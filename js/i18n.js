window.udtI18n = (function () {
    const translations = {
        nl: {
            title: "DenBosch Digitale Tweeling — UDT Console (DataTwinLabs)",
            urban_digital_twin: "Stedelijke Digitale Tweeling",
            operations_overview: "Den Bosch operationeel overzicht",
            twin_status: "Status digitale tweeling",
            data_freshness: "Actualiteit data",
            active_focus: "Actieve focus",
            prototype_live: "Prototype actief",
            city_core_monitoring: "Monitoring binnenstad",
            city_operations: "Stadsoperaties",
            quick_views: "Snelle weergaven",
            municipal_objects: "Gemeentelijke objecten",
            citizen_policy: "Burger- en beleidsinzichten",
            platform_partnerships: "Platform & partnerschappen",
            city_command_view: "Stedelijk commandobeeld",
            traffic_flow_co2: "Verkeersstroom & CO2",
            event_crowd_mobility: "Mobiliteitsfocus",
            air_quality_health_view: "Luchtkwaliteit & gezondheid",
            tourism_cultural_districts: "Toerisme & cultuurgebieden",
            flood_rainfall_readiness: "Water- en neerslaggereedheid",
            night_view: "Nachtweergave",
            object_catalog: "Gemeentelijke objectcatalogus",
            buildings_group: "Panden",
            context_group: "Omgeving",
            inrichting_group: "Inrichting",
            mobility_group: "Mobiliteit",
            ecology_group: "Ecologisch / milieu",
            safety_group: "Veiligheid",
            thematic_view: "Themaweergave",
            neutral_view: "Neutraal",
            building_function: "Gebouwfunctie",
            building_types: "Bouwtypen",
            mobility_note: "Inclusief bottleneckzones, corridorstatus en mobiliteitslegenda.",
            ecology_note: "RIVM meetpunten, luchtkwaliteit en weeranalyse worden via locatieklik en open data-dashboard getoond.",
            safety_note: "Publieke waarschuwingen en scenario’s worden in de volgende stap verder uitgebreid.",
            kadaster_buildings: "Kadastergebouwen",
            dutch_heritage_sites: "Erfgoedpunten (PDOK/RCE)",
            biodiversity_stream: "Gemeentelijke bomenlaag",
            cbs_neighborhood_profiles: "CBS buurtstatistiek",
            forecast_climate: "Verwachting & klimaatgrafieken",
            open_data_dashboard: "Open data-dashboard",
            live_sensor_storytelling: "Live sensordemo",
            public_alert_feed: "Publieke waarschuwingen",
            operational_readiness: "Operationele gereedheid",
            data_governance: "Datagovernance & audit",
            municipality_deployment: "Gemeentelijk uitrolmodel",
            weather_air_quality: "Weer- en luchtkwaliteitsverwachting",
            city_assistant: "Stadsassistent",
            clear: "Wissen",
            send: "Versturen",
            type_message: "Typ je bericht...",
            you: "Jij",
            assistant_name: "Odin",
            demo_version: "Demoversie",
            retry: "Opnieuw proberen",
            close: "Sluiten",
            no_server_response: "Geen antwoord van de server.",
            demo_chat_active: "Demoversie actief. Voor het volledige multi-streaming platform neem contact op met Daniel via info@datatwinlabs.nl.",
            demo_chat_traffic: "Deze publieke site draait in demomodus. Live verkeersstreaming is beschikbaar in het volledige multi-streaming platform. Neem contact op met Daniel via info@datatwinlabs.nl.",
            demo_chat_air: "De prototypemodus toont voorbeeldinzichten. Voor live weer-, luchtkwaliteits- en geïntegreerde stadsstromen neem contact op met Daniel via info@datatwinlabs.nl.",
            demo_chat_default: "Dit is de demoversie van de Digital Twin Den Bosch-ervaring. Voor het volledige multi-streaming platform met live back-enddiensten neem contact op met Daniel via info@datatwinlabs.nl.",
            demo_chat_error: "Deze publieke site draait in demomodus. Voor het volledige multi-streaming platform neem contact op met Daniel via info@datatwinlabs.nl.",
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
            briefing_text: "Demoversie. Voor het volledige multi-streaming platform neem contact op met Daniel via info@datatwinlabs.nl.",
            language_label: "Taalkeuze",
            loading_more: "Nog bezig met laden…"
        },
        en: {
            title: "DenBosch Digital Twin — UDT Console (DataTwinLabs)",
            urban_digital_twin: "Urban Digital Twin",
            operations_overview: "Den Bosch operations overview",
            twin_status: "Twin status",
            data_freshness: "Data freshness",
            active_focus: "Active focus",
            prototype_live: "Prototype live",
            city_core_monitoring: "City core monitoring",
            city_operations: "City operations",
            quick_views: "Quick views",
            municipal_objects: "Municipal objects",
            citizen_policy: "Citizen and policy insights",
            platform_partnerships: "Platform and partnerships",
            city_command_view: "City command view",
            traffic_flow_co2: "Traffic flow and CO2",
            event_crowd_mobility: "Mobility focus",
            air_quality_health_view: "Air quality and health",
            tourism_cultural_districts: "Tourism and cultural districts",
            flood_rainfall_readiness: "Flood and rainfall readiness",
            night_view: "Night view",
            object_catalog: "Municipal object catalog",
            buildings_group: "Buildings",
            context_group: "Context",
            inrichting_group: "Street furniture",
            mobility_group: "Mobility",
            ecology_group: "Ecology / environment",
            safety_group: "Safety",
            thematic_view: "Thematic view",
            neutral_view: "Neutral",
            building_function: "Building function",
            building_types: "Building types",
            mobility_note: "Includes bottleneck zones, corridor status, and the mobility legend.",
            ecology_note: "RIVM stations, air quality, and weather analysis are shown through map clicks and the open data dashboard.",
            safety_note: "Public alerts and scenarios will be expanded further in the next step.",
            kadaster_buildings: "Kadaster buildings",
            dutch_heritage_sites: "Heritage points (PDOK/RCE)",
            biodiversity_stream: "Municipal tree layer",
            cbs_neighborhood_profiles: "CBS neighborhood statistics",
            forecast_climate: "Forecast and climate charts",
            open_data_dashboard: "Open data dashboard",
            live_sensor_storytelling: "Live sensor storytelling",
            public_alert_feed: "Public alert feed",
            operational_readiness: "Operational readiness",
            data_governance: "Data governance and audit",
            municipality_deployment: "Municipality deployment model",
            weather_air_quality: "Weather and air quality forecast",
            city_assistant: "City assistant",
            clear: "Clear",
            send: "Send",
            type_message: "Type your message...",
            you: "You",
            assistant_name: "Odin",
            demo_version: "Demo version",
            retry: "Retry",
            close: "Close",
            no_server_response: "No response from the server.",
            demo_chat_active: "Demo mode active. For the full multi-streaming platform, contact Daniel at info@datatwinlabs.nl.",
            demo_chat_traffic: "This public site runs in demo mode. Live traffic streaming is available in the full multi-streaming platform. Contact Daniel at info@datatwinlabs.nl.",
            demo_chat_air: "The prototype mode shows sample insights. For live weather, air quality, and integrated city streams, contact Daniel at info@datatwinlabs.nl.",
            demo_chat_default: "This is the demo version of the Digital Twin Den Bosch experience. For the full multi-streaming platform with live backend services, contact Daniel at info@datatwinlabs.nl.",
            demo_chat_error: "This public site runs in demo mode. For the full multi-streaming platform, contact Daniel at info@datatwinlabs.nl.",
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
            briefing_text: "Demo version. For the full multi-streaming platform, contact Daniel at info@datatwinlabs.nl.",
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
        applyText(".status-chip:nth-of-type(1) .status-chip__label", "twin_status");
        applyText(".status-chip:nth-of-type(1) .status-chip__value", "prototype_live");
        applyText(".status-chip:nth-of-type(2) .status-chip__label", "data_freshness");
        applyText(".status-chip:nth-of-type(3) .status-chip__label", "active_focus");
        applyText("#statusFocusArea", "city_core_monitoring");

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
        applyText(".card-header span", "city_assistant");
        applyText("#clear-chat-btn", "clear");
        applyText("#send-btn", "send");
        document.getElementById("user-input")?.setAttribute("placeholder", t("type_message"));
        applyText("#legend h4", "building_legend");
        applyText("#buildingThemeLegend h4", "building_function");
        applyText("#layerLoadingLabel", "loading_kadaster");

        document.getElementById("locationInfoCloseBtn")?.setAttribute("aria-label", t("close_details"));
        applyText("#locationInfoTitle", "location_details");
        applyText(".location-info-card__section:nth-of-type(1) h5", "weather");
        applyText(".location-info-card__section:nth-of-type(2) h5", "air_quality");
        applyText(".location-info-card__section:nth-of-type(3) h5", "traffic");
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
