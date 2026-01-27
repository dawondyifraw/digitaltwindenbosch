   // Get references to DOM elements with null checks
   const chatWindow = document.getElementById('chat-window');
   const userInput = document.getElementById('user-input');
   const sendBtn = document.getElementById('send-btn');
   const clearChatBtn = document.getElementById('clear-chat-btn');
   const closeChatBtn = document.getElementById('close-chat-btn');
   const chatContainer = document.querySelector('.chat-container');

   if (!chatWindow || !userInput || !sendBtn || !clearChatBtn || !closeChatBtn || !chatContainer) {
     console.error('Chatbot: One or more required DOM elements are missing.');
     // Optionally, display a user-facing error here
   }
   
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
   function showServerErrorPopup(retryCallback) {
     let popup = document.createElement('div');
     popup.style.position = 'fixed';
     popup.style.top = '0';
     popup.style.left = '0';
     popup.style.width = '100vw';
     popup.style.height = '100vh';
     popup.style.background = 'rgba(0,0,0,0.6)';
     popup.style.display = 'flex';
     popup.style.alignItems = 'center';
     popup.style.justifyContent = 'center';
     popup.style.zIndex = '9999';
     popup.innerHTML = `<div style="background:#fff;padding:2em 2.5em;border-radius:10px;box-shadow:0 2px 16px #0003;text-align:center;max-width:90vw;max-height:80vh;overflow:auto;">
         <h2 style='color:#c00;margin-bottom:1em;'>Server Not Ready</h2>
         <p style='margin-bottom:1.5em;'>The chatbot server is not running or not reachable. Please start the backend server and try again.</p>
         <button style='padding:0.5em 1.5em;font-size:1.1em;border-radius:6px;border:none;background:#0d6efd;color:#fff;cursor:pointer;margin-right:1em;' id='retryServerBtn'>Retry</button>
         <button style='padding:0.5em 1.5em;font-size:1.1em;border-radius:6px;border:none;background:#888;color:#fff;cursor:pointer;' onclick='this.closest("div").parentNode.remove()'>Close</button>
     </div>`;
     document.body.appendChild(popup);
     document.getElementById('retryServerBtn').onclick = function() {
       popup.remove();
       if (typeof retryCallback === 'function') retryCallback();
     };
   }

   async function checkServerHealth() {
     try {
       const resp = await fetch('http://127.0.0.1:5050/health', { method: 'GET' });
       if (!resp.ok) throw new Error('Server not healthy');
       return true;
     } catch (e) {
       return false;
     }
   }

   async function sendMessage() {
     if (!userInput || !chatWindow || !sendBtn) return;
     const query = userInput.value.trim();
     if (!query) return;
     // Add user's message
     addMessage('user', query);
     userInput.value = '';
     sendBtn.disabled = true;  // Disable the send button while waiting
     showSpinner();
     console.log("Sending query:", query);

     // Check server health before making the main call
     const healthy = await checkServerHealth();
     if (!healthy) {
       removeSpinner();
       showServerErrorPopup(sendMessage);
       sendBtn.disabled = false;
       return;
     }

     try {
       const response = await fetch('http://127.0.0.1:5050/query', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ query }),
       });
       if (!response.ok) {
         throw new Error(`HTTP error ${response.status}`);
       }
       let data;
       try {
         data = await response.json();
       } catch (jsonErr) {
         throw new Error('Invalid JSON in response');
       }
       removeSpinner();
       if (data && data.response) {
         addMessage('bot', data.response);
       } else {
         addMessage('bot', 'No response from server.');
       }
     } catch (error) {
       console.error('Error:', error);
       removeSpinner();
       let msg = 'Sorry, something went wrong.';
       if (error.message && error.message.includes('CORS')) {
         msg = 'CORS or network error: Unable to reach the backend. Please check that the backend server is running and CORS is enabled.';
       } else if (error.message && error.message.includes('Failed to fetch')) {
         msg = 'Network error: Unable to connect to the backend. Is the server running?';
       } else if (error.message && error.message.includes('HTTP error')) {
         msg = `Server error: ${error.message}`;
       }
       addMessage('bot', msg);
     } finally {
       sendBtn.disabled = false;  // Re-enable the send button
     }
   }
   
   // Event listeners with null checks
   if (sendBtn) {
     sendBtn.addEventListener('click', sendMessage);
   }
   if (userInput) {
     userInput.addEventListener('keypress', (e) => {
       if (e.key === 'Enter') {
         sendMessage();
       }
     });
   }
   if (clearChatBtn && chatWindow) {
     clearChatBtn.addEventListener('click', () => {
       chatWindow.innerHTML = '';
     });
   }
   if (closeChatBtn && chatContainer) {
     closeChatBtn.addEventListener('click', () => {
       chatContainer.style.display = 'none';
     });
   }