(() => {
  const root = document.querySelector('#reading-edition-info');
  const flow = document.querySelector('main.flow');
  const cover = document.querySelector('.page:has(h1)');
  if (!root || !cover) return;

  const info = JSON.parse(root.textContent);
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
  navigation.append(back, make('span', 'edition-nav-title', info.title));
  const originalDownload = document.querySelector('a[download][style*="fixed"][href*=".pdf"]');
  if (originalDownload) {
    const download = make('a', 'jc-btn jc-btn--secondary edition-download', '下载 PDF');
    download.href = originalDownload.href;
    download.download = originalDownload.download;
    navigation.append(download);
    originalDownload.classList.add('edition-original-download');
  }
  header.append(navigation);

  const opening = make('div', 'edition-cover');
  const copy = make('div', 'edition-copy');
  const title = make('div', 'edition-title', info.title);
  title.setAttribute('role', 'heading');
  title.setAttribute('aria-level', '1');
  const description = cover.querySelector('.cv2-sub, .cover-copy .subtitle, .subtitle, .sub')?.textContent.trim() || info.description;
  const note = cover.querySelector('.cv2-domain')?.textContent.trim();
  const begin = make('button', 'jc-btn jc-btn--primary jc-btn--lg edition-start', '开始阅读 ↓');
  begin.type = 'button';
  begin.addEventListener('click', () => {
    const next = document.querySelector('.rd-next');
    if (cover.classList.contains('current') && next && document.body.matches('.reader-flow, .reader-mode')) {
      next.click();
      return;
    }
    const target = flow || document.querySelectorAll('.page')[1];
    target?.scrollIntoView({block:'start'});
  });
  copy.append(title);
  if (description) copy.append(make('p', 'edition-description', description));
  copy.append(begin);
  if (note) copy.append(make('p', 'edition-note', note));
  const art = make('div', 'edition-art');
  art.setAttribute('aria-hidden', 'true');
  const mark = make('img', 'edition-mark');
  mark.src = new URL('logo-zh-white.png', assets).href;
  mark.alt = '';
  art.append(mark);
  opening.append(copy, art);
  cover.append(opening);
  cover.classList.add('edition-opening');

  if (!flow) document.body.classList.add('edition-fixed');
  document.body.classList.add('edition-reader');
  document.body.prepend(header);

  if (!flow) return;
  const chapterUrl = (hash) => {
    pageUrl.hash = hash;
    return pageUrl.href;
  };
  const revealChapter = (hash) => {
    const chapter = document.getElementById(hash.slice(1));
    if (!chapter || !flow.contains(chapter)) return;
    if (document.body.classList.contains('reader-flow')) document.querySelector('.rd-toggle')?.click();
    chapter.scrollIntoView({ block: 'start' });
    return chapter;
  };

  flow.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href^="#"]');
    const hash = anchor?.getAttribute('href');
    if (!hash || !revealChapter(hash)) return;
    event.preventDefault();
    history.pushState(null, '', chapterUrl(hash));
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (initialHash && revealChapter(initialHash)) history.replaceState(null, '', chapterUrl(initialHash));
  });
})();
