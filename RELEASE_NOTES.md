# Release Notes

## Runner Blade V.4.1

Release date: 2026-03-16

This release focuses on turning the Den Bosch prototype into a stronger municipality-facing open-data showcase with a cleaner startup flow, better GIS structure, and more honest feature behavior.

### Highlights

- New branded welcome screen with DataTwinLabs, Daniel Adenew Wonyifraw, and Prof. Jos van Hillegersberg credits.
- Dutch-first UI with visible `NL / EN` switching foundation.
- Cesium scene upgraded and stabilized with local-time sync, improved atmosphere handling, and cleaner weather-mode behavior.
- Municipal-style sidebar structure with quick views, object catalog, and more compact panels.
- Open-data dashboard path that works without the backend.
- Official and public data integrations for:
  - weather
  - air quality
  - traffic flow
  - RIVM / Luchtmeetnet stations
  - CBS neighborhood context
  - BAG / Kadaster building info
  - PDOK / RCE heritage points
- Improved mobility presentation with corridor colors, bottleneck legend, and traffic status summaries.
- Cleaner single location card instead of stacked notification boxes.
- Condensed `Analyse hier` popup styling aligned with the rest of the interface.
- Local admin/help/contact panels now show meaningful content instead of dead placeholders.

### Smoke-Test Status

The release passed the local smoke-test gate before release preparation:

- `node --check js/main.js`
- `node --check dashboard/charts.js`
- `node --check chatbotservice/chatbot.js`
- `node --check notificationservice/notifications_alert.js`
- local browser smoke test:
  - welcome screen launch
  - command view click
  - traffic layer activation
  - status ribbon update
  - no console errors during the release pass

### Known Gaps

- Some scenario buttons are now meaningful, but a few still need deeper analytics beyond camera guidance.
- Full Dutch localization is improved but not yet complete for every runtime string.
- Some municipal/open-data layers still depend on source availability and may need future source hardening.
- Water/flood readiness and tourism views still need richer data panels to match the strongest mobility/environment flows.
