const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(DATA_DIR, "visitor-log.jsonl");
const MAX_RESPONSE_ROWS = 200;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://digitaltwindenbosch.nl";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const requestLog = new Map();

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload, origin = "") {
  const allowOrigin = origin && origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  });
  res.end(JSON.stringify(payload));
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }

  return req.socket.remoteAddress || "";
}

function normalizeRecord(input, req) {
  const now = new Date();
  return {
    event: typeof input.event === "string" ? input.event : "unknown",
    sessionId: typeof input.sessionId === "string" ? input.sessionId : "",
    timestamp: typeof input.timestamp === "string" ? input.timestamp : now.toISOString(),
    date: typeof input.date === "string" ? input.date : now.toISOString().slice(0, 10),
    path: typeof input.path === "string" ? input.path : "/",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || ""
  };
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin || "";
  return !origin || origin === ALLOWED_ORIGIN;
}

function hasValidAdminToken(req) {
  if (!ADMIN_TOKEN) return false;
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const queryToken = (() => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      return (url.searchParams.get("token") || "").trim();
    } catch (error) {
      return "";
    }
  })();
  return bearerToken === ADMIN_TOKEN || queryToken === ADMIN_TOKEN;
}

function isRateLimited(req) {
  const ip = getClientIp(req) || "unknown";
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function appendRecord(record) {
  ensureDataDir();
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

function readRecentRecords(limit = 50) {
  if (!fs.existsSync(LOG_FILE)) return [];
  const lines = fs.readFileSync(LOG_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .slice(-Math.min(limit, MAX_RESPONSE_ROWS));

  return lines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean)
    .reverse();
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";

  if (!req.url) {
    sendJson(res, 400, { ok: false, error: "Missing URL" }, origin);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(req)) {
      sendJson(res, 403, { ok: false, error: "Origin not allowed" }, origin);
      return;
    }
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin || ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin"
    });
    res.end();
    return;
  }

  if (isRateLimited(req)) {
    sendJson(res, 429, { ok: false, error: "Too many requests" }, origin);
    return;
  }

  if (req.method === "POST" && url.pathname === "/visitor-log") {
    if (!isAllowedOrigin(req)) {
      sendJson(res, 403, { ok: false, error: "Origin not allowed" }, origin);
      return;
    }
    try {
      const rawBody = await readBody(req);
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const record = normalizeRecord(payload, req);
      appendRecord(record);
      sendJson(res, 201, { ok: true, record }, origin);
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message || "Invalid request body" }, origin);
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/visitor-log") {
    if (!hasValidAdminToken(req)) {
      sendJson(res, 401, { ok: false, error: "Unauthorized" }, origin);
      return;
    }
    const limit = Number(url.searchParams.get("limit") || "50");
    sendJson(res, 200, {
      ok: true,
      count: Math.min(limit, MAX_RESPONSE_ROWS),
      items: readRecentRecords(limit)
    }, origin);
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "visitor-log", timestamp: new Date().toISOString() }, origin);
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" }, origin);
});

server.listen(PORT, HOST, () => {
  console.log(`Visitor log server listening on http://${HOST}:${PORT}`);
  console.log(`Writing visitor records to ${LOG_FILE}`);
});
