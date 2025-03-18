console.log(`Notification loaded`); // Debugging
let isClicked = false;
let notificationInterval; // Store the interval ID for toggling

// Notification Data for Simulated Alerts
const notificationData = [
    // Traffic Alerts
    { type: 'traffic', message: 'Heavy traffic on Main Street due to an accident.' },
    { type: 'traffic', message: 'Road construction on Oak Avenue, expect delays.' },
    { type: 'traffic', message: 'Traffic congestion on Highway 10 due to rush hour.' },

    // Weather Alerts
    { type: 'weather', message: 'Severe thunderstorms expected this evening.' },
    { type: 'weather', message: 'High winds advisory for the weekend.' },
    { type: 'weather', message: 'Heatwave warning issued for the next 3 days.' },
    { type: 'weather', message: 'Heavy snowfall expected tonight, drive safely.' },

    // Event Notifications
    { type: 'event', message: 'Local festival starting this weekend.' },
    { type: 'event', message: 'Community meeting at the town hall tomorrow.' },
    { type: 'event', message: 'Charity run on Saturday, expect road closures.' },
    { type: 'event', message: 'Farmers market open in the central square today.' },

    // Emergency Alerts
    { type: 'emergency', message: 'Amber alert issued in the local area.' },
    { type: 'emergency', message: 'Flood warning in low-lying neighborhoods.' },
    { type: 'emergency', message: 'Fire reported near Oakwood Park, avoid the area.' },

    // Public Service Announcements
    { type: 'public_service', message: 'COVID-19 vaccination drive at the community center.' },
    { type: 'public_service', message: 'Water supply maintenance scheduled for tonight.' },
    { type: 'public_service', message: 'Power outage expected in the downtown area from 2-4 PM.' }
];




// Function to generate a random notification and update the corresponding alert box
function generateRandomNotification() {
    console.log('Generating random notification'); // Debugging
    const randomNotification = notificationData[Math.floor(Math.random() * notificationData.length)];
    console.log('Random Notification:', randomNotification); // Debugging

    // Update the corresponding alert box based on the type
    updateAlertBox(randomNotification.type, randomNotification.message);

    // Play sound when notification is updated
    playNotificationSound();
}

// Function to update a specific alert box based on type
function updateAlertBox(type, message) {
    console.log(`Updating alert box for type: ${type}`); // Debugging
    const alertBox = document.getElementById(`${type}Alert`);
    if (!alertBox) {
        console.error(`Alert box with ID ${type}Alert not found.`);
        return;
    }
    const alertContent = alertBox.querySelector('.alert-content');
    
    // Update the alert content with the new message
    alertContent.textContent = message;

    // Show the alert box
    alertBox.style.display = 'block';

    // Add a flash effect to highlight the update
    alertBox.classList.add('flash');
    setTimeout(() => {
        alertBox.classList.remove('flash');
    }, 500);
}

// Function to play a notification sound
function playNotificationSound() {
    console.log('Playing notification sound'); // Debugging
    const audio = new Audio('notification-sound.mp3'); // Ensure the path is correct
    audio.play().catch(error => {
        console.error('Error playing sound:', error);
    });
}

// Start Notifications on Button Click
document.getElementById('startNotifications').addEventListener('click', (event) => {
    // Toggle real-time alerts
    if (!isClicked) {
        event.target.innerHTML = 'Real Time Alert is ON!';
        event.target.style.backgroundColor = 'lightblue';
        isClicked = true;

        // Initialize AudioContext for permissions (if needed)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);

        // Start the notification interval
        notificationInterval = setInterval(generateRandomNotification, 10000); // Every 10 seconds
        generateRandomNotification(); // Call it immediately
    } else {
        event.target.innerHTML = 'Real Time Alert is OFF!';
        event.target.style.backgroundColor = ''; // Reset to default background
        isClicked = false;

        // Clear the notification interval to stop alerts
        clearInterval(notificationInterval);

        // Hide all alert boxes when alerts are turned off
        hideAllAlertBoxes();
    }
});

// Function to hide all alert boxes
function hideAllAlertBoxes() {
    const alertBoxes = document.querySelectorAll('.alert-box');
    alertBoxes.forEach(alertBox => {
        alertBox.style.display = 'none';
    });
}
