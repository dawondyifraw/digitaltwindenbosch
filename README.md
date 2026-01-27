# Urban Digital Twin — Den Bosch (demoUIv3.o)

A professional 3D/2D web console for the Den Bosch Urban Digital Twin. This is a static HTML/CSS/JS application that renders CesiumJS 3D content, overlays live sensor data, and provides operational panels for traffic, air quality, weather, and alerts.

## What This Project Does

- 3D city visualization with CesiumJS
- Live telemetry overlays (traffic, air quality, noise)
- Analytics side panel with charts
- Notifications and alert system
- Built‑in assistant chat panel
- Minimap overview
- Museum area fly‑to (Museumkwartier)
- Biodiversity stream with tree points overlay

## Architecture (End‑to‑End)

```
[Data Sources]
  - Kafka topics (traffic, sensors, environment)
  - External APIs (TomTom, OpenWeatherMap)
           |
           v
[Backend Streaming Service]
  - Socket.IO gateway (default: http://localhost:5000)
           |
           v
[Client Web App]
  - CesiumJS viewer
  - Real‑time stream handlers
  - UI controls (menus, panels, alerts)
```

### Runtime Components

- **Cesium Viewer**: main 3D scene and entity layer. See `js/main.js`.
- **Real‑time Stream**: Socket.IO client to Kafka bridge. See `realtimestream/kafka.js`.
- **Charts**: Forecast and analytics charts. See `dashboard/charts.js`.
- **Notifications**: Visual alerts and sound cues. See `notificationservice/`.
- **Chat Assistant**: Lightweight UI layer. See `chatbotservice/`.
- **Minimap**: OSM overlay map. See `minimap/OSM.js`.
- **Biodiversity Stream**: Tree points from the Den Bosch Geoportal ArcGIS service.

## Entry Points

- `index.html` — primary UI entry (UI v3.0 Runner)
- `indexnew.html` and `index copy.html` — legacy or experimental pages

## Key Files

- `js/main.js` — Cesium initialization, UI bindings, and interaction logic
- `js/config.js` + `config.json` — global config loader (dispatches `configLoaded`)
- `realtimestream/kafka.js` — real‑time socket client
- `css/main.css` — primary UI theme
- `notificationservice/notifications_alert.js` — alerts and audio

## Setup

### Requirements

- Python 3.8+ (for local static server and test script)
- A modern browser (Chrome/Edge recommended)

### Run Locally

1. Start a local web server in the repo root:

```
python -m http.server
```

2. Open in the browser:

```
http://localhost:8000
```

### Optional Backends

- Socket.IO real‑time backend (default `http://localhost:5000`) is expected for live streams.
- Kafka is upstream of the backend. This repo only contains client‑side code.

## Configuration

- `config.json` is loaded by `js/config.js`.
- Keys like Cesium Ion, TomTom, and OpenWeatherMap are referenced in `js/main.js`.
- Prefer moving keys to `config.json` and accessing them after `configLoaded`.

## Biodiversity Data Source (Trees)

The biodiversity overlay pulls tree point data from the Den Bosch geoportal ArcGIS REST service.

```
https://geo.s-hertogenbosch.nl/geoproxy/rest/services/Externvrij/CO2/MapServer/11
```

Example query (envelope around Den Bosch, WGS84):

```
https://geo.s-hertogenbosch.nl/geoproxy/rest/services/Externvrij/CO2/MapServer/11/query?where=1%3D1&outFields=*&f=json&geometryType=esriGeometryEnvelope&geometry=5.20,51.62,5.45,51.78&inSR=4326&outSR=4326&spatialRel=esriSpatialRelIntersects&resultRecordCount=800
```

## Museum Fly‑To Target

The “Fly to Museum Areas” button centers on Museumkwartier (Noordbrabants Museum + Design Museum) in ’s‑Hertogenbosch.

```
Center: 51.6863, 5.3043
```

## Tests

A lightweight Python smoke test verifies that key UI elements and files exist.

Run:

```
python scripts/ui_smoke_test.py
```

## Project Structure

```
config.json
index.html
indexnew.html
index copy.html
README.md
3DModels/
archive/
chatbotservice/
css/
dashboard/
js/
minimap/
notificationservice/
realtimestream/
scripts/
```

## Operational Notes

- No bundler: this is a static site. Reload the browser to see changes.
- Global variables are used (e.g., `viewer`). Avoid modular imports unless refactoring.
- The UI expects certain element IDs; keep them stable when editing markup.

## License

[MIT License](LICENSE)

## Contact

For inquiries, contact Daniel Wonyifraw at danielwondyifrawatoutlook.com.
