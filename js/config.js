window.config = {
    conf: null, // Placeholder for the config
    debug: true
};

async function loadConfig() {
    try {
        const response = await fetch('./config.json'); // Public path
        if (!response.ok) throw new Error('Failed to load config');
        const configData = await response.json();
        console.log("Config is loaded", configData);
        // Assign the loaded config to window.config.conf
        window.config.conf = configData;
        // Dispatch an event that main.js can listen for
        document.dispatchEvent(new Event("configLoaded"));
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Call insitially
loadConfig();