document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    function getAppConfig() {
        return (window.config && window.config.conf) || {};
    }

    function getStreamUrl() {
        const conf = getAppConfig();
        return conf.SERVICES && conf.SERVICES.streamUrl ? conf.SERVICES.streamUrl : '';
    }

    function isPrototypeMode() {
        return getAppConfig().APP_MODE !== 'production';
    }

    function streamkafka() {
        console.log('streamkafka function loaded');
        var isStreaming = false;
        var socket = null;
        var demoTimer = null;
        var markers = {};
        var iconUrl = 'https://cdn-icons-png.flaticon.com/512/1484/1484819.png';

        function updateMapWithData(data) {
            if (!window.viewer || !window.Cesium) {
                return;
            }

            console.log('Received data from server:', data);

            var lat = data.latitude;
            var lon = data.longitude;
            var key = lat + ',' + lon;

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

        function startDemoStreaming() {
            demoTimer = setInterval(function() {
                updateMapWithData({
                    latitude: 51.687,
                    longitude: 5.303 + ((Math.random() - 0.5) * 0.02),
                    co2: 420 + Math.round(Math.random() * 40),
                    no2: 18 + Math.round(Math.random() * 10),
                    pm25: 8 + Math.round(Math.random() * 6),
                    sound_level: 52 + Math.round(Math.random() * 8),
                    weather: 'Prototype stream'
                });
            }, 6000);
        }

        function startStreaming() {
            var streamUrl = getStreamUrl();
            console.log('Starting stream...');

            if (isPrototypeMode() || !streamUrl) {
                startDemoStreaming();
                return;
            }

            socket = io(streamUrl);
            socket.on('kafka_data', function(data) {
                console.log('Data received:', data);
                updateMapWithData(data);
            });
        }

        function stopStreaming() {
            if (demoTimer) {
                clearInterval(demoTimer);
                demoTimer = null;
            }

            if (socket) {
                console.log('Stopping stream...');
                socket.disconnect();
                socket = null;
            }
        }

        function toggleStream() {
            var button = document.getElementById('toggleStreamBtn');
            if (!button) {
                return;
            }

            if (isStreaming) {
                stopStreaming();
                button.textContent = isPrototypeMode() ? 'Live Stream Demo' : 'Start Stream';
            } else {
                startStreaming();
                button.textContent = isPrototypeMode() ? 'Stop Demo Stream' : 'Stop Stream';
            }
            isStreaming = !isStreaming;
        }

        document.getElementById('toggleStreamBtn')?.addEventListener('click', function() {
            toggleStream();
        });
    }

    streamkafka();
});
