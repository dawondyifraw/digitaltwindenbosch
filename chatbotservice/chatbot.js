   // Get references to DOM elements
   const chatWindow = document.getElementById('chat-window');
   const userInput = document.getElementById('user-input');
   const sendBtn = document.getElementById('send-btn');
   const clearChatBtn = document.getElementById('clear-chat-btn');
   const closeChatBtn = document.getElementById('close-chat-btn');
   const chatContainer = document.querySelector('.chat-container');
   
   // Function to add messages to the chat window (supports formatted HTML)
   function addMessage(sender, messageHtml) {
     const div = document.createElement('div');
     div.classList.add('message');
     div.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
     div.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Odin'}:</strong> ${messageHtml}`;
     chatWindow.appendChild(div);
     chatWindow.scrollTop = chatWindow.scrollHeight;
   }
   
   // Function to show an animated spinner while waiting for a response
   function showSpinner() {
     const spinnerDiv = document.createElement('div');
     spinnerDiv.id = 'spinner';
     spinnerDiv.classList.add('message', 'bot-message');
     spinnerDiv.innerHTML = `<strong>Odin:</strong> <span class="spinner"><span>.</span><span>.</span><span>.</span></span>`;
     chatWindow.appendChild(spinnerDiv);
     chatWindow.scrollTop = chatWindow.scrollHeight;
   }
   
   // Function to remove the spinner from the chat window
   function removeSpinner() {
     const spinnerDiv = document.getElementById('spinner');
     if (spinnerDiv) {
       spinnerDiv.remove();
     }
   }
   
   // Function to send a message to the backend API and process the response
   async function sendMessage() {
     const query = userInput.value.trim();
     if (!query) return;
     
     // Add user's message
     addMessage('user', query);
     userInput.value = '';
     sendBtn.disabled = true;  // Disable the send button while waiting
     showSpinner();
     console.log("Sending query:", query);
     
     try {
       const response = await fetch('http://127.0.0.1:5050/query', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ query }),
       });
       const data = await response.json();
       removeSpinner();
       // Add bot's response (formatted HTML supported)
       addMessage('bot', data.response);
     } catch (error) {
       console.error('Error:', error);
       removeSpinner();
       addMessage('bot', 'Sorry, something went wrong.');
     } finally {
       sendBtn.disabled = false;  // Re-enable the send button
     }
   }
   
   // Event listener for the send button
   sendBtn.addEventListener('click', sendMessage);
   
   // Allow sending message when Enter is pressed
   userInput.addEventListener('keypress', (e) => {
     if (e.key === 'Enter') {
       sendMessage();
     }
   });
   
   // Clear chat history when clear button is clicked
   clearChatBtn.addEventListener('click', () => {
     chatWindow.innerHTML = '';
   });
   
   // Hide the chat container when the close button is clicked
   closeChatBtn.addEventListener('click', () => {
     chatContainer.style.display = 'none';
   });