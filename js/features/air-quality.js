(function () {
  async function fetchAirPollutionTrend(lat, lon) {
    const keyCache = `air_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    const cached = cacheGet(keyCache);
    if (cached) return cached;

    const key = (typeof airQualityApiKey === "string" && airQualityApiKey)
      ? airQualityApiKey
      : (window.config && window.config.conf && (window.config.conf.AIRQUALITYAPI || window.config.conf.WEATHERAPI));

    if (!key) return null;

    const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${key}`;
    let attempt = 0;
    const maxAttempts = 3;
    let lastErr = null;

    while (attempt < maxAttempts) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          lastErr = new Error(`HTTP ${response.status}`);
          if (response.status === 429) {
            attempt++;
            await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
            continue;
          }
          return null;
        }

        const data = await response.json();
        if (!data.list || !Array.isArray(data.list)) return null;

        const result = {
          co: data.list.map((item) => item.components && item.components.co ? item.components.co : 0).slice(0, 24),
          pm25: data.list.map((item) => item.components && item.components.pm2_5 ? item.components.pm2_5 : 0).slice(0, 24),
          no2: data.list.map((item) => item.components && item.components.no2 ? item.components.no2 : 0).slice(0, 24),
          o3: data.list.map((item) => item.components && item.components.o3 ? item.components.o3 : 0).slice(0, 24)
        };

        cacheSet(keyCache, result, 10 * 60 * 1000);
        return result;
      } catch (error) {
        lastErr = error;
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 400 * Math.pow(2, attempt)));
      }
    }

    console.warn("fetchAirPollutionTrend failed after retries", lastErr);
    return null;
  }

  async function fetchAndDisplayAirQuality(latitude, longitude) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${airQualityApiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch air quality data");

      const airQualityData = await response.json();
      const airQuality = airQualityData.list[0];
      const aqi = airQuality.main.aqi;
      const components = airQuality.components;
      const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1];

      const airQualityContent = `
        <div class="info-stack">
          ${renderInfoBadge(aqiDescription, aqi <= 2 ? "good" : aqi === 3 ? "warn" : "alert")}
          ${renderInfoBadge(`AQI ${aqi}`, "neutral")}
        </div>
        ${renderInfoRows([
          { label: "PM2.5", value: `${components.pm2_5} µg/m³` },
          { label: "PM10", value: `${components.pm10} µg/m³` },
          { label: "NO2", value: `${components.no2} µg/m³` },
          { label: "O3", value: `${components.o3} µg/m³` }
        ])}
      `;

      showNotification("air-quality", airQualityContent);
      markOperationalUpdate("Air quality snapshot updated", "Weather and air quality");
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      showNotification("air-quality", "Error fetching air quality data");
    }
  }

  window.udtAirQuality = {
    fetchAirPollutionTrend,
    fetchAndDisplayAirQuality
  };
})();
