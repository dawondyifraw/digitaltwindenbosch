let temperatureChart;
let humidityChart;
let aqiChart;
let no2Chart;

const demoChartData = {
    labels: ["Now", "+3h", "+6h", "+9h", "+12h", "+15h", "+18h"],
    temperature: [10, 11, 12, 13, 12, 11, 10],
    humidity: [72, 69, 67, 65, 70, 75, 78],
    pm25: [18, 20, 19, 21, 23, 20, 18],
    no2: [14, 16, 15, 18, 17, 15, 13]
};

function isPrototypeMode() {
    return !window.config || !window.config.conf || window.config.conf.APP_MODE !== "production";
}

function getChartColors() {
    return {
        temperature: { line: "#59d98a", fill: "rgba(89, 217, 138, 0.18)" },
        humidity: { line: "#7dd3fc", fill: "rgba(125, 211, 252, 0.18)" },
        pm25: { line: "#facc15", fill: "rgba(250, 204, 21, 0.18)" },
        no2: { line: "#fb923c", fill: "rgba(251, 146, 60, 0.18)" },
        grid: "rgba(255, 255, 255, 0.08)",
        ticks: "#a7c6b2"
    };
}

function getLabel(key, fallback) {
    return window.udtI18n ? window.udtI18n.t(key, fallback) : fallback;
}

function updateForecastSummary(label, meta) {
    const locationEl = document.getElementById("forecastPanelLocation");
    const metaEl = document.getElementById("forecastPanelMeta");
    if (locationEl && label) {
        locationEl.textContent = label;
    }
    if (metaEl && meta) {
        metaEl.textContent = meta;
    }
}

function buildChartOptions(unitSuffix) {
    const colors = getChartColors();
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: "rgba(7, 18, 13, 0.96)",
                borderColor: "rgba(255, 255, 255, 0.12)",
                borderWidth: 1,
                titleColor: "#edf7ef",
                bodyColor: "#edf7ef",
                displayColors: false,
                callbacks: {
                    label(context) {
                        const value = context.parsed.y;
                        return `${value}${unitSuffix ? ` ${unitSuffix}` : ""}`;
                    }
                }
            }
        },
        elements: {
            line: {
                borderWidth: 2.2,
                tension: 0.34
            },
            point: {
                radius: 0,
                hoverRadius: 4,
                hitRadius: 10
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: colors.ticks,
                    maxRotation: 0,
                    autoSkip: false,
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                grid: {
                    color: colors.grid
                },
                ticks: {
                    color: colors.ticks,
                    font: {
                        size: 10
                    },
                    callback(value) {
                        return unitSuffix ? `${value} ${unitSuffix}` : value;
                    }
                }
            }
        }
    };
}

function createLineChart(id, label, palette, unitSuffix, beginAtZero = false) {
    const context = document.getElementById(id)?.getContext("2d");
    if (!context) return null;

    const options = buildChartOptions(unitSuffix);
    options.scales.y.beginAtZero = beginAtZero;

    return new Chart(context, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label,
                data: [],
                borderColor: palette.line,
                backgroundColor: palette.fill,
                fill: true
            }]
        },
        options
    });
}

function initCharts() {
    const colors = getChartColors();
    temperatureChart = createLineChart(
        "temperatureChart",
        getLabel("temp_label", "Temperature (°C)"),
        colors.temperature,
        "°C",
        false
    );
    humidityChart = createLineChart(
        "humidityChart",
        getLabel("humidity_label", "Humidity (%)"),
        colors.humidity,
        "%",
        true
    );
    aqiChart = createLineChart(
        "aqiChart",
        getLabel("aqi_label", "PM2.5 (µg/m³)"),
        colors.pm25,
        "µg/m³",
        true
    );
    no2Chart = createLineChart(
        "no2Chart",
        getLabel("no2_label", "NO₂ (µg/m³)"),
        colors.no2,
        "µg/m³",
        true
    );
}

function applyChartData(labels, tempData, humidityData, pm25Data, no2Data) {
    const charts = [
        { chart: temperatureChart, data: tempData },
        { chart: humidityChart, data: humidityData },
        { chart: aqiChart, data: pm25Data },
        { chart: no2Chart, data: no2Data }
    ];

    charts.forEach(({ chart, data }) => {
        if (!chart) return;
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    });
}

function renderDemoCharts() {
    updateForecastSummary("Den Bosch city center", "Prototype forecast window");
    applyChartData(
        demoChartData.labels,
        demoChartData.temperature,
        demoChartData.humidity,
        demoChartData.pm25,
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
                        temp: demoChartData.temperature[index],
                        humidity: demoChartData.humidity[index]
                    }
                }))
            },
            airQualityData: {
                list: [{
                    components: {
                        pm2_5: demoChartData.pm25[0],
                        no2: demoChartData.no2[0]
                    }
                }]
            }
        };
    }

    try {
        const weatherKey = window.weatherApiKey || window.config?.conf?.WEATHERAPI || window.config?.conf?.AIRQUALITYAPI;
        const [forecastResponse, airQualityResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherKey}`)
        ]);

        if (!forecastResponse.ok) {
            throw new Error(`Forecast API request failed with status ${forecastResponse.status}`);
        }
        if (!airQualityResponse.ok) {
            throw new Error(`Air Quality API request failed with status ${airQualityResponse.status}`);
        }

        const forecastData = await forecastResponse.json();
        const airQualityData = await airQualityResponse.json();
        return { forecastData, airQualityData };
    } catch (error) {
        console.error("Failed to fetch chart data:", error);
        return null;
    }
}

function formatForecastLabel(raw) {
    const date = new Date(raw);
    return new Intl.DateTimeFormat(document.documentElement.lang || "en", {
        hour: "2-digit",
        day: "2-digit",
        month: "short"
    }).format(date);
}

async function updateCharts(lat, lon) {
    const data = await fetchWeatherAndPollutionData(lat, lon);
    if (!data || !data.forecastData || !Array.isArray(data.forecastData.list)) {
        return;
    }

    const forecastSlice = data.forecastData.list.slice(0, 7);
    const labels = forecastSlice.map((item) => formatForecastLabel(item.dt_txt));
    const tempData = forecastSlice.map((item) => Math.round((item.main?.temp ?? 0) * 10) / 10);
    const humidityData = forecastSlice.map((item) => item.main?.humidity || 0);
    const pm25Value = data.airQualityData?.list?.[0]?.components?.pm2_5 || 0;
    const no2Value = data.airQualityData?.list?.[0]?.components?.no2 || 0;
    const pm25Data = Array(labels.length).fill(Math.round(pm25Value * 10) / 10);
    const no2Data = Array(labels.length).fill(Math.round(no2Value * 10) / 10);

    const locationName = (() => {
        try {
            const saved = JSON.parse(localStorage.getItem("udt_last_location") || "null");
            return saved?.name || null;
        } catch (error) {
            return null;
        }
    })();
    const summaryLabel = locationName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    const summaryMeta = `Updated ${new Intl.DateTimeFormat(document.documentElement.lang || "en", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date())}`;
    updateForecastSummary(summaryLabel, summaryMeta);

    applyChartData(labels, tempData, humidityData, pm25Data, no2Data);
}

window.updateCharts = updateCharts;

document.addEventListener("DOMContentLoaded", () => {
    initCharts();
    if (isPrototypeMode()) {
        renderDemoCharts();
    }
});
