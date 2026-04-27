OctoroitOS.registerApp('notes', () => {
  try {
    const user = OctoroitOS.users?.current || 'guest';
    const notesDir = `/home/${user}/notes`;
    if (!OctoroitOS.fs?.read(notesDir)) OctoroitOS.fs?.mkdir(notesDir);

    const id = OctoroitOS.wm.create({
      title: 'Notes', app: 'notes', width: 400, height: 350, icon: '📒',
      content: `<div style="display:flex;flex-direction:column;height:100%;"><div style="padding:6px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><span style="font-size:12px;opacity:0.7">Auto-saves to /notes</span><button id="note-new" style="padding:4px 8px;background:var(--accent);color:#000;border:none;border-radius:4px;cursor:pointer;font-size:12px;">+ New</button></div><div style="flex:1;display:flex;overflow:hidden;"><div id="note-list" style="width:120px;background:var(--bg-secondary);border-right:1px solid var(--border);overflow-y:auto;padding:5px;"></div><textarea id="note-editor" placeholder="Start typing..." style="flex:1;background:var(--bg-primary);color:var(--text-primary);border:none;padding:10px;font-family:system-ui;font-size:14px;resize:none;outline:none;"></textarea></div></div>`
    });
    const win = OctoroitOS.windows.get(id)?.el;
    if (!win) return;
    const listEl = win.querySelector('#note-list');
    const editor = win.querySelector('#note-editor');
    let currentNote = null, saveTimeout = null;

    const renderList = () => {
      listEl.innerHTML = '';
      const notes = OctoroitOS.fs?.ls(notesDir) || [];
      if (!notes.length) { listEl.innerHTML = '<div style="padding:10px;font-size:12px;opacity:0.5;text-align:center;">No notes</div>'; return; }
      notes.forEach(name => {
        const el = document.createElement('div');
        el.textContent = name.replace('.txt', '');
        el.style.cssText = 'padding:8px;cursor:pointer;border-radius:4px;font-size:12px;margin-bottom:2px;transition:background 0.2s;';
        el.onpointerover = () => el.style.background = 'rgba(255,255,255,0.05)';
        el.onpointerout = () => el.style.background = 'transparent';
        el.onclick = () => {
          currentNote = `${notesDir}/${name}`;
          const f = OctoroitOS.fs?.read(currentNote);
          editor.value = f?.content || '';
          listEl.querySelectorAll('div').forEach(d => { d.style.background = 'transparent'; d.style.color = 'var(--text-primary)'; });
          el.style.background = 'var(--accent)'; el.style.color = '#000';
        };
        listEl.appendChild(el);
      });
    };

    editor?.addEventListener('input', () => {
      if (!currentNote) return;
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => OctoroitOS.fs?.write(currentNote, editor.value), 500);
    });

    win.querySelector('#note-new')?.onclick = () => {
      const name = prompt('Note name:', `note-${Date.now()}.txt`);
      if (name) {
        const path = `${notesDir}/${name.endsWith('.txt') ? name : name + '.txt'}`;
        OctoroitOS.fs?.write(path, '');
        renderList();
        setTimeout(() => listEl.lastElementChild?.click(), 50);
      }
    };

    renderList();
    return id;
  } catch(e) { console.error('[Notes] Crash:', e); OctoroitOS.notify?.('Notes crashed', 'error'); }
});