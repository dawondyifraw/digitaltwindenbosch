Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZGIzMDNjYy0zZTg2LTRhMjAtYjM1MS1hN2IzNDlhMjEzNGYiLCJpZCI6MjM5NDE4LCJpYXQiOjE3MjU1NTg2MDh9.hNdDA8dKIk4eT10b6jkvFHTvuJ1swvu1I2ZEY5FACAI";
let isBuildingsLoaded = false; // State tracking
let tomTomTrafficLayer;
let viewer;
let name = "";
let TomTomAPI="m0lqjskY9lNfIAjWZ99BUOZ31wHQynGA";
let airQualityApiKey="bd5e378503939ddaee76f12ad7a97608";
const weatherApiKey = "bd5e378503939ddaee76f12ad7a97608";

document.addEventListener("configLoaded", () => {
    console.log("Config loaded:", window.config);
    initializeMain();
});

async function initializeMain() {
    // Wait for config to load
    while (!window.config.conf) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    }
    console.log("Config:", window.config.conf);
    // Assign variables AFTER the config is loaded
    const config = window.config.conf;
    const airQualityApiKey = config.AIRQUALITYAPI;
    const TomTomAPI = config.TOMTOMAPI;
    const Longitude = 5.31541;
    const Latitude = 51.67855;
    // API keys
 

    console.log("Weather API Key:", weatherApiKey);
}

document.addEventListener('DOMContentLoaded', function () {
    // Show splash screen for 5 seconds
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';

        // Load Cesium after hiding the splash screen
        initCesium();

        // Add event listeners once Cesium is loaded
        document.getElementById('toggleTraffic').addEventListener('click', toggleTraffic);
        document.body.insertAdjacentHTML('beforeend', '<button id="togglePanel" onclick="toggleRightPanel()">Toggle Panel</button>');
        
        const flyButton = document.getElementById('flytoIKDBButton');
        if (flyButton) {
            flyButton.addEventListener('click', flytoIKDB);
        } else {
            console.error('Button not found');
        }
    }, 5000); // Adjust the timeout duration as needed
});

function toggleBuildings() {
  if (isBuildingsLoaded) {
    loadTileset(); // Call when buildings are loaded (toggle off)
  } else {
    loadBuildings3DTiles(); // Call when buildings are not loaded (toggle on)
  }
  isBuildingsLoaded = !isBuildingsLoaded; // Flip the state
}
document.getElementById('BAGButton').addEventListener('click', toggleBuildings);

 // Function to load the 3D Tiles for buildings
        async function loadBuildings3DTiles() {
            try {
                const tileset = new Cesium.Cesium3DTileset({
                    // Replace with the actual endpoint URL for your tileset.json
                    url: 'https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/gebouwen/3dtiles',
                   
                });

                //loadTileset();

                // Add the tileset to the Cesium scene
                viewer.scene.primitives.add(tileset);

                // Zoom to the tileset
                //await tileset.readyPromise;
                viewer.zoomTo(tileset);

                console.log('3D Tiles for buildings loaded successfully.');
            } catch (error) {
                console.error('Error loading 3D Tiles for buildings:', error);
            }
        }

      

async function initCesium(weatherApiKey) {
    // Initialize Cesium Viewer
    viewer = new Cesium.Viewer('cesiumContainer', {
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
        const creditContainer = document.querySelector('.cesium-credit-logoContainer');
        if (creditContainer) {
            creditContainer.innerHTML = `
                <a href="https://www.denbosch.nl" target="_blank">
                    <img title="Den Bosch" src="https://ros-tvkrant.nl/wp-content/uploads/2023/10/logo-s-hertogenbosch.jpg" style="width: 150px;">
                </a>`;
        }
    });

    // Scene configurations
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.skyBox.show = false;
    viewer.scene.backgroundColor = Cesium.Color.BLACK;
    viewer.scene.globe.enableLighting = true; // This is assigned once here.
    viewer.shadows = true;
    viewer.camera.frustum.far = 10000000.0;

   if (viewer.dataSources.length > 0) {
    viewer.dataSources.get(0).clustering.enabled = false;
    }

    viewer.entities.removeAll();

    // Ensure these functions are defined and async if they depend on any data loading
    await loadTileset();  // Ensure loadTileset is properly defined elsewhere in your code
      // Load the 3D Tiles
   //loadBuildings3DTiles();
    //await loadTileset();
   // loadBuildings3DTiles();
    //await setupMapClickHandler();
    setupMapClickHandler();  // Ensure setupMapClickHandler is defined as well
    // Initialize the context menu for right-click actions
    addCombinedContextMenu(viewer);
}




