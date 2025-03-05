let pollutionNotificationsOn = false; // Track the state of pollution notifications
let pollutionNotificationInterval; // Interval ID for pollution notifications

// Function to toggle Weather, Traffic, and Noise notifications
function togglePollution() {
    const button = document.getElementById('pollutionToggle');

    if (!pollutionNotificationsOn) {
        // Turn on notifications
        button.innerHTML = 'Notifications ON: Weather, Traffic, Noise';
        button.classList.add('active'); // Optional: add active style
        pollutionNotificationsOn = true;

        // Start the notification interval
        pollutionNotificationInterval = setInterval(generatePollutionNotification, 10000); // Every 10 seconds
        generatePollutionNotification(); // Immediate notification on button press
    } else {
        // Turn off notifications
        button.innerHTML = 'Notifications OFF: Weather, Traffic, Noise';
        button.classList.remove('active'); // Optional: reset active style
        pollutionNotificationsOn = false;

        // Clear the notification interval
        clearInterval(pollutionNotificationInterval);
        hidePollutionAlertBoxes(); // Hide all pollution-related alert boxes
    }
}

// Function to generate random pollution notifications (weather, traffic, noise)
function generatePollutionNotification() {
    const pollutionData = [
        { type: 'weather', message: 'Rain expected in the evening with heavy clouds.' },
        { type: 'traffic', message: 'Traffic congestion on Main Street, expect delays.' },
        { type: 'noise', message: 'Increased noise levels reported near construction sites.' }
    ];

    // Select a random pollution notification
    const randomNotification = pollutionData[Math.floor(Math.random() * pollutionData.length)];
    updatePollutionAlertBox(randomNotification.type, randomNotification.message);
}

// Function to update a specific pollution alert box based on type
function updatePollutionAlertBox(type, message) {
    const alertBox = document.getElementById(`${type}Alert`);
    if (!alertBox) return;

    const alertContent = alertBox.querySelector('.alert-content');
    alertContent.textContent = message;
    alertBox.style.display = 'block';

    // Flash effect for new notification
    alertBox.classList.add('flash');
    setTimeout(() => alertBox.classList.remove('flash'), 1000);
}

// Function to hide all pollution-related alert boxes
function hidePollutionAlertBoxes() {
    document.querySelectorAll('#trafficAlert, #weatherAlert, #noiseAlert').forEach(alertBox => {
        alertBox.style.display = 'none';
    });
}
