OctoroitOS.registerApp('browser', (args = {}) => {
  const startUrl = args.url || 'https://example.com';
  const id = OctoroitOS.wm.create({
    title: 'Web Browser', app: 'browser', width: 850, height: 520, icon: '🌐',
    content: `
      <div style="display:flex;flex-direction:column;height:100%;background:var(--bg-secondary);">
        <div style="padding:6px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);display:flex;gap:6px;align-items:center;">
          <button id="br-back" style="padding:4px 8px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;cursor:pointer;opacity:0.4;">←</button>
          <button id="br-fwd" style="padding:4px 8px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;cursor:pointer;opacity:0.4;">→</button>
          <button id="br-refresh" style="padding:4px 8px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;cursor:pointer;">↻</button>
          <input id="br-url" type="text" value="${startUrl}" placeholder="Enter URL..." style="flex:1;padding:6px 10px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;outline:none;font-size:13px;">
          <button id="br-go" style="padding:4px 12px;background:var(--accent);color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:600;">Go</button>
          <button id="br-external" title="Open in new tab" style="padding:4px 8px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;cursor:pointer;">↗</button>
        </div>
        <div style="flex:1;position:relative;background:#fff;overflow:hidden;">
          <iframe id="br-frame" src="${startUrl}" style="width:100%;height:100%;border:none;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
          <div id="br-overlay" style="position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;background:var(--bg-primary);color:var(--text-primary);text-align:center;padding:20px;">
            <div style="font-size:48px;margin-bottom:10px;">🚫</div>
            <h3>Site Cannot Be Embedded</h3>
            <p style="opacity:0.7;margin:10px 0;max-width:420px;line-height:1.5;">This website blocks iframe embedding via <code>X-Frame-Options</code> or <code>CSP</code> headers. This is a browser security restriction, not an OS bug.</p>
            <a id="br-open-ext" href="${startUrl}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;padding:8px 16px;background:var(--accent);color:#000;border-radius:6px;text-decoration:none;font-weight:600;">Open in New Tab ↗</a>
          </div>
          <div id="br-progress" style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform 0.4s ease;z-index:5;"></div>
        </div>
        <div style="padding:4px 10px;font-size:11px;opacity:0.6;border-top:1px solid var(--border);background:var(--bg-tertiary);display:flex;justify-content:space-between;">
          <span id="br-status">Ready</span>
          <span style="opacity:0.5">Sandboxed Web Viewer</span>
        </div>
      </div>`
  });

  const win = OctoroitOS.windows.get(id).el;
  const frame = win.querySelector('#br-frame');
  const urlInput = win.querySelector('#br-url');
  const overlay = win.querySelector('#br-overlay');
  const progress = win.querySelector('#br-progress');
  const status = win.querySelector('#br-status');
  const extLink = win.querySelector('#br-open-ext');
  const extBtn = win.querySelector('#br-external');

  let history = [startUrl];
  let historyIndex = 0;
  let loadTimer = null;

  const normalizeUrl = (url) => {
    url = url.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  };

  const updateNav = () => {
    win.querySelector('#br-back').style.opacity = historyIndex > 0 ? '1' : '0.4';
    win.querySelector('#br-fwd').style.opacity = historyIndex < history.length - 1 ? '1' : '0.4';
  };

  const navigate = (url) => {
    url = normalizeUrl(url);
    if (!url) return;
    urlInput.value = url;
    extLink.href = url;
    overlay.style.display = 'none';
    progress.style.transform = 'scaleX(1)';
    status.textContent = 'Loading...';
    frame.src = url;

    if (history[historyIndex] !== url) {
      history = history.slice(0, historyIndex + 1);
      history.push(url);
      historyIndex = history.length - 1;
    }
    updateNav();

    // Fallback timer for blocked sites
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      try {
        // If iframe is cross-origin, we can't read content. 
        // We'll show overlay only if user manually triggers it or if it visibly fails.
        status.textContent = 'Loaded (cross-origin). Some sites may block embedding.';
      } catch(e) {}
    }, 6000);
  };

  // Controls
  win.querySelector('#br-go').onclick = () => navigate(urlInput.value);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(urlInput.value); });
  win.querySelector('#br-back').onclick = () => { if (historyIndex > 0) { historyIndex--; navigate(history[historyIndex]); } };
  win.querySelector('#br-fwd').onclick = () => { if (historyIndex < history.length - 1) { historyIndex++; navigate(history[historyIndex]); } };
  win.querySelector('#br-refresh').onclick = () => { frame.src = frame.src; progress.style.transform = 'scaleX(1)'; };
  extBtn.onclick = () => window.open(normalizeUrl(urlInput.value), '_blank', 'noopener');

  // Iframe events
  frame.onload = () => {
    clearTimeout(loadTimer);
    progress.style.transform = 'scaleX(0)';
    status.textContent = 'Loaded: ' + urlInput.value;
  };
  frame.onerror = () => {
    clearTimeout(loadTimer);
    progress.style.transform = 'scaleX(0)';
    overlay.style.display = 'flex';
    status.textContent = 'Failed to load';
  };

  // Manual overlay toggle for blocked sites
  frame.addEventListener('click', () => {
    // If user clicks inside a blank/blocked iframe, we can't detect it cross-origin.
    // We'll add a right-click context hint instead.
  });

  // Initialize
  updateNav();
  navigate(startUrl);
  return id;
});