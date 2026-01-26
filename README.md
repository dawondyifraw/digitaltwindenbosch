# Urban Digital Twin (Den Bosch)

## Purpose

This is a static Web (HTML+JS+CSS) 3D/2D visualization app built on CesiumJS for the Urban Digital Twin of Den Bosch. It provides real-time data visualization for sensors, traffic, weather, and air quality in a 3D map interface.

## Quick Start

- Serve the repo root with a static server: `python -m http.server` and open `http://localhost:8000`.
- Real-time data is served separately via a WebSocket backend (default `http://localhost:5000`).

## Architecture

Client-only code lives in the repo and expects a small real-time backend for streaming sensor/Kafka data.

Real-time flow: Kafka -> backend WS (socket.io) -> client `realtimestream/kafka.js` -> Cesium viewer (`js/main.js`).

## Key Files / Folders

- `index.html`, `indexnew.html`, `index copy.html` — primary pages.
- `js/main.js` — core Cesium initialization and UI handlers.
- `js/config.js` + `config.json` — global config loading pattern (dispatches `configLoaded`).
- `realtimestream/kafka.js` — `streamkafka()` and WebSocket (`io('http://localhost:5000')`) integration.
- `3DModels/`, `minimap/OSM.js`, `dashboard/charts.js`, `chatbotservice/`, `notificationservice/` — example modules.
- `dashboard.html` — control console page.
- `archive/` — archived unused files.

## Project-specific Patterns and Conventions

- No bundler/build system: files are loaded directly in the browser. Changes are visible after reloading the served page.
- Global variables and events: `window.config.conf`, `document.dispatchEvent(new Event('configLoaded'))`, and globals like `viewer` are used instead of modular imports.
- Cesium-centric: many features add `viewer.entities`, `scene.primitives`, and rely on `viewer` being globally available.
- Streaming toggles: UI buttons bind to functions in `realtimestream/kafka.js` (`toggleStreamBtn`) and `js/main.js` (traffic, tileset toggles).

## Integration & External Dependencies

- Cesium Ion token is currently embedded in `js/main.js` — treat as a secret and prefer using `config.json` to override.
- External APIs: TomTom, OpenWeatherMap (keys appear in `js/main.js` and `config.json`).
- Socket.IO backend expected at `http://localhost:5000` (see `realtimestream/kafka.js`).
- Kafka is referenced as the upstream stream, but the repo contains only client-side code for consumption.

## Common Gotchas / Maintenance Notes

- Several filenames/directories contain typos or duplicate copies (e.g., `notificaionservice` was archived due to typo; `notificationservice` kept).
- No automated tests or CI are present — changes should be manually smoke-tested in the browser.
- Config is loaded asynchronously; wait for the `configLoaded` event before using `window.config.conf`.

## Examples of Useful Tasks

- Add a small UI toggle that calls an existing function (follow existing global event patterns).
- Move hard-coded API keys into `config.json` and update `js/config.js` usage.
- Improve marker updates: prefer updating `viewer.entities` (existing `markers` pattern in `realtimestream/kafka.js`) instead of re-creating.

## When to Open an Issue / Ask the Maintainer

- If required runtime backend (socket server) or Kafka topics are unavailable and changes require server-side work.
- If unclear which `index*.html` is intended as canonical entrypoint.

## Project Structure

```
config.json
dashboard.html
index copy.html
index.html
indexnew.html
influxdbclient.py
LICENSE
README.md
sync.ffs_lock
3DModels/
architectureimages/
archive/
chatbotservice/
	chatbot.css
	chatbot.js
	newchatbot.css
	newchatbot.js
css/
	main.css
dashboard/
	charts.js
js/
	config.js
	main.js
minimap/
	OSM.js
New folder/
notificationservice/
	notificaion_alert.css
	notification.js
	notifications.js
	notifications_alert.js
	notifications_weather_traffic_air.js
	radom_notfication.js
realtimestream/
	kafka.js
```

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Start a local web server: `python -m http.server`
4. Open `http://localhost:8000` in your browser.

## License

[MIT License](LICENSE)

## Contact

For inquiries, contact Daniel Wonyifraw at danielwondyifrawatoutlook.com.

