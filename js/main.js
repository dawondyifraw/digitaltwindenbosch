// js/main.js

let isBuildingsLoaded = false;
let tomTomTrafficLayer = null;
let viewer = null;
let name = "";

// API keys filled from config.json
let TomTomAPI = "";
let airQualityApiKey = "";
let weatherApiKey = "";

let osmBuildingsTileset = null;
let biodiversityState = {
    active: false,
    dataSource: null,
    refreshTimer: null
};

const BIODIVERSITY_SERVICE_URL = "https://geo.s-hertogenbosch.nl/geoproxy/rest/services/Externvrij/CO2/MapServer/11";

// Helper to get elements
function $(id) {
    return document.getElementById(id);
}

// Wait until window.config.conf is ready
function waitForConfig() {
    return new Promise((resolve) => {
        if (window.config && window.config.conf) {
            resolve();
            return;
        }

        const handler = () => {
            if (window.config && window.config.conf) {
                document.removeEventListener("configLoaded", handler);
                resolve();
            }
        };

        document.addEventListener("configLoaded", handler);
    });
}

// Entry point

document.addEventListener("DOMContentLoaded", () => {
    startApp().catch((err) => {
        showCesiumErrorPopup("Error during app start: " + err);
        console.error("Error during app start:", err);
    });
});

function showCesiumErrorPopup(message) {
    let popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = 'rgba(0,0,0,0.6)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.zIndex = '9999';
    popup.innerHTML = `<div style="background:#fff;padding:2em 2.5em;border-radius:10px;box-shadow:0 2px 16px #0003;text-align:center;max-width:90vw;max-height:80vh;overflow:auto;">
        <h2 style='color:#c00;margin-bottom:1em;'>3D Viewer Error</h2>
        <p style='margin-bottom:1.5em;'>${message}</p>
        <button style='padding:0.5em 1.5em;font-size:1.1em;border-radius:6px;border:none;background:#0d6efd;color:#fff;cursor:pointer;' onclick='this.closest("div").parentNode.remove()'>Close</button>
    </div>`;
    document.body.appendChild(popup);
}

async function startApp() {
    await waitForConfig();

    const conf = window.config.conf;
    console.log("Config:", conf);

    Cesium.Ion.defaultAccessToken = conf.CESIUM_TOKEN;
    TomTomAPI = conf.TOMTOMAPI;
    airQualityApiKey = conf.AIRQUALITYAPI;
    weatherApiKey = conf.WEATHERAPI || conf.AIRQUALITYAPI;

    console.log("Weather API Key:", weatherApiKey);

    try {
        await initCesium();
        wireUi();
        // Hide splash only after Cesium and tiles are loaded
        const splash = document.getElementById('splashScreen');
        if (splash) splash.style.display = 'none';
    } catch (err) {
        showCesiumErrorPopup("Failed to load 3D viewer or tiles: " + err);
        throw err;
    }
}

// Wire UI buttons
function wireUi() {
    const trafficBtn = $("toggleTraffic");
    if (trafficBtn) {
        trafficBtn.addEventListener("click", toggleTraffic);
    }

    const flyBtn = $("flytoIKDBButton");
    if (flyBtn) {
        flyBtn.addEventListener("click", flytoIKDB);
    }

    const bagBtn = $("BAGButton");
    if (bagBtn) {
        bagBtn.addEventListener("click", toggleBuildings);
    }

    const biodiversityBtn = $("toggleBiodiversityBtn");
    if (biodiversityBtn) {
        biodiversityBtn.addEventListener("click", toggleBiodiversityStream);
    }
}

// Toggle Kadaster buildings
function toggleBuildings() {
    if (isBuildingsLoaded) {
        console.log("Buildings already loaded, no off toggle implemented yet.");
    } else {
        loadBuildings3DTiles();
    }
    isBuildingsLoaded = !isBuildingsLoaded;
}

// Load Kadaster 3D tiles (BAG)
async function loadBuildings3DTiles() {
    try {
        const tileset = new Cesium.Cesium3DTileset({
            url: "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/gebouwen/3dtiles"
        });

        viewer.scene.primitives.add(tileset);
        await tileset.readyPromise;
        viewer.zoomTo(tileset);

        console.log("3D Tiles for buildings loaded successfully.");
    } catch (error) {
        console.error("Error loading 3D Tiles for buildings:", error);
    }
}

// Init Cesium viewer
async function initCesium() {
    try {
        viewer = new Cesium.Viewer("cesiumContainer", {
            terrainProvider: Cesium.createWorldTerrain(),
            imageryProvider: Cesium.createWorldImagery(),
            requestRenderMode: true,
            animation: true,
            timeline: true,
            sceneMode: Cesium.SceneMode.SCENE3D,
            baseLayerPicker: false
        });

        // Replace Cesium logo with Den Bosch logo
        viewer.scene.postRender.addEventListener(() => {
            const creditContainer = document.querySelector(".cesium-credit-logoContainer");
            if (creditContainer) {
                creditContainer.innerHTML = `
                    <a href="https://www.denbosch.nl" target="_blank">
                        <img title="Den Bosch"
                             src="https://ros-tvkrant.nl/wp-content/uploads/2023/10/logo-s-hertogenbosch.jpg"
                             style="width: 150px;">
                    </a>`;
            }
        });

        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.skyBox.show = false;
        viewer.scene.backgroundColor = Cesium.Color.BLACK;
        viewer.scene.globe.enableLighting = true;
        viewer.shadows = true;
        viewer.camera.frustum.far = 10000000.0;

        if (viewer.dataSources.length > 0) {
            viewer.dataSources.get(0).clustering.enabled = false;
        }

        viewer.entities.removeAll();

        await loadTileset();
        setupMapClickHandler();
        addCombinedContextMenu(viewer);
    } catch (err) {
        showCesiumErrorPopup("Cesium initialization failed: " + err);
        throw err;
    }
}

