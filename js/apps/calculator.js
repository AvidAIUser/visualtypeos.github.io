OctoroitOS.registerApp('calc', () => {
  const id = OctoroitOS.wm.create({
    title: 'Calculator', app: 'calc', width: 320, height: 480, icon: '🔢',
    content: `
      <div style="display:flex;flex-direction:column;height:100%;background:var(--bg-secondary);">
        <input id="calc-display" readonly style="width:100%;padding:15px;font-size:24px;text-align:right;background:var(--bg-primary);color:var(--text-primary);border:none;border-bottom:1px solid var(--border);outline:none;">
        <div id="calc-grid" style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);"></div>
      </div>`
  });
  const win = OctoroitOS.windows.get(id).el;
  const display = win.querySelector('#calc-display');
  const grid = win.querySelector('#calc-grid');
  const buttons = ['C','⌫','(',')','7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
  let expr = '';

  buttons.forEach(btn => {
    const b = document.createElement('button');
    b.textContent = btn;
    b.style.cssText = `background:var(--bg-tertiary);color:var(--text-primary);border:none;font-size:18px;cursor:pointer;transition:background 0.1s;`;
    b.onpointerdown = () => b.style.background = 'var(--accent)';
    b.onpointerup = () => b.style.background = 'var(--bg-tertiary)';
    b.onclick = () => {
      if (btn === 'C') { expr = ''; display.value = ''; }
      else if (btn === '⌫') { expr = expr.slice(0, -1); display.value = expr; }
      else if (btn === '=') {
        try {
          const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
          const result = new Function(`return ${sanitized}`)();
          display.value = result;
          expr = String(result);
        } catch { display.value = 'Error'; expr = ''; }
      } else {
        expr += btn;
        display.value = expr;
      }
    };
    grid.appendChild(b);
  });
  return id;
});