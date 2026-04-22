OctoroitOS.Desktop = {
  // ... existing properties ...

  init() {
    this.renderIcons();
    this.setupContextMenu();
    this.setupWallpaper();
    this.setupStartButton();
  },

  setupWallpaper() {
    const savedWp = OctoroitOS.storage.get('octoroit_wallpaper');
    if (savedWp) {
      document.getElementById('desktop').style.backgroundImage = `url('${savedWp}')`;
    } else {
      document.getElementById('desktop').style.backgroundImage = `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')`;
    }
  },

  setupStartButton() {
    const btn = document.getElementById('start-btn');
    btn.addEventListener('click', () => {
      OctoroitOS.startMenu.toggle();
      btn.classList.toggle('active', OctoroitOS.startMenu.isOpen);
    });
  }
};