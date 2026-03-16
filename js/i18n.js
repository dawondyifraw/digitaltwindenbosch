window.udtI18n = (function () {
    const translations = {
        nl: {
            title: "Digital Twin Den Bosch — Viewer",
            urban_digital_twin: "Stedelijke Digitale Tweeling",
            operations_overview: "Digital Twin Den Bosch",
            twin_status: "Viewerstatus",
            data_freshness: "Actualiteit data",
            active_focus: "Focus",
            prototype_live: "Beperkte versie actief",
            city_core_monitoring: "Monitoring binnenstad",
            city_operations: "Viewer",
            quick_views: "Zichtpunten",
            municipal_objects: "Lagen",
            citizen_policy: "Tools",
            platform_partnerships: "Info",
            city_command_view: "Stadscentrum",
            traffic_flow_co2: "Verkeersbeeld",
            event_crowd_mobility: "Mobiliteitsbeeld",
            air_quality_health_view: "Milieubeeld",
            tourism_cultural_districts: "Erfgoedbeeld",
            flood_rainfall_readiness: "Watergereedheid",
            night_view: "Nachtweergave",
            object_catalog: "Gemeentelijke objectcatalogus",
            buildings_group: "Panden",
            context_group: "Verkeer",
            inrichting_group: "Erfgoed",
            mobility_group: "CBS",
            ecology_group: "Bomen",
            safety_group: "Milieu",
            thematic_view: "Themaweergave",
            neutral_view: "Neutraal",
            building_function: "Gebouwfunctie",
            building_types: "Bouwtypen",
            mobility_note: "Corridors, bottleneckzones en actuele doorstroming voor het stedelijke netwerk.",
            ecology_note: "Bomen en publieke groenlagen voor snelle ruimtelijke context.",
            safety_note: "Luchtkwaliteit en weeranalyse blijven beschikbaar via klikanalyse en het weerpaneel.",
            kadaster_buildings: "Kadastergebouwen",
            dutch_heritage_sites: "Erfgoedpunten (PDOK/RCE)",
            biodiversity_stream: "Gemeentelijke bomenlaag",
            cbs_neighborhood_profiles: "CBS buurtstatistiek",
            forecast_climate: "Weerpaneel",
            open_data_dashboard: "Open dashboard",
            live_sensor_storytelling: "Livesensoren",
            public_alert_feed: "Waarschuwingen",
            alert_feed_demo_on: "Demo-waarschuwingen aan",
            alert_feed_demo_off: "Demo-waarschuwingen uit",
            operational_readiness: "Viewerstatus",
            data_governance: "Datagovernance",
            municipality_deployment: "Uitrolmodel",
            weather_air_quality: "Weer- en luchtkwaliteitsverwachting",
            temp_chart_title: "Temperatuurverwachting",
            temp_chart_meta: "Komende 21 uur",
            humidity_chart_title: "Luchtvochtigheidstrend",
            humidity_chart_meta: "Relatieve luchtvochtigheid",
            air_chart_eyebrow: "Lucht",
            weather_chart_eyebrow: "Weer",
            pm25_chart_title: "PM2.5-schatting",
            pm25_chart_meta: "Huidige waarde over de tijdshorizon",
            no2_chart_title: "NO₂-concentratie",
            no2_chart_meta: "Huidige waarde over de tijdshorizon",
            city_assistant: "Stadsassistent",
            clear: "Wissen",
            send: "Versturen",
            type_message: "Typ je bericht...",
            you: "Jij",
            assistant_name: "Odin",
            demo_version: "Beperkte versie",
            retry: "Opnieuw proberen",
            close: "Sluiten",
            no_server_response: "Geen antwoord van de server.",
            demo_chat_active: "Beperkte versie actief. Bezoek DataTwinLabs.nl om een live full-data demo met Daniel of Prof. Jos in te plannen.",
            demo_chat_traffic: "Deze beperkte versie toont slechts een deel van de verkeerslaag. Bezoek DataTwinLabs.nl om een live full-data demo met Daniel of Prof. Jos in te plannen.",
            demo_chat_air: "Deze beperkte versie toont voorbeeldinzichten. Bezoek DataTwinLabs.nl om een live full-data demo met Daniel of Prof. Jos in te plannen.",
            demo_chat_default: "Dit is de beperkte versie van Digital Twin Den Bosch. Bezoek DataTwinLabs.nl om een live full-data demo met Daniel of Prof. Jos in te plannen en het volledige platform te verkennen.",
            demo_chat_error: "Deze beperkte versie gebruikt niet alle backenddiensten. Bezoek DataTwinLabs.nl om een live full-data demo met Daniel of Prof. Jos in te plannen.",
            building_legend: "Legenda gebouwtypes",
            loading_kadaster: "Kadastergebouwen laden…",
            close_details: "Sluit details",
            location_details: "Locatiegegevens",
            weather: "Weer",
            air_quality: "Luchtkwaliteit",
            traffic: "Verkeer",
            bag_building_info: "BAG gebouwinfo",
            energy_label: "Energielabel",
            official_sensor_data: "Officiele RIVM meetpunten",
            traffic_state: "Verkeersstatus",
            traffic_incidents: "Incidenten gemeld",
            no_location_selected: "Nog geen locatie geselecteerd.",
            no_official_sensor_data: "Geen actuele officiele meetpunten gevonden voor deze locatie.",
            no_traffic_incidents: "Geen actuele verkeersincidenten in de directe omgeving.",
            open_dashboard: "Open dashboard",
            briefing_open: "Briefing openen",
            briefing_close: "Briefing sluiten",
            briefing_title: "Prototypebriefing",
            briefing_text: "Beperkte versie. Bezoek DataTwinLabs.nl om een live full-data demo met Daniel of Prof. Jos in te plannen en de gemeentelijke uitrolroadmap te bespreken.",
            language_label: "Taalkeuze",
            loading_more: "Nog bezig met laden…"
        },
        en: {
            title: "Digital Twin Den Bosch — Viewer",
            urban_digital_twin: "Urban Digital Twin",
            operations_overview: "Digital Twin Den Bosch",
            twin_status: "Viewer mode",
            data_freshness: "Data freshness",
            active_focus: "Focus",
            prototype_live: "Limited version live",
            city_core_monitoring: "City core monitoring",
            city_operations: "Viewer",
            quick_views: "Viewpoints",
            municipal_objects: "Layers",
            citizen_policy: "Tools",
            platform_partnerships: "Info",
            city_command_view: "City Center",
            traffic_flow_co2: "Traffic View",
            event_crowd_mobility: "Mobility View",
            air_quality_health_view: "Environment View",
            tourism_cultural_districts: "Heritage View",
            flood_rainfall_readiness: "Water Readiness",
            night_view: "Night view",
            object_catalog: "Municipal object catalog",
            buildings_group: "Buildings",
            context_group: "Traffic",
            inrichting_group: "Heritage",
            mobility_group: "CBS",
            ecology_group: "Trees",
            safety_group: "Environment",
            thematic_view: "Thematic view",
            neutral_view: "Neutral",
            building_function: "Building function",
            building_types: "Building types",
            mobility_note: "Corridors, bottleneck zones, and live flow status for the city network.",
            ecology_note: "Tree and green layers for quick spatial context.",
            safety_note: "Air quality and weather analysis stay available through click analysis and the weather panel.",
            kadaster_buildings: "Kadaster buildings",
            dutch_heritage_sites: "Heritage points (PDOK/RCE)",
            biodiversity_stream: "Municipal tree layer",
            cbs_neighborhood_profiles: "CBS neighborhood statistics",
            forecast_climate: "Weather Panel",
            open_data_dashboard: "Open Dashboard",
            live_sensor_storytelling: "Live Sensors",
            public_alert_feed: "Alerts",
            alert_feed_demo_on: "Demo alerts on",
            alert_feed_demo_off: "Demo alerts off",
            operational_readiness: "Viewer Status",
            data_governance: "Data Governance",
            municipality_deployment: "Deployment Model",
            weather_air_quality: "Weather and air quality forecast",
            temp_chart_title: "Temperature forecast",
            temp_chart_meta: "Next 21 hours",
            humidity_chart_title: "Humidity trend",
            humidity_chart_meta: "Relative humidity",
            air_chart_eyebrow: "Air",
            weather_chart_eyebrow: "Weather",
            pm25_chart_title: "PM2.5 estimate",
            pm25_chart_meta: "Current proxy across the horizon",
            no2_chart_title: "NO₂ concentration",
            no2_chart_meta: "Current proxy across the horizon",
            city_assistant: "City assistant",
            clear: "Clear",
            send: "Send",
            type_message: "Type your message...",
            you: "You",
            assistant_name: "Odin",
            demo_version: "Limited version",
            retry: "Retry",
            close: "Close",
            no_server_response: "No response from the server.",
            demo_chat_active: "Limited version active. Visit DataTwinLabs.nl to schedule a live full-data demo with Daniel or Prof. Jos.",
            demo_chat_traffic: "This limited version shows only part of the traffic layer. Visit DataTwinLabs.nl to schedule a live full-data demo with Daniel or Prof. Jos.",
            demo_chat_air: "This limited version shows sample insights. Visit DataTwinLabs.nl to schedule a live full-data demo with Daniel or Prof. Jos.",
            demo_chat_default: "This is the limited version of the Digital Twin Den Bosch experience. Visit DataTwinLabs.nl to schedule a live full-data demo with Daniel or Prof. Jos and explore the full platform.",
            demo_chat_error: "This limited version does not use all backend services. Visit DataTwinLabs.nl to schedule a live full-data demo with Daniel or Prof. Jos.",
            building_legend: "Building type legend",
            loading_kadaster: "Loading Kadaster buildings…",
            close_details: "Close details",
            location_details: "Location details",
            weather: "Weather",
            air_quality: "Air quality",
            traffic: "Traffic",
            bag_building_info: "BAG building info",
            energy_label: "Energy label",
            official_sensor_data: "Official RIVM stations",
            traffic_state: "Traffic state",
            traffic_incidents: "Reported incidents",
            no_location_selected: "No location selected yet.",
            no_official_sensor_data: "No current official stations found for this location.",
            no_traffic_incidents: "No current traffic incidents in the immediate area.",
            open_dashboard: "Open dashboard",
            briefing_open: "Open briefing",
            briefing_close: "Close briefing",
            briefing_title: "Prototype briefing",
            briefing_text: "Limited version. Visit DataTwinLabs.nl to schedule a live full-data demo with Daniel or Prof. Jos and explore the full platform and municipal deployment roadmap.",
            language_label: "Language selection",
            loading_more: "Still loading…"
        }
    };

    function getLocale() {
        return localStorage.getItem("udt_locale")
            || (window.config && window.config.conf && window.config.conf.LOCALE)
            || "nl";
    }

    function t(key, fallback) {
        const locale = getLocale();
        const dict = translations[locale] || translations.nl;
        return dict[key] || fallback || key;
    }

    function applyText(selector, key) {
        const element = document.querySelector(selector);
        if (element) element.textContent = t(key, element.textContent);
    }

    function updateLocaleButtons(locale) {
        document.querySelectorAll(".locale-switch__btn").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.locale === locale);
        });
    }

    function setButtonLabel(selector, label) {
        const button = document.querySelector(selector);
        if (!button) return;
        const icon = button.querySelector(".icon");
        button.textContent = "";
        if (icon) {
            button.appendChild(icon);
            button.appendChild(document.createTextNode(label));
        } else {
            button.textContent = label;
        }
    }

    function apply() {
        const locale = getLocale();
        document.documentElement.lang = locale;
        document.title = t("title", document.title);

        applyText(".status-ribbon__eyebrow", "urban_digital_twin");
        applyText(".status-ribbon__intro strong", "operations_overview");
        applyText(".status-inline:nth-of-type(1) .status-inline__label", "twin_status");
        applyText(".status-inline:nth-of-type(1) strong", "prototype_live");
        applyText(".status-inline:nth-of-type(2) .status-inline__label", "data_freshness");
        applyText(".status-inline:nth-of-type(3) .status-inline__label", "active_focus");
        applyText("#statusFocusArea", "city_core_monitoring");
        applyText("#topHomeBtn .status-ribbon__btn-label", "city_command_view");
        document.querySelector("#topInfoBtn .status-ribbon__btn-label") && (document.querySelector("#topInfoBtn .status-ribbon__btn-label").textContent = t("platform_partnerships", "Info"));
        document.querySelector("#topWeatherBtn .status-ribbon__btn-label") && (document.querySelector("#topWeatherBtn .status-ribbon__btn-label").textContent = t("forecast_climate", "Weather"));
        document.querySelector("#topDashboardBtn .status-ribbon__btn-label") && (document.querySelector("#topDashboardBtn .status-ribbon__btn-label").textContent = t("open_data_dashboard", "Dashboard"));
        document.querySelector("#topAlertsBtn .status-ribbon__btn-label") && (document.querySelector("#topAlertsBtn .status-ribbon__btn-label").textContent = t("public_alert_feed", "Alerts"));
        document.querySelector("#topAssistantBtn .status-ribbon__btn-label") && (document.querySelector("#topAssistantBtn .status-ribbon__btn-label").textContent = t("city_assistant", "Assistant"));

        setButtonLabel('.menu-toggle[aria-controls="ops-submenu"]', t("city_operations"));
        setButtonLabel('.menu-toggle[aria-controls="quick-submenu"]', t("quick_views"));
        setButtonLabel('.menu-toggle[aria-controls="layers-submenu"]', t("municipal_objects"));
        setButtonLabel('.menu-toggle[aria-controls="analytics-submenu"]', t("citizen_policy"));
        setButtonLabel('.menu-toggle[aria-controls="admin-submenu"]', t("platform_partnerships"));

        applyText("#ops-submenu li:nth-of-type(1) .menu-item", "city_command_view");
        applyText("#quick-submenu li:nth-of-type(1) .menu-item", "traffic_flow_co2");
        applyText('#quick-submenu [data-scenario="mobility"]', "event_crowd_mobility");
        applyText('#quick-submenu [data-scenario="environment"]', "air_quality_health_view");
        applyText('#quick-submenu [data-scenario="culture"]', "tourism_cultural_districts");
        applyText('#quick-submenu [data-world-effect="weather-water"]', "flood_rainfall_readiness");
        applyText('#quick-submenu [data-world-effect="weather-night"]', "night_view");

        document.querySelector("#layers-submenu")?.setAttribute("aria-label", t("object_catalog"));
        applyText("#layers-submenu > .catalog-group:nth-of-type(1) > summary", "buildings_group");
        applyText("#layers-submenu > .catalog-group:nth-of-type(2) > summary", "context_group");
        applyText("#layers-submenu > .catalog-group:nth-of-type(3) > summary", "inrichting_group");
        applyText("#layers-submenu > .catalog-group:nth-of-type(4) > summary", "mobility_group");
        applyText("#layers-submenu > .catalog-group:nth-of-type(5) > summary", "ecology_group");
        applyText("#layers-submenu > .catalog-group:nth-of-type(6) > summary", "safety_group");
        applyText("#BAGButton", "kadaster_buildings");
        applyText("#layers-submenu .catalog-subgroup:nth-of-type(1) > summary", "thematic_view");
        applyText('input[name="buildingTheme"][value="neutral"] + span', "neutral_view");
        applyText('input[name="buildingTheme"][value="function"] + span', "building_function");
        applyText("#layers-submenu .catalog-subgroup:nth-of-type(2) > summary", "building_types");
        applyText("#toggleMuseumsBtn", "dutch_heritage_sites");
        applyText("#toggleCbsNeighborhoodsBtn", "cbs_neighborhood_profiles");
        applyText("#toggleBiodiversityBtn", "biodiversity_stream");
        applyText("#toggleTraffic", "traffic_flow_co2");
        applyText("#layers-submenu .catalog-group:nth-of-type(4) .catalog-note", "mobility_note");
        applyText("#layers-submenu .catalog-group:nth-of-type(5) .catalog-note", "ecology_note");
        applyText("#layers-submenu .catalog-group:nth-of-type(6) .catalog-note", "safety_note");

        applyText("#analytics-submenu li:nth-of-type(1) .menu-item", "forecast_climate");
        applyText("#analytics-submenu li:nth-of-type(2) .menu-item", "open_data_dashboard");
        applyText("#analytics-submenu li:nth-of-type(3) .menu-item", "live_sensor_storytelling");
        applyText("#analytics-submenu li:nth-of-type(4) .menu-item", "public_alert_feed");
        applyText("#admin-submenu li:nth-of-type(1) .menu-item", "operational_readiness");
        applyText("#admin-submenu li:nth-of-type(2) .menu-item", "data_governance");
        applyText("#admin-submenu li:nth-of-type(3) .menu-item", "municipality_deployment");

        applyText("#rightPanel h2", "weather_air_quality");
        applyText("#temperatureChartEyebrow", "weather_chart_eyebrow");
        applyText("#temperatureChartTitle", "temp_chart_title");
        applyText("#temperatureChartMeta", "temp_chart_meta");
        applyText("#humidityChartEyebrow", "weather_chart_eyebrow");
        applyText("#humidityChartTitle", "humidity_chart_title");
        applyText("#humidityChartMeta", "humidity_chart_meta");
        applyText("#aqiChartEyebrow", "air_chart_eyebrow");
        applyText("#aqiChartTitle", "pm25_chart_title");
        applyText("#aqiChartMeta", "pm25_chart_meta");
        applyText("#no2ChartEyebrow", "air_chart_eyebrow");
        applyText("#no2ChartTitle", "no2_chart_title");
        applyText("#no2ChartMeta", "no2_chart_meta");
        applyText(".card-header span", "city_assistant");
        applyText("#clear-chat-btn", "clear");
        applyText("#send-btn", "send");
        document.getElementById("user-input")?.setAttribute("placeholder", t("type_message"));
        applyText("#legend h4", "building_legend");
        applyText("#buildingThemeLegend h4", "building_function");
        applyText("#layerLoadingLabel", "loading_kadaster");

        document.getElementById("locationInfoCloseBtn")?.setAttribute("aria-label", t("close_details"));
        applyText("#locationInfoTitle", "location_details");
        applyText("#weatherInfoHeading", "weather");
        applyText("#airQualityInfoHeading", "air_quality");
        applyText("#trafficInfoHeading", "traffic");
        applyText("#bagInfoHeading", "bag_building_info");
        applyText("#energyLabelHeading", "energy_label");
        applyText("#rivmInfoHeading", "official_sensor_data");
        applyText("#trafficStateHeading", "traffic_state");
        applyText("#trafficIncidentsHeading", "traffic_incidents");
        applyText("#openLocationDashboardBtn", "open_dashboard");

        const weatherContent = document.getElementById("locationWeatherContent");
        const airContent = document.getElementById("locationAirContent");
        const trafficContent = document.getElementById("locationTrafficContent");
        const bagContent = document.getElementById("locationBagContent");
        const energyContent = document.getElementById("locationEnergyContent");
        const rivmContent = document.getElementById("locationRivmContent");
        const trafficStateContent = document.getElementById("trafficStateContent");
        const trafficIncidentsContent = document.getElementById("trafficIncidentsContent");
        if (weatherContent && !weatherContent.dataset.hasData) weatherContent.textContent = t("no_location_selected");
        if (airContent && !airContent.dataset.hasData) airContent.textContent = t("no_location_selected");
        if (trafficContent && !trafficContent.dataset.hasData) trafficContent.textContent = t("no_location_selected");
        if (bagContent && !bagContent.dataset.hasData) bagContent.textContent = t("no_location_selected");
        if (energyContent && !energyContent.dataset.hasData) energyContent.textContent = t("no_location_selected");
        if (rivmContent && !rivmContent.dataset.hasData) rivmContent.textContent = t("no_location_selected");
        if (trafficStateContent && !trafficStateContent.dataset.hasData) trafficStateContent.textContent = t("no_location_selected");
        if (trafficIncidentsContent && !trafficIncidentsContent.dataset.hasData) trafficIncidentsContent.textContent = t("no_location_selected");

        applyText("#sidebarBriefingTitle", "briefing_title");
        applyText("#sidebarBriefingText", "briefing_text");
        const briefingButton = document.getElementById("sidebarBriefingToggle");
        if (briefingButton) {
            const isOpen = briefingButton.getAttribute("aria-expanded") === "true";
            briefingButton.textContent = t(isOpen ? "briefing_close" : "briefing_open");
        }
        document.querySelector(".locale-switch")?.setAttribute("aria-label", t("language_label"));
        updateLocaleButtons(locale);
    }

    function setLocale(locale) {
        localStorage.setItem("udt_locale", locale);
        if (window.config && window.config.conf) {
            window.config.conf.LOCALE = locale;
        }
        apply();
        document.dispatchEvent(new CustomEvent("localeChanged", { detail: { locale } }));
    }

    return { t, apply, setLocale, locale: getLocale() };
})();

document.addEventListener("configLoaded", () => {
    const savedLocale = localStorage.getItem("udt_locale");
    if (savedLocale && window.config && window.config.conf) {
        window.config.conf.LOCALE = savedLocale;
    }
    window.udtI18n.apply();
});
