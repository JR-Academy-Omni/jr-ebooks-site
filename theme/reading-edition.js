(() => {
  const info = document.querySelector('#reading-edition-info');
  if (!info) return;
  const flow = document.querySelector('main.flow');
  const contents = flow?.querySelector(':scope > .book-toc');
  const pageUrl = new URL(location.href);
  const initialHash = pageUrl.hash;
  const assets = new URL('./assets/logo/', document.currentScript.src);
  const shelf = new URL('../../..', assets);
  shelf.pathname = shelf.pathname.replace(/\/$/, '');
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const header = make('header', 'edition-header');
  const navigation = make('nav', 'edition-nav');
  navigation.setAttribute('aria-label', '电子书导航');
  const back = make('a', 'edition-shelf');
  back.href = shelf.href;
  const logo = make('img', 'edition-logo');
  logo.src = new URL('logo-zh-full.svg', assets).href;
  logo.alt = '匠人学院';
  back.append(logo, make('span', '', '‹ 返回书架'));
  const actions = make('div', 'edition-nav-actions');
  navigation.append(back, make('span', 'edition-nav-title', JSON.parse(info.textContent).title), actions);
  const originalDownload = document.querySelector('a[download][style*="fixed"][href*=".pdf"]');
  if (originalDownload) {
    const download = make('a', 'jc-btn jc-btn--secondary edition-download', '下载 PDF');
    download.href = originalDownload.href;
    download.download = originalDownload.download;
    actions.append(download);
    originalDownload.classList.add('edition-original-download');
  }
  header.append(navigation);
  document.body.classList.add('edition-reader');
  document.body.prepend(header);

  if (!flow) return;
  document.body.classList.add('edition-flow');
  flow.tabIndex = 0;
  const paperWidth = 210 * 96 / 25.4;
  const paperHeight = 297 * 96 / 25.4;
  const fitPaper = () => {
    const widthScale = (document.documentElement.clientWidth - 24) / paperWidth;
    const heightScale = (innerHeight - 140) / paperHeight;
    document.documentElement.style.setProperty('--a4-screen-width-scale', Math.min(1, widthScale));
    document.documentElement.style.setProperty('--a4-screen-scale', Math.min(1, widthScale, heightScale));
  };
  fitPaper();
  addEventListener('resize', fitPaper);

  const getPages = () => [...document.querySelectorAll('body > .page, main.flow > .book-toc, main.flow > section.ch')];
  const showPage = (page, target = page) => {
    if (document.body.classList.contains('reader-flow')) {
      const pages = getPages();
      const difference = pages.indexOf(page) - pages.findIndex((item) => item.classList.contains('current'));
      const control = document.querySelector(difference < 0 ? '.rd-prev' : '.rd-next');
      for (let step = 0; step < Math.abs(difference); step++) control?.click();
    } else {
      target.scrollIntoView({ block: 'start' });
    }
  };
  const getChapter = (target) => target?.closest('main.flow > section.ch, main.flow > .book-toc');
  const openChapter = (hash) => {
    const target = document.getElementById(hash.slice(1));
    const chapter = getChapter(target);
    if (!chapter) return false;
    showPage(chapter, target);
    return true;
  };

  if (contents) {
    const jumpToContents = make('button', 'edition-toc-button', '目录');
    jumpToContents.type = 'button';
    contents.tabIndex = -1;
    jumpToContents.addEventListener('click', () => {
      showPage(contents);
      contents.focus({ preventScroll: true });
    });
    actions.prepend(jumpToContents);

    const pages = getPages();
    let hasPageNumbers = false;
    for (const link of contents.querySelectorAll(':scope > a[href^="#"]')) {
      const chapter = getChapter(document.getElementById(link.hash.slice(1)));
      const index = pages.indexOf(chapter);
      if (index === -1) continue;
      const folio = make('span', 'edition-toc-page', String(index + 1).padStart(2, '0'));
      folio.setAttribute('aria-label', `第 ${index + 1} 页`);
      link.append(folio);
      hasPageNumbers = true;
    }
    if (hasPageNumbers) {
      contents.querySelector(':scope > h2')?.append(make('span', 'edition-toc-label', '页码'));
    }
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = event.target.closest('main.flow a[href^="#"], .ebook-draft-cover .cv2-chips a[href^="#"]')?.getAttribute('href');
    if (!hash || !openChapter(hash)) return;
    event.preventDefault();
    pageUrl.hash = hash;
    history.replaceState(null, '', pageUrl);
  });

  new MutationObserver((records) => {
    if (records.some(({target}) => target.parentElement === flow && target.classList.contains('current'))) flow.scrollTop = 0;
  }).observe(flow, { subtree: true, attributes: true, attributeFilter: ['class'] });

  document.addEventListener('DOMContentLoaded', () => {
    if (!initialHash || !openChapter(initialHash)) return;
    pageUrl.hash = initialHash;
    history.replaceState(null, '', pageUrl);
  });
})();
