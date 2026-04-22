OctoroitOS.registerApp('files', (args = {}) => {
  const userHome = `/home/${OctoroitOS.users.current || 'guest'}`;
  let path = args.path || `${userHome}/desktop`;
  let selected = new Set();
  let lastClicked = null;

  const id = OctoroitOS.wm.create({
    title: 'Files', app: 'files', width: 620, height: 420, icon: '📁',
    content: `
      <div style="display:flex;flex-direction:column;height:100%">
        <div style="padding:6px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
          <button id="fm-up">↑ Up</button>
          <span id="fm-path" style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:100px;"></span>
          <button id="fm-undo" title="Undo (Ctrl+Z)">↩</button>
          <button id="fm-redo" title="Redo (Ctrl+Y)">↪</button>
          <button id="fm-mkdir">+ Folder</button>
          <button id="fm-mkfile">+ File</button>
          <button id="fm-trash" style="color:#ff5f56;">🗑️ Trash</button>
        </div>
        <div id="fm-grid" style="flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px;align-content:start;position:relative;"></div>
        <div id="fm-status" style="padding:4px 8px;font-size:11px;border-top:1px solid var(--border);opacity:0.7;display:flex;justify-content:space-between;"></div>
      </div>`
  });

  const win = OctoroitOS.windows.get(id).el;
  const grid = win.querySelector('#fm-grid');
  const pathEl = win.querySelector('#fm-path');
  const statusEl = win.querySelector('#fm-status');

  const render = () => {
    pathEl.textContent = path;
    grid.innerHTML = '';
    selected.clear();
    lastClicked = null;
    const kids = OctoroitOS.fs.ls(path);
    statusEl.innerHTML = `<span>${kids.length} items</span><span>0 selected</span>`;

    if (!kids.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:0.5;margin-top:20px;">Empty Folder</div>';
      return;
    }

    kids.forEach(name => {
      const cp = path === '/' ? `/${name}` : `${path}/${name}`;
      const info = OctoroitOS.fs.read(cp);
      const el = document.createElement('div');
      el.className = 'fm-item';
      el.dataset.path = cp;
      el.style.cssText = 'padding:10px;border-radius:8px;cursor:pointer;text-align:center;transition:background 0.15s,transform 0.1s;position:relative;';
      el.innerHTML = `
        <div style="font-size:24px;margin-bottom:4px;">${info?.type === 'dir' ? '📁' : '📄'}</div>
        <div style="font-size:12px;word-break:break-word;">${name}</div>
        <div style="font-size:10px;opacity:0.5;margin-top:2px;">${info?.meta?.size ? `${info.meta.size}B` : ''}</div>
      `;
      el.draggable = true;

      // Selection Logic
      el.addEventListener('click', e => {
        if (e.ctrlKey || e.metaKey) {
          selected.has(cp) ? selected.delete(cp) : selected.add(cp);
        } else if (e.shiftKey && lastClicked) {
          const items = Array.from(grid.querySelectorAll('.fm-item'));
          const start = items.findIndex(i => i.dataset.path === lastClicked);
          const end = items.findIndex(i => i.dataset.path === cp);
          const range = items.slice(Math.min(start, end), Math.max(start, end) + 1);
          range.forEach(i => selected.add(i.dataset.path));
        } else {
          selected.clear();
          selected.add(cp);
        }
        lastClicked = cp;
        updateSelectionUI();
      });

      el.addEventListener('dblclick', () => {
        if (info?.type === 'dir') { path = cp; render(); }
        else OctoroitOS.openFile(cp);
      });

      el.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (!selected.has(cp)) { selected.clear(); selected.add(cp); updateSelectionUI(); }
        showContextMenu(e.clientX, e.clientY);
      });

      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('application/x-octoroit-paths', JSON.stringify([...selected]));
        e.dataTransfer.effectAllowed = 'move';
      });

      grid.appendChild(el);
    });
    updateSelectionUI();
  };

  const updateSelectionUI = () => {
    grid.querySelectorAll('.fm-item').forEach(el => {
      el.style.background = selected.has(el.dataset.path) ? 'rgba(125,207,255,0.15)' : 'transparent';
      el.style.outline = selected.has(el.dataset.path) ? '2px solid var(--accent)' : 'none';
    });
    statusEl.querySelector('span:last-child').textContent = `${selected.size} selected`;
  };

  const showContextMenu = (x, y) => {
    const ctx = document.getElementById('context-menu');
    const inTrash = path.includes('/trash');
    ctx.innerHTML = `
      ${inTrash ? '<div class="ctx-item" data-action="restore">♻️ Restore</div>' : '<div class="ctx-item" data-action="trash">🗑️ Move to Trash</div>'}
      <div class="ctx-item" data-action="properties">ℹ️ Properties</div>
      <div class="ctx-item" data-action="rename">✏️ Rename</div>
    `;
    ctx.style.left = x + 'px'; ctx.style.top = y + 'px'; ctx.classList.remove('hidden');
    const handler = e => {
      const action = e.target.dataset.action;
      if (!action) return;
      ctx.classList.add('hidden');
      document.removeEventListener('click', handler);
      if (action === 'trash') [...selected].forEach(p => OctoroitOS.fs.trash(p));
      if (action === 'restore') [...selected].forEach(p => OctoroitOS.fs.restore(p));
      if (action === 'properties') showProperties([...selected][0]);
      if (action === 'rename') {
        const p = [...selected][0];
        const newName = prompt('New name:', p.split('/').pop());
        if (newName) {
          const dest = path === '/' ? `/${newName}` : `${path}/${newName}`;
          OctoroitOS.fs.move(p, dest);
        }
      }
      render();
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
  };

  const showProperties = (p) => {
    const props = OctoroitOS.fs.getProperties(p);
    if (!props) return;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9998;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:20px;width:300px;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
        <h3 style="margin-bottom:12px;">📄 Properties</h3>
        <div style="font-size:13px;line-height:1.6;">
          <strong>Name:</strong> ${props.name}<br>
          <strong>Type:</strong> ${props.type}<br>
          <strong>Size:</strong> ${props.size} bytes<br>
          <strong>Created:</strong> ${props.created}<br>
          <strong>Modified:</strong> ${props.modified}<br>
          <strong>Path:</strong> <span style="word-break:break-all;opacity:0.8;">${props.path}</span>
        </div>
        <button id="prop-close" style="margin-top:16px;width:100%;padding:8px;background:var(--accent);color:#000;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Close</button>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#prop-close').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  };

  // Toolbar Actions
  win.querySelector('#fm-up').onclick = () => {
    if (path !== '/') { const p = path.split('/').filter(Boolean); p.pop(); path = '/' + p.join('/') || '/'; render(); }
  };
  win.querySelector('#fm-mkdir').onclick = () => {
    const n = prompt('Folder name:'); if (n) { OctoroitOS.fs.mkdir(path === '/' ? `/${n}` : `${path}/${n}`); render(); }
  };
  win.querySelector('#fm-mkfile').onclick = () => {
    const n = prompt('File name:'); if (n) { OctoroitOS.fs.write(path === '/' ? `/${n}` : `${path}/${n}`, ''); render(); }
  };
  win.querySelector('#fm-trash').onclick = () => { path = `${userHome}/trash`; render(); };
  win.querySelector('#fm-undo').onclick = () => { OctoroitOS.fs.undo(); render(); };
  win.querySelector('#fm-redo').onclick = () => { OctoroitOS.fs.redo(); render(); };

  // Keyboard Shortcuts
  win.addEventListener('keydown', e => {
    if (e.key === 'Delete' || e.key === 'Backspace') { [...selected].forEach(p => OctoroitOS.fs.trash(p)); render(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); OctoroitOS.fs.ls(path).forEach(n => selected.add(path === '/' ? `/${n}` : `${path}/${n}`)); updateSelectionUI(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); OctoroitOS.fs.undo(); render(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); OctoroitOS.fs.redo(); render(); }
  });

  render();
  return id;
});