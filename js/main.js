// js/main.js

let isBuildingsLoaded = false;
let tomTomTrafficLayer = null;
let viewer = null;
let name = "";
let trafficFlowEntities = [];
let trafficPulseEntities = [];
let trafficCorridorEntities = [];
let trafficIncidentEntities = [];
let trafficAnimationTimer = null;
let trafficIncidentRefreshTimer = null;
let mobilityOverlayState = [];
let buildingThemeMode = "function";
let sceneTimeSyncTimer = null;

// API keys filled from config.json
let TomTomAPI = "";
let airQualityApiKey = "";
let weatherApiKey = "";
let energyLabelApiKey = "";

let cityContextTileset = null;
let osmBuildingsTileset = null;
let kadasterBuildingsTileset = null;
let kadasterRootObjectUrl = null;
let bagFootprintState = {
    active: false,
    dataSource: null
};
let biodiversityState = {
    active: false,
    dataSource: null,
    refreshTimer: null
};
let cbsNeighborhoodLayer = null;
let heritageState = {
    active: false,
    dataSource: null
};
let aviationState = {
    active: false,
    entities: []
};
const operationalState = {
    mode: "Prototype live",
    focus: "City core monitoring",
    lastUpdatedAt: null,
    lastUpdatedLabel: "Waiting for live actions",
    activeLayers: new Set()
};

const BIODIVERSITY_SERVICE_URL = "https://geoproxy.s-hertogenbosch.nl/ags_extern/rest/services/Externvrij/CO2/MapServer/11";
const HERITAGE_SERVICE_URL = "https://service.pdok.nl/rce/beschermde-gebieden-cultuurhistorie/wfs/v1_0";
const CBS_WIJKBUURT_WFS_URL = "https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0";
const CBS_WIJKBUURT_WMS_URL = "https://service.pdok.nl/cbs/wijkenbuurten/2024/wms/v1_0";
const BAG_WFS_URL = "https://service.pdok.nl/lv/bag/wfs/v2_0";
const KADASTER_3D_TILESET_URL = "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/gebouwen/3dtiles";
const RIVM_STATIONS_URL = "https://data.rivm.nl/data/luchtmeetnet/Metadata/luchtmeetnet_meetlocaties.csv";

// Helper to get elements
function $(id) {
    return document.getElementById(id);
}

function markOperationalUpdate(label, focus) {
    operationalState.lastUpdatedAt = Date.now();
    operationalState.lastUpdatedLabel = label || operationalState.lastUpdatedLabel;
    if (focus) {
        operationalState.focus = focus;
    }
    refreshOperationalState();
}

function refreshOperationalState() {
    const twinMode = $("statusTwinMode");
    const dataFreshness = $("statusDataFreshness");
    const focusArea = $("statusFocusArea");

    const layerCount = operationalState.activeLayers.size;
    let modeText = layerCount > 0
        ? `Prototype live | ${layerCount} layers active`
        : "Prototype live | map baseline";

    let freshnessText = operationalState.lastUpdatedLabel || "Waiting for live actions";
    if (operationalState.lastUpdatedAt) {
        const elapsedSeconds = Math.max(1, Math.round((Date.now() - operationalState.lastUpdatedAt) / 1000));
        freshnessText = `${elapsedSeconds} sec ago | ${operationalState.lastUpdatedLabel}`;
    }

    if (twinMode) twinMode.textContent = modeText;
    if (dataFreshness) dataFreshness.textContent = freshnessText;
    if (focusArea) focusArea.textContent = operationalState.focus;
}

function setLayerActive(layerName, isActive, focusLabel, freshnessLabel) {
    if (isActive) {
        operationalState.activeLayers.add(layerName);
    } else {
        operationalState.activeLayers.delete(layerName);
    }
    if (freshnessLabel || focusLabel) {
        markOperationalUpdate(freshnessLabel || operationalState.lastUpdatedLabel, focusLabel || operationalState.focus);
    } else {
        refreshOperationalState();
    }
}

