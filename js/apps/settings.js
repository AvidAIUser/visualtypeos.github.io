// Inside renderAppearance() or new renderAccessibility(), add:
const renderAccessibility = () => {
  panel.innerHTML = `
    <div class="setting-group">
      <label class="setting-label">${OctoroitOS.i18n.t('settings.language')}</label>
      <select id="set-lang" style="width:100%;padding:8px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border);border-radius:6px;margin-top:6px;">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="ja">日本語</option>
      </select>
    </div>
    <div class="setting-group">
      <label class="setting-label">${OctoroitOS.i18n.t('settings.accessibility')}</label>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;">
        <button id="set-voice" class="fm-btn">🎤 ${OctoroitOS.i18n.t('settings.voice')}</button>
        <button id="set-shortcuts" class="fm-btn">⌨️ ${OctoroitOS.i18n.t('a11y.shortcuts')}</button>
      </div>
    </div>
    <div class="setting-group">
      <label class="setting-label">${OctoroitOS.i18n.t('settings.audio')}</label>
      <button id="audio-toggle" class="fm-btn">${OctoroitOS.audio.enabled ? '🔊 On' : '🔇 Off'}</button>
    </div>
  `;

  const langSel = panel.querySelector('#set-lang');
  langSel.value = OctoroitOS.i18n.current;
  langSel.onchange = () => OctoroitOS.i18n.setLang(langSel.value);

  panel.querySelector('#set-voice').onclick = () => OctoroitOS.a11y.toggleVoice();
  panel.querySelector('#set-shortcuts').onclick = () => OctoroitOS.a11y.showShortcuts();

  const audBtn = panel.querySelector('#audio-toggle');
  audBtn.onclick = () => {
    OctoroitOS.audio.enabled = !OctoroitOS.audio.enabled;
    OctoroitOS.storage.set('set:audio', OctoroitOS.audio.enabled);
    audBtn.textContent = OctoroitOS.audio.enabled ? '🔊 On' : '🔇 Off';
  };
};