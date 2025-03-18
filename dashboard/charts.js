
    // Define global chart variables
    let temperatureChart, humidityChart, aqiChart, no2Chart;

    // Function to initialize empty charts
    function initCharts() {
        console.log('Initializing Charts');  // Debugging log

        // Temperature Chart
        temperatureChart = new Chart(document.getElementById('temperatureChart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Temperature (�C)', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: false } } }
        });

        // Humidity Chart
        humidityChart = new Chart(document.getElementById('humidityChart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Humidity (%)', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // AQI Chart
        aqiChart = new Chart(document.getElementById('aqiChart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'AQI', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // NO2 Chart
        no2Chart = new Chart(document.getElementById('no2Chart').getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'NO2 (�g/m�)', data: [], backgroundColor: 'rgba(0, 255, 255, 0.2)', borderColor: '#00ffff', borderWidth: 2 }] },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    // Function to fetch real-time data based on coordinates


    async function fetchWeatherAndPollutionData(lat, lon) {
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded chart js loaded');  // Debugging log
    // Initialize charts when DOM is fully loaded
    initCharts();
});