// Function to load tileset and OSM buildings
async function loadTileset() {
     console.log('toileset not found');
    
// Approximate bounding box for the Innovation Quarter Den Bosch (IKDB)
const ikdbMinLat = 51.686;  // Minimum latitude for IKDB
const ikdbMaxLat = 51.690;  // Maximum latitude for IKDB
const ikdbMinLon = 5.290;   // Minimum longitude for IKDB
const ikdbMaxLon = 5.310;   // Maximum longitude for IKDB

    try {
        // Load the Cesium tileset resource
        const tilesetResource = await Cesium.IonResource.fromAssetId(2275207);
        const tileset = new Cesium.Cesium3DTileset({
            url: tilesetResource
        });

        // Add the tileset to the scene
        viewer.scene.primitives.add(tileset);
     

        // Add OSM Buildings (OpenStreetMap 3D buildings) to Cesium
        const osmBuildings = viewer.scene.primitives.add(Cesium.createOsmBuildings());

        // Apply styles to the buildings based on types
        osmBuildings.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ["${building} === 'school'", "color('rgba(70, 130, 180, 0.8)')"],      // School
                    ["${building} === 'university'", "color('rgba(34, 139, 34, 0.8)')"],  // University
                    ["${building} === 'hospital'", "color('rgba(255, 69, 0, 0.8)')"],     // Hospital
                    ["${building} === 'parking'", "color('rgba(128, 128, 128, 0.7)')"],   // Parking
                    ["${building} === 'church'", "color('rgba(148, 0, 211, 0.8)')"],      // Church
                    ["${building} === 'retail'", "color('rgba(255, 165, 0, 0.8)')"],      // Retail
                    ["${building} === 'industrial'", "color('rgba(160, 82, 45, 0.8)')"],  // Industrial
                    ["${building} === 'commercial'", "color('rgba(0, 0, 139, 0.8)')"],    // Commercial
                    ["${building} === 'hotel'", "color('rgba(255, 223, 0, 0.8)')"],       // Hotel
                    ["${building} === 'house'", "color('rgba(255, 182, 193, 0.8)')"],     // House
                    ["${building} === 'apartments'", "color('rgba(135, 206, 235, 0.8)')"],// Apartments
                    ["${building} === 'office'", "color('rgba(105, 105, 105, 0.8)')"],    // Office
                    // Default color for any other building type
                    ["true", "color('rgba(200, 200, 200, 0.6)')"]
                ],
            }
        });

        // Function to add a pin with a specific icon and color based on the building type
        function addBuildingPin(buildingType, latitude, longitude) {
            const pinBuilder = new Cesium.PinBuilder();
            let pinColor;
            let iconId;

            // Only process certain building types for pins
            switch (buildingType) {
                case 'hospital':
                    iconId = "hospital";
                    pinColor = Cesium.Color.RED;
                    break;
                case 'school':
                    iconId = "school";
                    pinColor = Cesium.Color.YELLOW;
                    break;
                case 'university':
                    iconId = "college";
                    pinColor = Cesium.Color.ORANGE;
                    break;
                case 'parking':
                    iconId = "parking";
                    pinColor = Cesium.Color.BLUE;
                    break;
                case 'church':
                    iconId = "religious-christian";
                    pinColor = Cesium.Color.PURPLE;
                    break;
                case 'retail':
                    iconId = "shop";
                    pinColor = Cesium.Color.PINK;
                    break;
                case 'industrial':
                    iconId = "industrial";
                    pinColor = Cesium.Color.GRAY;
                    break;
                default:
                    return;  // Skip buildings that are not of interest
            }

            // Create the pin with the defined icon and color
            pinBuilder.fromMakiIconId(iconId, pinColor, 48).then((canvas) => {
                 viewer.entities.add({
                name: buildingType.charAt(0).toUpperCase() + buildingType.slice(1),  // Capitalize the building type
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                billboard: {
                    image: canvas.toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    scaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.2, 1.0e6, 0.8), // Adjusted to prevent shrinking too much
                    pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.2, 1.0e6, 0.8), // Same adjustment for offset
                    show: true  // Ensure the marker is always visible
                }
            });

            });
        }

        // Throttle the processing to avoid overwhelming the app
        let lastProcessedTime = Date.now();
        const throttleDelay = 1000; // Adjust delay as needed

         // Add event listener to check for buildings and place pins
        osmBuildings.tileVisible.addEventListener((tile) => {
            const features = tile.content.featuresLength;

            // Throttle the pin addition to reduce overload
            const currentTime = Date.now();
            if (currentTime - lastProcessedTime < throttleDelay) return;
            lastProcessedTime = currentTime;
             
             console.log(lastProcessedTime);
            // Iterate through features and place pins for valid buildings
            for (let i = 0; i < features; i++) {
                const feature = tile.content.getFeature(i);
                const buildingType = feature.getProperty('building'); // Check the building property

                // Get latitude and longitude properties if available
                let latitude = feature.getProperty('cesium#latitude');
                let longitude = feature.getProperty('cesium#longitude');

                // If no latitude/longitude, try calculating from Cartesian position
                if (!latitude || !longitude) {
                    const cartesianPosition = feature.getProperty('cesium#position');
                    if (cartesianPosition) {
                        const cartographicPosition = Cesium.Cartographic.fromCartesian(cartesianPosition);
                        latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
                        longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
                    }
                }
                
                // Check if the building is within the Netherlands bounding box (adjust as needed)
                if (latitude && longitude) {
                    // If valid latitude/longitude and building type is of interest, add a pin
                    if (buildingType) {
                       addBuildingPin(buildingType, latitude, longitude);
                       console.log('addBuildingPin called');
                    }
                } else {
                    console.warn('Invalid latitude/longitude, skipping feature.');
                }
            }
        });

        // Fly to the 's-Hertogenbosch area
        await viewer.zoomTo(tileset);
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(5.3154, 51.67855, 500),  // Coordinates for 's-Hertogenbosch (Den Bosch)
            orientation: {
                heading: Cesium.Math.toRadians(0.0),  // 0 degree heading (north-facing)
                pitch: Cesium.Math.toRadians(-30.0),  // Angle of the camera
                roll: 0.0
            },
            duration: 4 // Duration of the flyTo animation (in seconds)
        });



    } catch (error) {
        console.error('Error loading tileset:', error);
    }
}