function setLayerLoadingState(active, label) {
    const overlay = $("layerLoading");
    const loadingLabel = $("layerLoadingLabel");
    const bagButton = $("BAGButton");
    if (loadingLabel && label) {
        loadingLabel.textContent = label;
    }
    if (overlay) {
        overlay.classList.toggle("is-hidden", !active);
    }
    if (bagButton) {
        bagButton.disabled = active;
        bagButton.textContent = active ? "Loading Kadaster…" : "Kadaster Buildings";
    }
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
    energyLabelApiKey = conf.ENERGYLABELAPI || conf.EPONLINEAPI || conf.EPONLINE_API_KEY || "";

    console.log("Weather API Key:", weatherApiKey);

    try {
        await initCesium();
        wireUi();
        // Mark splash ready; the user dismisses the welcome screen manually.
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.classList.add("is-ready");
            splash.setAttribute("aria-busy", "false");
        }
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

    const quickTrafficBtn = $("toggleTrafficQuick");
    if (quickTrafficBtn) {
        quickTrafficBtn.addEventListener("click", toggleTraffic);
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

    const heritageBtn = $("toggleMuseumsBtn");
    if (heritageBtn) {
        heritageBtn.addEventListener("click", toggleDutchHeritageLayer);
    }

    const cbsBtn = $("toggleCbsNeighborhoodsBtn");
    if (cbsBtn) {
        cbsBtn.addEventListener("click", toggleCbsNeighborhoodOverlay);
    }

    document.querySelectorAll('input[name="buildingTheme"]').forEach((input) => {
        input.addEventListener("change", (event) => {
            applyBuildingTheme(event.target.value);
        });
    });

    document.querySelectorAll("[data-scenario]").forEach((button) => {
        button.addEventListener("click", () => {
            activateScenario(button.getAttribute("data-scenario"));
        });
    });

    document.querySelectorAll("[data-world-effect]").forEach((button) => {
        button.addEventListener("click", () => {
            const effectName = button.getAttribute("data-world-effect");
            setWorldEffectState(effectName);
            flytoIKDB();
            const statusText = effectName === "weather-night"
                ? "Night view activated"
                : effectName === "weather-water"
                    ? "Flood and rainfall readiness view activated"
                    : "Weather view activated";
            updatePrototypeHud({
                freshness: statusText,
                focus: button.textContent.trim()
            });
        });
    });
}

// Toggle Kadaster buildings
function toggleBuildings() {
    if (isBuildingsLoaded) {
        if (viewer && kadasterBuildingsTileset) {
            viewer.scene.primitives.remove(kadasterBuildingsTileset);
            kadasterBuildingsTileset = null;
        }
        if (kadasterRootObjectUrl) {
            URL.revokeObjectURL(kadasterRootObjectUrl);
            kadasterRootObjectUrl = null;
        }
        if (viewer && bagFootprintState.dataSource) {
            viewer.dataSources.remove(bagFootprintState.dataSource, true);
            bagFootprintState.dataSource = null;
            bagFootprintState.active = false;
        }
        isBuildingsLoaded = false;
        setLayerActive("kadaster", false, "City core monitoring", "Kadaster 3D buildings hidden");
        showNotification("event", "Kadaster 3D buildings hidden.");
    } else {
        loadBuildings3DTiles();
    }
}

// Load Kadaster 3D tiles (BAG)
async function loadBuildings3DTiles() {
    setLayerLoadingState(true, "Loading Kadaster buildings…");
    try {
        await loadKadaster3DTiles();
        isBuildingsLoaded = true;
        showNotification("event", "Kadaster 3D BAG-gebouwen geladen.");
        setLayerActive("kadaster", true, "Kadaster 3D BAG buildings", "Kadaster 3D BAG buildings loaded");
    } catch (error) {
        console.error("Error loading Kadaster 3D BAG, falling back to BAG footprints:", error);
        try {
            await loadBagFootprintFallback();
            isBuildingsLoaded = true;
            showNotification("event", "Officiële BAG-gebouwlaag geladen vanuit Kadaster / PDOK.");
            setLayerActive("kadaster", true, "Kadaster BAG buildings", "Official BAG building layer loaded");
        } catch (fallbackError) {
            console.error("BAG fallback also failed:", fallbackError);
            isBuildingsLoaded = false;
            showNotification("event", "Kadaster 3D buildings could not be loaded.");
        }
    } finally {
        setLayerLoadingState(false, "Loading Kadaster buildings…");
    }
}

function rewriteTilesetUris(node, prefixUrl) {
    if (!node || typeof node !== "object") return;
    if (node.content && typeof node.content.uri === "string" && !/^https?:\/\//i.test(node.content.uri)) {
        node.content.uri = `${prefixUrl}/${node.content.uri}`;
    }
    if (Array.isArray(node.contents)) {
        node.contents.forEach((content) => {
            if (content && typeof content.uri === "string" && !/^https?:\/\//i.test(content.uri)) {
                content.uri = `${prefixUrl}/${content.uri}`;
            }
        });
    }
    if (Array.isArray(node.children)) {
        node.children.forEach((child) => rewriteTilesetUris(child, prefixUrl));
    }
}

async function loadKadaster3DTiles() {
    if (!viewer) return;

    if (bagFootprintState.dataSource) {
        viewer.dataSources.remove(bagFootprintState.dataSource, true);
        bagFootprintState.dataSource = null;
        bagFootprintState.active = false;
    }
    if (kadasterBuildingsTileset) {
        viewer.scene.primitives.remove(kadasterBuildingsTileset);
        kadasterBuildingsTileset = null;
    }
    if (kadasterRootObjectUrl) {
        URL.revokeObjectURL(kadasterRootObjectUrl);
        kadasterRootObjectUrl = null;
    }

    const response = await fetch(KADASTER_3D_TILESET_URL);
    if (!response.ok) {
        throw new Error(`Kadaster root tileset fetch failed: ${response.status}`);
    }

    const rootTileset = await response.json();
    rewriteTilesetUris(rootTileset.root, KADASTER_3D_TILESET_URL);
    kadasterRootObjectUrl = URL.createObjectURL(
        new Blob([JSON.stringify(rootTileset)], { type: "application/json" })
    );

    const tileset = typeof Cesium.Cesium3DTileset.fromUrl === "function"
        ? await Cesium.Cesium3DTileset.fromUrl(kadasterRootObjectUrl)
        : new Cesium.Cesium3DTileset({ url: kadasterRootObjectUrl });

    kadasterBuildingsTileset = viewer.scene.primitives.add(tileset);
    if (kadasterBuildingsTileset.readyPromise) {
        await kadasterBuildingsTileset.readyPromise;
    }
    flytoIKDB();
}

async function loadBagFootprintFallback() {
    if (!viewer) return;

    if (bagFootprintState.dataSource) {
        viewer.dataSources.remove(bagFootprintState.dataSource, true);
        bagFootprintState.dataSource = null;
    }

    const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: "bag:pand",
        count: "700",
        outputFormat: "application/json",
        srsName: "EPSG:4326",
        bbox: "51.67,5.29,51.70,5.32,EPSG:4326"
    });

    const response = await fetch(`${BAG_WFS_URL}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`BAG footprint fetch failed: ${response.status}`);
    }

    const geojson = await response.json();
    const dataSource = await Cesium.GeoJsonDataSource.load(geojson, {
        clampToGround: true,
        stroke: Cesium.Color.fromCssColorString("#3dd6c6"),
        fill: Cesium.Color.fromCssColorString("rgba(61, 214, 198, 0.16)"),
        strokeWidth: 1.5
    });

    dataSource.entities.values.forEach((entity) => {
        if (!entity.polygon) return;
        entity.polygon.material = Cesium.Color.fromCssColorString("#3dd6c6").withAlpha(0.14);
        entity.polygon.outline = true;
        entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#8ff4ea").withAlpha(0.72);
        entity.polygon.height = 0;
        entity.polygon.extrudedHeight = 8;

        const properties = entity.properties;
        const identificatie = properties?.identificatie?.getValue?.() || "Onbekend";
        const bouwjaar = properties?.bouwjaar?.getValue?.() || "Onbekend";
        const status = properties?.status?.getValue?.() || "Onbekend";
        const gebruiksdoel = properties?.gebruiksdoel?.getValue?.() || "Onbekend";
        const verblijfsobjecten = properties?.aantal_verblijfsobjecten?.getValue?.() || "Onbekend";
        entity.description = `
            <h2>BAG pand</h2>
            <p><strong>Identificatie:</strong> ${identificatie}</p>
            <p><strong>Bouwjaar:</strong> ${bouwjaar}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Gebruiksdoel:</strong> ${gebruiksdoel}</p>
            <p><strong>Aantal verblijfsobjecten:</strong> ${verblijfsobjecten}</p>
            <p><strong>Bron:</strong> Kadaster / PDOK BAG WFS</p>
        `;
    });

    bagFootprintState.dataSource = dataSource;
    bagFootprintState.active = true;
    viewer.dataSources.add(dataSource);
    flytoIKDB();
}

// Init Cesium viewer
async function initCesium() {
    try {
        let terrainProvider = undefined;
        let imageryProvider = undefined;
        if (typeof Cesium.createWorldTerrainAsync === "function") {
            terrainProvider = await Cesium.createWorldTerrainAsync();
        } else if (typeof Cesium.createWorldTerrain === "function") {
            terrainProvider = Cesium.createWorldTerrain();
        }
        if (typeof Cesium.createWorldImageryAsync === "function") {
            imageryProvider = await Cesium.createWorldImageryAsync();
        } else if (typeof Cesium.createWorldImagery === "function") {
            imageryProvider = Cesium.createWorldImagery();
        }

        viewer = new Cesium.Viewer("cesiumContainer", {
            terrainProvider,
            baseLayer: imageryProvider ? new Cesium.ImageryLayer(imageryProvider) : false,
            requestRenderMode: true,
            animation: false,
            timeline: false,
            sceneMode: Cesium.SceneMode.SCENE3D,
            baseLayerPicker: false,
            shouldAnimate: false
        });

        if (viewer.imageryLayers.length === 0) {
            viewer.imageryLayers.addImageryProvider(
                new Cesium.OpenStreetMapImageryProvider({
                    url: "https://tile.openstreetmap.org/"
                })
            );
        }

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
        viewer.scene.fog.enabled = true;
        viewer.shadows = true;
        viewer.camera.frustum.far = 10000000.0;
        window.viewer = viewer;

        syncSceneToLocalTime();
        startSceneTimeSync();
        configureCesiumEnvironment();

        if (viewer.dataSources.length > 0) {
            viewer.dataSources.get(0).clustering.enabled = false;
        }

        viewer.entities.removeAll();
        setupPrototypeHud();

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
        try {
            const cityResource = await Cesium.IonResource.fromAssetId(2275207);
            cityContextTileset = typeof Cesium.Cesium3DTileset.fromUrl === "function"
                ? await Cesium.Cesium3DTileset.fromUrl(cityResource)
                : new Cesium.Cesium3DTileset({ url: cityResource });
            viewer.scene.primitives.add(cityContextTileset);
        } catch (cityError) {
            console.warn("Primary city context tileset unavailable, continuing with OSM buildings.", cityError);
            cityContextTileset = null;
        }

        if (typeof Cesium.createOsmBuildingsAsync === "function") {
            osmBuildingsTileset = viewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync());
        } else if (typeof Cesium.createOsmBuildings === "function") {
            osmBuildingsTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
        } else {
            osmBuildingsTileset = null;
        }

        applyBuildingTheme(buildingThemeMode);

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

        if (cityContextTileset) {
            await viewer.zoomTo(cityContextTileset);
        } else if (osmBuildingsTileset) {
            await viewer.zoomTo(osmBuildingsTileset);
        }
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
            try {
                localStorage.setItem("udt_last_location", JSON.stringify({
                    lat: latitude,
                    lon: longitude,
                    name: name || ""
                }));
            } catch (error) { }
            await fetchAndDisplayWeather(latitude, longitude);
            await fetchAndDisplayAirQuality(latitude, longitude);
            await fetchAndDisplayTraffic(latitude, longitude);
            const bagInfo = await fetchAndDisplayBagInfo(latitude, longitude);
            await fetchAndDisplayEnergyLabel(bagInfo);
            await fetchAndDisplayRivmSensors(latitude, longitude);
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

function getRivmMonthlyCandidates() {
    const now = new Date();
    const candidates = [];
    for (let offset = 1; offset <= 3; offset++) {
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
    if (cached) return cached;

    const response = await fetch(RIVM_STATIONS_URL);
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

function syncSceneToLocalTime() {
    if (!viewer || !Cesium || !Cesium.JulianDate) return;
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
    viewer.clock.shouldAnimate = false;
    viewer.clock.multiplier = 1;
    if (viewer.scene) {
        viewer.scene.requestRender();
    }
}

function startSceneTimeSync() {
    if (sceneTimeSyncTimer) {
        clearInterval(sceneTimeSyncTimer);
    }
    sceneTimeSyncTimer = window.setInterval(() => {
        syncSceneToLocalTime();
    }, 60 * 1000);
}

function configureCesiumEnvironment() {
    if (!viewer || !viewer.scene) return;

    if (viewer.scene.fog) {
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.00055;
        viewer.scene.fog.minimumBrightness = 0.25;
        viewer.scene.fog.screenSpaceErrorFactor = 1.7;
    }

    if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.skyAtmosphere.brightnessShift = -0.04;
        viewer.scene.skyAtmosphere.saturationShift = -0.02;
    }

    if (viewer.scene.atmosphere) {
        if (typeof Cesium.DynamicAtmosphereLightingType !== "undefined") {
            viewer.scene.atmosphere.dynamicLighting = Cesium.DynamicAtmosphereLightingType.SUNLIGHT;
        }
        viewer.scene.atmosphere.lightIntensity = 11.0;
        viewer.scene.atmosphere.rayleighCoefficient = new Cesium.Cartesian3(5.5e-6, 13.0e-6, 28.4e-6);
        viewer.scene.atmosphere.mieCoefficient = new Cesium.Cartesian3(21e-6, 21e-6, 21e-6);
    }

    if (viewer.scene.dynamicEnvironmentMapManager) {
        viewer.scene.dynamicEnvironmentMapManager.enabled = true;
    }
}

function applyCesiumAtmosphereProfile(profile = {}) {
    if (!viewer || !viewer.scene) return;

    if (viewer.scene.fog) {
        viewer.scene.fog.enabled = true;
        if (typeof profile.fogDensity === "number") viewer.scene.fog.density = profile.fogDensity;
        if (typeof profile.fogBrightness === "number") viewer.scene.fog.minimumBrightness = profile.fogBrightness;
    }

    if (viewer.scene.skyAtmosphere) {
        if (typeof profile.skyBrightnessShift === "number") viewer.scene.skyAtmosphere.brightnessShift = profile.skyBrightnessShift;
        if (typeof profile.skySaturationShift === "number") viewer.scene.skyAtmosphere.saturationShift = profile.skySaturationShift;
        if (typeof profile.skyHueShift === "number") viewer.scene.skyAtmosphere.hueShift = profile.skyHueShift;
    }

    if (viewer.scene.atmosphere) {
        if (typeof profile.lightIntensity === "number") viewer.scene.atmosphere.lightIntensity = profile.lightIntensity;
    }

    if (viewer.scene) {
        viewer.scene.requestRender();
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
        applyLiveWeatherEffects(weatherData);
        const weatherContent = `
            <strong>Weather at ${name}</strong><br>
            Temperature: ${weatherData.main.temp} °C<br>
            Feels like: ${weatherData.main.feels_like} °C<br>
            Weather: ${weatherData.weather[0].main} (${weatherData.weather[0].description})<br>
            Humidity: ${weatherData.main.humidity}%<br>
            Wind: ${weatherData.wind.speed} m/s, ${weatherData.wind.deg}
        `;
        showNotification("weather", weatherContent);
        markOperationalUpdate("Weather snapshot updated", "Weather and air quality");
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
        markOperationalUpdate("Air quality snapshot updated", "Weather and air quality");
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
                <strong>Traffic Information at ${name}</strong><br>
                Road: ${traffic.roadName || "N/A"}<br>
                Speed: ${traffic.currentSpeed} km/h<br>
                Free Flow Speed: ${traffic.freeFlowSpeed} km/h<br>
                Travel Time: ${traffic.currentTravelTime} seconds<br>
                Confidence: ${confidencePercent}%
            `;
            showNotification("traffic", trafficContent);
            const trafficStateTarget = $("trafficStateContent");
            if (trafficStateTarget) {
                trafficStateTarget.innerHTML = `
                    <strong>${congestionState}</strong><br>
                    Vertraging: ${delaySeconds} seconden<br>
                    Corridorbetrouwbaarheid: ${confidencePercent}%<br>
                    Snelheidsverhouding: ${Math.round(congestionRatio * 100)}% van vrije doorstroming
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

    await fetchAndDisplayTrafficIncidents(latitude, longitude);
}

async function fetchAndDisplayTrafficIncidents(latitude, longitude) {
    const target = $("trafficIncidentsContent");
    if (!target) return;

    const incidents = await fetchTomTomTrafficIncidents(latitude, longitude);
    if (!incidents.length) {
        target.textContent = window.udtI18n
            ? window.udtI18n.t("no_traffic_incidents")
            : "Geen actuele verkeersincidenten in de directe omgeving.";
        target.dataset.hasData = "false";
        return;
    }

    target.innerHTML = incidents.slice(0, 4).map((incident) => {
        const props = incident.properties || {};
        const display = getIncidentDisplay(incident);
        const road = Array.isArray(props.roadNumbers) && props.roadNumbers.length ? props.roadNumbers.join(", ") : "Lokale weg";
        return `
            <div class="location-inline-block">
                <strong>${display.description}</strong><br>
                ${road} • Ernst ${display.severity || "n/b"}<br>
                ${props.from || "Start onbekend"} → ${props.to || "Einde onbekend"}<br>
                ${props.length ? `Lengte: ${Math.round(props.length)} m` : ""}
            </div>
        `;
    }).join("<hr>");
    target.dataset.hasData = "true";
}

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
        const response = await fetch(`${HERITAGE_SERVICE_URL}?${params.toString()}`);
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
        const response = await fetch(`${BAG_WFS_URL}?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch BAG building info");
        const data = await response.json();
        const feature = Array.isArray(data.features) ? data.features[0] : null;
        return feature ? feature.properties || null : null;
    } catch (error) {
        return null;
    }
}

