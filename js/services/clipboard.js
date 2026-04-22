OctoroitOS.clipboard = {
  text: '',
  files: [],
  copyText(t) { this.text = t; this.files = []; OctoroitOS.notify('Copied to clipboard', 'info'); },
  copyFiles(paths) { this.files = Array.isArray(paths) ? paths : [paths]; this.text = ''; OctoroitOS.notify(`${this.files.length} file(s) copied`, 'info'); },
  paste() { return { text: this.text, files: [...this.files] }; },
  init() {
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const sel = window.getSelection().toString();
        if (sel) this.copyText(sel);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const data = this.paste();
        if (data.text) document.execCommand('insertText', false, data.text);
      }
    });
  }
};