(function () {
  async function fetchTrafficSnapshot(latitude, longitude) {
    try {
      const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TomTomAPI}&point=${latitude},${longitude}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch traffic snapshot");
      const data = await response.json();
      return data && data.flowSegmentData ? data.flowSegmentData : null;
    } catch (error) {
      return null;
    }
  }

  async function fetchAndDisplayTraffic(latitude, longitude) {
    try {
      const traffic = await fetchTrafficSnapshot(latitude, longitude);
      if (traffic) {
        const congestionRatio = traffic.freeFlowSpeed > 0
          ? traffic.currentSpeed / traffic.freeFlowSpeed
          : 1;
        const congestionState = congestionRatio >= 0.9
          ? "Vlotte doorstroming"
          : congestionRatio >= 0.7
            ? "Lichte congestie"
            : congestionRatio >= 0.5
              ? "Drukke corridor"
              : "Zware congestie";
        const delaySeconds = Math.max((traffic.currentTravelTime || 0) - 60, 0);
        const confidencePercent = Math.round((traffic.confidence || 0) * 100);

        const trafficContent = `
          <div class="info-stack">
            ${renderInfoBadge(`${traffic.currentSpeed} km/h`, "accent")}
            ${renderInfoBadge(traffic.roadName || "Local road", "neutral")}
          </div>
          ${renderInfoRows([
            { label: "Free flow", value: `${traffic.freeFlowSpeed} km/h` },
            { label: "Travel time", value: `${traffic.currentTravelTime}s` },
            { label: "Confidence", value: `${confidencePercent}%` }
          ])}
        `;

        showNotification("traffic", trafficContent);

        const trafficStateTarget = $("trafficStateContent");
        if (trafficStateTarget) {
          trafficStateTarget.innerHTML = `
            <div class="info-stack">
              ${renderInfoBadge(congestionState, congestionRatio >= 0.9 ? "good" : congestionRatio >= 0.7 ? "warn" : "alert")}
            </div>
            ${renderInfoRows([
              { label: "Delay", value: `${delaySeconds}s` },
              { label: "Confidence", value: `${confidencePercent}%` },
              { label: "Flow ratio", value: `${Math.round(congestionRatio * 100)}%` }
            ])}
          `;
          trafficStateTarget.dataset.hasData = "true";
        }

        markOperationalUpdate("Traffic segment updated", "Traffic and mobility");
      }
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      showNotification("traffic", "Error fetching traffic data");
      const trafficStateTarget = $("trafficStateContent");
      if (trafficStateTarget) {
        trafficStateTarget.textContent = "Verkeersstatus tijdelijk niet beschikbaar.";
        trafficStateTarget.dataset.hasData = "false";
      }
    }

    await window.udtIncidents.fetchAndDisplayTrafficIncidents(latitude, longitude);
  }

  window.udtTraffic = {
    fetchTrafficSnapshot,
    fetchAndDisplayTraffic
  };
})();
