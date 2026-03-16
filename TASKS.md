# Task Notes

## Recent UI Window Work

- Added shared draggable window behavior for panels marked with `data-window-panel`
- Added minimize controls for the main floating panels
- Unified panel chrome through shared `panel-window__*` styles
- Kept panel visuals aligned with the main theme tokens in `css/main.css`
- Updated the chat window controls to use the same panel control styling as the other floating windows
- Added persistence for minimized state and dragged position in `js/features/ui-windows.js`

## Feature Split Progress

Completed:

- `js/features/ui-windows.js`
- `js/features/weather.js`
- `js/features/air-quality.js`
- `js/features/traffic.js`
- `js/features/incidents.js`
- `js/features/location-analysis.js`

Still to extract from `js/main.js`:

- building and layer management
- scenario/world-effect orchestration
- biodiversity and heritage toggles
- camera/orbit helpers
- context-menu and advanced analyze popup logic

## Verification Notes

- `python3 scripts/ui_smoke_test.py` passes
- Syntax checks pass for the refactored frontend modules that were touched

This file is here mainly to preserve task history inside the repo so UI cleanup and refactor work does not get lost between sessions.
