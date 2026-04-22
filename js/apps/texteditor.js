OctoroitOS.registerApp('editor', (args = {}) => {
  const filePath = args.path || null;
  let fileName = filePath ? filePath.split('/').pop() : 'untitled.txt';
  let isDirty = false;

  const id = OctoroitOS.WindowManager.create({
    title: `Editor - ${fileName}`,
    width: 500,
    height: 400,
    app: 'editor',
    icon: '📝',
    content: `
      <div style="display:flex;flex-direction:column;height:100%;">
        <div class="editor-toolbar" style="padding:6px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
          <span style="font-size:12px;opacity:0.7;">${filePath || 'New File'}</span>
          <div>
            <button class="ed-btn" data-action="save">💾 Save</button>
            <button class="ed-btn" data-action="close">❌ Close</button>
          </div>
        </div>
        <textarea class="editor-area" style="flex:1;background:var(--bg-secondary);color:var(--text-primary);border:none;padding:10px;font-family:monospace;resize:none;outline:none;" placeholder="Start typing..."></textarea>
      </div>
    `
  });

  const win = OctoroitOS.windows.get(id).el;
  const textarea = win.querySelector('.editor-area');
  const saveBtn = win.querySelector('[data-action="save"]');
  const closeBtn = win.querySelector('[data-action="close"]');

  // Load content if file exists
  if (filePath) {
    const fileData = OctoroitOS.FileSystem.read(filePath);
    if (fileData && fileData.content !== undefined) {
      textarea.value = fileData.content;
    }
  }

  // Track changes
  textarea.addEventListener('input', () => {
    isDirty = true;
    win.querySelector('.window-title').textContent = `* Editor - ${fileName}`;
  });

  // Save Action
  const saveFile = () => {
    if (!filePath) {
      // Save As logic
      const name = prompt('Save as filename:', 'untitled.txt');
      if (!name) return;
      const newPath = `/home/user/desktop/${name}`;
      OctoroitOS.FileSystem.write(newPath, textarea.value);
      fileName = name;
      win.querySelector('.window-title').textContent = `Editor - ${fileName}`;
      OctoroitOS.notify('File saved', 'success');
    } else {
      OctoroitOS.FileSystem.write(filePath, textarea.value);
      isDirty = false;
      win.querySelector('.window-title').textContent = `Editor - ${fileName}`;
      OctoroitOS.notify('Changes saved', 'success');
    }
  };

  saveBtn.addEventListener('click', saveFile);
  
  // Keyboard Shortcut (Ctrl+S)
  textarea.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
  });

  closeBtn.addEventListener('click', () => {
    if (isDirty) {
      if (confirm('Unsaved changes. Discard?')) {
        OctoroitOS.WindowManager.close(id);
      }
    } else {
      OctoroitOS.WindowManager.close(id);
    }
  });

  return id;
});