/*const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (click) {
    const pickedObject = viewer.scene.pick(click.position);
    if (Cesium.defined(pickedObject) && pickedObject.getProperty) {
        const name = pickedObject.getProperty('name') || 'Unknown';
        const buildingType = pickedObject.getProperty('building') || 'Unknown';
        
        // Log the properties
        console.log('Building Name:', name);
        console.log('Building Type:', buildingType);

        // Display the information in a custom notification or popup
        const buildingInfo = `Name: ${name}<br>Type: ${buildingType}`;
        showNotification('Building Info', buildingInfo);
    } else {
        console.log('No building picked.');
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);*/

function setupMapClickHandler() {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(async function (click) {
        const pickedPosition = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        if (pickedPosition) {
            const cartographicPosition = Cesium.Cartographic.fromCartesian(pickedPosition);
            const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
            const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);

            await getPlaceName(latitude, longitude);
            await fetchAndDisplayWeather(latitude, longitude);
            await fetchAndDisplayAirQuality(latitude, longitude);
            await fetchAndDisplayTraffic(latitude, longitude);
            updateCharts(latitude, longitude);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

async function getPlaceName(latitude, longitude) {
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${TomTomAPI}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.addresses && data.addresses.length > 0) {
            name = data.addresses[0].address.freeformAddress;
            console.log(`Place name found: ${name}`);
            
            // Check if place name matches target address
            if (name === "'s-Gravesandestraat 40, 5223 BS 's-Hertogenbosch") {
                // Call function to display popup on map
                showSimplifiedPopup(latitude, longitude, name);
            }
        } else {
            console.warn('No addresses data returned from the API.');
        }
    } catch (error) {
        console.error('Error fetching place name:', error);
    }
}



async function fetchAndDisplayWeather(latitude, longitude) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const weatherData = await response.json();
        const weatherContent = `
            <strong>Weather at ${name}</strong><br>
            Temperature: ${weatherData.main.temp} C<br>
            Feels like: ${weatherData.main.feels_like} C<br>
            Weather: ${weatherData.weather[0].main} (${weatherData.weather[0].description})<br>
            Humidity: ${weatherData.main.humidity}%<br>
            Wind: ${weatherData.wind.speed} m/s, ${weatherData.wind.deg} 
        `;
        showNotification('weather', weatherContent);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        showNotification('weather', 'Error fetching weather data');
    }
}

