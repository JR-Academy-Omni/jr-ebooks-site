(() => {
  const a4Width = 210 * 96 / 25.4;
  const root = document.documentElement;
  const fitPages = () => {
    const scale = Math.min(1, (root.clientWidth - 24) / a4Width);
    root.style.setProperty('--ebook-page-scale', scale);
  };
  fitPages();
  addEventListener('resize', fitPages);
})();
