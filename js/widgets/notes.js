OctoroitOS.widgets.register('notes', (container, data) => {
  const ta = document.createElement('textarea');
  ta.className = 'widget-notes';
  ta.placeholder = 'Quick note...';
  ta.value = data.text || '';
  container.appendChild(ta);

  let timeout;
  ta.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      data.text = ta.value;
      OctoroitOS.widgets.save();
    }, 400);
  });

  return { save: () => ({ text: ta.value }) };
});