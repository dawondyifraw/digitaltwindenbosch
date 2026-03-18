const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(DATA_DIR, "visitor-log.jsonl");
const MAX_RESPONSE_ROWS = 200;

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

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
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
  if (!req.url) {
    sendJson(res, 400, { ok: false, error: "Missing URL" });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method === "POST" && url.pathname === "/visitor-log") {
    try {
      const rawBody = await readBody(req);
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const record = normalizeRecord(payload, req);
      appendRecord(record);
      sendJson(res, 201, { ok: true, record });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message || "Invalid request body" });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/visitor-log") {
    const limit = Number(url.searchParams.get("limit") || "50");
    sendJson(res, 200, {
      ok: true,
      count: Math.min(limit, MAX_RESPONSE_ROWS),
      items: readRecentRecords(limit)
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "visitor-log", timestamp: new Date().toISOString() });
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, HOST, () => {
  console.log(`Visitor log server listening on http://${HOST}:${PORT}`);
  console.log(`Writing visitor records to ${LOG_FILE}`);
});
