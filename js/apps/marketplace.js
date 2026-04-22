OctoroitOS.registerApp('marketplace', () => {
  const registry = [
    { id: 'paint', name: 'Pixel Paint', desc: 'Simple drawing canvas', icon: '🎨', url: 'js/apps/paint.js' },
    { id: 'music', name: 'Audio Player', desc: 'Play local audio files', icon: '🎵', url: 'js/apps/music.js' },
    { id: 'weather', name: 'Weather', desc: 'Live forecast widget', icon: '🌤️', url: 'js/apps/weather.js' },
    { id: 'tasks', name: 'Task Manager', desc: 'Kanban-style todo board', icon: '✅', url: 'js/apps/tasks.js' }
  ];

  const id = OctoroitOS.wm.create({
    title: 'App Marketplace', app: 'marketplace', width: 500, height: 400, icon: '🛒',
    content: `<div style="padding:15px;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;overflow-y:auto;flex:1;" id="market-grid"></div>`
  });
  const win = OctoroitOS.windows.get(id).el;
  const grid = win.querySelector('#market-grid');

  const installed = OctoroitOS.storage.get('set:installed_apps') || [];

  registry.forEach(app => {
    const isInstalled = installed.includes(app.id) || OctoroitOS.apps[app.id];
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg-tertiary);padding:12px;border-radius:8px;text-align:center;cursor:pointer;transition:transform 0.2s;';
    card.innerHTML = `<div style="font-size:28px;margin-bottom:6px;">${app.icon}</div><strong style="font-size:13px;">${app.name}</strong><p style="font-size:11px;opacity:0.7;margin:4px 0;">${app.desc}</p><button class="mkt-btn" style="margin-top:6px;padding:4px 10px;border:none;border-radius:4px;cursor:pointer;font-size:12px;background:${isInstalled?'var(--border)':'var(--accent)'};color:${isInstalled?'var(--text-primary)':'#000'};">${isInstalled?'Installed':'Install'}</button>`;
    
    const btn = card.querySelector('.mkt-btn');
    if (!isInstalled) {
      btn.onclick = async () => {
        btn.textContent = 'Installing...'; btn.disabled = true;
        try {
          const script = document.createElement('script');
          script.src = app.url;
          document.head.appendChild(script);
          await new Promise((res, rej) => { script.onload = res; script.onerror = rej; });
          installed.push(app.id);
          OctoroitOS.storage.set('set:installed_apps', installed);
          btn.textContent = 'Installed'; btn.style.background = 'var(--border)'; btn.style.color = 'var(--text-primary)';
          OctoroitOS.notify(`${app.name} installed`, 'success');
        } catch {
          btn.textContent = 'Failed'; btn.style.background = '#ff5f56'; btn.style.color = '#fff';
          OctoroitOS.notify(`Failed to install ${app.name}`, 'error');
        }
      };
    } else {
      btn.disabled = true;
    }
    grid.appendChild(card);
  });
  return id;
});