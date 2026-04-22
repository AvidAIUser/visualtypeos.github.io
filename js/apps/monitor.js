OctoroitOS.registerApp('monitor', () => {
  const id = OctoroitOS.wm.create({
    title: 'System Monitor', app: 'monitor', width: 380, height: 320, icon: '📊',
    content: `
      <div style="padding:15px;font-size:13px;display:flex;flex-direction:column;gap:12px;">
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;">
          <strong>🖥️ OS Info</strong><br>
          <span id="mon-version">Version: ${OctoroitOS.version}</span><br>
          <span id="mon-uptime">Uptime: 0s</span>
        </div>
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;">
          <strong>🪟 Windows</strong><br>
          <span id="mon-windows">Active: 0</span>
        </div>
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;">
          <strong>💾 Storage</strong><br>
          <span id="mon-storage">Calculating...</span>
          <div style="width:100%;height:6px;background:var(--bg-primary);border-radius:3px;margin-top:6px;overflow:hidden;">
            <div id="mon-storage-bar" style="width:0%;height:100%;background:var(--accent);transition:width 0.3s;"></div>
          </div>
        </div>
        <div style="background:var(--bg-tertiary);padding:10px;border-radius:6px;">
          <strong>⚡ Performance</strong><br>
          <span id="mon-fps">FPS: --</span>
        </div>
      </div>`
  });
  const win = OctoroitOS.windows.get(id).el;
  const startTime = Date.now();
  let frames = 0, lastTime = performance.now(), fps = 0;

  const calcStorage = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) total += localStorage[key].length * 2;
    }
    const mb = (total / 1024 / 1024).toFixed(2);
    const pct = Math.min((total / (5 * 1024 * 1024)) * 100, 100);
    win.querySelector('#mon-storage').textContent = `LocalStorage: ${mb} MB / ~5 MB`;
    win.querySelector('#mon-storage-bar').style.width = pct + '%';
  };

  const loop = () => {
    if (!OctoroitOS.windows.has(id)) return;
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps = frames; frames = 0; lastTime = now;
    }
    win.querySelector('#mon-uptime').textContent = `Uptime: ${Math.floor((Date.now() - startTime) / 1000)}s`;
    win.querySelector('#mon-windows').textContent = `Active: ${OctoroitOS.windows.size}`;
    win.querySelector('#mon-fps').textContent = `FPS: ${fps}`;
    calcStorage();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return id;
});