OctoroitOS.registerApp('devtools', () => {
  const id = OctoroitOS.wm.create({
    title: 'Developer Tools', app: 'devtools', width: 650, height: 450, icon: '🛠️',
    content: `
      <div style="display:flex;flex-direction:column;height:100%;background:var(--bg-primary);">
        <div id="dt-tabs" style="display:flex;background:var(--bg-tertiary);border-bottom:1px solid var(--border);overflow-x:auto;">
          <button class="dt-tab active" data-tab="console">Console</button>
          <button class="dt-tab" data-tab="profiler">Profiler</button>
          <button class="dt-tab" data-tab="debugger">Debugger</button>
          <button class="dt-tab" data-tab="docs">API Docs</button>
          <button class="dt-tab" data-tab="reload">Hot-Reload</button>
        </div>
        <div id="dt-content" style="flex:1;overflow:auto;padding:10px;font-size:13px;"></div>
      </div>`
  });

  const win = OctoroitOS.windows.get(id).el;
  const content = win.querySelector('#dt-content');
  const tabs = win.querySelectorAll('.dt-tab');
  let activeTab = 'console';

  const render = (tab) => {
    activeTab = tab;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    content.innerHTML = '';

    if (tab === 'console') renderConsole();
    if (tab === 'profiler') renderProfiler();
    if (tab === 'debugger') renderDebugger();
    if (tab === 'docs') renderDocs();
    if (tab === 'reload') renderReload();
  };

  const renderConsole = () => {
    content.innerHTML = `
      <div id="dt-console-out" style="flex:1;overflow:auto;font-family:monospace;white-space:pre-wrap;margin-bottom:8px;max-height:320px;"></div>
      <div style="display:flex;gap:6px;">
        <span style="color:var(--accent);font-family:monospace;">❯</span>
        <input id="dt-cmd" type="text" placeholder="Evaluate JS (scoped to OctoroitOS)" style="flex:1;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;padding:4px 8px;outline:none;font-family:monospace;">
      </div>`;
    const out = content.querySelector('#dt-console-out');
    const inp = content.querySelector('#dt-cmd');

    const flush = () => {
      out.innerHTML = OctoroitOS.devtools.consoleBuffer.map(l => 
        `<div style="color:${l.level==='error'?'#ff5f56':l.level==='warn'?'#ffbd2e':'var(--text-primary)'};border-bottom:1px solid rgba(255,255,255,0.05);padding:2px 0;">
          <span style="opacity:0.5;margin-right:6px;">${l.time}</span>[${l.level.toUpperCase()}] ${l.msg.replace(/</g,'&lt;')}
        </div>`
      ).join('');
      out.scrollTop = out.scrollHeight;
    };
    OctoroitOS.devtools.updateConsole = flush;
    flush();

    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = inp.value.trim();
        if (!cmd) return;
        OctoroitOS.devtools.evalCommand(cmd);
        inp.value = '';
        flush();
      }
    });
  };

  const renderProfiler = () => {
    content.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;"><strong>FPS</strong><div id="dt-fps" style="font-size:24px;font-weight:700;color:var(--accent);">0</div></div>
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;"><strong>DOM Nodes</strong><div id="dt-dom" style="font-size:24px;font-weight:700;">0</div></div>
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;"><strong>Windows</strong><div id="dt-wins" style="font-size:24px;font-weight:700;">0</div></div>
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;"><strong>JS Heap (MB)</strong><div id="dt-mem" style="font-size:24px;font-weight:700;">N/A</div></div>
      </div>
      <div style="margin-top:12px;opacity:0.7;font-size:12px;">Profiler updates at 1Hz. Pauses when minimized.</div>`;
    
    OctoroitOS.devtools.updateProfiler = () => {
      const d = OctoroitOS.devtools.profilerData;
      const fpsEl = content.querySelector('#dt-fps');
      if (fpsEl) {
        fpsEl.textContent = d.fps;
        content.querySelector('#dt-dom').textContent = d.dom;
        content.querySelector('#dt-wins').textContent = d.windows;
        content.querySelector('#dt-mem').textContent = d.mem;
      }
    };
  };

  const renderDebugger = () => {
    content.innerHTML = `<div id="dt-apps" style="display:flex;flex-direction:column;gap:6px;"></div>`;
    const list = content.querySelector('#dt-apps');
    const apps = Object.keys(OctoroitOS.apps);
    const wins = Array.from(OctoroitOS.windows.values());

    if (!apps.length) { list.innerHTML = '<div style="opacity:0.5;">No apps registered.</div>'; return; }

    apps.forEach(app => {
      const appWins = wins.filter(w => w.app === app);
      const perms = OctoroitOS.permissions.get(app);
      const el = document.createElement('div');
      el.style.cssText = 'background:var(--bg-tertiary);padding:8px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;';
      el.innerHTML = `
        <div><strong>${app}</strong> <span style="opacity:0.6;font-size:11px;">(${appWins.length} windows)</span><br>
        <span style="font-size:11px;opacity:0.7;">FS:${perms.fs?'✅':'❌'} | Notify:${perms.notify?'✅':'❌'}</span></div>
        <div style="display:flex;gap:4px;">
          <button class="dt-btn" data-action="launch" style="padding:4px 8px;background:var(--accent);color:#000;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Launch</button>
          ${appWins.length ? `<button class="dt-btn" data-action="close" style="padding:4px 8px;background:#ff5f56;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Close All</button>` : ''}
        </div>`;
      el.querySelector('[data-action="launch"]').onclick = () => OctoroitOS.launchApp(app);
      el.querySelector('[data-action="close"]')?.onclick = () => appWins.forEach(w => OctoroitOS.wm.close(w.el.id));
      list.appendChild(el);
    });
  };

  const renderDocs = () => {
    content.innerHTML = `
      <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <strong>Auto-Generated API Reference</strong>
        <button id="dt-refresh-docs" style="padding:4px 8px;background:var(--bg-tertiary);border:1px solid var(--border);color:var(--text-primary);border-radius:4px;cursor:pointer;font-size:11px;">Refresh</button>
      </div>
      <div id="dt-docs-tree" style="font-family:monospace;font-size:12px;line-height:1.5;max-height:340px;overflow:auto;"></div>`;
    const tree = content.querySelector('#dt-docs-tree');
    const refresh = () => { tree.innerHTML = OctoroitOS.devtools.generateDocs(); };
    content.querySelector('#dt-refresh-docs').onclick = refresh;
    refresh();
  };

  const renderReload = () => {
    content.innerHTML = `
      <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;">
        <strong>Hot-Reload Simulator</strong>
        <button id="dt-toggle-reload" style="padding:4px 10px;border:none;border-radius:4px;cursor:pointer;font-size:12px;background:${OctoroitOS.devtools.hotReloadEnabled?'#27c93f':'var(--border)'};color:${OctoroitOS.devtools.hotReloadEnabled?'#000':'var(--text-primary)'};">
          ${OctoroitOS.devtools.hotReloadEnabled ? '🟢 Active' : '⚪ Inactive'}
        </button>
      </div>
      <div style="font-size:12px;opacity:0.7;margin-bottom:10px;">Watches VFS for <code>.js</code> writes. Injects updated code dynamically. Scope: global/window.</div>
      <div id="dt-reload-log" style="font-family:monospace;font-size:12px;max-height:260px;overflow:auto;"></div>`;
    
    const logEl = content.querySelector('#dt-reload-log');
    const btn = content.querySelector('#dt-toggle-reload');
    
    const flushLog = () => {
      logEl.innerHTML = OctoroitOS.devtools.reloadLog.map(l => 
        `<div style="padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05);">${l.time} <strong>${l.path}</strong> ${l.status}</div>`
      ).join('') || '<div style="opacity:0.5;">No reload events yet.</div>';
    };
    OctoroitOS.devtools.updateReload = flushLog;
    flushLog();

    btn.onclick = () => {
      const next = !OctoroitOS.devtools.hotReloadEnabled;
      OctoroitOS.devtools.toggleHotReload(next);
      btn.textContent = next ? '🟢 Active' : '⚪ Inactive';
      btn.style.background = next ? '#27c93f' : 'var(--border)';
      btn.style.color = next ? '#000' : 'var(--text-primary)';
    };
  };

  tabs.forEach(t => t.onclick = () => render(t.dataset.tab));
  render('console');

  // Pause profiler when minimized
  const origMin = OctoroitOS.wm.minimize.bind(OctoroitOS.wm);
  OctoroitOS.wm.minimize = (wid) => {
    origMin(wid);
    if (wid === id) cancelAnimationFrame(OctoroitOS.devtools._rafId);
    else if (!OctoroitOS.windows.get(id)?.minimized) OctoroitOS.devtools._startProfiler();
  };

  return id;
});