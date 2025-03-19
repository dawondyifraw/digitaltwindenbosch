# Urban Digital Twin Core

*A Non-Game Engine Core-Based Urban Digital Twin* Developed by **Daniel Adenew Wonyifraw**

![Urban Digital Twin Core](https://via.placeholder.com/600x400?text=Urban+Digital+Twin+Core+Image)

## Overview

This project, part of an **Engineering Doctorate (EngD) program**, serves as the core framework for an urban digital twin. Built from the ground up, it offers greater flexibility, performance, and control over urban simulation and visualization compared to traditional game engine-based digital twins.

## Features

-   **Non-Game Engine Core:** Custom-built for efficiency and scalability.
-   **Urban Simulation & Analysis:** Supports data-driven insights for smart cities.
-   **3D & 2D Visualization:** Implements rendering techniques for interactive urban modeling.
-   **Modular Architecture:** Easily extendable to integrate with GIS, IoT, and real-time data.
-   **Scalability:** Designed to handle large-scale urban datasets.

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

# Installation

To install and run the Urban Digital Twin Core, follow these steps:

## Clone the Repository:

```bash
    git clone [https://github.com/dadenewyyt/digitaltwindenbosch.git](https://github.com/dadenewyyt/digitaltwindenbosch/.git)
```

cd digitaltwindenbosch


#Start a Local Web Server:
This project is designed to run in a web browser. You'll need a local web server to serve the files. Python's built-in http.server is a convenient option

``` bash
    python -m http.server
```

This command starts a simple HTTP server, typically on port 8000.

#Open the Application in Your Browser:
Open your web browser and navigate to http://localhost:8000. This will load the application.

#Contact
For inquiries, contact Daniel Adenew Wonyifraw at danielwondyifrawatoutlook.com.

#3D Web Application for Den Bosch
This project is a 3D web application built with CesiumJS, visualizing geographical data for Den Bosch, Netherlands. It integrates 3D building tiles, OpenStreetMap (OSM) buildings, weather, air quality, and traffic information.

#Features
3D Visualization: Displays 3D building tiles and OSM buildings with custom styling.
Interactive Map: Allows users to click for detailed location information.
Data Integration: Fetches and displays real-time weather, air quality, and traffic data.
Custom Context Menu: Provides right-click options for zooming, centering, and more.
Notifications: Displays non-intrusive information popups.
Location-Specific Popups: Shows details for landmarks like St. John's Cathedral.
Fly-To and Orbit: Implements camera controls for navigation.
Traffic Layer: Toggles the TomTom traffic layer.

