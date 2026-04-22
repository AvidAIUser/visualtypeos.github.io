OctoroitOS.devtools = {
  consoleBuffer: [],
  maxConsole: 500,
  profilerData: { fps: 0, dom: 0, windows: 0, mem: 'N/A' },
  hotReloadEnabled: false,
  reloadLog: [],
  _rafId: null,
  _originalConsole: {},

  init() {
    this._captureConsole();
    this._startProfiler();
    this._hookHotReload();
  },

  _captureConsole() {
    ['log', 'warn', 'error', 'info'].forEach(level => {
      this._originalConsole[level] = console[level].bind(console);
      console[level] = (...args) => {
        this._originalConsole[level](...args);
        const msg = args.map(a => {
          try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
          catch { return '[Circular/Unserializable]'; }
        }).join(' ');
        this.consoleBuffer.push({ level, msg, time: new Date().toLocaleTimeString() });
        if (this.consoleBuffer.length > this.maxConsole) this.consoleBuffer.shift();
        this.updateConsole?.();
      };
    });
  },

  _startProfiler() {
    let frames = 0, last = performance.now();
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        this.profilerData = {
          fps: frames,
          dom: document.querySelectorAll('*').length,
          windows: OctoroitOS.windows.size,
          mem: performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) : 'N/A'
        };
        frames = 0; last = now;
        this.updateProfiler?.();
      }
      this._rafId = requestAnimationFrame(loop);
    };
    loop();
  },

  _hookHotReload() {
    const origWrite = OctoroitOS.fs.write.bind(OctoroitOS.fs);
    OctoroitOS.fs.write = (path, content) => {
      origWrite(path, content);
      if (this.hotReloadEnabled && path.endsWith('.js')) {
        this._reloadScript(path, content);
      }
    };
  },

  _reloadScript(path, content) {
    try {
      // Remove old script tag if exists
      document.querySelectorAll(`script[data-dev-path="${path}"]`).forEach(s => s.remove());
      const script = document.createElement('script');
      script.dataset.devPath = path;
      script.textContent = content;
      document.head.appendChild(script);
      this.reloadLog.unshift({ path, time: new Date().toLocaleTimeString(), status: '✅ Success' });
      console.log(`[HotReload] Injected: ${path}`);
    } catch (e) {
      this.reloadLog.unshift({ path, time: new Date().toLocaleTimeString(), status: `❌ ${e.message}` });
      console.error(`[HotReload] Failed: ${path}`, e);
    }
    if (this.reloadLog.length > 20) this.reloadLog.pop();
    this.updateReload?.();
  },

  generateDocs() {
    let html = '';
    const walk = (obj, prefix = 'OctoroitOS', depth = 0) => {
      if (depth > 3 || !obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (key.startsWith('_') || key === 'prototype') continue;
        const val = obj[key];
        const type = typeof val;
        const path = `${prefix}.${key}`;
        const isFunc = type === 'function';
        const isObj = type === 'object' && val !== null && !Array.isArray(val);
        
        html += `<div style="padding:3px 0;padding-left:${depth*12}px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <strong style="color:var(--accent)">${key}</strong> 
          <span style="opacity:0.6;font-size:11px;">(${type})</span>
          ${isFunc ? '<span style="opacity:0.5;margin-left:6px;">fn()</span>' : ''}
        </div>`;
        if (isObj) walk(val, path, depth + 1);
      }
    };
    walk(OctoroitOS);
    return html;
  },

  evalCommand(cmd) {
    try {
      const result = new Function('OS', `with(OS) { return ${cmd}; }`)(OctoroitOS);
      console.log(`> ${cmd}`, result);
      return result;
    } catch (e) {
      console.error(`> ${cmd}`, e.message);
      return e.message;
    }
  },

  toggleHotReload(enable) {
    this.hotReloadEnabled = enable;
    console.log(`[HotReload] ${enable ? 'Enabled' : 'Disabled'}`);
  }
};