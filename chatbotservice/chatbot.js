const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatContainer = document.querySelector('.chat-container');
const toggleChatBtn = document.getElementById('toggleChatBtn');

function syncChatVisibility(isClosed) {
  if (chatContainer) {
    chatContainer.classList.toggle('is-closed', isClosed);
    chatContainer.style.display = '';
  }

  if (toggleChatBtn) {
    toggleChatBtn.classList.toggle('is-hidden', !isClosed);
    toggleChatBtn.hidden = !isClosed;
  }
}

window.syncChatVisibility = syncChatVisibility;

function getAppConfig() {
  return (window.config && window.config.conf) || {};
}

function getChatApi() {
  const conf = getAppConfig();
  return conf.SERVICES && conf.SERVICES.chatApi ? conf.SERVICES.chatApi : '';
}

function isPrototypeMode() {
  return getAppConfig().APP_MODE !== 'production';
}

function addMessage(sender, messageHtml) {
  if (!chatWindow) {
    return;
  }

  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
  const ui = window.udtI18n;
  div.innerHTML = `<strong>${sender === 'user' ? ui.t('you', 'You') : ui.t('assistant_name', 'Odin')}:</strong> ${messageHtml}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showSpinner() {
  if (!chatWindow) {
    return;
  }

  const spinnerDiv = document.createElement('div');
  spinnerDiv.id = 'spinner';
  spinnerDiv.classList.add('message', 'bot-message');
  const ui = window.udtI18n;
  spinnerDiv.innerHTML = `<strong>${ui.t('assistant_name', 'Odin')}:</strong> <span class="spinner"><span>.</span><span>.</span><span>.</span></span>`;
  chatWindow.appendChild(spinnerDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeSpinner() {
  const spinnerDiv = document.getElementById('spinner');
  if (spinnerDiv) {
    spinnerDiv.remove();
  }
}

function getDemoResponse(query) {
  const normalized = query.toLowerCase();

  if (normalized.includes('traffic')) {
    return window.udtI18n.t('demo_chat_traffic');
  }

  if (normalized.includes('weather') || normalized.includes('air')) {
    return window.udtI18n.t('demo_chat_air');
  }

  return window.udtI18n.t('demo_chat_default');
}

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
      <h2 style='color:#c00;margin-bottom:1em;'>${window.udtI18n.t('demo_version')}</h2>
      <p style='margin-bottom:1.5em;'>${window.udtI18n.t('demo_chat_default')}</p>
      <button style='padding:0.5em 1.5em;font-size:1.1em;border-radius:6px;border:none;background:#0d6efd;color:#fff;cursor:pointer;margin-right:1em;' id='retryServerBtn'>${window.udtI18n.t('retry')}</button>
      <button style='padding:0.5em 1.5em;font-size:1.1em;border-radius:6px;border:none;background:#888;color:#fff;cursor:pointer;' onclick='this.closest("div").parentNode.remove()'>${window.udtI18n.t('close')}</button>
  </div>`;
  document.body.appendChild(popup);
  document.getElementById('retryServerBtn').onclick = function() {
    popup.remove();
    if (typeof retryCallback === 'function') {
      retryCallback();
    }
  };
}

async function checkServerHealth() {
  const chatApi = getChatApi();
  if (!chatApi || isPrototypeMode()) {
    return false;
  }

  try {
    const resp = await fetch(`${chatApi.replace(/\/$/, '')}/health`, { method: 'GET' });
    if (!resp.ok) {
      throw new Error('Server not healthy');
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function sendMessage() {
  if (!userInput || !chatWindow || !sendBtn) {
    return;
  }

  const query = userInput.value.trim();
  if (!query) {
    return;
  }

  addMessage('user', query);
  userInput.value = '';
  sendBtn.disabled = true;
  showSpinner();

  const healthy = await checkServerHealth();
  if (!healthy) {
    removeSpinner();
    if (isPrototypeMode() || !getChatApi()) {
      addMessage('bot', getDemoResponse(query));
    } else {
      showServerErrorPopup(sendMessage);
    }
    sendBtn.disabled = false;
    return;
  }

  try {
    const chatApi = getChatApi().replace(/\/$/, '');
    const response = await fetch(`${chatApi}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    removeSpinner();
    if (data && data.response) {
      addMessage('bot', data.response);
    } else {
      addMessage('bot', window.udtI18n.t('no_server_response'));
    }
  } catch (error) {
    console.error('Error:', error);
    removeSpinner();
    addMessage('bot', window.udtI18n.t('demo_chat_error'));
  } finally {
    sendBtn.disabled = false;
  }
}

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
    syncChatVisibility(true);
  });
}

if (toggleChatBtn) {
  toggleChatBtn.addEventListener('click', () => {
    syncChatVisibility(false);
  });
}

syncChatVisibility(false);

document.addEventListener('configLoaded', () => {
  if (isPrototypeMode()) {
    addMessage('bot', window.udtI18n.t('demo_chat_active'));
  }
});
