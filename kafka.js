document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');  // Debugging log to confirm DOM is loaded

    function streamkafka() {
        console.log('streamkafka function loaded');  // Debugging log to ensure function is loaded
        var isStreaming = false;  // Stream is initially off
        var socket;
        var markers = {};  // Dictionary to store real-time markers based on coordinates
        var iconUrl = 'https://cdn-icons-png.flaticon.com/512/1484/1484819.png';  // High-quality custom icon

        // Function to update Cesium map with real-time data from Kafka
        function updateMapWithData(data) {
            console.log('Received data from server:', data);

            var lat = data.latitude;
            var lon = data.longitude;
            var key = lat + ',' + lon;  // Unique key based on coordinates

            // Check if a marker already exists at this location
            if (!markers[key]) {
                markers[key] = viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(lon, lat),
                    billboard: {
                        image: iconUrl,
                        width: 32,
                        height: 32,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        eyeOffset: new Cesium.Cartesian3(0, 0, -500),
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000)
                    },
                    label: {
                        text: `CO2: ${data.co2}, NO2: ${data.no2}`,
                        font: '14pt sans-serif',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.YELLOW,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.TOP,
                        pixelOffset: new Cesium.Cartesian2(0, -40)
                    },
                    description: `
                        <h2>Real-time Data</h2>
                        <p>CO2 Level: ${data.co2}</p>
                        <p>Nitrogen Level: ${data.no2}</p>
                        <p>PM25 Level: ${data.pm25}</p>
                        <p>Sound Level: ${data.sound_level}</p>
                        <p>Weather: ${data.weather}</p>
                    `
                });

                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1000),
                    duration: 2
                });
            } else {
                markers[key].label.text = `CO2: ${data.co2}, NO2: ${data.no2}`;
                markers[key].description = `
                    <h2>Real-time Data</h2>
                    <p>CO2 Level: ${data.co2}</p>
                    <p>Nitrogen Level: ${data.no2}</p>
                    <p>Sound Level: ${data.sound_level}</p>
                    <p>Weather: ${data.weather}</p>
                `;
            }
        }

        // Function to start the Kafka streaming and WebSocket connection
        function startStreaming() {
            console.log('Starting stream...');  // Debugging log
            socket = io('http://localhost:5000');  // Adjust the URL if necessary

            socket.on('kafka_data', function(data) {
                console.log('Data received:', data);  // Log the data received to ensure it's correct
                updateMapWithData(data);
            });
        }

        // Function to stop the Kafka streaming and close WebSocket connection
        function stopStreaming() {
            if (socket) {
                console.log('Stopping stream...');  // Debugging log
                socket.disconnect();
            }
        }

        // Toggle function to start and stop the stream
        function toggleStream() {
            console.log('Toggle stream called');  // Debugging log
            var button = document.getElementById('toggleStreamBtn');
            if (isStreaming) {
                stopStreaming();
                button.textContent = 'Start Stream';
            } else {
                startStreaming();
                button.textContent = 'Stop Stream';
            }
            isStreaming = !isStreaming;  // Toggle the state
        }

        // Bind the button click event to toggleStream function
        document.getElementById('toggleStreamBtn').addEventListener('click', function() {
            console.log('Button clicked');  // Debugging log
            toggleStream();
        });
    }

    // Call the `streamkafka` function once the DOM is fully loaded
    streamkafka();
});

