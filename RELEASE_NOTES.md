# Release Notes

## Current Local Updates

Not yet pushed as a separate release tag.

- Public-facing wording now presents the platform as a limited version.
- Welcome, help, and contact text now direct visitors to `DataTwinLabs.nl` to schedule a full-data demo or municipal roadmap session with Daniel or Prof. Jos.
- The chat assistant can now be reopened from a small floating `Odin` button after closing.
- The tree layer now uses a more reliable public green-object source.
- Place and city names are easier to read thanks to a stronger labels overlay.
- The open-data dashboard now starts correctly in Den Bosch.
- Energy insights are now shown in both the map info panel and the dashboard, with clear fallback text when no EP-Online key is available.

## Runner Blade V.4.1

Release date: 2026-03-16

This release makes the limited version clearer, more usable, and more municipality-friendly, with stronger open-data views, a cleaner startup flow, and better map-driven insight.

### Highlights

- New branded welcome experience with credits and clearer access flow.
- Dutch-first interface with visible `NL / EN` switching.
- More stable 3D scene behavior with improved lighting, atmosphere, and weather states.
- Cleaner municipal-style sidebar with quick views, object groups, and more compact panels.
- Open-data dashboard that works without the backend.
- Broader live and public data coverage for weather, air quality, traffic, RIVM stations, CBS neighborhood context, BAG/Kadaster building information, and heritage points.
- Stronger mobility view with corridor colors, bottleneck states, and clearer traffic summaries.
- Cleaner location analysis in a single compact info card.
- Better help, contact, and platform information panels.

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
