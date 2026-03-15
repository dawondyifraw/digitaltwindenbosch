window.udtI18n = (function () {
    const translations = {
        nl: {
            title: "DenBosch Digitale Tweeling — UDT Console (DataTwinLabs)",
            prototype: "Prototype",
            open_briefing: "Briefing openen",
            hide_briefing: "Briefing sluiten",
            show_only_3d: "Toon alleen 3D-kaart",
            exit_3d_only: "Sluit 3D-modus",
            urban_digital_twin: "Stedelijke Digitale Tweeling",
            operations_overview: "Den Bosch Operationeel Overzicht",
            twin_status: "Status digitale tweeling",
            data_freshness: "Actualiteit data",
            active_focus: "Actieve focus",
            prototype_live: "Prototype actief",
            prototype_message: "Demoversie. Voor het volledige multi-streaming platform neem contact op met Daniel via info@datatwinlabs.nl.",
            city_operations: "Stadsoperaties",
            city_command_view: "Stedelijk commandobeeld",
            traffic_flow_co2: "Verkeersstroom & CO2",
            event_crowd_mobility: "Evenementen- en publieksmobiliteit",
            flood_rainfall_readiness: "Water- en neerslagparaatheid",
            urban_intelligence: "Stedelijke intelligentie",
            kadaster_buildings: "Kadastergebouwen",
            dutch_heritage_sites: "Nederlands erfgoed",
            biodiversity_stream: "Biodiversiteitslaag",
            air_quality_health: "Luchtkwaliteit & gezondheid",
            tourism_culture: "Toerisme & cultuurgebieden",
            citizen_policy: "Burger- en beleidsinzichten",
            forecast_climate: "Verwachting & klimaatgrafieken",
            open_data_dashboard: "Open data-dashboard",
            live_sensor_storytelling: "Live sensordemo",
            public_alert_feed: "Publieke waarschuwingen",
            night_safety: "Nachtelijke veiligheidsweergave",
            regional_mobility: "Regionale mobiliteit & luchtvaart",
            platform_partnerships: "Platform & partnerschappen",
            operational_readiness: "Operationele gereedheid",
            data_governance: "Datagovernance & audit",
            municipality_deployment: "Gemeentelijk uitrolmodel",
            weather_air_quality: "Weer- en luchtkwaliteitsverwachting",
            city_assistant: "Stadsassistent",
            clear: "Wissen",
            send: "Versturen",
            type_message: "Typ je bericht...",
            traffic_alert: "Verkeersmelding",
            weather_alert: "Weermelding",
            event_alert: "Gebeurtenismelding",
            no_traffic_updates: "Er zijn momenteel geen verkeersupdates.",
            no_weather_updates: "Er zijn momenteel geen weerupdates.",
            no_event_updates: "Er zijn momenteel geen gebeurtenisupdates.",
            building_legend: "Legenda gebouwtypes",
            loading_kadaster: "Kadastergebouwen laden…",
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
            alert_feed_demo_on: "Demo-waarschuwingen aan",
            alert_feed_demo_off: "Publieke waarschuwingen",
            generating_notification: "Demomelding genereren",
            temp_label: "Temperatuur (°C)",
            humidity_label: "Luchtvochtigheid (%)",
            aqi_label: "Luchtkwaliteitsindex",
            no2_label: "NO2 (µg/m³)",
            now: "Nu",
            dashboard_error: "Dashboardfout",
            dashboard_unavailable: "Het dashboard kan niet worden geladen. Controleer of de back-end API actief en bereikbaar is.",
            no_sensor_data: "Geen sensordata beschikbaar.",
            traffic_node: "Verkeersknooppunt",
            air_quality_node: "Luchtkwaliteitsknooppunt",
            ikdb_hub: "IKDB-knooppunt",
            loading_more: "Nog bezig met laden…",
            hide_briefing_btn: "Briefing sluiten",
            open_briefing_btn: "Briefing openen",
            show_3d_btn: "Toon alleen 3D-kaart",
            hide_3d_btn: "Sluit 3D-modus",
            kadaster_loaded: "Kadaster 3D-gebouwen zijn geladen.",
            kadaster_failed: "Kadaster 3D-gebouwen konden niet worden geladen.",
            dutch_heritage_hidden: "De Nederlandse erfgoedlaag is verborgen.",
            dutch_heritage_loaded: "Nederlandse erfgoeddata van PDOK is geladen.",
            dutch_heritage_failed: "Nederlandse erfgoeddata kon nu niet worden geladen.",
            biodiversity_none: "Geen biodiversiteitspunten gevonden in het huidige gebied.",
            biodiversity_failed: "Biodiversiteitslaag niet beschikbaar.",
            traffic_co2_on: "Verkeersstroom en CO2-hotspots zijn geactiveerd."
        }
    };

    function t(key, fallback) {
        const locale = (window.config && window.config.conf && window.config.conf.LOCALE) || "nl";
        const dict = translations[locale] || translations.nl;
        return dict[key] || fallback || key;
    }

    function apply() {
        document.title = t("title", document.title);

        const mappings = [
            [".status-ribbon__eyebrow", "urban_digital_twin"],
            [".status-ribbon__intro strong", "operations_overview"],
            [".status-chip:nth-of-type(1) .status-chip__label", "twin_status"],
            [".status-chip:nth-of-type(1) .status-chip__value", "prototype_live"],
            [".status-chip:nth-of-type(2) .status-chip__label", "data_freshness"],
            [".status-chip:nth-of-type(3) .status-chip__label", "active_focus"],
            [".prototype-pill", "prototype"],
            [".prototype-banner p", "prototype_message"],
            ["#toggleBriefingBtn", "open_briefing"],
            ["#toggleMapOnlyBtn", "show_only_3d"],
            [".sidebar .brand", "city_operations"], 
            ["#ops-submenu li:nth-of-type(1) .menu-item", "city_command_view"],
            ["#ops-submenu li:nth-of-type(2) .menu-item", "traffic_flow_co2"],
            ["#ops-submenu li:nth-of-type(3) .menu-item", "event_crowd_mobility"],
            ["#ops-submenu li:nth-of-type(4) .menu-item", "flood_rainfall_readiness"],
            ["#layers-submenu li:nth-of-type(1) .menu-item", "kadaster_buildings"],
            ["#layers-submenu li:nth-of-type(2) .menu-item", "dutch_heritage_sites"],
            ["#layers-submenu li:nth-of-type(3) .menu-item", "biodiversity_stream"],
            ["#layers-submenu li:nth-of-type(4) .menu-item", "air_quality_health"],
            ["#layers-submenu li:nth-of-type(5) .menu-item", "tourism_culture"],
            ["#analytics-submenu li:nth-of-type(1) .menu-item", "forecast_climate"],
            ["#analytics-submenu li:nth-of-type(2) .menu-item", "open_data_dashboard"],
            ["#analytics-submenu li:nth-of-type(3) .menu-item", "live_sensor_storytelling"],
            ["#analytics-submenu li:nth-of-type(4) .menu-item", "public_alert_feed"],
            ["#analytics-submenu li:nth-of-type(5) .menu-item", "night_safety"],
            ["#analytics-submenu li:nth-of-type(6) .menu-item", "regional_mobility"],
            ["#admin-submenu li:nth-of-type(1) .menu-link", "operational_readiness"],
            ["#admin-submenu li:nth-of-type(2) .menu-link", "data_governance"],
            ["#admin-submenu li:nth-of-type(3) .menu-link", "municipality_deployment"],
            ["#rightPanel h2", "weather_air_quality"],
            [".card-header span", "city_assistant"],
            ["#clear-chat-btn", "clear"],
            ["#send-btn", "send"],
            ["#user-input", "type_message", "placeholder"],
            ["#trafficAlert h4", "traffic_alert"],
            ["#weatherAlert h4", "weather_alert"],
            ["#eventAlert h4", "event_alert"],
            ["#trafficAlert .alert-content", "no_traffic_updates"],
            ["#weatherAlert .alert-content", "no_weather_updates"],
            ["#eventAlert .alert-content", "no_event_updates"],
            ["#legend h4", "building_legend"],
            ["#layerLoadingLabel", "loading_kadaster"]
        ];

        mappings.forEach(([selector, key, attr]) => {
            const element = document.querySelector(selector);
            if (!element) return;
            if (attr === "placeholder") {
                element.setAttribute("placeholder", t(key, element.getAttribute("placeholder")));
            } else {
                element.textContent = t(key, element.textContent);
            }
        });

        const sectionTitles = document.querySelectorAll(".menu-toggle");
        if (sectionTitles[0]) sectionTitles[0].lastChild.textContent = t("city_operations");
        if (sectionTitles[1]) sectionTitles[1].lastChild.textContent = t("urban_intelligence");
        if (sectionTitles[2]) sectionTitles[2].lastChild.textContent = t("citizen_policy");
        if (sectionTitles[3]) sectionTitles[3].lastChild.textContent = t("platform_partnerships");
    }

    return { t, apply, locale: () => ((window.config && window.config.conf && window.config.conf.LOCALE) || "nl") };
})();

document.addEventListener("configLoaded", () => {
    window.udtI18n.apply();
});
