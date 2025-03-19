Urban Digital Twin Core
========================
*A Non-Game Engine Core-Based Urban Digital Twin*  
Developed by **Daniel Adenew Wonyifraw**  

.. image:: https://via.placeholder.com/600x400?text=Urban+Digital+Twin+Core+Image  # Placeholder for Image 1
   :width: 600px
   :alt: Urban Digital Twin Core

Overview
--------
This project is part of an **Engineering Doctorate (EngD) program** and serves as the **core framework** for an **urban digital twin**. Unlike traditional digital twins that rely on **game engines**, this implementation is built **from the ground up**, providing greater flexibility, performance, and control over urban simulation and visualization.

Features
--------
- **Non-Game Engine Core** – Custom-built for efficiency and scalability.
- **Urban Simulation & Analysis** – Supports data-driven insights for smart cities.
- **3D & 2D Visualization** – Implements rendering techniques for interactive urban modeling.
- **Modular Architecture** – Easily extendable to integrate with GIS, IoT, and real-time data.
- **Scalability** – Designed to handle large-scale urban datasets.

Project Structure
-Project Structure
-----------------
The project structure is as follows:

.. code-block:: text

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

## Installation  
To get started, clone the repository and install dependencies:  

```bash
git clone https://github.com/your-username/urban-digital-twin-core.git
cd urban-digital-twin-core
python -m http.server

This will start a local server at `http://localhost:8000`. Open this URL in your browser to access the application.

Contact
-------
For inquiries, reach out to **Daniel Adenew Wonyifraw** at [danielwondyifrawatoutlook.com].

---

3D Web Application for Den Bosch
=================================
This project is a **3D web application** built with **CesiumJS**, designed to visualize geographical data for the city of Den Bosch, Netherlands. It integrates various data sources, including 3D building tiles, OpenStreetMap (OSM) buildings, weather, air quality, and traffic information, to provide a comprehensive view of the city.

.. image:: https://via.placeholder.com/600x400?text=Den+Bosch+Visualization  # Placeholder for Image 2
   :width: 600px
   :alt: Den Bosch Visualization

Features
--------
- **3D Visualization**: Displays 3D building tiles and OSM buildings with custom styling.
- **Interactive Map**: Allows users to click on the map to retrieve and display detailed information about the selected location.
- **Data Integration**: Fetches and displays real-time weather, air quality, and traffic data from external APIs.
- **Custom Context Menu**: Provides a right-click context menu with options for zooming, centering, and accessing additional information.
- **Notifications**: Displays information in non-intrusive notification popups.
- **Location-Specific Popups**: Shows detailed information for specific locations like the St. John's Cathedral.
- **Fly-To and Orbit**: Implements camera controls to fly to specific locations and orbit around them.
- **Traffic Layer**: Allows users to toggle the TomTom traffic layer on and off.