async function fetchEnergyLabelForAddress(bagInfo) {
    if (!energyLabelApiKey) return { unavailableReason: "missingKey" };
    if (!bagInfo || !bagInfo.postcode || !bagInfo.huisnummer) return { unavailableReason: "missingAddress" };

    const postcode = String(bagInfo.postcode).replace(/\s+/g, "").toUpperCase();
    const huisnummer = String(bagInfo.huisnummer);
    const huisletter = bagInfo.huisletter || "";
    const huisnummertoevoeging = bagInfo.toevoeging || "";
    const cacheKey = `energy_label_${postcode}_${huisnummer}_${huisletter}_${huisnummertoevoeging}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        postcode,
        huisnummer
    });
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
            if (response.status === 401 || response.status === 403) {
                return { unavailableReason: "unauthorized" };
            }
            if (response.status === 404) {
                return { unavailableReason: "notFound" };
            }
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
    const bagTarget = $("locationBagContent");
    if (!bagTarget) return;

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
        <strong>${addressParts || "BAG verblijfsobject"}</strong><br>
        Postcode: ${bagInfo.postcode || "Onbekend"} ${bagInfo.woonplaats || ""}<br>
        Gebruiksdoel: ${bagInfo.gebruiksdoel || "Onbekend"}<br>
        Oppervlakte: ${bagInfo.oppervlakte || "Onbekend"} m²<br>
        Bouwjaar: ${bagInfo.bouwjaar || "Onbekend"}<br>
        Status: ${bagInfo.status || "Onbekend"}
    `;
    bagTarget.dataset.hasData = "true";
    return bagInfo;
}

