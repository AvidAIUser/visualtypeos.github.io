// Add to OctoroitOS.wm object:
activeId: null,

// Inside focus(id):
focus(id) {
  const w = OctoroitOS.windows.get(id); if(!w) return;
  this.activeId = id; // <-- ADD THIS LINE
  w.el.style.zIndex = ++OctoroitOS.zIndexCounter;
  document.querySelectorAll('.taskbar-item').forEach(t=>t.classList.remove('active'));
  document.getElementById('tb-'+id)?.classList.add('active');
}