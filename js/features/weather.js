(function () {
  function applyLiveWeatherEffects(weatherData) {
    if (!weatherData || !weatherData.weather || !weatherData.weather.length) return;

    const weatherMain = String(weatherData.weather[0].main || "").toLowerCase();
    const weatherDescription = String(weatherData.weather[0].description || "").toLowerCase();
    const cloudiness = Number(weatherData.clouds && weatherData.clouds.all) || 0;
    const sunrise = Number(weatherData.sys && weatherData.sys.sunrise) || 0;
    const sunset = Number(weatherData.sys && weatherData.sys.sunset) || 0;
    const observedAt = Number(weatherData.dt) || Math.floor(Date.now() / 1000);

    let effectName = "weather-clear";

    if (weatherMain.includes("snow") || weatherDescription.includes("sneeuw")) {
      effectName = "weather-snow";
    } else if (
      weatherMain.includes("rain")
      || weatherMain.includes("drizzle")
      || weatherMain.includes("thunderstorm")
      || weatherDescription.includes("regen")
    ) {
      effectName = "weather-rain";
    } else if (weatherMain.includes("mist") || weatherMain.includes("fog") || weatherMain.includes("haze") || cloudiness >= 85) {
      effectName = "weather-water";
    } else if (sunrise && sunset && (observedAt < sunrise || observedAt > sunset)) {
      effectName = "weather-night";
    }

    setWorldEffectState(effectName);
  }

  async function fetchWeatherSnapshot(latitude, longitude) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch weather snapshot");
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function fetchAndDisplayWeather(latitude, longitude) {
    try {
      const weatherData = await fetchWeatherSnapshot(latitude, longitude);
      if (!weatherData) {
        throw new Error("Weather snapshot unavailable");
      }

      applyLiveWeatherEffects(weatherData);

      const weatherContent = `
        <div class="info-stack">
          ${renderInfoBadge(`${weatherData.main.temp.toFixed(1)} °C`, "accent")}
          ${renderInfoBadge(weatherData.weather[0].main || "Weather", "neutral")}
        </div>
        ${renderInfoRows([
          { label: "Feels like", value: `${Math.round(weatherData.main.feels_like)} °C` },
          { label: "Humidity", value: `${weatherData.main.humidity}%` },
          { label: "Wind", value: `${weatherData.wind.speed} m/s` }
        ])}
      `;

      showNotification("weather", weatherContent);
      markOperationalUpdate("Weather snapshot updated", "Weather and air quality");
    } catch (error) {
      console.error("Error fetching weather data:", error);
      showNotification("weather", "Error fetching weather data");
    }
  }

  window.udtWeather = {
    applyLiveWeatherEffects,
    fetchWeatherSnapshot,
    fetchAndDisplayWeather
  };
})();
