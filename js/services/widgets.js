OctoroitOS.widgets = {
  registry: {}, instances: new Map(), container: null, gridSnap: 20,
  register(t, f) { this.registry[t] = f; },
  init() {
    this.container = document.getElementById('widget-layer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'widget-layer';
      document.getElementById('desktop').appendChild(this.container);
    }
    this.load(); this.patchContextMenu();
  },
  create(t, o = {}) {
    if (!this.registry[t]) return console.warn(`Widget "${t}" not registered`);
    const id = 'wgt-' + Date.now() + Math.random().toString(36).slice(2, 6);
    const cfg = { id, type: t, x: o.x || 40, y: o.y || 40, w: o.w || 200, h: o.h || 150, data: o.data || {} };
    const el = document.createElement('div');
    el.className = 'widget'; el.id = id;
    el.style.cssText = `left:${cfg.x}px;top:${cfg.y}px;width:${cfg.w}px;height:${cfg.h}px;`;
    el.innerHTML = `<div class="widget-header"><span class="widget-title">${t.toUpperCase()}</span><div class="widget-controls"><button class="widget-btn cfg" title="Configure">⚙</button><button class="widget-btn del" title="Remove">✕</button></div></div><div class="widget-body"></div><div class="widget-resize"></div>`;
    this.container.appendChild(el);
    const inst = this.registry[t](el.querySelector('.widget-body'), cfg.data);
    this.instances.set(id, { el, cfg, instance: inst });
    this.attachEvents(el, id); this.save(); return id;
  },
  attachEvents(el, id) {
    const hdr = el.querySelector('.widget-header'), rsz = el.querySelector('.widget-resize');
    let drag = false, sX, sY, sL, sT, resize = false, rX, rY, rW, rH;
    hdr.addEventListener('pointerdown', e => {
      if (e.target.closest('.widget-controls')) return;
      drag = true; sX = e.clientX; sY = e.clientY; sL = el.offsetLeft; sT = el.offsetTop;
      el.setPointerCapture(e.pointerId);
    });
    rsz.addEventListener('pointerdown', e => {
      resize = true; rX = e.clientX; rY = e.clientY; rW = el.offsetWidth; rH = el.offsetHeight;
      el.setPointerCapture(e.pointerId); e.stopPropagation();
    });
    el.addEventListener('pointermove', e => {
      if (drag) {
        el.style.left = Math.max(0, Math.round((sL + e.clientX - sX) / this.gridSnap) * this.gridSnap) + 'px';
        el.style.top = Math.max(0, Math.round((sT + e.clientY - sY) / this.gridSnap) * this.gridSnap) + 'px';
      }
      if (resize) {
        el.style.width = Math.max(120, Math.round((rW + e.clientX - rX) / this.gridSnap) * this.gridSnap) + 'px';
        el.style.height = Math.max(80, Math.round((rH + e.clientY - rY) / this.gridSnap) * this.gridSnap) + 'px';
      }
    });
    el.addEventListener('pointerup', () => { if (drag || resize) { drag = false; resize = false; this.updateConfig(id); } });
    el.querySelector('.del').onclick = () => this.remove(id);
    el.querySelector('.cfg').onclick = () => { const i = this.instances.get(id); if (i?.instance?.configure) i.instance.configure(); };
  },
  updateConfig(id) {
    const w = this.instances.get(id); if (!w) return;
    w.cfg.x = w.el.offsetLeft; w.cfg.y = w.el.offsetTop; w.cfg.w = w.el.offsetWidth; w.cfg.h = w.el.offsetHeight;
    this.save();
  },
  remove(id) {
    const w = this.instances.get(id); if (!w) return;
    w.el.remove(); if (w.instance?.destroy) w.instance.destroy();
    this.instances.delete(id); this.save();
  },
  save() {
    const st = [];
    this.instances.forEach(w => st.push({ ...w.cfg, data: w.instance?.save?.() || {} }));
    OctoroitOS.storage.set('set:widgets', st);
  },
  load() {
    const st = OctoroitOS.storage.get('set:widgets') || [];
    st.forEach(c => this.create(c.type, c));
  },
  patchContextMenu() {
    const ctx = document.getElementById('context-menu');
    const base = ctx.innerHTML;
    document.getElementById('desktop').addEventListener('contextmenu', e => {
      if (e.target.closest('.window') || e.target.closest('.widget')) return;
      ctx.innerHTML = `<div class="ctx-item" data-action="add-widget">➕ Add Widget</div>${base}`;
    });
    ctx.addEventListener('click', e => {
      if (e.target.dataset.action === 'add-widget') {
        const types = Object.keys(this.registry);
        const choice = prompt(`Available: ${types.join(', ')}\nEnter widget type:`);
        if (choice && this.registry[choice]) this.create(choice);
      }
    });
  }
};