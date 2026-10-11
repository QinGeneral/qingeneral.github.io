(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'qingeneral-theme';
  const validTheme = value => ['light', 'dark'].includes(value) ? value : null;
  let preference = null;
  try { preference = validTheme(localStorage.getItem(storageKey)); } catch {}

  function apply() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151a17' : '#f8f7f4');
    const button = document.getElementById('theme-toggle');
    if (button) {
      const label = theme === 'dark' ? '切换到日间模式' : '切换到夜间模式';
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = label;
      button.hidden = false;
    }
  }

  // Runs before the stylesheet to avoid flashing the wrong theme on navigation.
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, preference); } catch {}
      apply();
    });
  }, { once: true });
  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      preference = validTheme(event.newValue);
      apply();
    }
  });
})();