async function fetchAndDisplayAirQuality(latitude, longitude) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${airQualityApiKey}`;
        const response = await fetch(url);
        const airQualityData = await response.json();
        const airQuality = airQualityData.list[0];
        const aqi = airQuality.main.aqi;
        const components = airQuality.components;
        const aqiDescription = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1];
        const airQualityContent = `
            <strong>Air Quality at ${name}</strong><br>
            AQI: ${aqi} (${aqiDescription})<br>
            PM2.5: ${components.pm2_5}  g/m <br>
            PM10: ${components.pm10}  g/m <br>
            NO2: ${components.no2}  g/m <br>
            O3: ${components.o3}  g/m <br>
            CO: ${components.co}  g/m 
        `;
        showNotification('air-quality', airQualityContent);
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        showNotification('air-quality', 'Error fetching air quality data');
    }
}

async function fetchAndDisplayTraffic(latitude, longitude) {
    try {
        const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TomTomAPI}&point=${latitude},${longitude}`;
        const response = await fetch(url);
        const trafficData = await response.json();
        if (trafficData && trafficData.flowSegmentData) {
            const traffic = trafficData.flowSegmentData;
            const trafficContent = `
                <strong>Traffic Information at ${name}</strong><br>
                Road: ${traffic.roadName || 'N/A'}<br>
                Speed: ${traffic.currentSpeed} km/h<br>
                Free Flow Speed: ${traffic.freeFlowSpeed} km/h<br>
                Travel Time: ${traffic.currentTravelTime} seconds<br>
                Confidence: ${traffic.confidence}%
            `;
            showNotification('traffic', trafficContent);
        }
    } catch (error) {
        console.error('Error fetching traffic data:', error);
        showNotification('traffic', 'Error fetching traffic data');
    }
}
function showNotification(type, content) {
    const notificationArea = document.getElementById('notificationArea');

    // Create the notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // Use type classes: 'traffic', 'air-quality', 'weather'

    // Set the notification content, including the close button
    notification.innerHTML = `
        <button class="close-btn" onclick="this.parentElement.remove()">�</button>
        <p>${content}</p>
    `;

    // Append the notification to the container
    notificationArea.appendChild(notification);

    // Automatically remove notification after 9 seconds with a fade-out
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 1000); // 1 second for fade-out transition
    }, 9000); // Display notification for 9 seconds before fade-out
}




function toggleTraffic() {
    console.log("Toggling Traffic Layer", tomTomTrafficLayer);
    if (!tomTomTrafficLayer) {
        tomTomTrafficLayer = viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
            url:'https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=m0lqjskY9lNfIAjWZ99BUOZ31wHQynGA',
            maximumLevel: 18
        }));
    } else {
        viewer.imageryLayers.remove(tomTomTrafficLayer, false);
        tomTomTrafficLayer = null;
    }
}
function toggleRightPanel() {
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel) {
        rightPanel.style.display = rightPanel.style.display === 'none' ? 'block' : 'none';
    }
}

function flytoIKDB() {
    const IKDBCoordinates = {
        longitude: 5.291, 
        latitude: 51.686, 
        height: 500
    };

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(IKDBCoordinates.longitude, IKDBCoordinates.latitude, IKDBCoordinates.height),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-30),
            roll: 0.0
        },
        duration: 3.0
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
        complete: function() {
            // Start gradual rotation after flying to the target
            startSmoothRotation(target, rotationSpeed, rotationDuration);
        }
    });
}

function startSmoothRotation(target, rotationSpeed, rotationDuration) {
    let startTime = Date.now();

    function rotate() {
        // Check elapsed time to stop after rotationDuration
        if (Date.now() - startTime < rotationDuration) {
            viewer.camera.lookAt(target, new Cesium.HeadingPitchRange(viewer.camera.heading + rotationSpeed, viewer.camera.pitch));
            requestAnimationFrame(rotate);  // Use requestAnimationFrame for smoother updates
        } else {
            viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); // Reset camera control
        }
    }

    rotate();  // Start the rotation loop
}


 // Add event listener to the button
 
function highlightAllResidentialBuildings() {
  osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [
        [
          "${feature['building']} === 'apartments' || ${feature['building']} === 'residential'",
          "color('cyan', 0.9)",
        ],
        [true, "color('white')"],
      ],
    },
  });
}

