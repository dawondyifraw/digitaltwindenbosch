document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');  // Debugging log to confirm DOM is loaded

    // Initialize the mini-map using OSM Buildings in the minimap container
const minimapLongitude = 5.31541;
const minimapLatitude = 51.67855;
    console.log('OSM Building loiaded');  // Debugging log to confirm DOM is loaded

var minimap = new OSMBuildings({
    container: 'minimap',  // Referencing the mini-map container
    position: { latitude: minimapLatitude, longitude: minimapLongitude },
    zoom: 16,
    minZoom: 15,
    maxZoom: 20,
    tilt: 40,
    rotation: 300,
    effects: ['shadows'],
    attribution: 'Prof. Jos van Hillegersberg and Daniel Wondyifraw</a>'
});

minimap.addMapTiles('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png');
minimap.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json');

// Handle click event to move Cesium camera
document.getElementById('minimap').addEventListener('click', function(event) {
    // Get the clicked pixel coordinates on the mini-map
    const rect = this.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Get the pixel size of the map
    const width = rect.width;
    const height = rect.height;

    // Calculate the geographic coordinates (simplified)
    const lon = minimapLongitude + ((x / width) - 0.5) * (360 / Math.pow(2, minimap.zoom));
    const lat = minimapLatitude - ((y / height) - 0.5) * (180 / Math.pow(2, minimap.zoom));

    console.log(`Clicked coordinates: Latitude: ${lat}, Longitude: ${lon}`);

    // Fly the Cesium camera to the clicked location
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1000), // You can adjust the height here
        duration: 2.0 // Fly over in 2 seconds
    });
});
// Set up the button click event listener
});

