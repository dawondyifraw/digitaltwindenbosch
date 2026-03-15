window.config = {
    conf: null, // Placeholder for the config
    debug: true
};

const defaultConfig = {
    APP_MODE: "prototype",
    SERVICES: {
        streamUrl: "",
        chatApi: "",
        dashboardApi: ""
    }
};

async function loadConfig() {
    try {
        const response = await fetch('./config.json'); // Public path
        if (!response.ok) throw new Error('Failed to load config');
        const configData = await response.json();
        const mergedConfig = {
            ...defaultConfig,
            ...configData,
            SERVICES: {
                ...defaultConfig.SERVICES,
                ...(configData.SERVICES || {})
            }
        };
        console.log("Config is loaded", mergedConfig);
        // Assign the loaded config to window.config.conf
        window.config.conf = mergedConfig;
        // Dispatch an event that main.js can listen for
        document.dispatchEvent(new Event("configLoaded"));
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Call insitially
loadConfig();
