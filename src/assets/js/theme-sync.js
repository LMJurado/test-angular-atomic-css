(() => {
  const storageKey = 'plataforma-ova-theme';

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  };

  applyTheme(localStorage.getItem(storageKey));
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey) {
      applyTheme(event.newValue);
    }
  });
})();
