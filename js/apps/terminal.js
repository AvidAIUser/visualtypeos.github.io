OctoroitOS.registerApp('terminal', (args = {}) => {
  const id = OctoroitOS.WindowManager.create({
    title: 'Terminal',
    width: 520,
    height: 340,
    app: 'terminal',
    content: `<div class="term-output" style="font-family:monospace;white-space:pre-wrap;min-height:80%;overflow:auto;"></div>
              <div style="display:flex;margin-top:6px;">
                <span style="margin-right:6px;color:var(--accent);">❯</span>
                <input class="term-input" type="text" style="flex:1;background:transparent;border:none;color:var(--text-primary);outline:none;font-family:monospace;" autofocus>
              </div>`
  });

  const win = OctoroitOS.windows.get(id).el;
  const output = win.querySelector('.term-output');
  const input = win.querySelector('.term-input');

  const print = (txt) => output.textContent += txt + '\n';
  print('Octoroit Terminal v1.0');
  print('Type "help" for commands.\n');
  if (args.initCmd) print(args.initCmd);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      input.value = '';
      print(`❯ ${cmd}`);
      this.exec(cmd, print);
    }
  });

  return id;
});

OctoroitOS.apps.terminal.exec = (cmd, print) => {
  const parts = cmd.split(' ');
  const base = parts[0].toLowerCase();
  switch (base) {
    case 'help':
      print('Available: help, echo, ls, mkdir, touch, cat, clear, date, reboot');
      break;
    case 'echo': print(parts.slice(1).join(' ')); break;
    case 'ls': print(OctoroitOS.FileSystem.ls('/home/user/desktop').join('\n') || '(empty)'); break;
    case 'mkdir': OctoroitOS.FileSystem.mkdir(`/home/user/desktop/${parts[1]}`); print(`Created ${parts[1]}`); break;
    case 'touch': OctoroitOS.FileSystem.write(`/home/user/desktop/${parts[1]}`, ''); print(`Created file ${parts[1]}`); break;
    case 'cat': {
      const f = OctoroitOS.FileSystem.read(`/home/user/desktop/${parts[1]}`);
      print(f ? f.content : `File not found: ${parts[1]}`);
      break;
    }
    case 'clear': document.querySelector('.term-output').textContent = ''; break;
    case 'date': print(new Date().toString()); break;
    case 'reboot': location.reload(); break;
    default: print(`Command not found: ${base}`);
  }
};