(() => {
  const RELEASE = '1.1.31';
  const setVersion = () => {
    const el = document.getElementById('app-version');
    if (el) el.textContent = RELEASE;
  };
  setVersion();
  document.addEventListener('DOMContentLoaded', setVersion);
  window.addEventListener('load', setVersion);
})();
