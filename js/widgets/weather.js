OctoroitOS.widgets.register('weather', (container, data) => {
  const loc = data.location || 'San Francisco';
  let temp = 20, desc = 'Clear', icon = '☀️';
  const conditions = [
    { t: 22, d: 'Sunny', i: '☀️' }, { t: 18, d: 'Cloudy', i: '☁️' },
    { t: 15, d: 'Rain', i: '🌧️' }, { t: 12, d: 'Storm', i: '⛈️' },
    { t: 25, d: 'Warm', i: '🌤️' }
  ];

  const simulate = () => {
    const c = conditions[Math.floor(Math.random() * conditions.length)];
    temp = c.t + Math.floor(Math.random() * 4) - 2;
    desc = c.d; icon = c.i;
    render();
  };

  const render = () => {
    container.innerHTML = `
      <div class="widget-weather">
        <div class="loc">📍 ${loc}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <span style="font-size:24px;">${icon}</span>
          <div><div class="temp">${temp}°C</div><div class="desc">${desc}</div></div>
        </div>
      </div>`;
  };

  simulate();
  const interval = setInterval(simulate, 30000); // Update every 30s
  return {
    destroy: () => clearInterval(interval),
    save: () => ({ location: loc }),
    configure: () => {
      const n = prompt('City name:', loc);
      if (n?.trim()) { data.location = n.trim(); simulate(); OctoroitOS.widgets.save(); }
    }
  };
});