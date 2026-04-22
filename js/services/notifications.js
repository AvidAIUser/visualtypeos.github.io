OctoroitOS.notifications = {
  queue: [],
  history: [],
  panelId: null,
  init() {
    this.createPanel();
    // Override old notify() to use new system
    const oldNotify = OctoroitOS.notify.bind(OctoroitOS);
    OctoroitOS.notify = (msg, type = 'info', appId = 'system') => {
      const id = 'notif-' + Date.now();
      const notif = { id, msg, type, appId, time: new Date().toLocaleTimeString() };
      this.queue.push(notif);
      this.history.unshift(notif);
      if (this.history.length > 50) this.history.pop();
      this.renderToast(notif);
      this.updateBadge();
      return id;
    };
  },
  createPanel() {
    this.panelId = OctoroitOS.wm.create({
      title: 'Notifications', app: 'notifications', width: 320, height: 400, icon: '🔔',
      content: `<div id="notif-list" style="padding:10px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:8px;"></div>
                <div style="padding:8px;border-top:1px solid var(--border);text-align:center;"><button id="notif-clear" style="padding:6px 12px;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;cursor:pointer;">Clear All</button></div>`
    });
    const win = OctoroitOS.windows.get(this.panelId).el;
    win.querySelector('#notif-clear').onclick = () => { this.history = []; this.renderPanel(); };
    this.renderPanel();
  },
  renderToast(n) {
    const t = document.createElement('div');
    t.className = `toast toast-${n.type}`;
    t.innerHTML = `<strong>${n.appId}</strong><br>${n.msg}<span style="float:right;font-size:11px;opacity:0.6">${n.time}</span>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    t.onclick = () => { t.remove(); this.focusApp(n.appId); };
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 5000);
  },
  renderPanel() {
    const win = OctoroitOS.windows.get(this.panelId);
    if (!win) return;
    const list = win.el.querySelector('#notif-list');
    list.innerHTML = this.history.length ? '' : '<div style="text-align:center;opacity:0.5;padding:20px;">No notifications</div>';
    this.history.forEach(n => {
      const el = document.createElement('div');
      el.style.cssText = 'padding:10px;background:var(--bg-tertiary);border-radius:6px;cursor:pointer;border-left:3px solid var(--accent);';
      el.innerHTML = `<strong>${n.appId}</strong> <span style="float:right;font-size:11px;opacity:0.6">${n.time}</span><br><span style="font-size:12px">${n.msg}</span>`;
      el.onclick = () => this.focusApp(n.appId);
      list.appendChild(el);
    });
  },
  focusApp(appId) {
    const wins = Array.from(OctoroitOS.windows.values()).filter(w => w.app === appId);
    if (wins.length) OctoroitOS.wm.focus(wins[0].el.id);
  },
  updateBadge() {
    const btn = document.getElementById('start-btn');
    if (btn) btn.dataset.badge = this.queue.length || '';
  }
};