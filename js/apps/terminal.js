OctoroitOS.registerApp('terminal', () => {
  try {
    const user = OctoroitOS.users?.current || 'guest';
    const home = `/home/${user}/desktop`;
    const id = OctoroitOS.wm.create({
      title: 'Terminal', app: 'terminal', width: 520, height: 340, icon: '⌨️',
      content: `<div class="term-out" style="font-family:monospace;white-space:pre-wrap;min-height:80%;overflow:auto;color:var(--text-primary);"></div><div style="display:flex;margin-top:6px;"><span style="margin-right:6px;color:var(--accent);">❯</span><input class="term-in" style="flex:1;background:transparent;border:none;color:var(--text-primary);outline:none;font-family:monospace;" autofocus></div>`
    });
    const win = OctoroitOS.windows.get(id)?.el;
    if (!win) return;
    const out = win.querySelector('.term-out');
    const inp = win.querySelector('.term-in');
    const print = t => { if(out) out.textContent += t + '\n'; };
    print('Octoroit Terminal v1.0\nType "help" for commands.\n');
    
    inp?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = inp.value.trim();
        inp.value = '';
        print(`❯ ${cmd}`);
        const parts = cmd.split(' ');
        const base = parts[0]?.toLowerCase();
        try {
          if (base === 'help') print('Commands: help, echo, ls, mkdir, touch, cat, clear, date, theme, reboot');
          else if (base === 'echo') print(parts.slice(1).join(' '));
          else if (base === 'ls') print((OctoroitOS.fs?.ls(home) || []).join('\n') || '(empty)');
          else if (base === 'mkdir') { OctoroitOS.fs?.mkdir(`${home}/${parts[1]}`); print('Created'); }
          else if (base === 'touch') { OctoroitOS.fs?.write(`${home}/${parts[1]}`, ''); print('Created'); }
          else if (base === 'cat') { const f = OctoroitOS.fs?.read(`${home}/${parts[1]}`); print(f?.content || 'Not found'); }
          else if (base === 'clear') out.textContent = '';
          else if (base === 'date') print(new Date().toString());
          else if (base === 'theme') OctoroitOS.theme?.apply(parts[1] || 'dark');
          else if (base === 'reboot') location.reload();
          else print(`Command not found: ${base}`);
        } catch(err) { print(`Error: ${err.message}`); }
      }
    });
    return id;
  } catch(e) { console.error('[Terminal] Crash:', e); OctoroitOS.notify?.('Terminal crashed', 'error'); }
});