async function fetchAndDisplayEnergyLabel(bagInfo) {
    const energyTarget = $("locationEnergyContent");
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
        <strong>Label ${energyLabel.Energieklasse || "Onbekend"}</strong><br>
        Status: ${energyLabel.Status || "Onbekend"}<br>
        Gebouwtype: ${energyLabel.Gebouwtype || energyLabel.Gebouwklasse || "Onbekend"}<br>
        Bouwjaar: ${energyLabel.Bouwjaar || "Onbekend"}<br>
        Thermische zone: ${energyLabel.Gebruiksoppervlakte_thermische_zone != null ? `${Number(energyLabel.Gebruiksoppervlakte_thermische_zone).toLocaleString("nl-NL")} m²` : "Onbekend"}<br>
        CO2-emissie: ${energyLabel.BerekendeCO2Emissie != null ? `${Number(energyLabel.BerekendeCO2Emissie).toLocaleString("nl-NL")} kg/jaar` : "Onbekend"}<br>
        Energieverbruik: ${energyLabel.BerekendeEnergieverbruik != null ? `${Number(energyLabel.BerekendeEnergieverbruik).toLocaleString("nl-NL")} kWh/jaar` : "Onbekend"}<br>
        Registratie: ${energyLabel.Registratiedatum || "Onbekend"}
    `;
    energyTarget.dataset.hasData = "true";
    markOperationalUpdate("Energy label data updated", "Building performance");
}

async function fetchAndDisplayRivmSensors(latitude, longitude) {
    const rivmTarget = $("locationRivmContent");
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
                <strong>${sensor.stationName}</strong><br>
                ${sensor.place || "Onbekende plaats"} • ${sensor.source || "RIVM"} • ${sensor.distanceKm.toFixed(1)} km<br>
                PM2.5: ${sensor.values && sensor.values.PM25 != null ? sensor.values.PM25.toFixed(1) : "n/b"} µg/m³<br>
                NO2: ${sensor.values && sensor.values.NO2 != null ? sensor.values.NO2.toFixed(1) : "n/b"} µg/m³<br>
                O3: ${sensor.values && sensor.values.O3 != null ? sensor.values.O3.toFixed(1) : "n/b"} µg/m³
                ${sensor.timestamp ? `<br>Laatst gemeten: ${sensor.timestamp}` : ""}
            </div>
        `).join("<hr>");
        rivmTarget.dataset.hasData = "true";
        markOperationalUpdate("Official RIVM station data updated", "Official sensor monitoring");
    } catch (error) {
        console.error("Error fetching official RIVM station data:", error);
        rivmTarget.textContent = window.udtI18n
            ? window.udtI18n.t("no_official_sensor_data")
            : "Geen actuele officiele meetpunten gevonden voor deze locatie.";
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
        const response = await fetch(`${CBS_WIJKBUURT_WFS_URL}?${params.toString()}`);
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

function showNotification(type, content) {
    if (type === "event") {
        showStatusToast(content);
        return;
    }

    const card = $("locationInfoCard");
    if (!card) return;

    const targetMap = {
        weather: "locationWeatherContent",
        "air-quality": "locationAirContent",
        traffic: "locationTrafficContent"
    };

    const targetId = targetMap[type];
    if (!targetId) return;

    const target = $(targetId);
    const title = $("locationInfoTitle");
    if (title && name) {
        title.textContent = name;
    }
    if (target) {
        target.innerHTML = content;
        target.dataset.hasData = "true";
    }
    card.classList.remove("is-hidden");
}

function showStatusToast(content) {
    const area = $("notificationArea");
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

function addPrototypeTrafficExperience() {
    if (!viewer || trafficFlowEntities.length > 0) return;

    const corridors = [
        { id: "A2-Centrum", lon: 5.3035, lat: 51.6873, co2: 420, ratio: 0.94, radius: 125 },
        { id: "Station-Corridor", lon: 5.3125, lat: 51.6835, co2: 455, ratio: 0.71, radius: 145 },
        { id: "Museumkwartier", lon: 5.2925, lat: 51.6892, co2: 398, ratio: 0.62, radius: 160 },
        { id: "Brabantlaan", lon: 5.3215, lat: 51.6922, co2: 440, ratio: 0.48, radius: 175 }
    ];

    function getCorridorState(ratio) {
        if (ratio >= 0.9) return { label: "Vrije doorstroming", color: "#34d399", pulse: "#86efac" };
        if (ratio >= 0.7) return { label: "Druk netwerk", color: "#facc15", pulse: "#fde68a" };
        if (ratio >= 0.55) return { label: "Vertraging", color: "#fb923c", pulse: "#fdba74" };
        return { label: "Bottleneck", color: "#f43f5e", pulse: "#fda4af" };
    }

    mobilityOverlayState = corridors.map((corridor) => {
        const state = getCorridorState(corridor.ratio);
        return { ...corridor, ...state };
    });

    trafficPulseEntities = mobilityOverlayState.map((corridor) => viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(corridor.lon, corridor.lat, 0),
        ellipse: {
            semiMinorAxis: corridor.radius,
            semiMajorAxis: corridor.radius,
            material: Cesium.Color.fromCssColorString(corridor.color).withAlpha(corridor.label === "Bottleneck" ? 0.26 : 0.18),
            outline: true,
            outlineWidth: 2,
            outlineColor: Cesium.Color.fromCssColorString(corridor.pulse).withAlpha(0.82),
            height: 2
        },
        label: {
            text: `${corridor.id} | ${corridor.label}`,
            font: "bold 13px sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -26),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000)
        },
        description: `
            <h2>Mobility & CO2 Corridor</h2>
            <p><strong>Status:</strong> ${corridor.label}</p>
            <p><strong>Doorstroming:</strong> ${Math.round(corridor.ratio * 100)}% van vrije snelheid</p>
            <p><strong>Estimated CO2 load:</strong> ${corridor.co2} ppm</p>
            <p><strong>Mode:</strong> Netwerkprestatie en bottleneckoverlay</p>
        `
    }));

    const vehiclePaths = [
        [
            [5.296, 51.6861],
            [5.300, 51.6868],
            [5.304, 51.6874],
            [5.309, 51.6882]
        ],
        [
            [5.318, 51.6915],
            [5.314, 51.6898],
            [5.309, 51.6887],
            [5.304, 51.6876]
        ],
        [
            [5.2918, 51.6891],
            [5.2961, 51.6888],
            [5.3012, 51.6885],
            [5.3074, 51.6882]
        ]
    ];

    trafficCorridorEntities = vehiclePaths.map((path, index) => {
        const flatPositions = path.flat();
        const corridorState = mobilityOverlayState[index] || mobilityOverlayState[0];
        const corridorColor = Cesium.Color.fromCssColorString(corridorState ? corridorState.color : "#3dd6c6");

        return viewer.entities.add({
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(flatPositions),
                width: corridorState && corridorState.label === "Bottleneck" ? 14 : 11,
                clampToGround: false,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: corridorState && corridorState.label === "Bottleneck" ? 0.38 : 0.28,
                    taperPower: 0.7,
                    color: corridorColor.withAlpha(0.92)
                })
            },
            description: `
                <h2>Traffic Corridor ${index + 1}</h2>
                <p><strong>Status:</strong> ${corridorState ? corridorState.label : "Mobiliteitscorridor"}</p>
                <p><strong>Visual:</strong> Kleur geeft netwerkprestatie en bottleneckdruk weer</p>
            `
        });
    });

    trafficFlowEntities = vehiclePaths.map((path, index) => {
        const [startLon, startLat] = path[0];
        const markerColor = mobilityOverlayState[index] ? mobilityOverlayState[index].color : "#3dd6c6";
        return viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(startLon, startLat, 18),
            point: {
                pixelSize: 16,
                color: Cesium.Color.fromCssColorString(markerColor),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.NONE
            },
            label: {
                text: mobilityOverlayState[index] ? mobilityOverlayState[index].label : `Mobiliteitscorridor ${index + 1}`,
                font: "bold 13px sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -24),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 14000)
            },
            properties: {
                pathIndex: index,
                stepIndex: 0
            }
        });
    });

    trafficAnimationTimer = window.setInterval(() => {
        trafficFlowEntities.forEach((entity, pathIndex) => {
            const path = vehiclePaths[pathIndex];
            const nextStep = ((entity.properties.stepIndex.getValue ? entity.properties.stepIndex.getValue() : entity.properties.stepIndex) + 1) % path.length;
            const [lon, lat] = path[nextStep];
            entity.position = Cesium.Cartesian3.fromDegrees(lon, lat, 18);
            entity.properties.stepIndex = nextStep;
        });
        if (viewer && viewer.scene) {
            viewer.scene.requestRender();
        }
    }, 2200);
}