// Load base 3D tiles + OSM buildings and style them
async function loadTileset() {
    console.log("Loading main tileset and OSM buildings");

    try {
        const tilesetResource = await Cesium.IonResource.fromAssetId(2275207);
        const tileset = new Cesium.Cesium3DTileset({
            url: tilesetResource
        });

        viewer.scene.primitives.add(tileset);

        osmBuildingsTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

        osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ["${building} === 'school'", "color('rgba(70, 130, 180, 0.8)')"],
                    ["${building} === 'university'", "color('rgba(34, 139, 34, 0.8)')"],
                    ["${building} === 'hospital'", "color('rgba(255, 69, 0, 0.8)')"],
                    ["${building} === 'parking'", "color('rgba(128, 128, 128, 0.7)')"],
                    ["${building} === 'church'", "color('rgba(148, 0, 211, 0.8)')"],
                    ["${building} === 'retail'", "color('rgba(255, 165, 0, 0.8)')"],
                    ["${building} === 'industrial'", "color('rgba(160, 82, 45, 0.8)')"],
                    ["${building} === 'commercial'", "color('rgba(0, 0, 139, 0.8)')"],
                    ["${building} === 'hotel'", "color('rgba(255, 223, 0, 0.8)')"],
                    ["${building} === 'house'", "color('rgba(255, 182, 193, 0.8)')"],
                    ["${building} === 'apartments'", "color('rgba(135, 206, 235, 0.8)')"],
                    ["${building} === 'office'", "color('rgba(105, 105, 105, 0.8)')"],
                    ["true", "color('rgba(200, 200, 200, 0.6)')"]
                ]
            }
        });

        function addBuildingPin(buildingType, latitude, longitude) {
            const pinBuilder = new Cesium.PinBuilder();
            let pinColor;
            let iconId;

            switch (buildingType) {
                case "hospital":
                    iconId = "hospital";
                    pinColor = Cesium.Color.RED;
                    break;
                case "school":
                    iconId = "school";
                    pinColor = Cesium.Color.YELLOW;
                    break;
                case "university":
                    iconId = "college";
                    pinColor = Cesium.Color.ORANGE;
                    break;
                case "parking":
                    iconId = "parking";
                    pinColor = Cesium.Color.BLUE;
                    break;
                case "church":
                    iconId = "religious-christian";
                    pinColor = Cesium.Color.PURPLE;
                    break;
                case "retail":
                    iconId = "shop";
                    pinColor = Cesium.Color.PINK;
                    break;
                case "industrial":
                    iconId = "industrial";
                    pinColor = Cesium.Color.GRAY;
                    break;
                default:
                    return;
            }

            pinBuilder.fromMakiIconId(iconId, pinColor, 48).then((canvas) => {
                viewer.entities.add({
                    name: buildingType.charAt(0).toUpperCase() + buildingType.slice(1),
                    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                    billboard: {
                        image: canvas.toDataURL(),
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        scaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.2, 1.0e6, 0.8),
                        pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.2, 1.0e6, 0.8),
                        show: true
                    }
                });
            });
        }

        let lastProcessedTime = Date.now();
        const throttleDelay = 1000;

        osmBuildingsTileset.tileVisible.addEventListener((tile) => {
            const currentTime = Date.now();
            if (currentTime - lastProcessedTime < throttleDelay) return;
            lastProcessedTime = currentTime;

            const features = tile.content.featuresLength;
            for (let i = 0; i < features; i++) {
                const feature = tile.content.getFeature(i);
                const buildingType = feature.getProperty("building");

                let latitude = feature.getProperty("cesium#latitude");
                let longitude = feature.getProperty("cesium#longitude");

                if (!latitude || !longitude) {
                    const cartesianPosition = feature.getProperty("cesium#position");
                    if (cartesianPosition) {
                        const cartographicPosition = Cesium.Cartographic.fromCartesian(cartesianPosition);
                        latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
                        longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
                    }
                }

                if (latitude && longitude && buildingType) {
                    addBuildingPin(buildingType, latitude, longitude);
                }
            }
        });

        await viewer.zoomTo(tileset);
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(5.3154, 51.67855, 500),
            orientation: {
                heading: Cesium.Math.toRadians(0.0),
                pitch: Cesium.Math.toRadians(-30.0),
                roll: 0.0
            },
            duration: 4
        });
    } catch (error) {
        console.error("Error loading tileset:", error);
    }
}

