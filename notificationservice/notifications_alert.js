console.log(`Notification loaded`);
let isClicked = false;
let notificationInterval;
const demoContactMessage = "Demoversie. Voor het volledige multi-streaming platform neem contact op met Daniel via info@datatwinlabs.nl.";

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
    { type: 'event', message: 'Farmers market open in the central square today.' }
];




// Function to generate a random notification and update the corresponding alert box
function generateRandomNotification() {
    const randomNotification = notificationData[Math.floor(Math.random() * notificationData.length)];

    updateAlertBox(randomNotification.type, randomNotification.message);
    playNotificationSound();
}

function updateAlertBox(type, message) {
    const alertBox = document.getElementById(`${type}Alert`);
    if (!alertBox) {
        console.error(`Alert box with ID ${type}Alert not found.`);
        return;
    }
    const alertContent = alertBox.querySelector('.alert-content');

    alertContent.textContent = message;
    alertBox.classList.remove('is-hidden');
    alertBox.classList.add('flash');
    setTimeout(() => {
        alertBox.classList.remove('flash');
    }, 500);
}

function playNotificationSound() {
    const audio = new Audio();
    audio.src = 'notification-sound.mp3';
    audio.type = 'audio/mp3';
    const oggSource = document.createElement('source');
    oggSource.src = 'notification-sound.ogg';
    oggSource.type = 'audio/ogg';
    audio.appendChild(oggSource);
    audio.play().catch(error => {
        console.error('Error playing sound:', error);
    });
}

function startDemoAlerts(button) {
    if (!button) return;
    button.innerHTML = window.udtI18n ? window.udtI18n.t('alert_feed_demo_on') : 'Demo-waarschuwingen aan';
    button.style.backgroundColor = 'lightblue';
    isClicked = true;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);

    notificationInterval = setInterval(generateRandomNotification, 10000);
    updateAlertBox('event', demoContactMessage);
    generateRandomNotification();
}

function stopDemoAlerts(button) {
    if (!button) return;
    button.innerHTML = window.udtI18n ? window.udtI18n.t('alert_feed_demo_off') : 'Publieke waarschuwingen';
    button.style.backgroundColor = '';
    isClicked = false;
    clearInterval(notificationInterval);
    hideAllAlertBoxes();
}

window.toggleDemoAlerts = function toggleDemoAlerts(forceState) {
    const button = document.getElementById('startNotifications');
    if (!button) return;

    const shouldEnable = typeof forceState === 'boolean' ? forceState : !isClicked;
    if (shouldEnable) {
        startDemoAlerts(button);
    } else {
        stopDemoAlerts(button);
    }
};

document.getElementById('startNotifications').addEventListener('click', (event) => {
    if (!isClicked) {
        startDemoAlerts(event.target);
    } else {
        stopDemoAlerts(event.target);
    }
});

function hideAllAlertBoxes() {
    const alertBoxes = document.querySelectorAll('.alert-box');
    alertBoxes.forEach(alertBox => {
        alertBox.classList.add('is-hidden');
    });
}
