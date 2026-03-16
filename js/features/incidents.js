(function () {
  async function fetchTomTomTrafficIncidents(latitude, longitude, delta = 0.018) {
    try {
      const params = new URLSearchParams({
        bbox: `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`,
        fields: "{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,delay,events{description},roadNumbers,startTime,endTime,from,to,length}}}",
        language: "nl-NL",
        timeValidityFilter: "present",
        key: TomTomAPI
      });
      const response = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch TomTom incidents");
      const data = await response.json();
      return Array.isArray(data.incidents) ? data.incidents : [];
    } catch (error) {
      return [];
    }
  }

  function getIncidentDisplay(incident) {
    const props = incident?.properties || {};
    const firstEvent = Array.isArray(props.events) && props.events[0] ? props.events[0].description : null;
    const description = firstEvent || "Verkeersincident";
    const severity = Number(props.magnitudeOfDelay) || 0;
    let color = "#facc15";
    if (severity >= 4) color = "#f43f5e";
    else if (severity >= 3) color = "#fb923c";
    else if (severity >= 2) color = "#facc15";
    else color = "#38d6c5";
    return { description, severity, color };
  }

  function renderTrafficIncidentPanel() {
    const panelBody = $("trafficIncidentsPanelBody");
    if (!panelBody) return;

    if (!currentTrafficIncidents.length) {
      panelBody.innerHTML = "<p>No incidents are currently reported for this location.</p>";
      return;
    }

    panelBody.innerHTML = currentTrafficIncidents.map((incident) => {
      const props = incident.properties || {};
      const display = getIncidentDisplay(incident);
      const road = Array.isArray(props.roadNumbers) && props.roadNumbers.length ? props.roadNumbers.join(", ") : "Local road";
      const route = props.from && props.to ? `${props.from} → ${props.to}` : (props.from || props.to || "Route details not available");
      return `
        <div class="location-inline-block">
          <div class="info-stack">
            ${renderInfoBadge(display.description, display.severity >= 4 ? "alert" : display.severity >= 2 ? "warn" : "neutral")}
            ${renderInfoBadge(`Severity ${display.severity || "n/a"}`, "neutral")}
          </div>
          ${renderInfoRows([
            { label: "Road", value: road },
            { label: "Route", value: route },
            { label: "Length", value: props.length ? `${Math.round(props.length)} m` : "n/a" }
          ])}
        </div>
      `;
    }).join("<hr>");
  }

  async function fetchAndDisplayTrafficIncidents(latitude, longitude) {
    const target = $("trafficIncidentsContent");
    if (!target) return;

    const incidents = await fetchTomTomTrafficIncidents(latitude, longitude);
    currentTrafficIncidents = incidents;

    if (!incidents.length) {
      target.innerHTML = `
        <div class="info-stack">
          ${renderInfoBadge("No active incidents", "good")}
        </div>
        ${renderInfoRows([
          { label: "Status", value: "No nearby traffic disruptions are currently reported." }
        ])}
      `;
      target.dataset.hasData = "false";
      renderTrafficIncidentPanel();
      return;
    }

    const severeCount = incidents.filter((incident) => (Number(incident?.properties?.magnitudeOfDelay) || 0) >= 3).length;
    target.innerHTML = `
      <div class="info-stack">
        ${renderInfoBadge(`${incidents.length} incidents`, severeCount ? "warn" : "neutral")}
        ${severeCount ? renderInfoBadge(`${severeCount} severe`, "alert") : ""}
      </div>
      ${renderInfoRows([
        { label: "Top issue", value: getIncidentDisplay(incidents[0]).description },
        { label: "Action", value: "Open the incident panel for full details" }
      ])}
    `;
    target.dataset.hasData = "true";
    renderTrafficIncidentPanel();
  }

  window.udtIncidents = {
    fetchTomTomTrafficIncidents,
    getIncidentDisplay,
    renderTrafficIncidentPanel,
    fetchAndDisplayTrafficIncidents
  };
})();
