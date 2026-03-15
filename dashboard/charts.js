
    // Define global chart variables
    let temperatureChart, humidityChart, aqiChart, no2Chart;
    const demoChartData = {
        labels: ["Now", "+3h", "+6h", "+9h", "+12h", "+15h", "+18h"],
        temperature: [10, 11, 12, 13, 12, 11, 10],
        humidity: [72, 69, 67, 65, 70, 75, 78],
        aqi: [18, 20, 19, 21, 23, 20, 18],
        no2: [14, 16, 15, 18, 17, 15, 13]
    };

    function isPrototypeMode() {
        return !window.config || !window.config.conf || window.config.conf.APP_MODE !== "production";
    }

    // Function to initialize empty charts
    function initCharts() {
        console.log('Initializing Charts');  // Debugging log
        const ui = window.udtI18n;

        // Temperature Chart
        temperatureChart = new Chart(document.getElementById('temperatureChart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: ui ? ui.t('temp_label') : 'Temperatuur (°C)', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: false } } }
        });

        // Humidity Chart
        humidityChart = new Chart(document.getElementById('humidityChart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: ui ? ui.t('humidity_label') : 'Luchtvochtigheid (%)', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // AQI Chart
        aqiChart = new Chart(document.getElementById('aqiChart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: ui ? ui.t('aqi_label') : 'Luchtkwaliteitsindex', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // NO2 Chart
        no2Chart = new Chart(document.getElementById('no2Chart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: ui ? ui.t('no2_label') : 'NO2 (µg/m³)', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    // Function to fetch real-time data based on coordinates


    function applyChartData(labels, tempData, humidityData, aqiData, no2Data) {
        temperatureChart.data.labels = labels;
        temperatureChart.data.datasets[0].data = tempData;
        temperatureChart.update();

        humidityChart.data.labels = labels;
        humidityChart.data.datasets[0].data = humidityData;
        humidityChart.update();

        aqiChart.data.labels = labels;
        aqiChart.data.datasets[0].data = aqiData;
        aqiChart.update();

        no2Chart.data.labels = labels;
        no2Chart.data.datasets[0].data = no2Data;
        no2Chart.update();
    }

    function renderDemoCharts() {
        applyChartData(
            demoChartData.labels,
            demoChartData.temperature,
            demoChartData.humidity,
            demoChartData.aqi,
            demoChartData.no2
        );
    }

    async function fetchWeatherAndPollutionData(lat, lon) {
    if (isPrototypeMode()) {
        return {
            forecastData: {
                list: demoChartData.labels.map((label, index) => ({
                    dt_txt: new Date(Date.now() + index * 3 * 60 * 60 * 1000).toISOString(),
                    main: {
                        temp: demoChartData.temperature[index] + 273.15,
                        humidity: demoChartData.humidity[index]
                    }
                }))
            },
            airQualityData: {
                list: [{
                    components: {
                        pm2_5: demoChartData.aqi[0],
                        no2: demoChartData.no2[0]
                    }
                }]
            }
        };
    }

    try {
        // Fetch weather forecast data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`);
        if (!forecastResponse.ok) throw new Error(`Forecast API request failed with status ${forecastResponse.status}`);
        const forecastData = await forecastResponse.json();

        // Fetch air quality data (only for the current moment, as this endpoint doesn�t support forecasting)
        const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`);
        if (!airQualityResponse.ok) throw new Error(`Air Quality API request failed with status ${airQualityResponse.status}`);
        const airQualityData = await airQualityResponse.json();

        return { forecastData, airQualityData };
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return null;
    }
}

    // Function to update charts with new data
    async function updateCharts(lat, lon) {
    const data = await fetchWeatherAndPollutionData(lat, lon);
    console.error("Forecast data or data.list is undefined");
    if (!data || !data.forecastData || !data.forecastData.list) {
        console.error("Forecast data or data.list is undefined", data);
        return;
    }

    // Parse forecast data
    const labels = data.forecastData.list.slice(0, 7).map(item => new Date(item.dt_txt).toLocaleDateString());
    const tempData = data.forecastData.list.slice(0, 7).map(item => item.main?.temp ? item.main.temp - 273.15 : 0);
    const humidityData = data.forecastData.list.slice(0, 7).map(item => item.main?.humidity || 0);

    // Parse air quality data (current data used across forecast times as an approximation)
    const aqiData = Array(7).fill(data.airQualityData.list[0].components.pm2_5 || 0);
    const no2Data = Array(7).fill(data.airQualityData.list[0].components.no2 || 0);

    // Update charts
    applyChartData(labels, tempData, humidityData, aqiData, no2Data);
}
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded chart js loaded');  // Debugging log
    // Initialize charts when DOM is fully loaded
    initCharts();
    if (isPrototypeMode()) {
        renderDemoCharts();
    }
});
