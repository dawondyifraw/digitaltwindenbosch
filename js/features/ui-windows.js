(function () {
  const PANEL_STORAGE_KEY = 'udt_window_panel_state';

  function loadPanelState() {
    try {
      return JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function savePanelState(nextState) {
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) { }
  }

  function getDashboardUrl() {
    let targetUrl = 'dashboard/open_data_dashboard.html';
    try {
      const lastLocation = JSON.parse(localStorage.getItem('udt_last_location') || 'null');
      if (lastLocation && Number.isFinite(lastLocation.lat) && Number.isFinite(lastLocation.lon)) {
        const params = new URLSearchParams({
          lat: String(lastLocation.lat),
          lon: String(lastLocation.lon),
          name: lastLocation.name || ''
        });
        targetUrl += `?${params.toString()}`;
      }
    } catch (error) { }
    return targetUrl;
  }

  function initDraggablePanels() {
    const panelState = loadPanelState();

    document.querySelectorAll('[data-window-panel]').forEach((panel) => {
      const panelId = panel.id || panel.getAttribute('aria-label') || `panel-${Math.random().toString(36).slice(2, 8)}`;
      const handle = panel.querySelector('[data-window-handle]');
      const minimizeBtn = panel.querySelector('[data-window-minimize]');
      const saved = panelState[panelId];

      if (saved?.minimized) {
        panel.classList.add('is-minimized');
      }
      if (saved?.left) panel.style.left = saved.left;
      if (saved?.top) panel.style.top = saved.top;
      if (saved?.right === 'auto') panel.style.right = 'auto';
      if (saved?.bottom === 'auto') panel.style.bottom = 'auto';
      if (saved?.transform === 'none') panel.style.transform = 'none';

      if (panel.dataset.windowPanelReady === 'true') {
        return;
      }
      panel.dataset.windowPanelReady = 'true';

      if (handle) {
        let startX = 0;
        let startY = 0;
        let panelX = 0;
        let panelY = 0;
        let dragging = false;

        handle.addEventListener('pointerdown', (event) => {
          if (event.target.closest('button, input, textarea, a, label')) return;
          dragging = true;
          panel.classList.add('is-dragging');
          const rect = panel.getBoundingClientRect();
          startX = event.clientX;
          startY = event.clientY;
          panelX = rect.left;
          panelY = rect.top;
          panel.style.left = `${rect.left}px`;
          panel.style.top = `${rect.top}px`;
          panel.style.right = 'auto';
          panel.style.bottom = 'auto';
          panel.style.transform = 'none';
        });

        window.addEventListener('pointermove', (event) => {
          if (!dragging) return;
          const nextLeft = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, panelX + (event.clientX - startX)));
          const nextTop = Math.max(8, Math.min(window.innerHeight - 56, panelY + (event.clientY - startY)));
          panel.style.left = `${nextLeft}px`;
          panel.style.top = `${nextTop}px`;
        });

        window.addEventListener('pointerup', () => {
          if (!dragging) return;
          dragging = false;
          panel.classList.remove('is-dragging');
          panelState[panelId] = {
            ...(panelState[panelId] || {}),
            minimized: panel.classList.contains('is-minimized'),
            left: panel.style.left || '',
            top: panel.style.top || '',
            right: panel.style.right || '',
            bottom: panel.style.bottom || '',
            transform: panel.style.transform || ''
          };
          savePanelState(panelState);
        });
      }

      minimizeBtn?.addEventListener('click', () => {
        panel.classList.toggle('is-minimized');
        panelState[panelId] = {
          ...(panelState[panelId] || {}),
          minimized: panel.classList.contains('is-minimized'),
          left: panel.style.left || '',
          top: panel.style.top || '',
          right: panel.style.right || '',
          bottom: panel.style.bottom || '',
          transform: panel.style.transform || ''
        };
        savePanelState(panelState);
      });
    });
  }

  function initUiWindows() {
    const rightPanel = document.getElementById('rightPanel');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const chatContainer = document.querySelector('.chat-container');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const locationInfoCloseBtn = document.getElementById('locationInfoCloseBtn');
    const openLocationDashboardBtn = document.getElementById('openLocationDashboardBtn');
    const sidebarBriefingToggle = document.getElementById('sidebarBriefingToggle');
    const sidebarBriefingPanel = document.getElementById('sidebarBriefingPanel');
    const localeNlBtn = document.getElementById('localeNlBtn');
    const localeEnBtn = document.getElementById('localeEnBtn');
    const openDataDashboardBtn = document.getElementById('openDataDashboardBtn');
    const topDashboardBtn = document.getElementById('topDashboardBtn');
    const topHomeBtn = document.getElementById('topHomeBtn');
    const topInfoBtn = document.getElementById('topInfoBtn');
    const topWeatherBtn = document.getElementById('topWeatherBtn');
    const topAlertsBtn = document.getElementById('topAlertsBtn');
    const topAssistantBtn = document.getElementById('topAssistantBtn');
    const topChatShortcutBtn = document.getElementById('topChatShortcutBtn');
    const adminInfoPanel = document.getElementById('adminInfoPanel');
    const adminInfoTitle = document.getElementById('adminInfoTitle');
    const adminInfoBody = document.getElementById('adminInfoBody');
    const adminInfoCloseBtn = document.getElementById('adminInfoCloseBtn');
    const trafficIncidentsPanel = document.getElementById('trafficIncidentsPanel');
    const trafficIncidentsCloseBtn = document.getElementById('trafficIncidentsCloseBtn');
    const openTrafficIncidentsBtn = document.getElementById('openTrafficIncidentsBtn');

    const adminPanelContent = {
      readiness: {
        title: 'Operational readiness',
        body: `
          <p><strong>Current limited-version status</strong></p>
          <ul>
            <li>The frontend is ready for simple web hosting.</li>
            <li>Open-data feeds are active for weather, traffic, CBS, RIVM, BAG, and heritage.</li>
            <li>Backend-connected modules remain optional in this limited version.</li>
          </ul>
          <p>This panel explains what is available now and what belongs to the full platform version.</p>
        `
      },
      governance: {
        title: 'Data governance and audit',
        body: `
          <p><strong>Current data governance status</strong></p>
          <ul>
            <li>Public sources are shown with source labels and timestamps where available.</li>
            <li>This limited version still combines open data with presentation-oriented visual layers.</li>
            <li>Full audit logging and data lineage belong to the platform phase.</li>
          </ul>
          <p>In the full twin, this section should expose source lineage, freshness, permissions, and audit trails.</p>
        `
      },
      deployment: {
        title: 'Municipality deployment model',
        body: `
          <p><strong>Deployment path</strong></p>
          <ul>
            <li>Current version: a public edition with optional open-data integrations.</li>
            <li>Next phase: connect to the Digital Twin Den Bosch backend services.</li>
            <li>Production phase: secure hosting, managed APIs, identity, audit, and orchestration.</li>
          </ul>
          <p>Visit DataTwinLabs.nl to schedule a live full-data demo with Daniel or Prof. Jos and explore the full platform and municipal deployment roadmap.</p>
        `
      }
    };

    document.querySelector('[data-action="openRightPanel"]')
      ?.addEventListener('click', () => {
        rightPanel?.classList.remove('is-closed');
      });

    closePanelBtn?.addEventListener('click', () => {
      rightPanel?.classList.add('is-closed');
    });

    closeChatBtn?.addEventListener('click', () => {
      if (window.syncChatVisibility) {
        window.syncChatVisibility(true);
        return;
      }
      chatContainer?.classList.add('is-closed');
    });

    toggleChatBtn?.addEventListener('click', () => {
      if (window.syncChatVisibility) {
        window.syncChatVisibility(false);
        return;
      }
      chatContainer?.classList.toggle('is-closed');
    });

    locationInfoCloseBtn?.addEventListener('click', () => {
      document.getElementById('locationInfoCard')?.classList.add('is-hidden');
    });

    sidebarBriefingToggle?.addEventListener('click', () => {
      const isOpen = sidebarBriefingToggle.getAttribute('aria-expanded') === 'true';
      const next = !isOpen;
      sidebarBriefingToggle.setAttribute('aria-expanded', String(next));
      if (sidebarBriefingPanel) {
        sidebarBriefingPanel.hidden = !next;
      }
      if (window.udtI18n) {
        sidebarBriefingToggle.textContent = window.udtI18n.t(next ? 'briefing_close' : 'briefing_open');
      }
    });

    [localeNlBtn, localeEnBtn].forEach((button) => {
      button?.addEventListener('click', () => {
        const locale = button.dataset.locale;
        if (window.udtI18n && locale) {
          window.udtI18n.setLocale(locale);
        }
      });
    });

    openDataDashboardBtn?.addEventListener('click', () => {
      window.open(getDashboardUrl(), '_blank');
    });

    topDashboardBtn?.addEventListener('click', () => {
      window.open(getDashboardUrl(), '_blank');
    });

    topHomeBtn?.addEventListener('click', () => {
      document.getElementById('flytoIKDBButton')?.click();
    });

    topInfoBtn?.addEventListener('click', () => {
      const infoButton = document.querySelector('.admin-info-trigger[data-admin-panel="readiness"]');
      infoButton?.click();
    });

    topWeatherBtn?.addEventListener('click', () => {
      rightPanel?.classList.remove('is-closed');
    });

    topAlertsBtn?.addEventListener('click', () => {
      if (window.toggleDemoAlerts) {
        window.toggleDemoAlerts();
      } else {
        document.getElementById('startNotifications')?.click();
      }
      document.getElementById('notificationArea')?.scrollIntoView?.({ block: 'nearest' });
    });

    topAssistantBtn?.addEventListener('click', () => {
      if (window.syncChatVisibility) {
        window.syncChatVisibility(false);
        return;
      }
      chatContainer?.classList.remove('is-closed');
    });

    topChatShortcutBtn?.addEventListener('click', () => {
      if (window.syncChatVisibility) {
        window.syncChatVisibility(false);
        return;
      }
      chatContainer?.classList.remove('is-closed');
    });

    openLocationDashboardBtn?.addEventListener('click', () => {
      window.open(getDashboardUrl(), '_blank');
    });

    document.querySelectorAll('.admin-info-trigger').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-admin-panel');
        const content = adminPanelContent[key];
        if (!content || !adminInfoPanel || !adminInfoTitle || !adminInfoBody) return;
        adminInfoTitle.textContent = content.title;
        adminInfoBody.innerHTML = content.body;
        adminInfoPanel.classList.remove('is-hidden');
      });
    });

    adminInfoCloseBtn?.addEventListener('click', () => {
      adminInfoPanel?.classList.add('is-hidden');
    });

    openTrafficIncidentsBtn?.addEventListener('click', () => {
      trafficIncidentsPanel?.classList.remove('is-hidden');
    });

    trafficIncidentsCloseBtn?.addEventListener('click', () => {
      trafficIncidentsPanel?.classList.add('is-hidden');
    });

    document.getElementById('minimize-chat-btn')?.addEventListener('click', () => {
      chatContainer?.classList.toggle('is-minimized');
    });

    initDraggablePanels();
  }

  window.initUiWindows = initUiWindows;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUiWindows, { once: true });
  } else {
    initUiWindows();
  }
})();
