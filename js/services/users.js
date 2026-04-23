OctoroitOS.users = {
  current: null, isLocked: false, list: [], guestMode: false,
  init() {
    try {
      this.list = OctoroitOS.storage.get('sys:users') || [{username:'admin',pin:'1234',avatar:'👤',created:Date.now()}];
      const s = OctoroitOS.storage.get('sys:session') || {};
      this.current = s.user || null;
      this.isLocked = s.locked || false;
      this.guestMode = s.guest || false;
      console.log('[Users] Initialized:', this.current || 'No session');
    } catch(e) { console.error('[Users] Init failed:', e); this.list = [{username:'admin',pin:'1234',avatar:'👤',created:Date.now()}]; }
  },
  saveSession() { OctoroitOS.storage.set('sys:session', {user: this.current, locked: this.isLocked, guest: this.guestMode}); },
  authenticate(u, p) {
    console.log('[Auth] Attempt:', u);
    if (this.guestMode && u === 'guest') { this.current = 'guest'; this.isLocked = false; this.saveSession(); return true; }
    const user = this.list.find(x => x.username === u);
    if (user && user.pin === p) { this.current = u; this.isLocked = false; this.guestMode = false; this.saveSession(); console.log('[Auth] Success'); return true; }
    console.warn('[Auth] Failed');
    return false;
  },
  createUser(u, p, a = '👤') {
    u = u.toLowerCase().trim();
    if (!u || !p || this.list.find(x => x.username === u)) return false;
    this.list.push({username: u, pin: p, avatar: a, created: Date.now()});
    OctoroitOS.storage.set('sys:users', this.list);
    return true;
  },
  deleteUser(u) {
    if (u === 'admin') return false;
    this.list = this.list.filter(x => x.username !== u);
    OctoroitOS.storage.set('sys:users', this.list);
    Object.keys(OctoroitOS.storage.memory).forEach(k => { if (k.startsWith(`user:${u}:`)) delete OctoroitOS.storage.memory[k]; });
    OctoroitOS.storage._sync();
    return true;
  },
  lock() { if (!this.current) return; this.isLocked = true; this.saveSession(); this.showLockOverlay(); },
  logout() { if (this.guestMode) this.clearGuestData(); this.current = null; this.isLocked = false; this.guestMode = false; this.saveSession(); location.reload(); },
  startGuest() { this.current = 'guest'; this.guestMode = true; this.isLocked = false; this.saveSession(); this.hideAuthScreen(); OctoroitOS.bootDesktop(); },
  clearGuestData() { Object.keys(OctoroitOS.storage.memory).forEach(k => { if (k.startsWith('user:guest:')) delete OctoroitOS.storage.memory[k]; }); OctoroitOS.storage._sync(); },
  getNamespace() { return this.current ? `user:${this.current}` : 'user:guest'; },
  showLockOverlay() {
    const o = document.getElementById('auth-screen');
    o.classList.remove('hidden'); o.dataset.mode = 'lock';
    document.getElementById('auth-user-select').classList.add('hidden');
    document.getElementById('auth-form').classList.remove('hidden');
    document.getElementById('auth-create').classList.add('hidden');
    document.getElementById('auth-guest').classList.add('hidden');
    const u = this.list.find(x => x.username === this.current) || {username:'guest', avatar:'👻'};
    document.getElementById('auth-avatar-display').textContent = u.avatar;
    document.getElementById('auth-username-display').textContent = u.username;
    document.getElementById('auth-pin').value = '';
    document.getElementById('auth-pin').focus();
  },
  hideAuthScreen() { document.getElementById('auth-screen').classList.add('hidden'); }
};