function removePrototypeTrafficExperience() {
    if (trafficAnimationTimer) {
        clearInterval(trafficAnimationTimer);
        trafficAnimationTimer = null;
    }
    if (trafficIncidentRefreshTimer) {
        clearInterval(trafficIncidentRefreshTimer);
        trafficIncidentRefreshTimer = null;
    }
    trafficFlowEntities.forEach((entity) => viewer && viewer.entities.remove(entity));
    trafficPulseEntities.forEach((entity) => viewer && viewer.entities.remove(entity));
    trafficCorridorEntities.forEach((entity) => viewer && viewer.entities.remove(entity));
    trafficIncidentEntities.forEach((entity) => viewer && viewer.entities.remove(entity));
    trafficFlowEntities = [];
    trafficPulseEntities = [];
    trafficCorridorEntities = [];
    trafficIncidentEntities = [];
    mobilityOverlayState = [];
}

async function refreshTrafficIncidentOverlay(latitude = 51.686, longitude = 5.291) {
    if (!viewer) return;
    const incidents = await fetchTomTomTrafficIncidents(latitude, longitude, 0.03);

    trafficIncidentEntities.forEach((entity) => viewer.entities.remove(entity));
    trafficIncidentEntities = [];

    incidents.slice(0, 18).forEach((incident) => {
        const geometry = incident.geometry || {};
        const coords = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
        if (!coords.length) return;
        const coord = Array.isArray(coords[0]) ? coords[0] : coords;
        if (!Array.isArray(coord) || coord.length < 2) return;
        const [lon, lat] = coord;
        const display = getIncidentDisplay(incident);
        const props = incident.properties || {};
        trafficIncidentEntities.push(viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 8),
            point: {
                pixelSize: 13,
                color: Cesium.Color.fromCssColorString(display.color),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2
            },
            label: {
                text: display.description,
                font: "bold 12px sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -22),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000)
            },
            description: `
                <h2>Verkeersincident</h2>
                <p><strong>Status:</strong> ${display.description}</p>
                <p><strong>Ernst:</strong> ${display.severity || "Onbekend"}</p>
                <p><strong>Van:</strong> ${props.from || "Onbekend"}</p>
                <p><strong>Naar:</strong> ${props.to || "Onbekend"}</p>
                <p><strong>Weglengte:</strong> ${props.length ? `${Math.round(props.length)} m` : "n/b"}</p>
            `
        }));
    });

    if (viewer.scene) viewer.scene.requestRender();
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
        tomTomTrafficLayer.alpha = 0.72;
        tomTomTrafficLayer.brightness = 1.25;
        tomTomTrafficLayer.contrast = 1.18;
        tomTomTrafficLayer.saturation = 1.1;
        addPrototypeTrafficExperience();
        refreshTrafficIncidentOverlay();
        trafficIncidentRefreshTimer = window.setInterval(() => refreshTrafficIncidentOverlay(), 5 * 60 * 1000);
        $("mobilityLegend")?.classList.remove("is-hidden");
        setLayerActive("traffic", true, "Traffic and CO2 corridors", "Traffic flow layer activated");
        if (viewer && viewer.scene) {
            viewer.scene.requestRender();
        }
        updatePrototypeHud({ freshness: "Flow refreshed now", focus: "Traffic & CO2 Corridors" });
        showNotification("traffic", "<strong>Traffic Flow & CO2</strong><br>Prototype corridor flow, moving vehicles, and emission hotspots activated.");
    } else {
        viewer.imageryLayers.remove(tomTomTrafficLayer, false);
        tomTomTrafficLayer = null;
        removePrototypeTrafficExperience();
        $("mobilityLegend")?.classList.add("is-hidden");
        setLayerActive("traffic", false, "City core monitoring", "Traffic flow layer hidden");
        if (viewer && viewer.scene) {
            viewer.scene.requestRender();
        }
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

async function toggleDutchHeritageLayer() {
    const button = $("toggleMuseumsBtn");
    if (!viewer) return;

    if (heritageState.active) {
        heritageState.active = false;
        if (heritageState.dataSource) {
            viewer.dataSources.remove(heritageState.dataSource, true);
            heritageState.dataSource = null;
        }
        if (button) {
            button.textContent = "Erfgoedpunten (PDOK/RCE)";
        }
        showNotification("event", "Erfgoedpunten verborgen.");
        setLayerActive("heritage", false, "City core monitoring", "Dutch heritage layer hidden");
        return;
    }

    try {
        await loadDutchHeritageSites();
        heritageState.active = true;
        if (button) {
            button.textContent = "Erfgoedpunten AAN";
        }
        updatePrototypeHud({
            mobility: "59%",
            air: "Fair",
            alerts: "04",
            readiness: "Culture Layer Active",
            freshness: "PDOK feed loaded",
            focus: "Dutch Heritage Sites"
        });
        showNotification("event", "Erfgoedpunten geladen.");
        setLayerActive("heritage", true, "Dutch heritage sites", "PDOK heritage feed loaded");
    } catch (error) {
        console.error("Error loading Dutch heritage sites:", error);
        showNotification("event", "Erfgoedpunten konden nu niet worden geladen.");
    }
}

function toggleCbsNeighborhoodOverlay() {
    const button = $("toggleCbsNeighborhoodsBtn");
    if (!viewer) return;

    if (cbsNeighborhoodLayer) {
        viewer.imageryLayers.remove(cbsNeighborhoodLayer, false);
        cbsNeighborhoodLayer = null;
        if (button) {
            button.textContent = "CBS buurtstatistiek";
            button.setAttribute("aria-pressed", "false");
        }
        showNotification("event", "CBS buurtstatistiek verborgen.");
        setLayerActive("cbs", false, "City core monitoring", "CBS neighborhood layer hidden");
        return;
    }

    cbsNeighborhoodLayer = viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapServiceImageryProvider({
            url: CBS_WIJKBUURT_WMS_URL,
            layers: "buurten",
            parameters: {
                service: "WMS",
                version: "1.3.0",
                request: "GetMap",
                transparent: true,
                format: "image/png"
            }
        })
    );
    cbsNeighborhoodLayer.alpha = 0.42;
    cbsNeighborhoodLayer.brightness = 1.05;
    cbsNeighborhoodLayer.contrast = 1.15;

    if (button) {
        button.textContent = "CBS buurtstatistiek AAN";
        button.setAttribute("aria-pressed", "true");
    }

    showNotification("event", "CBS buurtstatistiek geladen.");
    setLayerActive("cbs", true, "CBS neighborhood profiles", "CBS neighborhood layer loaded");
    viewer.scene.requestRender();
}

