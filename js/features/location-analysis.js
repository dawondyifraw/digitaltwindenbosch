(function () {
  const UDT_CACHE = {};
  const deps = {};
  let hasWarnedAboutRivmCors = false;

  function configure(nextDeps = {}) {
    Object.assign(deps, nextDeps);
  }

  function getDep(name, fallback = null) {
    return typeof deps[name] === "function" ? deps[name]() : (deps[name] ?? fallback);
  }

  function cacheSet(key, value, ttlMs) {
    const expires = Date.now() + (ttlMs || 10 * 60 * 1000);
    UDT_CACHE[key] = { value, expires };
    try {
      localStorage.setItem(`udt_cache_${key}`, JSON.stringify({ value, expires }));
    } catch (error) { }
  }

  function cacheGet(key) {
    const inMemory = UDT_CACHE[key];
    if (inMemory && inMemory.expires > Date.now()) return inMemory.value;

    try {
      const serialized = localStorage.getItem(`udt_cache_${key}`);
      if (!serialized) return null;

      const cached = JSON.parse(serialized);
      if (cached.expires > Date.now()) {
        UDT_CACHE[key] = cached;
        return cached.value;
      }

      localStorage.removeItem(`udt_cache_${key}`);
    } catch (error) { }

    return null;
  }

  function renderInfoRows(rows = []) {
    return `<div class="info-kv">${rows.map(({ label, value }) => `
        <div class="info-kv__row">
            <span class="info-kv__label">${label}</span>
            <strong class="info-kv__value">${value}</strong>
        </div>
    `).join("")}</div>`;
  }

  function renderInfoBadge(value, tone = "neutral") {
    return `<span class="info-badge info-badge--${tone}">${value}</span>`;
  }

  function showStatusToast(content) {
    const area = document.getElementById("notificationArea");
    if (!area) return;

    const toast = document.createElement("div");
    toast.className = "status-toast";
    toast.innerHTML = content;
    area.prepend(toast);

    window.setTimeout(() => {
      toast.classList.add("is-hiding");
      window.setTimeout(() => toast.remove(), 220);
    }, 3200);
  }

  function getRivmUnavailableMessage() {
    return window.udtI18n
      ? window.udtI18n.t("no_official_sensor_data")
      : "Official RIVM station data is currently unavailable for this browser session.";
  }

  function prepareLocationCard(latitude, longitude) {
    const card = document.getElementById("locationInfoCard");
    const title = document.getElementById("locationInfoTitle");
    const meta = document.getElementById("locationInfoMeta");
    const name = document.getElementById("locationInfoName");
    const coords = document.getElementById("locationInfoCoords");
    const loadingText = "Loading details...";
    if (!card) return;

    if (title) {
      title.textContent = "Location details";
    }
    if (meta) {
      meta.textContent = "Building selection";
    }
    if (name) {
      name.textContent = "Loading address...";
    }
    if (coords) {
      coords.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    [
      "locationBagContent",
      "locationEnergyContent",
      "locationTrafficContent",
      "trafficStateContent",
      "locationWeatherContent",
      "locationAirContent",
      "locationRivmContent",
      "trafficIncidentsContent"
    ].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.textContent = loadingText;
      element.dataset.hasData = "false";
    });

    card.classList.remove("is-hidden");
  }

  function showNotification(type, content) {
    if (type === "event") {
      showStatusToast(content);
      return;
    }

    const card = document.getElementById("locationInfoCard");
    if (!card) return;

    const targetMap = {
      weather: "locationWeatherContent",
      "air-quality": "locationAirContent",
      traffic: "locationTrafficContent"
    };

    const targetId = targetMap[type];
    if (!targetId) return;

    const target = document.getElementById(targetId);
    const section = target?.closest(".location-info-card__section");
    const toggle = section?.querySelector(".location-info-card__section-toggle");
    const title = document.getElementById("locationInfoTitle");
    const nameElement = document.getElementById("locationInfoName");
    const meta = document.getElementById("locationInfoMeta");
    const currentName = getDep("getLocationName", "");

    if (title) {
      title.textContent = "Location details";
    }
    if (nameElement && currentName) {
      nameElement.textContent = currentName;
    }
    if (meta) {
      meta.textContent = type === "traffic" ? "Traffic selection" : "Building selection";
    }
    if (target) {
      target.innerHTML = content;
      target.dataset.hasData = "true";
    }
    if (section && toggle) {
      section.classList.remove("is-collapsed");
      toggle.setAttribute("aria-expanded", "true");
    }
    card.classList.remove("is-hidden");
  }

  function makeSparkline(values = [], color = "#007bff") {
    if (!values || values.length === 0) return "";
    const width = Math.max(60, values.length * 6);
    const height = 40;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = (max - min) || 1;
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((value - min) / range) * (height - 8);
      return `${x},${y}`;
    }).join(" ");

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  }

  function parseSemicolonCsv(text) {
    return text
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(";"));
  }

  function distanceKm(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function getPlaceName(latitude, longitude) {
    const tomTomApi = getDep("getTomTomApi", "");
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${tomTomApi}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error. Status: ${response.status}`);

      const data = await response.json();

      if (data.addresses && data.addresses.length > 0) {
        const resolvedName = data.addresses[0].address.freeformAddress;
        if (typeof deps.setLocationName === "function") {
          deps.setLocationName(resolvedName);
        }
        const nameElement = document.getElementById("locationInfoName");
        if (nameElement) {
          nameElement.textContent = resolvedName;
        }

        if (
          resolvedName === "'s-Gravesandestraat 40, 5223 BS 's-Hertogenbosch"
          && typeof deps.showSimplifiedPopup === "function"
        ) {
          deps.showSimplifiedPopup(latitude, longitude);
        }

        return resolvedName;
      }

      console.warn("No addresses data returned from the API.");
      return null;
    } catch (error) {
      console.error("Error fetching place name:", error);
      return null;
    }
  }

  async function setupMapClickHandler() {
    const viewer = getDep("getViewer");
    if (!viewer || !window.Cesium) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(async function (click) {
      const locationInfoCard = document.getElementById("locationInfoCard");
      const pickedPosition = viewer.camera.pickEllipsoid(
        click.position,
        viewer.scene.globe.ellipsoid
      );

      if (!pickedPosition) return;

      const cartographicPosition = Cesium.Cartographic.fromCartesian(pickedPosition);
      const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
      const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);

      prepareLocationCard(latitude, longitude);

      await getPlaceName(latitude, longitude);
      try {
        localStorage.setItem("udt_last_location", JSON.stringify({
          lat: latitude,
          lon: longitude,
          name: getDep("getLocationName", "")
        }));
      } catch (error) { }

      const dataTasks = [];

      if (typeof deps.fetchAndDisplayWeather === "function") {
        dataTasks.push(deps.fetchAndDisplayWeather(latitude, longitude));
      }
      if (typeof deps.fetchAndDisplayAirQuality === "function") {
        dataTasks.push(deps.fetchAndDisplayAirQuality(latitude, longitude));
      }
      if (typeof deps.fetchAndDisplayTraffic === "function") {
        dataTasks.push(deps.fetchAndDisplayTraffic(latitude, longitude));
      }

      const bagInfo = await fetchAndDisplayBagInfo(latitude, longitude);
      dataTasks.push(fetchAndDisplayEnergyLabel(bagInfo));
      dataTasks.push(fetchAndDisplayRivmSensors(latitude, longitude));
      await Promise.allSettled(dataTasks);

      if (typeof deps.updateCharts === "function") {
        deps.updateCharts(latitude, longitude);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  function getRivmMonthlyCandidates() {
    const now = new Date();
    const candidates = [];

    for (let offset = 1; offset <= 3; offset += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      candidates.push({
        PM25: `${year}_${month}_PM25.csv`,
        NO2: `${year}_${month}_NO2.csv`,
        O3: `${year}_${month}_O3.csv`
      });
    }

    return candidates;
  }

  async function fetchRivmStations() {
    const cacheKey = "rivm_stations_metadata";
    const cached = cacheGet(cacheKey);
    if (Array.isArray(cached)) return cached;
    if (cached && cached.unavailable) {
      throw new Error(cached.reason || "RIVM station metadata unavailable");
    }

    try {
      const response = await fetch(getDep("getRivmStationsUrl"));
      if (!response.ok) {
        throw new Error(`RIVM station metadata unavailable: ${response.status}`);
      }

      const text = await response.text();
      const rows = parseSemicolonCsv(text);
      const headers = rows[0] || [];
      const stations = rows.slice(1)
        .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])))
        .filter((row) => !row.meetlocatie_einddatumtijd && row.breedtegraad && row.lengtegraad);

      cacheSet(cacheKey, stations, 12 * 60 * 60 * 1000);
      return stations;
    } catch (error) {
      const reason = error instanceof TypeError
        ? "RIVM station metadata blocked by browser CORS policy"
        : (error.message || "RIVM station metadata unavailable");
      cacheSet(cacheKey, { unavailable: true, reason }, 15 * 60 * 1000);
      throw new Error(reason);
    }
  }

  async function fetchRivmComponentLatest(filename, stationId) {
    const cacheKey = `rivm_component_${filename}_${stationId}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null && cached !== undefined) return cached;

    try {
      const response = await fetch(`https://data.rivm.nl/data/luchtmeetnet/Actueel-jaar/${filename}`);
      if (!response.ok) {
        throw new Error(`RIVM component file unavailable: ${response.status}`);
      }

      const text = await response.text();
      const rows = parseSemicolonCsv(text);
      const headers = rows[0] || [];
      const stationIndex = headers.indexOf("meetlocatie_id");
      const valueIndex = headers.indexOf("waarde");
      const endIndex = headers.indexOf("einddatumtijd");
      let latest = null;

      rows.slice(1).forEach((row) => {
        if (row[stationIndex] !== stationId) return;
        const value = Number(row[valueIndex]);
        if (!Number.isFinite(value)) return;
        const timestamp = row[endIndex];
        if (!latest || timestamp > latest.timestamp) {
          latest = { value, timestamp };
        }
      });

      cacheSet(cacheKey, latest, 30 * 60 * 1000);
      return latest;
    } catch (error) {
      cacheSet(cacheKey, null, 10 * 60 * 1000);
      return null;
    }
  }

  async function fetchNearestRivmSensors(latitude, longitude) {
    const cacheKey = `rivm_nearest_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const stations = await fetchRivmStations();
    const nearestStations = stations
      .map((station) => ({
        stationId: station.meetlocatie_id,
        stationName: station.meetlocatie_naam,
        place: station.meetlocatie_plaatsnaam,
        source: station.bron_id,
        lat: Number(station.breedtegraad),
        lon: Number(station.lengtegraad),
        distanceKm: distanceKm(latitude, longitude, Number(station.breedtegraad), Number(station.lengtegraad))
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 2);

    for (const station of nearestStations) {
      let values = null;
      let latestTimestamp = null;

      for (const candidate of getRivmMonthlyCandidates()) {
        const [pm25, no2, o3] = await Promise.all([
          fetchRivmComponentLatest(candidate.PM25, station.stationId),
          fetchRivmComponentLatest(candidate.NO2, station.stationId),
          fetchRivmComponentLatest(candidate.O3, station.stationId)
        ]);

        if (pm25 || no2 || o3) {
          values = {
            PM25: pm25 ? pm25.value : null,
            NO2: no2 ? no2.value : null,
            O3: o3 ? o3.value : null
          };
          latestTimestamp = pm25?.timestamp || no2?.timestamp || o3?.timestamp || null;
          break;
        }
      }

      station.values = values || { PM25: null, NO2: null, O3: null };
      station.timestamp = latestTimestamp;
    }

    cacheSet(cacheKey, nearestStations, 30 * 60 * 1000);
    return nearestStations;
  }

  async function fetchPopulationNearby(lat, lon, labelFallback) {
    const key = `pop_${lat.toFixed(4)}_${lon.toFixed(4)}${labelFallback ? `_label_${labelFallback.replace(/\s+/g, "_")}` : ""}`;
    const cached = cacheGet(key);
    if (cached) return cached;

    const wkt = `Point(${lon} ${lat})`;
    const sparql = `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
SELECT ?item ?itemLabel ?population WHERE {
  SERVICE wikibase:around {
    ?item wdt:P625 ?location .
    bd:serviceParam wikibase:center "${wkt}"^^geo:wktLiteral ;
                    wikibase:radius "2" .
  }
  OPTIONAL { ?item wdt:P1082 ?population. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?population)
LIMIT 1`;
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;

    try {
      const response = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
      if (!response.ok) return null;

      const data = await response.json();
      const bindings = data.results.bindings;
      if (bindings && bindings.length > 0) {
        const binding = bindings[0];
        const result = {
          label: binding.itemLabel ? binding.itemLabel.value : null,
          population: binding.population ? parseInt(binding.population.value, 10) : null
        };
        cacheSet(key, result, 24 * 60 * 60 * 1000);
        return result;
      }
    } catch (error) {
      console.warn("fetchPopulationNearby failed", error);
    }

    if (labelFallback) {
      try {
        const fallback = await fetchPopulationByLabel(labelFallback);
        if (fallback) {
          cacheSet(key, fallback, 24 * 60 * 60 * 1000);
          return fallback;
        }
      } catch (error) {
        console.warn("fetchPopulationNearby fallback failed", error);
      }
    }

    return null;
  }

  async function fetchPopulationByLabel(label) {
    if (!label) return null;
    const key = `pop_label_${label.replace(/\s+/g, "_")}`;
    const cached = cacheGet(key);
    if (cached) return cached;

    try {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&search=${encodeURIComponent(label)}&origin=*`;
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) return null;

      const searchData = await searchResponse.json();
      if (searchData && searchData.search && searchData.search.length > 0) {
        const qid = searchData.search[0].id;
        const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(qid)}&props=claims|labels&languages=en&format=json&origin=*`;
        const entityResponse = await fetch(entityUrl);
        if (!entityResponse.ok) return null;

        const entityData = await entityResponse.json();
        const entity = entityData.entities && entityData.entities[qid];
        if (entity) {
          let population = null;
          try {
            const claims = entity.claims && entity.claims.P1082;
            if (claims && claims.length) {
              for (const claim of claims) {
                if (claim.mainsnak && claim.mainsnak.datavalue && claim.mainsnak.datavalue.value) {
                  population = parseInt(claim.mainsnak.datavalue.value.amount || claim.mainsnak.datavalue.value, 10);
                  if (!Number.isNaN(population)) break;
                }
              }
            }
          } catch (error) { }

          const result = {
            label: entity.labels && entity.labels.en && entity.labels.en.value ? entity.labels.en.value : label,
            population
          };
          cacheSet(key, result, 24 * 60 * 60 * 1000);
          return result;
        }
      }
    } catch (error) {
      console.warn("fetchPopulationByLabel failed", error);
    }

    return null;
  }

  async function fetchNearbyHeritageSummary(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: "ps-ch:rce_inspire_points",
        count: "5",
        outputFormat: "application/json",
        srsName: "EPSG:4326",
        bbox: `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01},EPSG:4326`
      });
      const response = await fetch(`${getDep("getHeritageServiceUrl")}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch heritage summary");
      const data = await response.json();
      return Array.isArray(data.features) ? data.features : [];
    } catch (error) {
      return [];
    }
  }

  async function fetchNearestBagBuildingInfo(latitude, longitude) {
    try {
      const delta = 0.0012;
      const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: "bag:verblijfsobject",
        count: "1",
        outputFormat: "application/json",
        srsName: "EPSG:4326",
        bbox: `${latitude - delta},${longitude - delta},${latitude + delta},${longitude + delta},EPSG:4326`
      });
      const response = await fetch(`${getDep("getBagWfsUrl")}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch BAG building info");
      const data = await response.json();
      const feature = Array.isArray(data.features) ? data.features[0] : null;
      return feature ? feature.properties || null : null;
    } catch (error) {
      return null;
    }
  }

  async function fetchEnergyLabelForAddress(bagInfo) {
    const energyLabelApiKey = getDep("getEnergyLabelApiKey", "");
    if (!energyLabelApiKey) return { unavailableReason: "missingKey" };
    if (!bagInfo || !bagInfo.postcode || !bagInfo.huisnummer) return { unavailableReason: "missingAddress" };

    const postcode = String(bagInfo.postcode).replace(/\s+/g, "").toUpperCase();
    const huisnummer = String(bagInfo.huisnummer);
    const huisletter = bagInfo.huisletter || "";
    const huisnummertoevoeging = bagInfo.toevoeging || "";
    const cacheKey = `energy_label_${postcode}_${huisnummer}_${huisletter}_${huisnummertoevoeging}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({ postcode, huisnummer });
    if (huisletter) params.set("huisletter", huisletter);
    if (huisnummertoevoeging) params.set("huisnummertoevoeging", huisnummertoevoeging);

    try {
      const response = await fetch(`https://public.ep-online.nl/api/v5/PandEnergielabel/Adres?${params.toString()}`, {
        headers: {
          Authorization: energyLabelApiKey,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return { unavailableReason: "unauthorized" };
        if (response.status === 404) return { unavailableReason: "notFound" };
        throw new Error(`Failed to fetch energy label: ${response.status}`);
      }

      const data = await response.json();
      const energyLabel = Array.isArray(data) ? (data[0] || null) : data;
      cacheSet(cacheKey, energyLabel, 12 * 60 * 60 * 1000);
      return energyLabel;
    } catch (error) {
      console.error("Error fetching energy label data:", error);
      return { unavailableReason: "fetchError" };
    }
  }

  async function fetchAndDisplayBagInfo(latitude, longitude) {
    const bagTarget = document.getElementById("locationBagContent");
    if (!bagTarget) return null;

    const bagInfo = await fetchNearestBagBuildingInfo(latitude, longitude);
    if (!bagInfo) {
      bagTarget.innerHTML = "Geen BAG gebouwinformatie gevonden voor deze locatie.";
      bagTarget.dataset.hasData = "false";
      return null;
    }

    const addressParts = [
      bagInfo.openbare_ruimte,
      bagInfo.huisnummer,
      bagInfo.huisletter || "",
      bagInfo.toevoeging || ""
    ].filter(Boolean).join(" ");

    bagTarget.innerHTML = `
        <div class="info-stack">
            ${renderInfoBadge(addressParts || "BAG object", "accent")}
        </div>
        ${renderInfoRows([
          { label: "Postcode", value: `${bagInfo.postcode || "Not available"} ${bagInfo.woonplaats || ""}`.trim() },
          { label: "Use type", value: bagInfo.gebruiksdoel || "Not available" },
          { label: "Area", value: `${bagInfo.oppervlakte || "?"} m²` },
          { label: "Year", value: bagInfo.bouwjaar || "?" }
        ])}
    `;
    bagTarget.dataset.hasData = "true";
    return bagInfo;
  }

  async function fetchAndDisplayEnergyLabel(bagInfo) {
    const energyTarget = document.getElementById("locationEnergyContent");
    if (!energyTarget) return;

    if (!bagInfo) {
      energyTarget.textContent = "Geen adresgegevens beschikbaar voor een energielabelcheck.";
      energyTarget.dataset.hasData = "false";
      return;
    }

    const energyLabel = await fetchEnergyLabelForAddress(bagInfo);
    if (!energyLabel || energyLabel.unavailableReason) {
      const messages = {
        missingKey: "EP-Online API-sleutel ontbreekt. Voeg ENERGYLABELAPI toe om echte energielabeldata te laden.",
        missingAddress: "Adresgegevens zijn niet volledig genoeg voor een energielabelcheck.",
        unauthorized: "EP-Online API-sleutel is ongeldig of heeft geen toegang.",
        notFound: "Geen energielabel gevonden voor dit adres.",
        fetchError: "Energielabeldata kon nu niet worden geladen."
      };
      energyTarget.textContent = messages[energyLabel?.unavailableReason] || "Energielabeldata is niet beschikbaar.";
      energyTarget.dataset.hasData = "false";
      return;
    }

    energyTarget.innerHTML = `
        <div class="info-stack">
            ${renderInfoBadge(`Label ${energyLabel.Energieklasse || "Not available"}`, "accent")}
            ${renderInfoBadge(energyLabel.Status || "Not available", "neutral")}
        </div>
        ${renderInfoRows([
          { label: "Type", value: energyLabel.Gebouwtype || energyLabel.Gebouwklasse || "Not available" },
          { label: "Year", value: energyLabel.Bouwjaar || "?" },
          { label: "CO2", value: energyLabel.BerekendeCO2Emissie != null ? `${Number(energyLabel.BerekendeCO2Emissie).toLocaleString("nl-NL")} kg/yr` : "Not available" },
          { label: "Energy use", value: energyLabel.BerekendeEnergieverbruik != null ? `${Number(energyLabel.BerekendeEnergieverbruik).toLocaleString("nl-NL")} kWh/yr` : "Not available" }
        ])}
    `;
    energyTarget.dataset.hasData = "true";

    if (typeof deps.markOperationalUpdate === "function") {
      deps.markOperationalUpdate("Energy label data updated", "Building performance");
    }
  }

  async function fetchAndDisplayRivmSensors(latitude, longitude) {
    const rivmTarget = document.getElementById("locationRivmContent");
    if (!rivmTarget) return;

    try {
      const sensors = await fetchNearestRivmSensors(latitude, longitude);
      if (!Array.isArray(sensors) || sensors.length === 0) {
        rivmTarget.textContent = window.udtI18n
          ? window.udtI18n.t("no_official_sensor_data")
          : "Geen actuele officiele meetpunten gevonden voor deze locatie.";
        rivmTarget.dataset.hasData = "false";
        return;
      }

      rivmTarget.innerHTML = sensors.map((sensor) => `
            <div class="location-inline-block">
                <div class="info-stack">
                    ${renderInfoBadge(sensor.stationName, "neutral")}
                </div>
                ${renderInfoRows([
                  { label: "Distance", value: `${sensor.distanceKm.toFixed(1)} km` },
                  { label: "PM2.5", value: sensor.values && sensor.values.PM25 != null ? sensor.values.PM25.toFixed(1) : "n/a" },
                  { label: "NO2", value: sensor.values && sensor.values.NO2 != null ? sensor.values.NO2.toFixed(1) : "n/a" },
                  { label: "O3", value: sensor.values && sensor.values.O3 != null ? sensor.values.O3.toFixed(1) : "n/a" }
                ])}
            </div>
        `).join("<hr>");
      rivmTarget.dataset.hasData = "true";

      if (typeof deps.markOperationalUpdate === "function") {
        deps.markOperationalUpdate("Official RIVM station data updated", "Official sensor monitoring");
      }
    } catch (error) {
      if (!hasWarnedAboutRivmCors) {
        console.warn("Official RIVM station data unavailable in-browser:", error.message || error);
        hasWarnedAboutRivmCors = true;
      }
      rivmTarget.textContent = getRivmUnavailableMessage();
      rivmTarget.dataset.hasData = "false";
    }
  }

  function normalizeCbsValue(value) {
    if (value === null || value === undefined || value === "" || Number.isNaN(value)) return null;
    if (typeof value === "number" && value <= -99995) return null;
    return value;
  }

  function pointInRing(point, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];
      const intersects = ((yi > point[1]) !== (yj > point[1]))
        && (point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || 1e-9) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function pointInPolygonGeometry(point, geometry) {
    if (!geometry || !geometry.type || !geometry.coordinates) return false;
    if (geometry.type === "Polygon") {
      return geometry.coordinates.some((ring) => pointInRing(point, ring));
    }
    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.some((polygon) => polygon.some((ring) => pointInRing(point, ring)));
    }
    return false;
  }

  function summarizeCbsNeighborhood(properties = {}) {
    return {
      buurtnaam: properties.buurtnaam || "Onbekende buurt",
      gemeentenaam: properties.gemeentenaam || "'s-Hertogenbosch",
      aantalInwoners: normalizeCbsValue(properties.aantalInwoners),
      bevolkingsdichtheid: normalizeCbsValue(properties.bevolkingsdichtheidInwonersPerKm2),
      huishoudens: normalizeCbsValue(properties.aantalHuishoudens),
      adressendichtheid: normalizeCbsValue(properties.omgevingsadressendichtheid),
      autosPerHuishouden: normalizeCbsValue(properties.personenautosPerHuishouden),
      leeftijd0tot15: normalizeCbsValue(properties.percentagePersonen0Tot15Jaar),
      leeftijd15tot25: normalizeCbsValue(properties.percentagePersonen15Tot25Jaar),
      leeftijd25tot45: normalizeCbsValue(properties.percentagePersonen25Tot45Jaar),
      leeftijd45tot65: normalizeCbsValue(properties.percentagePersonen45Tot65Jaar),
      leeftijd65plus: normalizeCbsValue(properties.percentagePersonen65JaarEnOuder),
      inkomenPerInwoner: normalizeCbsValue(properties.gemiddeldInkomenPerInwoner),
      wmoClientenPer1000: normalizeCbsValue(properties.aantalWmoClientenPer1000Inwoners)
    };
  }

  async function fetchCbsNeighborhoodStats(latitude, longitude) {
    const cacheKey = `cbs_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const delta = 0.012;
    const params = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeNames: "wijkenbuurten:buurten",
      count: "24",
      outputFormat: "application/json",
      srsName: "EPSG:4326",
      bbox: `${latitude - delta},${longitude - delta},${latitude + delta},${longitude + delta},EPSG:4326`
    });

    try {
      const response = await fetch(`${getDep("getCbsWfsUrl")}?${params.toString()}`);
      if (!response.ok) throw new Error(`CBS buurtprofielen fetch failed: ${response.status}`);

      const data = await response.json();
      const features = Array.isArray(data.features) ? data.features : [];
      const point = [longitude, latitude];
      const match = features.find((feature) => pointInPolygonGeometry(point, feature.geometry)) || features[0];
      if (!match) return null;

      const result = summarizeCbsNeighborhood(match.properties || {});
      cacheSet(cacheKey, result, 12 * 60 * 60 * 1000);
      return result;
    } catch (error) {
      console.warn("CBS buurtprofielen tijdelijk niet beschikbaar:", error);
      return null;
    }
  }

  window.udtLocationAnalysis = {
    configure,
    cacheSet,
    cacheGet,
    renderInfoRows,
    renderInfoBadge,
    showStatusToast,
    showNotification,
    makeSparkline,
    parseSemicolonCsv,
    distanceKm,
    setupMapClickHandler,
    getPlaceName,
    fetchRivmStations,
    fetchRivmComponentLatest,
    fetchNearestRivmSensors,
    fetchPopulationNearby,
    fetchPopulationByLabel,
    fetchNearbyHeritageSummary,
    fetchNearestBagBuildingInfo,
    fetchEnergyLabelForAddress,
    fetchAndDisplayBagInfo,
    fetchAndDisplayEnergyLabel,
    fetchAndDisplayRivmSensors,
    fetchCbsNeighborhoodStats
  };
})();
