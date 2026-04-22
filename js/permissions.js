OctoroitOS.permissions = {
  defaults: { fs: false, notify: false, clipboard: false, network: false },
  store: {},
  init() {
    this.store = OctoroitOS.storage.get('set:permissions') || {};
  },
  get(appId) {
    return { ...this.defaults, ...(this.store[appId] || {}) };
  },
  set(appId, perms) {
    this.store[appId] = { ...this.get(appId), ...perms };
    OctoroitOS.storage.set('set:permissions', this.store);
  },
  check(appId, perm) {
    return this.get(appId)[perm] === true;
  },
  request(appId, perm) {
    if (this.check(appId, perm)) return true;
    const grant = confirm(`⚠️ Permission Request\n\nApp: "${appId}"\nAccess: ${perm.toUpperCase()}\n\nAllow?`);
    if (grant) {
      this.set(appId, { [perm]: true });
      return true;
    }
    return false;
  },
  revoke(appId, perm) {
    const p = this.get(appId);
    p[perm] = false;
    this.set(appId, p);
  }
};