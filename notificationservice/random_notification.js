 // Notification Data for Simulated Alerts
        const notificationData = [
            { type: 'traffic', message: 'Heavy traffic on Main Street due to an accident.' },
            { type: 'weather', message: 'Severe thunderstorms expected this evening.' },
            { type: 'event', message: 'Local festival starting this weekend.' }
        ];

        // Function to generate a random notification and update the corresponding alert box
        function generateRandomNotification() {
            console.log('Generating random notification'); // Debugging
            // Select a random notification
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
            // Select the alert box and the content paragraph based on the type
            const alertBox = document.getElementById(`${type}Alert`);
            if (!alertBox) {
                console.error(`Alert box with ID ${type}Alert not found.`);
                return;
            }
            const alertContent = alertBox.querySelector('.alert-content');

            // Update the alert content with the new message
            alertContent.textContent = message;

            // Add a flash effect to highlight the update
            alertBox.classList.add('flash');
            setTimeout(() => {
                alertBox.classList.remove('flash');
            }, 1000);
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
        document.getElementById('startNotifications').addEventListener('click', () => {
            // Play a silent sound to enable audio playback
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);

            // Start the notification interval
            setInterval(generateRandomNotification, 10000); // Every 10 seconds
            generateRandomNotification(); // Call it immediately
        });