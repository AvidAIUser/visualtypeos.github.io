OctoroitOS.widgets.register('stats', (container, data) => {
  let fps = 0, frames = 0, last = performance.now(), rafId;
  const el = document.createElement('div');
  el.className = 'widget-stats';
  container.appendChild(el);

  const loop = () => {
    frames++; const now = performance.now();
    if (now - last >= 1000) { fps = frames; frames = 0; last = now; }
    const wins = OctoroitOS.windows.size;
    const mem = (JSON.stringify(OctoroitOS.storage.memory).length / 1024).toFixed(1);
    const user = OctoroitOS.users.current || 'guest';
    el.innerHTML = `
      <div>🪟 Windows: ${wins}</div>
      <div>⚡ FPS: ${fps}</div>
      <div>💾 State: ${mem} KB</div>
      <div>👤 User: ${user}</div>
    `;
    rafId = requestAnimationFrame(loop);
  };
  loop();
  return { destroy: () => cancelAnimationFrame(rafId) };
});