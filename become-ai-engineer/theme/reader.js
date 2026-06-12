// jr-ebooks 左右翻页阅读器 — 所有 A4 书（index.html）公用
// 行为：一屏一页缩放至清晰大小；← → / 点按钮 / 触屏滑动翻页；#p3 深链；可切回滚动模式
// 渲染安全：playwright（navigator.webdriver=true）下不启用，render.mjs 的 overflow 检测和 PDF 打印不受影响
(() => {
  if (navigator.webdriver) return;
  if (document.querySelector('main.flow')) return; // flow 书：浏览器滚动读，翻页看 PDF
  const pages = [...document.querySelectorAll('.page')];
  if (pages.length < 2) return;

  let cur = 0;
  let flip = true;

  // —— 控制条 ——
  const bar = document.createElement('div');
  bar.className = 'reader-bar';
  bar.innerHTML = `
    <button class="rd-prev" title="上一页（←）">‹</button>
    <span class="reader-counter"></span>
    <button class="rd-next" title="下一页（→）">›</button>
    <span class="rd-sep"></span>
    <button class="rd-toggle" title="切换阅读模式">滚动</button>`;
  document.body.appendChild(bar);
  const counter = bar.querySelector('.reader-counter');
  const toggleBtn = bar.querySelector('.rd-toggle');

  function fit() {
    if (!flip) return;
    const p = pages[cur];
    const s = Math.min((innerWidth - 48) / p.offsetWidth, (innerHeight - 110) / p.offsetHeight, 1.5);
    document.documentElement.style.setProperty('--reader-scale', s);
  }

  function show(i) {
    cur = Math.max(0, Math.min(i, pages.length - 1));
    pages.forEach((p, k) => p.classList.toggle('current', k === cur));
    counter.textContent = `${cur + 1} / ${pages.length}`;
    history.replaceState(null, '', '#p' + (cur + 1));
    fit();
  }

  function setMode(toFlip) {
    flip = toFlip;
    document.body.classList.toggle('reader-mode', flip);
    toggleBtn.textContent = flip ? '滚动' : '翻页';
    if (flip) { show(cur); }
    else { pages[cur] && pages[cur].scrollIntoView({ block: 'start' }); }
  }

  bar.querySelector('.rd-prev').addEventListener('click', () => flip && show(cur - 1));
  bar.querySelector('.rd-next').addEventListener('click', () => flip && show(cur + 1));
  toggleBtn.addEventListener('click', () => setMode(!flip));

  addEventListener('keydown', (e) => {
    if (!flip) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); show(cur + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(cur - 1); }
  });

  let tx = null;
  addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (!flip || tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 44) show(cur + (dx < 0 ? 1 : -1));
    tx = null;
  }, { passive: true });

  addEventListener('resize', fit);

  const m = location.hash.match(/^#p(\d+)$/);
  document.body.classList.add('reader-mode');
  show(m ? parseInt(m[1], 10) - 1 : 0);
})();
