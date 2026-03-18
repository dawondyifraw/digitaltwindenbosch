# Digital Twin Den Bosch

Digital Twin Den Bosch is a Cesium-based web app for exploring municipal data in a 3D city view. It combines map layers, building data, weather, air quality, traffic, incidents, and location-based lookups in a single frontend.

This repository is the client application. It is mainly a static site with optional realtime/backend integrations.

## What This Repo Contains

- A Cesium 3D scene for Den Bosch
- A sidebar-driven UI for layers, scenarios, and municipal datasets
- Feature-specific frontend modules under `js/features/`
- Optional realtime hooks through `realtimestream/kafka.js`
- A simple smoke test for key UI elements

## Frontend Structure

The codebase is being separated feature-wise so behavior is easier to maintain.

- `js/main.js` handles app startup, Cesium setup, shared state, and high-level coordination
- `js/features/weather.js` handles weather fetching and scene weather effects
- `js/features/air-quality.js` handles air-quality requests and display updates
- `js/features/traffic.js` handles traffic flow fetching and traffic status updates
- `js/features/incidents.js` handles traffic incident fetching and rendering
- `js/features/ui-windows.js` handles draggable panels, open/close behavior, and utility windows

## Main Capabilities

- 3D city viewing with CesiumJS
- Building and municipal layer exploration
- Click-based location analysis
- Traffic, incident, weather, and air-quality lookups
- Open-data dashboard links and supporting dataset views
- Chat, alerts, notifications, and floating panels

## Requirements

- A static file server such as `python -m http.server`
- A modern desktop browser
- API keys in `config.json` for the external services you want to use

## Quick Start

1. Add your keys to `config.json`.
2. Start a local static server from the repo root.
3. Open the app in your browser.

Example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Configuration

`config.json` is loaded by `js/config.js` and used during app startup.

Common fields:

| Field | Required | Purpose |
| --- | --- | --- |
| `CESIUM_TOKEN` | Yes | Cesium Ion token |
| `TOMTOMAPI` | Yes for traffic | TomTom traffic API key |
| `AIRQUALITYAPI` | Yes for air quality | OpenWeather air quality key |
| `WEATHERAPI` | Optional | Weather API key, falls back to `AIRQUALITYAPI` |
| `ENERGYLABELAPI` | Optional | Energy label / EP-online integration |

Keep real secrets out of version control.

## Optional Backend

The frontend can work as a static app, but some integrations expect a backend or stream source.

- `realtimestream/kafka.js` defaults to `http://localhost:5000`
- Kafka is not included in this repo
- Socket.IO integration is optional for local frontend work
- `scripts/visitor_log_server.js` is a tiny optional logger for visitor events

### Visitor Log Server

If you want server-side visitor logs with IP addresses, run:

```bash
node scripts/visitor_log_server.js
```

This starts a small HTTP server on `http://localhost:8787` with:

- `POST /visitor-log` to store visitor events
- `GET /visitor-log` to inspect recent entries
- `GET /health` for a basic health check

Saved records are written to `logs/visitor-log.jsonl`.

To connect the frontend, set this in `config.json`:

```json
{
  "SERVICES": {
    "visitorLogUrl": "http://localhost:8787/visitor-log"
  }
}
```

Each stored record includes:

- `event`
- `sessionId`
- `timestamp`
- `date`
- `path`
- `ip`
- `userAgent`

## Project Layout

```text
config.json
index.html
README.md
css/
dashboard/
js/
js/features/
notificationservice/
chatbotservice/
realtimestream/
scripts/
architecture/
3DModels/
```

## Key Files

- `index.html`: app shell and UI markup
- `js/main.js`: app bootstrap, Cesium wiring, shared logic
- `js/config.js`: runtime config loader
- `js/i18n.js`: locale and translation handling
- `js/features/`: feature-specific frontend modules
- `css/main.css`: primary styling
- `scripts/ui_smoke_test.py`: basic UI smoke test

## Testing

Run the smoke test:

```bash
python3 scripts/ui_smoke_test.py
```

This checks for required files and important UI elements in `index.html`.

## Notes

- The UI and README are both in active cleanup.
- Some older naming and prototype-era wording may still exist in the app until the frontend refactor is fully finished.
- If you continue the separation work, prefer adding new behavior to `js/features/` instead of expanding `js/main.js`.

## License

[Apache 2.0](LICENSE)