////
function showSimplifiedPopup(latitude, longitude) {
    viewer.entities.removeAll(); // Clear any previous popups

    const popupEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        label: {
            text: "St. John's Cathedral\n's-Gravesandestraat 40, 's-Hertogenbosch",
            font: '16px sans-serif',
            fillColor: Cesium.Color.BLACK,
            showBackground: true,
            backgroundColor: Cesium.Color.WHITE,
            pixelOffset: new Cesium.Cartesian2(0, -40),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        billboard: {
            image: './Evening-in-s-Hertogenbosch-normal_jpg_6951.jpg', // Image of St. John�s Cathedral
            width: 64,
            height: 64,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        }
    });

    viewer.flyTo(popupEntity, {
        offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-30), 500)
    });
    
    console.log("Popup displayed at St. John's Cathedral.");
}


function addCombinedContextMenu(viewer) {
    if (!viewer || !viewer.container) {
        console.error("Viewer instance is not defined or initialized.");
        return;
    }

    // Create a combined context menu element
    const contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu';
    contextMenu.style.display = 'none';
    contextMenu.style.position = 'absolute';
    contextMenu.style.background = '#ffffff';
    contextMenu.style.border = '1px solid #ccc';
    contextMenu.style.padding = '10px';
    contextMenu.style.zIndex = '1000';
    document.body.appendChild(contextMenu);

    // Add both sets of options to the context menu
    contextMenu.innerHTML = `
        <div id="zoomIn">Zoom In</div>
        <div id="zoomOut">Zoom Out</div>
        <div id="centerHere">Center Here</div>
        <hr>
        <div id="analyiseArea">Analyze</div>
        <div id="dashboardArea">Dashboard</div>
        <div id="showInfo">Show Info</div>
        <div id="showSettings">Settings</div>
        <div id="showHelp">Help</div>

    `;

    // Function to show the context menu
    function showContextMenu(x, y) {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
    }

    // Function to hide the context menu
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    // Add right-click listener to show the combined context menu
    viewer.container.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        showContextMenu(event.clientX, event.clientY);
    });

    // Hide context menu when clicking anywhere else
    window.addEventListener('click', hideContextMenu);

    // Create a div for displaying additional HTML content when an option is clicked
    const displayDiv = document.createElement('div');
    displayDiv.id = 'displayDiv';
    displayDiv.style.display = 'none';
    displayDiv.style.position = 'fixed';
    displayDiv.style.top = '50%';
    displayDiv.style.left = '50%';
    displayDiv.style.transform = 'translate(-50%, -50%)';
    displayDiv.style.background = '#ffffff';
    displayDiv.style.border = '1px solid #ccc';
    displayDiv.style.padding = '20px';
    displayDiv.style.zIndex = '1001';
    document.body.appendChild(displayDiv);

    // Close button for displayDiv
    displayDiv.innerHTML += `<button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;

    // Event listeners for the original context menu options
    document.getElementById('zoomIn').addEventListener('click', () => {
        viewer.camera.zoomIn();
        hideContextMenu();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        viewer.camera.zoomOut();
        hideContextMenu();
    });

    document.getElementById('centerHere').addEventListener('click', (event) => {
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
                ),
            });
        }
        hideContextMenu();
    });

    // Event listeners for the new context menu options
    document.getElementById('showInfo').addEventListener('click', () => {
        displayDiv.style.display = 'block';
        displayDiv.innerHTML = `<h2>Info</h2><p>Digital Twins Den Bosch v.2.0 in collaboration with DataTwinLabs, 2025. All Rights Reserved.</p><button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;
        hideContextMenu();
    });

    document.getElementById('showSettings').addEventListener('click', () => {
        displayDiv.style.display = 'block';
        displayDiv.innerHTML = `<h2>Settings</h2><p>Settings options and preferences go here.</p><button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;
        hideContextMenu();
    });

    document.getElementById('showHelp').addEventListener('click', () => {
        displayDiv.style.display = 'block';
        displayDiv.innerHTML = `<h2>Help</h2><p>This is the help section with guidance and FAQs.</p><button onclick="document.getElementById('displayDiv').style.display='none'">Close</button>`;
        hideContextMenu();
    });

    document.getElementById('analyiseArea').addEventListener('click', () => {
    window.open('dashboard.html', '_blank');
    });

 document.getElementById('dashboardArea').addEventListener('click', () => {
    window.open('dashboard.html', '_blank');
    });
    document.getElementById('startOrbit').addEventListener('click', function() {
    // Example coordinates for a specific building
    flyToAndOrbitWithLimit(5.2913, 51.6890, 500, 0.005, 10000); // Rotate around location for 10 seconds
});

document.getElementById('stopOrbit').addEventListener('click', function() {
    stopOrbit(); // Stop rotating around the target
});


}


