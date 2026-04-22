OctoroitOS.StartMenu = {
  menuEl: null,
  appsList: [],

  init() {
    this.menuEl = document.getElementById('start-menu');
    this.renderApps();
    this.setupSearch();
    
    // Close when clicking outside
    document.addEventListener('click', e => {
      if (!this.menuEl.contains(e.target) && 
          !document.getElementById('start-btn').contains(e.target)) {
        OctoroitOS.startMenu.close();
        document.getElementById('start-btn').classList.remove('active');
      }
    });
  },

  renderApps() {
    const container = this.menuEl.querySelector('.start-apps');
    container.innerHTML = '';
    
    // Get registered apps
    const appIds = Object.keys(OctoroitOS.apps);
    
    appIds.forEach(appId => {
      const icon = OctoroitOS.getIcon(appId);
      const name = appId.charAt(0).toUpperCase() + appId.slice(1);
      
      const el = document.createElement('div');
      el.className = 'start-app-item';
      el.dataset.app = appId;
      el.innerHTML = `
        <div class="start-app-icon">${icon}</div>
        <div class="start-app-name">${name}</div>
      `;
      
      el.addEventListener('click', () => {
        OctoroitOS.launchApp(appId);
        OctoroitOS.startMenu.close();
        document.getElementById('start-btn').classList.remove('active');
      });
      
      container.appendChild(el);
    });
  },

  setupSearch() {
    const input = document.getElementById('start-search');
    input.addEventListener('input', e => {
      const term = e.target.value.toLowerCase();
      const items = this.menuEl.querySelectorAll('.start-app-item');
      
      items.forEach(item => {
        const name = item.querySelector('.start-app-name').textContent.toLowerCase();
        const app = item.dataset.app;
        if (name.includes(term) || app.includes(term)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
};