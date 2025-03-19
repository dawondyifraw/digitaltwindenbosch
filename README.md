# Urban Digital Twin Den Bosch

*A Non-Game Engine Core-Based Urban Digital Twin* Developed by **Daniel Adenew Wonyifraw**

[![Urban Digital Twin Core](about:sanitized)](https://via.placeholder.com/600x400?text=Urban+Digital+Twin+Core+Image)

## Overview

This project, part of an **Engineering Doctorate (EngD) program**, serves as the core framework for an urban digital twin. Built from the ground up, it offers greater flexibility, performance, and control over urban simulation and visualization compared to traditional game engine-based digital twins.

## Features

  - **Non-Game Engine Core:** Custom-built for efficiency and scalability.
  - **Urban Simulation & Analysis:** Data-driven insights for smart cities.
  - **3D & 2D Visualization:** Interactive urban modeling.
  - **Modular Architecture:** Easily extendable with GIS, IoT, and real-time data.
  - **Scalability:** Handles large-scale urban datasets.

## Project Structure

```text
├── 3DModels
│   └── car.glb
├── LICENSE
├── OSM.html
├── README.md
├── chatbotservice
│   ├── chatbot.css
│   └── chatbot.js
├── config.json
├── css
│   └── main.css
├── dashboard
│   └── charts.js
├── dashboard.html
├── index.html
├── js
│   ├── config.js
│   └── main.js
├── minimap
│   └── OSM.js
├── notificationservice
│   ├── notification_alert.css
│   ├── notification.js
│   ├── notifications.js
│   ├── notifications_alert.js
│   ├── notifications_weather_traffic_air.js
│   └── random_notification.js
├── notification-sound.mp3
├── popup_html.html
└── realtimestream
    └── kafka.js

```

## Installation

To install and run the Urban Digital Twin Core, follow these steps:

1.  **Clone the Repository:**

    ```
    git clone [https://github.com/dadenewyyt/digitaltwindenbosch.git](https://github.com/dadenewyyt/digitaltwindenbosch.git)

    ```

2.  **Navigate to the Project Directory:**

    ```
    cd digitaltwindenbosch

    ```

3.  **Start a Local Web Server:**

    This project is designed to run in a web browser. You'll need a local web server to serve the files. Python's built-in `http.server` is a convenient option:

    ```
    python -m http.server

    ```

    This command starts a simple HTTP server, typically on port 8000.

4.  **Open the Application in Your Browser:**

    Open your web browser and navigate to `http://localhost:8000`.

## Core Functionality

The Urban Digital Twin Core provides a foundation for representing a city digitally.  It's designed for extension and customization.

### Core Capabilities

  * **3D Scene Management:** Loads and renders 3D models and data for visualizing the urban environment.
  * **Data Integration:** Connects to configurable data sources for real-time or static information, including:
      * Real-time Traffic and Forecast
      * Real-time Weather and Forecast
      * Real-time Air Quality and Forecast
  * **Modular Design:** The architecture supports adding modules.  The core system includes modules for:
      * Environmental analysis with chatbot and sensor streaming
      * Citizen engagement tools with chatbot
      * IKDB (data source/system)
      * Dashboarding
      * Context Menu
      * Interactive alerts and notifications

### Extensibility

Developers can add modules for specific needs.

### Features for Developers

  * Traffic Simulation
  * Citizen Engagement Tools
  * More dashboarding and data integrations
  * Traffic overlay for construction sites
  * CO2 Estimation for IKDB
  * IKDB Specific Traffic

## Getting Started with Development

To develop with the Urban Digital Twin Core:

1.  **Familiarize yourself with the codebase:** Explore the file structure, focusing on `index.html`, `js/main.js`, and the `notificationservice` and `chatbotservice` directories.
2.  **Set up a development environment:** Install Python (for the local server) and use a code editor.  Consider a virtual environment for dependency management.
3.  **Start with a simple extension:** Add a small feature, like a custom message on the map.
4.  **Consult module documentation:** Detailed module documentation should be in the relevant directories.

## Real-time Data Streaming

The Urban Digital Twin Core is capable of displaying real-time data on the map.  This is achieved using a combination of technologies:

  * **Kafka:** Data is streamed using Apache Kafka, a distributed event streaming platform.
  * **WebSocket:** A WebSocket connection is established to transmit the data from the server to the client.
  * **CesiumJS:** The 3D map is updated dynamically with the received data.

The `streamkafka` function in `js/main.js` handles the real-time data streaming.  Here's how it works:

1.  **Initialization:**

      * A WebSocket connection is established with the server (running on `http://localhost:5000` in this example).
      * An empty object `markers` is used to store the map markers, allowing for updates instead of creating new markers for every data point.
      * A custom icon is used for the markers.

2.  **Data Reception and Map Update:**

      * The `socket.on('kafka_data', ...)` listener receives data from the server.
      * The received data contains information like latitude, longitude, CO2 level, NO2 level, PM25 level, sound level, and weather.
      * The `updateMapWithData(data)` function is called to process and display the data on the map.

3.  **`updateMapWithData` Function:**

      * This function extracts the latitude and longitude from the received data.
      * It generates a unique key based on the coordinates.
      * If a marker does not exist at the given coordinates:
          * A new marker is added to the Cesium scene with the following properties:
              * Position:  Set using `Cesium.Cartesian3.fromDegrees`.
              * Billboard:  Displays the custom icon.
              * Label:  Displays the CO2 and NO2 levels.
              * Description:  Provides a detailed HTML description with all the data.
          * The camera flies to the location of the new marker.
      * If a marker already exists at the coordinates:
          * The existing marker's label and description are updated with the new data.  This ensures smooth updates on the map.

4.  **Start/Stop Streaming:**

      * The `startStreaming()` function initiates the WebSocket connection.
      * The `stopStreaming()` function closes the WebSocket connection.
      * The `toggleStream()` function is bound to a button (`toggleStreamBtn`) in the HTML.  When the button is clicked, this function starts or stops the streaming and updates the button text.

This system allows for real-time visualization of sensor data (or other data streamed via Kafka) on a 3D map, providing a dynamic and interactive way to monitor urban data.

## Getting Started with Development

To develop with the Urban Digital Twin Core:

1.  **Familiarize yourself with the codebase:** Explore the file structure, focusing on `index.html`, `js/main.js`, and the `notificationservice` and `chatbotservice` directories.
2.  **Set up a development environment:** Install Python (for the local server) and use a code editor.  Consider a virtual environment for dependency management.
3.  **Start with a simple extension:** Add a small feature, like a custom message on the map.
4.  **Consult module documentation:** Detailed module documentation should be in the relevant directories.

## Contributing

Contributions are welcome\!

1.  **Fork the repository:** Create your GitHub copy.
2.  **Create a branch:** Make a branch for your feature or bug fix.
3.  **Make changes:** Implement your contribution.
4.  **Test changes:** Ensure no broken functionality and add tests.
5.  **Submit a pull request:** Propose your changes.

Follow these guidelines:

  * Write clear commit messages.
  * Follow the project's code style.
  * Provide tests for new features.
  * Update documentation.

## License

[MIT License](https://github.com/dadenewyyt/digitaltwindenbosch/blob/main/LICENSE)

## Contact

For inquiries, contact **Daniel Adenew Wonyifraw** at [danielwondyifrawatoutlook.com](mailto:danielwondyifrawatoutlook.com).

# 3D Web Application for Den Bosch

This project is a 3D web application built with CesiumJS, visualizing geographical data for Den Bosch, Netherlands. It integrates 3D building tiles, OpenStreetMap (OSM) buildings, weather, air quality, and traffic information.

## Features

  * **3D Visualization:** Displays 3D building tiles and OSM buildings with custom styling.

  * **Interactive Map:** Allows users to click for detailed location information.

## Data Sources

The 3D Web Application for Den Bosch uses the following data sources:

  * 3D building data
  * OpenStreetMap (OSM)
  * Weather data
  * Air quality data
  * Traffic data

<!-- end list -->

