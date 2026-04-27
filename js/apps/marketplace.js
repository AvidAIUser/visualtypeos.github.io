OctoroitOS.registerApp('marketplace', () => {
  try {
    const registry = [
      { id: 'terminal', name: 'Terminal', desc: 'Command line interface', icon: '⌨️' },
      { id: 'files', name: 'Files', desc: 'File manager & trash', icon: '📁' },
      { id: 'code', name: 'Code Editor', desc: 'Syntax highlighted editor', icon: '💻' },
      { id: 'calc', name: 'Calculator', desc: 'Basic math calculator', icon: '🔢' },
      { id: 'browser', name: 'Browser', desc: 'Sandboxed web viewer', icon: '🌐' },
      { id: 'notes', name: 'Notes', desc: 'Auto-saving notepad', icon: '📒' },
      { id: 'monitor', name: 'Monitor', desc: 'System stats & FPS', icon: '📊' },
      { id: 'devtools', name: 'DevTools', desc: 'Console & profiler', icon: '🛠️' },
      { id: 'settings', name: 'Settings', desc: 'OS configuration', icon: '⚙️' }
    ];

    const id = OctoroitOS.wm.create({
      title: 'App Marketplace', app: 'marketplace', width: 500, height: 400, icon: '🛒',
      content: `<div style="padding:15px;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;overflow-y:auto;flex:1;" id="market-grid"></div>`
    });
    const win = OctoroitOS.windows.get(id)?.el;
    if (!win) return;
    const grid = win.querySelector('#market-grid');

    registry.forEach(app => {
      const isInstalled = !!OctoroitOS.apps[app.id];
      const card = document.createElement('div');
      card.style.cssText = 'background:var(--bg-tertiary);padding:12px;border-radius:8px;text-align:center;cursor:default;transition:transform 0.2s;';
      card.innerHTML = `<div style="font-size:28px;margin-bottom:6px;">${app.icon}</div><strong style="font-size:13px;">${app.name}</strong><p style="font-size:11px;opacity:0.7;margin:4px 0;">${app.desc}</p><button class="mkt-btn" style="margin-top:6px;padding:4px 10px;border:none;border-radius:4px;cursor:pointer;font-size:12px;background:${isInstalled?'var(--border)':'var(--accent)'};color:${isInstalled?'var(--text-primary)':'#000'};" ${isInstalled?'disabled':''}>${isInstalled?'Installed':'Open'}</button>`;
      
      const btn = card.querySelector('.mkt-btn');
      if (!isInstalled) {
        btn.style.cursor = 'pointer';
        btn.onclick = () => OctoroitOS.launchApp(app.id);
      }
      grid.appendChild(card);
    });
    return id;
  } catch(e) { console.error('[Marketplace] Crash:', e); }
});