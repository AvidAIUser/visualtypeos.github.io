OctoroitOS.sandbox = {
  frames: new Map(),
  create(appId, url, args = {}) {
    const id = OctoroitOS.wm.create({
      title: `${appId} (Sandboxed)`, width: 640, height: 480, app: appId, icon: '🔒',
      content: `<iframe id="sb-${appId}" src="${url}" style="width:100%;height:100%;border:none;background:#fff;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`
    });
    const win = OctoroitOS.windows.get(id).el;
    const iframe = win.querySelector(`#sb-${appId}`);
    this.frames.set(appId, { iframe, winId: id });

    window.addEventListener('message', e => {
      if (e.source !== iframe.contentWindow) return;
      this.handleMessage(appId, e.data);
    });
    return id;
  },
  handleMessage(appId, msg) {
    if (!msg || !msg.type) return;
    switch(msg.type) {
      case 'fs_read':
        if (!OctoroitOS.permissions.request(appId, 'fs')) return this.reply(appId, msg.id, { error: 'Permission denied' });
        this.reply(appId, msg.id, { data: OctoroitOS.fs.read(msg.path) });
        break;
      case 'fs_write':
        if (!OctoroitOS.permissions.request(appId, 'fs')) return this.reply(appId, msg.id, { error: 'Permission denied' });
        OctoroitOS.fs.write(msg.path, msg.content);
        this.reply(appId, msg.id, { success: true });
        break;
      case 'notify':
        if (!OctoroitOS.permissions.request(appId, 'notify')) return;
        OctoroitOS.notify(msg.text, msg.level || 'info');
        break;
      case 'log':
        console.log(`[Sandbox:${appId}]`, msg.text);
        break;
    }
  },
  reply(appId, msgId, payload) {
    const frame = this.frames.get(appId);
    if (frame?.iframe.contentWindow) {
      frame.iframe.contentWindow.postMessage({ id: msgId, ...payload }, '*');
    }
  }
};