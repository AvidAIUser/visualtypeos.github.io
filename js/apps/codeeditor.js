OctoroitOS.registerApp('code', (args = {}) => {
  const fp = args.path || null;
  const fn = fp ? fp.split('/').pop() : 'untitled.js';
  const id = OctoroitOS.wm.create({
    title: `Code - ${fn}`, app: 'code', width: 600, height: 450, icon: '💻',
    content: `
      <div style="display:flex;flex-direction:column;height:100%;background:var(--bg-primary);">
        <div style="padding:6px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;opacity:0.7">${fp || 'New File'}</span>
          <div style="display:flex;gap:6px;">
            <select id="code-lang" style="background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-size:12px;">
              <option value="js">JavaScript</option><option value="html">HTML</option><option value="css">CSS</option><option value="txt">Plain</option>
            </select>
            <button id="code-save" style="padding:4px 8px;background:var(--accent);color:#000;border:none;border-radius:4px;cursor:pointer;font-size:12px;">💾 Save</button>
          </div>
        </div>
        <div style="flex:1;display:flex;overflow:hidden;position:relative;">
          <div id="code-lines" style="width:40px;background:var(--bg-secondary);color:var(--text-secondary);text-align:right;padding:10px 5px;font-family:monospace;font-size:14px;line-height:1.5;overflow:hidden;user-select:none;border-right:1px solid var(--border);">1</div>
          <div style="flex:1;position:relative;">
            <pre id="code-highlight" style="position:absolute;inset:0;margin:0;padding:10px;font-family:monospace;font-size:14px;line-height:1.5;color:var(--text-primary);background:transparent;pointer-events:none;white-space:pre;overflow:hidden;"></pre>
            <textarea id="code-input" spellcheck="false" style="position:absolute;inset:0;width:100%;height:100%;padding:10px;font-family:monospace;font-size:14px;line-height:1.5;background:transparent;color:transparent;caret-color:var(--text-primary);border:none;outline:none;resize:none;white-space:pre;overflow:auto;z-index:2;"></textarea>
          </div>
        </div>
      </div>`
  });
  const win = OctoroitOS.windows.get(id).el;
  const input = win.querySelector('#code-input');
  const highlight = win.querySelector('#code-highlight');
  const lines = win.querySelector('#code-lines');
  const langSel = win.querySelector('#code-lang');
  let isDirty = false;

  if (fp) {
    const f = OctoroitOS.fs.read(fp);
    if (f) input.value = f.content || '';
  }

  const updateHighlight = () => {
    const text = input.value;
    lines.innerHTML = text.split('\n').map((_, i) => i + 1).join('<br>');
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lang = langSel.value;
    if (lang === 'js') {
      html = html.replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await)\b/g, '<span style="color:#c792ea">$1</span>')
                 .replace(/(&quot;|"|')/g, '<span style="color:#c3e88d">$&</span>')
                 .replace(/\b(\d+)\b/g, '<span style="color:#f78c6c">$1</span>')
                 .replace(/(\/\/.*)/g, '<span style="color:#546e7a">$1</span>');
    } else if (lang === 'html') {
      html = html.replace(/(&lt;\/?[a-z0-9]+)(.*?)(&gt;)/gi, '<span style="color:#f07178">$1</span>$2<span style="color:#f07178">$3</span>');
    } else if (lang === 'css') {
      html = html.replace(/([a-z-]+)(?=:)/g, '<span style="color:#82aaff">$1</span>')
                 .replace(/(#[0-9a-f]{3,6})/gi, '<span style="color:#c3e88d">$1</span>');
    }
    highlight.innerHTML = html + '\n';
    isDirty = true;
    win.querySelector('.window-title').textContent = `* Code - ${fn}`;
  };

  input.addEventListener('input', updateHighlight);
  input.addEventListener('scroll', () => {
    highlight.scrollTop = input.scrollTop;
    highlight.scrollLeft = input.scrollLeft;
    lines.scrollTop = input.scrollTop;
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = input.selectionStart;
      input.value = input.value.substring(0, start) + '  ' + input.value.substring(input.selectionEnd);
      input.selectionStart = input.selectionEnd = start + 2;
      updateHighlight();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      win.querySelector('#code-save').click();
    }
  });

  win.querySelector('#code-save').onclick = () => {
    const savePath = fp || `/home/user/desktop/${prompt('Filename:', 'untitled.js')}`;
    if (savePath) {
      OctoroitOS.fs.write(savePath, input.value);
      isDirty = false;
      win.querySelector('.window-title').textContent = `Code - ${savePath.split('/').pop()}`;
      OctoroitOS.notify('Code saved', 'success');
    }
  };

  updateHighlight();
  return id;
});