async function loadDutchHeritageSites() {
    const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: "ps-ch:rce_inspire_points",
        count: "120",
        outputFormat: "application/json",
        srsName: "EPSG:4326",
        // PDOK WFS expects EPSG:4326 bbox in lat,lon axis order here.
        bbox: "51.62,5.20,51.78,5.45,EPSG:4326"
    });

    const requestUrl = `${HERITAGE_SERVICE_URL}?${params.toString()}`;
    const response = await fetch(requestUrl);
    if (!response.ok) {
        throw new Error(`Heritage fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const features = Array.isArray(data.features) ? data.features : [];
    if (!features.length) {
        throw new Error("No heritage features returned for current area");
    }

    if (!heritageState.dataSource) {
        heritageState.dataSource = new Cesium.CustomDataSource("dutchHeritage");
        viewer.dataSources.add(heritageState.dataSource);
    } else {
        heritageState.dataSource.entities.removeAll();
    }

    const pinColor = Cesium.Color.fromCssColorString("#f59e0b");
    features.forEach((feature) => {
        const geometry = feature.geometry;
        if (!geometry || geometry.type !== "Point" || !Array.isArray(geometry.coordinates)) {
            return;
        }

        const [lon, lat] = geometry.coordinates;
        const props = feature.properties || {};
        const monumentId = props.localid || "Unknown";
        const citation = props.ci_citation || "";

        heritageState.dataSource.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            point: {
                pixelSize: 10,
                color: pinColor,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 1.5
            },
            label: {
                text: `Heritage ${monumentId}`,
                font: "12px sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, -18),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 9000)
            },
            description: `
                <h2>Dutch Heritage Site</h2>
                <p><strong>ID:</strong> ${monumentId}</p>
                <p><strong>Source:</strong> PDOK / RCE</p>
                <p><strong>Version:</strong> ${props.versionid || "Unknown"}</p>
                ${citation ? `<p><a href="${citation}" target="_blank" rel="noopener noreferrer">Open monument record</a></p>` : ""}
            `
        });
    });

    viewer.flyTo(heritageState.dataSource, {
        duration: 2.2,
        offset: new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(18),
            Cesium.Math.toRadians(-40),
            5000
        )
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
            button.textContent = "Gemeentelijke bomenlaag";
            button.setAttribute("aria-pressed", "false");
        }
        showNotification("event", "Gemeentelijke bomenlaag verborgen. Dit zijn biodiversiteits- en boompunten uit de lokale geo service.");
        setLayerActive("biodiversity", false, "City core monitoring", "Biodiversity stream hidden");
        return;
    }

    biodiversityState.active = true;
    if (button) {
        button.textContent = "Gemeentelijke bomenlaag AAN";
        button.setAttribute("aria-pressed", "true");
    }

    await loadBiodiversityTrees();
    showNotification("event", "Gemeentelijke bomenlaag geladen. Dit toont biodiversiteits- en boompunten uit de Den Bosch geo service.");
    biodiversityState.refreshTimer = setInterval(loadBiodiversityTrees, 5 * 60 * 1000);
    setLayerActive("biodiversity", true, "Biodiversity stream", "Biodiversity stream activated");
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
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 10000);
        const response = await fetch(requestUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`Biodiversity fetch failed: ${response.status}`);
        }
        const data = await response.json();
        const features = Array.isArray(data.features) ? data.features : [];
        if (!features.length) {
            showNotification("event", "Geen boompunten gevonden in het huidige kaartgebied.");
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
        showNotification("event", "Gemeentelijke bomenlaag niet beschikbaar (bron offline of geblokkeerd).");
    }
}

function setupPrototypeHud() {
    markOperationalUpdate("System initialized", "City core monitoring");
}

function updatePrototypeHud(state) {
    if (state.freshness || state.focus) {
        markOperationalUpdate(state.freshness || operationalState.lastUpdatedLabel, state.focus || operationalState.focus);
    }

    const mapping = {
        kpiMobility: state.mobility,
        kpiAir: state.air,
        kpiAlerts: state.alerts,
        kpiReadiness: state.readiness
    };

    Object.entries(mapping).forEach(([id, value]) => {
        const element = $(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function setWorldEffectState(effectName) {
    const body = document.body;
    if (!body) return;

    ["weather-clear", "weather-rain", "weather-snow", "weather-night", "weather-water"].forEach((className) => {
        body.classList.remove(className);
    });
    body.classList.add(effectName);

    const rootStyle = document.documentElement.style;
    const presets = {
        "weather-clear": {
            rain: "0", snow: "0", fog: "0.08", glow: "0.05",
            fogDensity: 0.00045, fogBrightness: 0.34, skyBrightnessShift: -0.03, skySaturationShift: -0.02, skyHueShift: 0.0, lightIntensity: 11.0
        },
        "weather-rain": {
            rain: "0.45", snow: "0", fog: "0.24", glow: "0.02",
            fogDensity: 0.00145, fogBrightness: 0.18, skyBrightnessShift: -0.18, skySaturationShift: -0.18, skyHueShift: -0.02, lightIntensity: 8.4
        },
        "weather-snow": {
            rain: "0", snow: "0.55", fog: "0.28", glow: "0.04",
            fogDensity: 0.0011, fogBrightness: 0.32, skyBrightnessShift: -0.09, skySaturationShift: -0.12, skyHueShift: -0.01, lightIntensity: 9.2
        },
        "weather-night": {
            rain: "0", snow: "0", fog: "0.12", glow: "0.6",
            fogDensity: 0.00072, fogBrightness: 0.07, skyBrightnessShift: -0.42, skySaturationShift: -0.22, skyHueShift: 0.01, lightIntensity: 3.2
        },
        "weather-water": {
            rain: "0.18", snow: "0", fog: "0.18", glow: "0.08",
            fogDensity: 0.001, fogBrightness: 0.2, skyBrightnessShift: -0.12, skySaturationShift: -0.1, skyHueShift: -0.015, lightIntensity: 8.8
        }
    };
    const preset = presets[effectName] || presets["weather-clear"];
    rootStyle.setProperty("--weather-rain-opacity", preset.rain);
    rootStyle.setProperty("--weather-snow-opacity", preset.snow);
    rootStyle.setProperty("--weather-fog-opacity", preset.fog);
    rootStyle.setProperty("--night-glow-opacity", preset.glow);
    applyCesiumAtmosphereProfile(preset);

    if (viewer) {
        if (effectName === "weather-night") {
            viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#040812");
            viewer.scene.globe.enableLighting = true;
        } else if (effectName === "weather-water") {
            viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#091422");
        } else {
            viewer.scene.backgroundColor = Cesium.Color.BLACK;
        }
    }
}

async function activateScenario(scenarioName) {
    if (!viewer) return;

    const scenarios = {
        mobility: {
            lon: 5.3043,
            lat: 51.6863,
            destination: Cesium.Cartesian3.fromDegrees(5.3043, 51.6863, 1200),
            heading: 10,
            pitch: -38,
            hud: {
                freshness: "Scenario mobility camera activated",
                focus: "Mobility corridor focus"
            },
            afterFly: async () => {
                name = "Mobiliteitsfocus Binnenstad";
                try {
                    localStorage.setItem("udt_last_location", JSON.stringify({
                        lat: 51.6863,
                        lon: 5.3043,
                        name
                    }));
                } catch (error) {}
                if (!tomTomTrafficLayer) {
                    toggleTraffic();
                }
                await fetchAndDisplayTraffic(51.6863, 5.3043);
                const card = $("locationInfoCard");
                card?.classList.remove("is-hidden");
            }
        },
        environment: {
            lon: 5.291,
            lat: 51.6905,
            destination: Cesium.Cartesian3.fromDegrees(5.291, 51.6905, 1800),
            heading: -20,
            pitch: -50,
            hud: {
                freshness: "Scenario environmental camera activated",
                focus: "Environmental watch"
            },
            afterFly: async () => {
                name = "Milieu- en gezondheidsfocus";
                try {
                    localStorage.setItem("udt_last_location", JSON.stringify({
                        lat: 51.6905,
                        lon: 5.291,
                        name
                    }));
                } catch (error) {}
                $("rightPanel")?.classList.remove("is-closed");
                await Promise.allSettled([
                    fetchAndDisplayWeather(51.6905, 5.291),
                    fetchAndDisplayAirQuality(51.6905, 5.291),
                    fetchAndDisplayRivmSensors(51.6905, 5.291)
                ]);
                const card = $("locationInfoCard");
                card?.classList.remove("is-hidden");
            }
        },
        culture: {
            lon: 5.3038,
            lat: 51.6872,
            destination: Cesium.Cartesian3.fromDegrees(5.3038, 51.6872, 900),
            heading: 35,
            pitch: -32,
            hud: {
                freshness: "Scenario heritage camera activated",
                focus: "Heritage and visitor flow"
            },
            afterFly: async () => {
                name = "Museumkwartier en erfgoed";
                try {
                    localStorage.setItem("udt_last_location", JSON.stringify({
                        lat: 51.6872,
                        lon: 5.3038,
                        name
                    }));
                } catch (error) {}
                if (!heritageState.active) {
                    await toggleDutchHeritageLayer();
                }
            }
        }
    };

    const scenario = scenarios[scenarioName];
    if (!scenario) return;

    updatePrototypeHud(scenario.hud);
    viewer.camera.flyTo({
        destination: scenario.destination,
        orientation: {
            heading: Cesium.Math.toRadians(scenario.heading),
            pitch: Cesium.Math.toRadians(scenario.pitch),
            roll: 0.0
        },
        duration: 2.4,
        complete: () => {
            if (typeof scenario.afterFly === "function") {
                scenario.afterFly().catch((error) => console.warn("Scenario follow-up failed:", error));
            }
        }
    });
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

function applyBuildingTheme(mode = "function") {
    buildingThemeMode = mode;
    const legend = $("buildingThemeLegend");

    if (cityContextTileset) {
        // In thematic mode, let the colorized OSM layer read clearly above the cinematic city context.
        cityContextTileset.show = mode === "neutral";
    }

    if (legend) {
        legend.classList.toggle("is-hidden", mode !== "function");
    }

    if (!osmBuildingsTileset) {
        if (mode === "function") {
            showNotification("event", "Gebouwfunctie is pas zichtbaar zodra de OSM-gebouwenlaag is geladen.");
        }
        return;
    }

    osmBuildingsTileset.show = true;

    if (mode === "neutral") {
        osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
            color: "color('rgba(196, 190, 182, 0.82)')"
        });
        if (viewer?.scene) {
            viewer.scene.requestRender();
        }
        return;
    }

    osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
        color: {
            conditions: [
                ["${building} === 'house' || ${building} === 'residential' || ${building} === 'apartments'", "color('#ffb703', 0.86)"],
                ["${building} === 'office' || ${building} === 'commercial'", "color('#38bdf8', 0.86)"],
                ["${building} === 'industrial' || ${building} === 'warehouse'", "color('#8b5cf6', 0.86)"],
                ["${building} === 'retail' || ${building} === 'shop' || ${building} === 'supermarket' || ${building} === 'kiosk'", "color('#ef4444', 0.88)"],
                ["${building} === 'school' || ${building} === 'university' || ${building} === 'college' || ${building} === 'kindergarten'", "color('#22c55e', 0.88)"],
                ["${building} === 'hospital' || ${building} === 'clinic'", "color('#eab308', 0.88)"],
                ["${building} === 'church' || ${building} === 'civic' || ${building} === 'public' || ${building} === 'parking' || ${building} === 'hotel'", "color('#14b8a6', 0.84)"],
                ["true", "color('#a3a3a3', 0.72)"]
            ]
        }
    });

    if (viewer?.scene) {
        viewer.scene.requestRender();
    }
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
        <div id="analyzeHere">Analyse hier</div>
        <div id="dashboardBtn" style="margin: 6px 0; color: #0d6efd; cursor: pointer; font-weight: 600;">Dashboard</div>
        <div id="showInfo">Show Info</div>
        <div id="showSettings">Settings</div>
        <div id="showHelp">Help</div>
    `;
    // Dashboard button event
    const dashboardBtn = $("dashboardBtn");
    if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => {
            let targetUrl = "dashboard/open_data_dashboard.html";
            try {
                const lastLocation = JSON.parse(localStorage.getItem("udt_last_location") || "null");
                if (lastLocation && Number.isFinite(lastLocation.lat) && Number.isFinite(lastLocation.lon)) {
                    const params = new URLSearchParams({
                        lat: String(lastLocation.lat),
                        lon: String(lastLocation.lon),
                        name: lastLocation.name || ""
                    });
                    targetUrl += `?${params.toString()}`;
                }
            } catch (error) { }
            window.open(targetUrl, "_blank");
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

    // remember the last right-click coordinates (lon/lat) for Analyse action
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
            displayDiv.innerHTML = `<h2>Info</h2><p>Runner Blade V.4.1 for the Digital Twin Den Bosch initiative, developed by DataTwinLabs in 2026. Created by Daniel Adenew Wonyifraw with Prof. Jos van Hillegersberg.</p><button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;
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
            displayDiv.innerHTML = `
                <h2>Help & Contact</h2>
                <p>Runner Blade V.4.1 is a public digital twin prototype for Den Bosch.</p>
                <p><strong>Project contact</strong><br>Daniel Adenew Wonyifraw<br><a href="mailto:info@datatwinlabs.nl">info@datatwinlabs.nl</a></p>
                <p><strong>Platform partner</strong><br>DataTwinLabs<br>For the full multi-streaming platform, backend integration, and municipality deployment path, please get in touch by email.</p>
                <p><strong>Academic collaboration</strong><br>Prof. Jos van Hillegersberg</p>
                <button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>
            `;
            hideContextMenu();
        });
    }

    // Small Analyse popup that shows population and pollution trend for the clicked location

    const analyzeHere = $("analyzeHere");
    if (analyzeHere) {
        analyzeHere.addEventListener("click", async () => {
            hideContextMenu();
            // create or reuse a small popup
            let popup = $("analyzePopup");
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'analyzePopup';
                popup.className = 'analyze-popup';
                popup.innerHTML = `
                    <div id="analyzeHeader" class="analyze-popup__header">
                        <div class="analyze-popup__title">
                            <strong>Analyse hier</strong>
                            <span id="analyzeSpinner" style="display:none;width:16px;height:16px">
                                <svg viewBox="0 0 50 50" width="16" height="16" aria-hidden="true">
                                    <circle cx="25" cy="25" r="20" fill="none" stroke="#3dd6c6" stroke-width="4" stroke-dasharray="31.4 31.4">
                                        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                            </span>
                        </div>
                        <div class="analyze-popup__actions">
                            <button id="pinAnalyzePopup" class="analyze-popup__icon-btn" title="Analysevenster vastzetten" type="button">📌</button>
                            <button id="closeAnalyzePopup" class="analyze-popup__icon-btn" type="button" aria-label="Sluit analysevenster">×</button>
                        </div>
                    </div>
                    <div id="analyzeContent" class="analyze-popup__content">Analyse wordt geladen…</div>`;
                document.body.appendChild(popup);
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
                popup.querySelector('#analyzeContent').innerHTML = 'Analyse wordt geladen…';
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

            const lat = lastContextLat;
            const lon = lastContextLon;
            if (lat == null || lon == null) {
                contentEl.innerHTML = '<em>Locatie op deze pixel kon niet worden bepaald. Klik op de globe om een punt te selecteren.</em>';
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
                const trafficPromise = fetchTrafficSnapshot(lat, lon).catch(() => null);
                const weatherPromise = fetchWeatherSnapshot(lat, lon).catch(() => null);
                const heritagePromise = fetchNearbyHeritageSummary(lat, lon).catch(() => []);
                const cbsPromise = fetchCbsNeighborhoodStats(lat, lon).catch(() => null);

                const [pop, air, traffic, weather, heritage, cbs] = await Promise.all([popPromise, airPromise, trafficPromise, weatherPromise, heritagePromise, cbsPromise]);
                const place = null; // name is available via global 'name'
                if (spinner) spinner.style.display = 'none';

                let html = '';
                html += `<div style="margin-bottom:6px"><strong>Locatie:</strong> ${name || (place && place.address) || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}</div>`;

                if (pop && (pop.population || pop.label)) {
                    html += `<div style="margin-bottom:6px"><strong>Gebied:</strong> ${pop.label || 'n/b'}<br><strong>Bevolking:</strong> ${pop.population ? pop.population.toLocaleString() : 'Onbekend'}</div>`;
                } else {
                    html += `<div style="margin-bottom:6px"><strong>Bevolking:</strong> Onbekend</div>`;
                }

                if (air && (air.co || air.pm25 || air.no2 || air.o3)) {
                    html += `<div style="margin-bottom:6px"><strong>Luchtvervuiling (24u prognose)</strong><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">`;
                    if (air.co && air.co.length) html += `<div style="flex:1;min-width:120px"><small>CO</small>${makeSparkline(air.co, '#ff7f0e')}</div>`;
                    if (air.pm25 && air.pm25.length) html += `<div style="flex:1;min-width:120px"><small>PM2.5</small>${makeSparkline(air.pm25, '#2ca02c')}</div>`;
                    if (air.no2 && air.no2.length) html += `<div style="flex:1;min-width:120px"><small>NO2</small>${makeSparkline(air.no2, '#9467bd')}</div>`;
                    if (air.o3 && air.o3.length) html += `<div style="flex:1;min-width:120px"><small>O3</small>${makeSparkline(air.o3, '#1f77b4')}</div>`;
                    html += `</div></div>`;
                } else {
                    html += `<div style="margin-bottom:6px"><strong>Luchtvervuiling:</strong> Niet beschikbaar (API-sleutel ontbreekt, limiet bereikt of geen data)</div>`;
                }

                if (weather && weather.main) {
                    html += `<div style="margin-bottom:6px"><strong>Huidig weer:</strong> ${Math.round(weather.main.temp)} °C, ${weather.weather && weather.weather[0] ? weather.weather[0].description : "onbekend"}<br><strong>Luchtvochtigheid:</strong> ${weather.main.humidity}%</div>`;
                } else {
                    html += `<div style="margin-bottom:6px"><strong>Huidig weer:</strong> Niet beschikbaar</div>`;
                }

                if (traffic) {
                    const ratio = traffic.freeFlowSpeed > 0 ? Math.round((traffic.currentSpeed / traffic.freeFlowSpeed) * 100) : 100;
                    const stateLabel = ratio >= 90 ? "Vrije doorstroming" : ratio >= 70 ? "Druk netwerk" : ratio >= 55 ? "Vertraging" : "Bottleneck";
                    const bottleneckLabel = ratio < 55 ? "Ja, corridor met hoge druk" : "Nee, geen harde bottleneck";
                    html += `<div style="margin-bottom:6px"><strong>Verkeersstatus:</strong> ${traffic.currentSpeed} / ${traffic.freeFlowSpeed} km/h<br><strong>Weg:</strong> ${traffic.roadName || "n/b"}<br><strong>Doorstroming:</strong> ${ratio}% van vrije doorstroming<br><strong>Netwerkstatus:</strong> ${stateLabel}<br><strong>Bottleneck:</strong> ${bottleneckLabel}</div>`;
                } else {
                    html += `<div style="margin-bottom:6px"><strong>Verkeersstatus:</strong> Niet beschikbaar</div>`;
                }

                if (cbs) {
                    html += `<div style="margin-bottom:6px"><strong>CBS buurtprofiel:</strong> ${cbs.buurtnaam}, ${cbs.gemeentenaam}<br><strong>Inwoners:</strong> ${cbs.aantalInwoners != null ? cbs.aantalInwoners.toLocaleString("nl-NL") : "Onbekend"}<br><strong>Huishoudens:</strong> ${cbs.huishoudens != null ? cbs.huishoudens.toLocaleString("nl-NL") : "Onbekend"}<br><strong>Dichtheid:</strong> ${cbs.bevolkingsdichtheid != null ? `${cbs.bevolkingsdichtheid.toLocaleString("nl-NL")} inw/km²` : "Onbekend"}<br><strong>Auto's per huishouden:</strong> ${cbs.autosPerHuishouden != null ? cbs.autosPerHuishouden.toLocaleString("nl-NL") : "Onbekend"}</div>`;
                } else {
                    html += `<div style="margin-bottom:6px"><strong>CBS buurtprofiel:</strong> Tijdelijk niet beschikbaar</div>`;
                }

                html += `<div style="margin-bottom:6px"><strong>Nabijgelegen erfgoedpunten:</strong> ${Array.isArray(heritage) ? heritage.length : 0}</div>`;
                html += `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button id="openAnalyzeDashboard" type="button" style="padding:6px 10px;border:none;border-radius:8px;background:#22c55e;color:#08131f;cursor:pointer;font-weight:600">Open data-dashboard</button></div>`;
                html += `<div style="margin-top:6px;font-size:11px;color:#666">Databronnen: Wikidata, OpenWeatherMap, TomTom Traffic, PDOK/RCE, PDOK/CBS. Resultaten kunnen benaderingen zijn en worden beperkt door API-limieten.</div>`;
                contentEl.innerHTML = html;
                const openAnalyzeDashboardBtn = document.getElementById('openAnalyzeDashboard');
                if (openAnalyzeDashboardBtn) {
                    openAnalyzeDashboardBtn.onclick = () => {
                        const params = new URLSearchParams({
                            lat: String(lat),
                            lon: String(lon),
                            name: name || ""
                        });
                        window.open(`dashboard/open_data_dashboard.html?${params.toString()}`, "_blank");
                    };
                }
                markOperationalUpdate("Analyse vernieuwd", "Locatieanalyse");
            } catch (e) {
                console.error('Analyse failed', e);
                contentEl.innerHTML = '<em>Fout bij het ophalen van analysegegevens.</em>';
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
