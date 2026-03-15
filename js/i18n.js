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
            urban_intelligence: "Stedelijke intelligentie",
            citizen_policy: "Burger- en beleidsinzichten",
            platform_partnerships: "Platform & partnerschappen",
            city_command_view: "Stedelijk commandobeeld",
            traffic_flow_co2: "Verkeersstroom & CO2",
            kadaster_buildings: "Kadastergebouwen",
            dutch_heritage_sites: "Nederlands erfgoed",
            biodiversity_stream: "Biodiversiteitslaag",
            cbs_neighborhood_profiles: "CBS buurtprofielen",
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
            traffic_state: "Verkeersstatus",
            no_location_selected: "Nog geen locatie geselecteerd.",
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
            urban_intelligence: "Urban intelligence",
            citizen_policy: "Citizen and policy insights",
            platform_partnerships: "Platform and partnerships",
            city_command_view: "City command view",
            traffic_flow_co2: "Traffic flow and CO2",
            kadaster_buildings: "Kadaster buildings",
            dutch_heritage_sites: "Dutch heritage sites",
            biodiversity_stream: "Biodiversity stream",
            cbs_neighborhood_profiles: "CBS neighborhood profiles",
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
            traffic_state: "Traffic state",
            no_location_selected: "No location selected yet.",
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

        const sectionTitles = document.querySelectorAll(".menu-toggle");
        if (sectionTitles[0]) sectionTitles[0].childNodes[1].textContent = t("city_operations");
        if (sectionTitles[1]) sectionTitles[1].childNodes[1].textContent = t("urban_intelligence");
        if (sectionTitles[2]) sectionTitles[2].childNodes[1].textContent = t("citizen_policy");
        if (sectionTitles[3]) sectionTitles[3].childNodes[1].textContent = t("platform_partnerships");

        applyText("#ops-submenu li:nth-of-type(1) .menu-item", "city_command_view");
        applyText("#ops-submenu li:nth-of-type(2) .menu-item", "traffic_flow_co2");
        applyText("#layers-submenu li:nth-of-type(1) .menu-item", "kadaster_buildings");
        applyText("#layers-submenu li:nth-of-type(2) .menu-item", "dutch_heritage_sites");
        applyText("#layers-submenu li:nth-of-type(3) .menu-item", "biodiversity_stream");
        applyText("#layers-submenu li:nth-of-type(4) .menu-item", "cbs_neighborhood_profiles");
        applyText("#analytics-submenu li:nth-of-type(1) .menu-item", "forecast_climate");
        applyText("#analytics-submenu li:nth-of-type(2) .menu-item", "open_data_dashboard");
        applyText("#analytics-submenu li:nth-of-type(3) .menu-item", "live_sensor_storytelling");
        applyText("#analytics-submenu li:nth-of-type(4) .menu-item", "public_alert_feed");
        applyText("#admin-submenu li:nth-of-type(1) .menu-link", "operational_readiness");
        applyText("#admin-submenu li:nth-of-type(2) .menu-link", "data_governance");
        applyText("#admin-submenu li:nth-of-type(3) .menu-link", "municipality_deployment");

        applyText("#rightPanel h2", "weather_air_quality");
        applyText(".card-header span", "city_assistant");
        applyText("#clear-chat-btn", "clear");
        applyText("#send-btn", "send");
        document.getElementById("user-input")?.setAttribute("placeholder", t("type_message"));
        applyText("#legend h4", "building_legend");
        applyText("#layerLoadingLabel", "loading_kadaster");

        document.getElementById("locationInfoCloseBtn")?.setAttribute("aria-label", t("close_details"));
        applyText("#locationInfoTitle", "location_details");
        applyText(".location-info-card__section:nth-of-type(1) h5", "weather");
        applyText(".location-info-card__section:nth-of-type(2) h5", "air_quality");
        applyText(".location-info-card__section:nth-of-type(3) h5", "traffic");
        applyText("#bagInfoHeading", "bag_building_info");
        applyText("#trafficStateHeading", "traffic_state");
        applyText("#openLocationDashboardBtn", "open_dashboard");

        const weatherContent = document.getElementById("locationWeatherContent");
        const airContent = document.getElementById("locationAirContent");
        const trafficContent = document.getElementById("locationTrafficContent");
        const bagContent = document.getElementById("locationBagContent");
        const trafficStateContent = document.getElementById("trafficStateContent");
        if (weatherContent && !weatherContent.dataset.hasData) weatherContent.textContent = t("no_location_selected");
        if (airContent && !airContent.dataset.hasData) airContent.textContent = t("no_location_selected");
        if (trafficContent && !trafficContent.dataset.hasData) trafficContent.textContent = t("no_location_selected");
        if (bagContent && !bagContent.dataset.hasData) bagContent.textContent = t("no_location_selected");
        if (trafficStateContent && !trafficStateContent.dataset.hasData) trafficStateContent.textContent = t("no_location_selected");

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

    return { t, apply, setLocale, locale: getLocale };
})();

document.addEventListener("configLoaded", () => {
    const savedLocale = localStorage.getItem("udt_locale");
    if (savedLocale && window.config && window.config.conf) {
        window.config.conf.LOCALE = savedLocale;
    }
    window.udtI18n.apply();
});
