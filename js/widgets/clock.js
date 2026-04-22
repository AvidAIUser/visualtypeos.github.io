OctoroitOS.widgets.register('clock', (container, data) => {
  let interval;
  const render = () => {
    const now = new Date();
    container.innerHTML = `
      <div class="widget-clock">
        <div class="time">${now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div>
        <div class="date">${now.toLocaleDateString([], {weekday:'long',month:'short',day:'numeric',year:'numeric'})}</div>
      </div>`;
  };
  render();
  interval = setInterval(render, 1000);
  return { destroy: () => clearInterval(interval) };
});