function setupMapClickHandler() {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(async function (click) {
        const pickedPosition = viewer.camera.pickEllipsoid(
            click.position,
            viewer.scene.globe.ellipsoid
        );
        if (pickedPosition) {
            const cartographicPosition = Cesium.Cartographic.fromCartesian(pickedPosition);
            const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
            const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);

            await getPlaceName(latitude, longitude);
            await fetchAndDisplayWeather(latitude, longitude);
            await fetchAndDisplayAirQuality(latitude, longitude);
            await fetchAndDisplayTraffic(latitude, longitude);
            if (typeof updateCharts === "function") {
                updateCharts(latitude, longitude);
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

async function getPlaceName(latitude, longitude) {
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${TomTomAPI}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error. Status: ${response.status}`);

        const data = await response.json();

        if (data.addresses && data.addresses.length > 0) {
            name = data.addresses[0].address.freeformAddress;
            console.log(`Place name found: ${name}`);

            if (name === "'s-Gravesandestraat 40, 5223 BS 's-Hertogenbosch") {
                showSimplifiedPopup(latitude, longitude);
            }
        } else {
            console.warn("No addresses data returned from the API.");
        }
    } catch (error) {
        console.error("Error fetching place name:", error);
    }
}

// --- Module-level simple cache and helpers (reduce rate-limit calls) ---
const UDT_CACHE = {};
function cacheSet(key, value, ttlMs) {
    const expires = Date.now() + (ttlMs || 10 * 60 * 1000);
    UDT_CACHE[key] = { value, expires };
    try { localStorage.setItem('udt_cache_' + key, JSON.stringify({ value, expires })); } catch (e) { }
}
function cacheGet(key) {
    const inmem = UDT_CACHE[key];
    if (inmem && inmem.expires > Date.now()) return inmem.value;
    try {
        const s = localStorage.getItem('udt_cache_' + key);
        if (s) {
            const obj = JSON.parse(s);
            if (obj.expires > Date.now()) {
                UDT_CACHE[key] = obj;
                return obj.value;
            } else {
                localStorage.removeItem('udt_cache_' + key);
            }
        }
    } catch (e) { }
    return null;
}

function makeSparkline(values = [], color = '#007bff') {
    if (!values || values.length === 0) return '';
    const w = Math.max(60, values.length * 6);
    const h = 40;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = (max - min) || 1;
    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * (w - 4) + 2;
        const y = h - 4 - ((v - min) / range) * (h - 8);
        return `${x},${y}`;
    }).join(' ');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

async function fetchPopulationNearby(lat, lon, labelFallback) {
    const key = `pop_${lat.toFixed(4)}_${lon.toFixed(4)}` + (labelFallback ? `_label_${labelFallback.replace(/\s+/g,'_')}` : '');
    const cached = cacheGet(key);
    if (cached) return cached;
    // SPARQL: find nearest entity with population claim (P1082)
    const wkt = `Point(${lon} ${lat})`;
    const sparql = `SELECT ?item ?itemLabel ?population WHERE { ?item wdt:P625 ?coord . SERVICE wikibase:around { ?item wdt:P625 ?location . bd:serviceParam wikibase:center "${wkt}"^^geo:wktLiteral; bd:serviceParam wikibase:radius "2". } OPTIONAL { ?item wdt:P1082 ?population. } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } ORDER BY DESC(?population) LIMIT 1`;
    const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql);
    try {
        const resp = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json' } });
        if (!resp.ok) return null;
        const data = await resp.json();
        const bindings = data.results.bindings;
        if (bindings && bindings.length > 0) {
            const b = bindings[0];
            const result = {
                label: b.itemLabel ? b.itemLabel.value : null,
                population: b.population ? parseInt(b.population.value, 10) : null
            };
            cacheSet(key, result, 24 * 60 * 60 * 1000); // cache 24h
            return result;
        }
    } catch (e) {
        console.warn('fetchPopulationNearby failed', e);
    }
    // fallback: try label-based lookup if we have a place name
    if (labelFallback) {
        try {
            const fb = await fetchPopulationByLabel(labelFallback);
            if (fb) {
                cacheSet(key, fb, 24 * 60 * 60 * 1000);
                return fb;
            }
        } catch (e) {
            console.warn('fetchPopulationNearby fallback failed', e);
        }
    }
    return null;
}

async function fetchPopulationByLabel(label) {
    if (!label) return null;
    const key = `pop_label_${label.replace(/\s+/g,'_')}`;
    const cached = cacheGet(key);
    if (cached) return cached;
    try {
        const searchUrl = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&search=' + encodeURIComponent(label) + '&origin=*';
        const sresp = await fetch(searchUrl);
        if (!sresp.ok) return null;
        const sdata = await sresp.json();
        if (sdata && sdata.search && sdata.search.length > 0) {
            const qid = sdata.search[0].id;
            const entUrl = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + encodeURIComponent(qid) + '&props=claims|labels&languages=en&format=json&origin=*';
            const eres = await fetch(entUrl);
            if (!eres.ok) return null;
            const ed = await eres.json();
            const entity = ed.entities && ed.entities[qid];
            if (entity) {
                let population = null;
                try {
                    const claims = entity.claims && entity.claims.P1082;
                    if (claims && claims.length) {
                        // pick the latest non-deprecated claim
                        for (const c of claims) {
                            if (c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value) {
                                population = parseInt(c.mainsnak.datavalue.value.amount || c.mainsnak.datavalue.value, 10);
                                if (!isNaN(population)) break;
                            }
                        }
                    }
                } catch (e) { }
                const result = { label: entity.labels && entity.labels.en && entity.labels.en.value ? entity.labels.en.value : label, population: population };
                cacheSet(key, result, 24 * 60 * 60 * 1000);
                return result;
            }
        }
    } catch (e) {
        console.warn('fetchPopulationByLabel failed', e);
    }
    return null;
}

async function fetchAirPollutionTrend(lat, lon) {
    const keyCache = `air_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    const cached = cacheGet(keyCache);
    if (cached) return cached;
    const key = (typeof airQualityApiKey === 'string' && airQualityApiKey) ? airQualityApiKey : (window.config && window.config.conf && (window.config.conf.AIRQUALITYAPI || window.config.conf.WEATHERAPI));
    if (!key) return null;
    const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${key}`;
    // simple retry with exponential backoff for 429/network errors
    let attempt = 0;
    const maxAttempts = 3;
    let lastErr = null;
    while (attempt < maxAttempts) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) {
                lastErr = new Error('HTTP ' + resp.status);
                if (resp.status === 429) {
                    // rate limited — wait and retry
                    attempt++;
                    await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
                    continue;
                }
                return null;
            }
            const data = await resp.json();
            if (!data.list || !Array.isArray(data.list)) return null;
            const co = data.list.map(item => (item.components && item.components.co) ? item.components.co : 0).slice(0, 24);
            const pm25 = data.list.map(item => (item.components && item.components.pm2_5) ? item.components.pm2_5 : 0).slice(0, 24);
            const no2 = data.list.map(item => (item.components && item.components.no2) ? item.components.no2 : 0).slice(0, 24);
            const o3 = data.list.map(item => (item.components && item.components.o3) ? item.components.o3 : 0).slice(0, 24);
            const result = { co, pm25, no2, o3 };
            cacheSet(keyCache, result, 10 * 60 * 1000); // cache 10 minutes
            return result;
        } catch (e) {
            lastErr = e;
            attempt++;
            await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
        }
    }
    console.warn('fetchAirPollutionTrend failed after retries', lastErr);
    return null;
}

async function fetchAndDisplayWeather(latitude, longitude) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch weather data");

        const weatherData = await response.json();
        const weatherContent = `
            <strong>Weather at ${name}</strong><br>
            Temperature: ${weatherData.main.temp} °C<br>
            Feels like: ${weatherData.main.feels_like} °C<br>
            Weather: ${weatherData.weather[0].main} (${weatherData.weather[0].description})<br>
            Humidity: ${weatherData.main.humidity}%<br>
            Wind: ${weatherData.wind.speed} m/s, ${weatherData.wind.deg}
        `;
        showNotification("weather", weatherContent);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        showNotification("weather", "Error fetching weather data");
    }
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
            <strong>Air Quality at ${name}</strong><br>
            AQI: ${aqi} (${aqiDescription})<br>
            PM2.5: ${components.pm2_5} µg/m³<br>
            PM10: ${components.pm10} µg/m³<br>
            NO2: ${components.no2} µg/m³<br>
            O3: ${components.o3} µg/m³<br>
            CO: ${components.co} µg/m³
        `;
        showNotification("air-quality", airQualityContent);
    } catch (error) {
        console.error("Error fetching air quality data:", error);
        showNotification("air-quality", "Error fetching air quality data");
    }
}

async function fetchAndDisplayTraffic(latitude, longitude) {
    try {
        const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TomTomAPI}&point=${latitude},${longitude}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch traffic data");

        const trafficData = await response.json();
        if (trafficData && trafficData.flowSegmentData) {
            const traffic = trafficData.flowSegmentData;
            const trafficContent = `
                <strong>Traffic Information at ${name}</strong><br>
                Road: ${traffic.roadName || "N/A"}<br>
                Speed: ${traffic.currentSpeed} km/h<br>
                Free Flow Speed: ${traffic.freeFlowSpeed} km/h<br>
                Travel Time: ${traffic.currentTravelTime} seconds<br>
                Confidence: ${traffic.confidence}%
            `;
            showNotification("traffic", trafficContent);
        }
    } catch (error) {
        console.error("Error fetching traffic data:", error);
        showNotification("traffic", "Error fetching traffic data");
    }
}

function showNotification(type, content) {
    const notificationArea = $("notificationArea");
    if (!notificationArea) return;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        <p>${content}</p>
    `;

    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 1000);
    }, 9000);
}

function toggleTraffic() {
    console.log("Toggling Traffic Layer", tomTomTrafficLayer);
    if (!tomTomTrafficLayer) {
        tomTomTrafficLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
                url: "https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=" + TomTomAPI,
                maximumLevel: 18
            })
        );
    } else {
        viewer.imageryLayers.remove(tomTomTrafficLayer, false);
        tomTomTrafficLayer = null;
    }
}

function toggleRightPanel() {
    const rightPanel = $("rightPanel");
    if (!rightPanel) return;
    const current = rightPanel.style.display;
    rightPanel.style.display = (current === "none" || current === "") ? "block" : "none";
}

function flytoIKDB() {
    const IKDBCoordinates = {
        longitude: 5.291,
        latitude: 51.686,
        height: 500
    };

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            IKDBCoordinates.longitude,
            IKDBCoordinates.latitude,
            IKDBCoordinates.height
        ),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-30),
            roll: 0.0
        },
      duration: 3.0
  });
}

async function toggleBiodiversityStream() {
    const button = $("toggleBiodiversityBtn");
    if (!viewer) return;

    if (biodiversityState.active) {
        biodiversityState.active = false;
        if (biodiversityState.refreshTimer) {
            clearInterval(biodiversityState.refreshTimer);
            biodiversityState.refreshTimer = null;
        }
        if (biodiversityState.dataSource) {
            viewer.dataSources.remove(biodiversityState.dataSource, true);
            biodiversityState.dataSource = null;
        }
        if (button) {
            button.textContent = "Biodiversity Stream OFF";
            button.setAttribute("aria-pressed", "false");
        }
        return;
    }

    biodiversityState.active = true;
    if (button) {
        button.textContent = "Biodiversity Stream ON";
        button.setAttribute("aria-pressed", "true");
    }

    await loadBiodiversityTrees();
    biodiversityState.refreshTimer = setInterval(loadBiodiversityTrees, 5 * 60 * 1000);
}

async function loadBiodiversityTrees() {
    if (!viewer) return;

    const bbox = {
        xmin: 5.20,
        ymin: 51.62,
        xmax: 5.45,
        ymax: 51.78
    };

    const params = new URLSearchParams({
        where: "1=1",
        outFields: "*",
        f: "json",
        geometryType: "esriGeometryEnvelope",
        geometry: `${bbox.xmin},${bbox.ymin},${bbox.xmax},${bbox.ymax}`,
        inSR: "4326",
        outSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        resultRecordCount: "800"
    });

    const requestUrl = `${BIODIVERSITY_SERVICE_URL}/query?${params.toString()}`;

    try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error(`Biodiversity fetch failed: ${response.status}`);
        }
        const data = await response.json();
        const features = Array.isArray(data.features) ? data.features : [];
        if (!features.length) {
            showNotification("event", "No biodiversity tree points found in the current area.");
            return;
        }

        if (!biodiversityState.dataSource) {
            biodiversityState.dataSource = new Cesium.CustomDataSource("biodiversityTrees");
            viewer.dataSources.add(biodiversityState.dataSource);
        } else {
            biodiversityState.dataSource.entities.removeAll();
        }

        const pointColor = Cesium.Color.fromCssColorString("#3dd6c6").withAlpha(0.85);
        const outlineColor = Cesium.Color.fromCssColorString("#0b1220");

        features.forEach((feature) => {
            if (!feature || !feature.geometry) return;
            const { x, y } = feature.geometry;
            if (typeof x !== "number" || typeof y !== "number") return;

            const attributes = feature.attributes || {};
            const title =
                attributes.Boomsoort ||
                attributes.Soort ||
                attributes.naam ||
                attributes.Naam ||
                "Tree";

            const description = buildAttributesTable(attributes);

            biodiversityState.dataSource.entities.add({
                position: Cesium.Cartesian3.fromDegrees(x, y, 0),
                point: {
                    pixelSize: 5,
                    color: pointColor,
                    outlineColor: outlineColor,
                    outlineWidth: 1
                },
                name: title,
                description
            });
        });
    } catch (error) {
        console.error("Biodiversity stream error:", error);
        showNotification("event", "Biodiversity stream unavailable (API blocked or offline).");
    }
}

function buildAttributesTable(attributes) {
    const entries = Object.entries(attributes || {}).slice(0, 8);
    if (!entries.length) return "No attributes available.";

    const rows = entries
        .map(([key, value]) => `<tr><td style="padding:4px 8px;color:#9fb2c8;">${key}</td><td style="padding:4px 8px;color:#e6edf6;">${value}</td></tr>`)
        .join("");

    return `<table style="border-collapse:collapse;font-size:12px;">${rows}</table>`;
}

function flyToMuseumArea() {
    if (!viewer) return;
    stopOrbit();
    const museumCenter = {
        longitude: 5.3043,
        latitude: 51.6863,
        height: 750
    };

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            museumCenter.longitude,
            museumCenter.latitude,
            museumCenter.height
        ),
        orientation: {
            heading: Cesium.Math.toRadians(15),
            pitch: Cesium.Math.toRadians(-35),
            roll: 0.0
        },
        duration: 2.4
    });
}

function flyToAndOrbitWithLimit(longitude, latitude, height = 500, rotationSpeed = 0.0001, rotationDuration = 10000) {
    const target = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

    viewer.camera.flyTo({
        destination: target,
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-20),
            roll: 0.0
        },
        duration: 3,
        complete: function () {
            startSmoothRotation(target, height, rotationSpeed, rotationDuration);
        }
    });
}

function startSmoothRotation(target, range, rotationSpeed, rotationDuration) {
    // Deprecated: kept for backward compatibility but forward to time-based implementation
    startSmoothRotationTimeBased(target, range, rotationSpeed, rotationDuration);
}

// Orbit controller state and animation id
let orbitAnimationId = null;
const orbitState = {
    active: false,
    heading: 0,
    pitch: Cesium.Math.toRadians(-20),
    speedRadPerSec: 0.2,
    target: null,
    range: 500,
};

function startSmoothRotationTimeBased(target, range, speedRadPerSec = 0.2, durationMs = null) {
    // stop any existing orbit
    stopOrbit();
    orbitState.active = true;
    orbitState.heading = 0;
    orbitState.speedRadPerSec = speedRadPerSec;
    orbitState.target = target;
    orbitState.range = range;

    let startTime = performance.now();
    let lastTime = startTime;

    function frame(now) {
        if (!orbitState.active) return;
        const dt = (now - lastTime) / 1000.0; // seconds
        lastTime = now;
        orbitState.heading += orbitState.speedRadPerSec * dt;
        try {
            viewer.camera.lookAt(
                orbitState.target,
                new Cesium.HeadingPitchRange(orbitState.heading, orbitState.pitch, orbitState.range)
            );
        } catch (e) {
            console.warn('Orbit lookAt failed', e);
        }

        if (durationMs && (now - startTime) >= durationMs) {
            stopOrbit();
            return;
        }

        orbitAnimationId = requestAnimationFrame(frame);
    }

    orbitAnimationId = requestAnimationFrame(frame);
}

function stopOrbit() {
    if (!viewer) return;
    // cancel any running animation frame
    if (orbitAnimationId) {
        cancelAnimationFrame(orbitAnimationId);
        orbitAnimationId = null;
    }
    orbitState.active = false;
    orbitState.target = null;
    try {
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    } catch (e) {
        console.warn('stopOrbit: lookAtTransform failed', e);
    }
}

function highlightAllResidentialBuildings() {
    if (!osmBuildingsTileset) {
        console.warn("OSM buildings tileset not ready");
        return;
    }

    osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: {
            conditions: [
                [
                    "${feature['building']} === 'apartments' || ${feature['building']} === 'residential'",
                    "color('cyan', 0.9)"
                ],
                [true, "color('white')"]
            ]
        }
    });
}

function showSimplifiedPopup(latitude, longitude) {
    viewer.entities.removeAll();

    const popupEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        label: {
            text: "St. John's Cathedral\n's-Gravesandestraat 40, 's-Hertogenbosch",
            font: "16px sans-serif",
            fillColor: Cesium.Color.BLACK,
            showBackground: true,
            backgroundColor: Cesium.Color.WHITE,
            pixelOffset: new Cesium.Cartesian2(0, -40),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        },
        billboard: {
            image: "./Evening-in-s-Hertogenbosch-normal_jpg_6951.jpg",
            width: 64,
            height: 64,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
    });

    viewer.flyTo(popupEntity, {
        offset: new Cesium.HeadingPitchRange(
            0,
            Cesium.Math.toRadians(-30),
            500
        )
    });

    console.log("Popup displayed at St. John's Cathedral.");
}

function addCombinedContextMenu(viewer) {
    if (!viewer || !viewer.container) {
        console.error("Viewer instance is not defined or initialized.");
        return;
    }

    const contextMenu = document.createElement("div");
    contextMenu.id = "contextMenu";
    contextMenu.className = "context-menu";
    contextMenu.style.display = "none";
    contextMenu.style.position = "absolute";
    contextMenu.style.zIndex = "1000";
    document.body.appendChild(contextMenu);

    contextMenu.innerHTML = `
        <div id="zoomIn">Zoom In</div>
        <div id="zoomOut">Zoom Out</div>
        <div id="centerHere">Center Here</div>
        <hr>
        <div id="analyzeHere">Analyze Here</div>
        <div id="dashboardBtn" style="margin: 6px 0; color: #0d6efd; cursor: pointer; font-weight: 600;">Dashboard</div>
        <div id="showInfo">Show Info</div>
        <div id="showSettings">Settings</div>
        <div id="showHelp">Help</div>
    `;
    // Dashboard button event
    const dashboardBtn = $("dashboardBtn");
    if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => {
            window.open("dashboard/dashboard_sensors.html", "_blank");
            hideContextMenu();
        });
    }

    function showContextMenu(x, y) {
        contextMenu.style.left = x + "px";
        contextMenu.style.top = y + "px";
        contextMenu.style.display = "block";
    }

    function hideContextMenu() {
        contextMenu.style.display = "none";
    }

    // remember the last right-click coordinates (lon/lat) for Analyze action
    let lastContextLon = null;
    let lastContextLat = null;
    viewer.container.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        // Compute canvas-relative coordinates (accounts for page layout/sidebars)
        try {
            const rect = viewer.scene.canvas.getBoundingClientRect();
            const canvasX = event.clientX - rect.left;
            const canvasY = event.clientY - rect.top;
            const ellipsoid = viewer.scene.globe.ellipsoid;
            const cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(canvasX, canvasY), ellipsoid);
            if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                lastContextLat = Cesium.Math.toDegrees(cartographic.latitude);
                lastContextLon = Cesium.Math.toDegrees(cartographic.longitude);
            } else {
                lastContextLat = null;
                lastContextLon = null;
            }
            // position the context menu at the original window coords
            showContextMenu(event.clientX, event.clientY);
        } catch (e) {
            lastContextLat = null;
            lastContextLon = null;
            showContextMenu(event.clientX, event.clientY);
        }
    });

    window.addEventListener("click", hideContextMenu);

    const displayDiv = document.createElement("div");
    displayDiv.id = "displayDiv";
    displayDiv.style.display = "none";
    displayDiv.style.position = "fixed";
    displayDiv.style.top = "50%";
    displayDiv.style.left = "50%";
    displayDiv.style.transform = "translate(-50%, -50%)";
    displayDiv.style.background = "#0c5977ff";
    displayDiv.style.border = "1px solid #ceb0b0ff";
    displayDiv.style.padding = "20px";
    displayDiv.style.zIndex = "1001";
    document.body.appendChild(displayDiv);

    displayDiv.innerHTML += `<button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;

    const zoomIn = $("zoomIn");
    const zoomOut = $("zoomOut");
    const centerHere = $("centerHere");
    const showInfo = $("showInfo");
    const showSettings = $("showSettings");
    const showHelp = $("showHelp");
    const analyiseArea = $("analyiseArea");

    if (zoomIn) {
        zoomIn.addEventListener("click", () => {
            viewer.camera.zoomIn();
            hideContextMenu();
        });
    }

    if (zoomOut) {
        zoomOut.addEventListener("click", () => {
            viewer.camera.zoomOut();
            hideContextMenu();
        });
    }

    if (centerHere) {
        centerHere.addEventListener("click", (event) => {
            const scene = viewer.scene;
            const ellipsoid = scene.globe.ellipsoid;
            const cartesian = viewer.camera.pickEllipsoid(
                new Cesium.Cartesian2(event.clientX, event.clientY),
                ellipsoid
            );

            if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromRadians(
                        cartographic.longitude,
                        cartographic.latitude,
                        viewer.camera.positionCartographic.height
                    )
                });
            }
            hideContextMenu();
        });
    }

    if (showInfo) {
        showInfo.addEventListener("click", () => {
            displayDiv.style.display = "block";
            displayDiv.innerHTML = `<h2>Info</h2><p>Digital Twins Den Bosch v.2.0 in collaboration with DataTwinLabs, 2025. All Rights Reserved.</p><button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;
            hideContextMenu();
        });
    }

    if (showSettings) {
        showSettings.addEventListener("click", () => {
            displayDiv.style.display = "block";
            displayDiv.innerHTML = `<h2>Settings</h2><p>Settings options and preferences go here.</p><button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;
            hideContextMenu();
        });
    }

    if (showHelp) {
        showHelp.addEventListener("click", () => {
            displayDiv.style.display = "block";
            displayDiv.innerHTML = `<h2>Help</h2><p>This is the help section with guidance and FAQs.</p><button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;
            hideContextMenu();
        });
    }

    // Small Analyze popup that shows population and pollution trend for the clicked location

    const analyzeHere = $("analyzeHere");
    if (analyzeHere) {
        analyzeHere.addEventListener("click", async () => {
            hideContextMenu();
            // create or reuse a small popup
            let popup = $("analyzePopup");
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'analyzePopup';
                popup.style.position = 'absolute';
                popup.style.minWidth = '260px';
                popup.style.maxWidth = '420px';
                popup.style.padding = '10px';
                popup.style.border = '1px solid #ccc';
                popup.style.borderRadius = '8px';
                // use the app's right-panel/display background where available for visibility
                popup.style.background = (displayDiv && displayDiv.style && displayDiv.style.background) ? displayDiv.style.background : contextMenu.style.background || 'rgba(12,89,119,0.95)';
                popup.style.color = '#e6f7ff';
                popup.style.zIndex = 10002;
                popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
                    popup.innerHTML = `
                        <div id="analyzeHeader" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:move">
                            <div style="display:flex;gap:8px;align-items:center"><strong>Analyze Here</strong><span id="analyzeSpinner" style="display:none;width:16px;height:16px"><svg viewBox="0 0 50 50" width="16" height="16"><circle cx="25" cy="25" r="20" fill="none" stroke="#007bff" stroke-width="4" stroke-dasharray="31.4 31.4"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg></span></div>
                            <div style="display:flex;gap:6px;align-items:center"><button id="pinAnalyzePopup" title="Pin popup" type="button" style="background:transparent;border:none;cursor:pointer;font-size:16px">📌</button><button id="closeAnalyzePopup" type="button" aria-label="Close analyze popup" style="background:transparent;border:none;font-size:16px;cursor:pointer">×</button></div>
                        </div>
                        <div id="analyzeContent">Analyzing…</div>`;
                document.body.appendChild(popup);
                // ensure popup receives pointer events and sits above other UI
                popup.style.pointerEvents = 'auto';
                popup.style.zIndex = 12001;
                // close handler (both click and pointerdown for reliability)
                const closeBtnEl = document.getElementById('closeAnalyzePopup');
                if (closeBtnEl) {
                    const doClose = (ev) => {
                        try { ev.stopPropagation(); ev.preventDefault(); } catch (e) { }
                        const pinned = localStorage.getItem('udt_analyze_pinned');
                        if (pinned === 'true') {
                            popup.style.display = 'none';
                        } else {
                            popup.remove();
                        }
                    };
                    closeBtnEl.addEventListener('click', doClose);
                    closeBtnEl.addEventListener('pointerdown', doClose);
                    closeBtnEl.style.cursor = 'pointer';
                    closeBtnEl.style.zIndex = 12002;
                }

                // pin handler
                const pinBtn = document.getElementById('pinAnalyzePopup');
                pinBtn.addEventListener('click', () => {
                    const isPinned = localStorage.getItem('udt_analyze_pinned') === 'true';
                    localStorage.setItem('udt_analyze_pinned', (!isPinned).toString());
                    pinBtn.style.opacity = (!isPinned) ? '1' : '0.5';
                });

                // draggable header to reposition popup and persist position
                const header = document.getElementById('analyzeHeader');
                let dragging = false, dragOffsetX = 0, dragOffsetY = 0;
                header.addEventListener('pointerdown', (ev) => {
                    dragging = true;
                    const rect = popup.getBoundingClientRect();
                    dragOffsetX = ev.clientX - rect.left;
                    dragOffsetY = ev.clientY - rect.top;
                    header.setPointerCapture(ev.pointerId);
                });
                window.addEventListener('pointermove', (ev) => {
                    if (!dragging) return;
                    const left = Math.min(window.innerWidth - 100, Math.max(8, ev.clientX - dragOffsetX));
                    const top = Math.min(window.innerHeight - 80, Math.max(8, ev.clientY - dragOffsetY));
                    popup.style.left = left + 'px';
                    popup.style.top = top + 'px';
                });
                window.addEventListener('pointerup', (ev) => {
                    if (!dragging) return;
                    dragging = false;
                    try { header.releasePointerCapture(ev.pointerId); } catch (e) { }
                    // persist pos
                    try { localStorage.setItem('udt_analyze_pos', JSON.stringify({ left: popup.style.left, top: popup.style.top })); } catch (e) { }
                });

                // restore pinned state and position
                try {
                    const pinned = localStorage.getItem('udt_analyze_pinned');
                    if (pinned === 'true') pinBtn.style.opacity = '1'; else pinBtn.style.opacity = '0.5';
                    const pos = JSON.parse(localStorage.getItem('udt_analyze_pos') || 'null');
                    if (pos && pos.left && pos.top) {
                        popup.style.left = pos.left; popup.style.top = pos.top;
                    }
                } catch (e) { }
            } else {
                popup.querySelector('#analyzeContent').innerHTML = 'Analyzing…';
                popup.style.display = 'block';
            }

            // position popup near where the context menu was shown
            try {
                const left = parseInt(contextMenu.style.left || '200', 10) + contextMenu.offsetWidth + 8;
                const top = parseInt(contextMenu.style.top || '200', 10);
                popup.style.left = Math.min(window.innerWidth - 440, left) + 'px';
                popup.style.top = Math.min(window.innerHeight - 200, top) + 'px';
            } catch (e) { /* ignore */ }

            const contentEl = popup.querySelector('#analyzeContent');
            if (contentEl) {
                contentEl.style.background = 'rgb(6 58 78 / 61%)';
                contentEl.style.padding = '8px';
                contentEl.style.borderRadius = '6px';
                contentEl.style.color = '#e6f7ff';
            }

            const lat = lastContextLat;
            const lon = lastContextLon;
            if (lat == null || lon == null) {
                contentEl.innerHTML = '<em>Unable to determine location at this pixel. Please click on the globe to select a point.</em>';
                return;
            }

            // fetch and display results (show spinner)
            try {
                const spinner = popup.querySelector('#analyzeSpinner');
                if (spinner) spinner.style.display = 'inline-block';
                // ensure place name is resolved first so we can use it as a fallback for Wikidata lookup
                await getPlaceName(lat, lon).catch(() => null);
                const popPromise = fetchPopulationNearby(lat, lon, name).catch(() => null);
                const airPromise = fetchAirPollutionTrend(lat, lon).catch(() => null);

                const [pop, air] = await Promise.all([popPromise, airPromise]);
                const place = null; // name is available via global 'name'
                if (spinner) spinner.style.display = 'none';

                let html = '';
                html += `<div style="margin-bottom:6px"><strong>Location:</strong> ${name || (place && place.address) || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}</div>`;

                if (pop && (pop.population || pop.label)) {
                    html += `<div style="margin-bottom:6px"><strong>Entity:</strong> ${pop.label || 'N/A'}<br><strong>Population:</strong> ${pop.population ? pop.population.toLocaleString() : 'Unknown'}</div>`;
                } else {
                    html += `<div style="margin-bottom:6px"><strong>Population:</strong> Unknown</div>`;
                }

                if (air && (air.co || air.pm25 || air.no2 || air.o3)) {
                    html += `<div style="margin-bottom:6px"><strong>Air pollution (24h forecast)</strong><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">`;
                    if (air.co && air.co.length) html += `<div style="flex:1;min-width:120px"><small>CO</small>${makeSparkline(air.co, '#ff7f0e')}</div>`;
                    if (air.pm25 && air.pm25.length) html += `<div style="flex:1;min-width:120px"><small>PM2.5</small>${makeSparkline(air.pm25, '#2ca02c')}</div>`;
                    if (air.no2 && air.no2.length) html += `<div style="flex:1;min-width:120px"><small>NO2</small>${makeSparkline(air.no2, '#9467bd')}</div>`;
                    if (air.o3 && air.o3.length) html += `<div style="flex:1;min-width:120px"><small>O3</small>${makeSparkline(air.o3, '#1f77b4')}</div>`;
                    html += `</div></div>`;
                } else {
                    html += `<div style="margin-bottom:6px"><strong>Air pollution:</strong> Not available (API key missing, rate-limited, or no data)</div>`;
                }

                html += `<div style="margin-top:6px;font-size:11px;color:#666">Data sources: Wikidata (population), OpenWeatherMap (air pollution). Results may be approximate and are subject to API limits.</div>`;
                contentEl.innerHTML = html;
            } catch (e) {
                console.error('Analyze failed', e);
                contentEl.innerHTML = '<em>Error while fetching analysis data.</em>';
            }
        });
    }

    const startOrbitBtn = $("startOrbit");
    const stopOrbitBtn = $("stopOrbit");

    if (startOrbitBtn) {
        startOrbitBtn.addEventListener("click", function () {
            flyToAndOrbitWithLimit(5.2913, 51.6890, 500, 0.005, 10000);
        });
    }

    if (stopOrbitBtn) {
        stopOrbitBtn.addEventListener("click", function () {
            flyToMuseumArea();
        });
    }
}
