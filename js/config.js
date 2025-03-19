async function loadConfig() {
    try {
        const response = await fetch('./config.json'); //public path
        if (!response.ok) throw new Error('Failed to load config');
        
        const config = await response.json();
        console.log('Config Loaded:', config);
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

//gloabl function call before main
loadConfig();
