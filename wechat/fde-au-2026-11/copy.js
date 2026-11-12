const article = document.querySelector('#wechat-body');
const status = document.querySelector('#copy-status');

const styleByTag = {
  H2: 'margin:30px 0 14px;font-size:21px;line-height:1.5;color:#1b4849;font-weight:700;',
  P: 'margin:0 0 16px;font-size:16px;line-height:1.85;color:#182327;',
  STRONG: 'font-weight:700;color:#142f31;',
  FIGURE: 'margin:16px 0 22px;',
  IMG: 'display:block;width:100%;max-width:100%;height:auto;margin:0 auto 6px;',
  FIGCAPTION: 'display:block;margin:6px 0 0;color:#586a66;font-size:12px;line-height:1.6;',
  FOOTER: 'margin:24px 0 0;color:#586a66;font-size:12px;line-height:1.6;',
};

function formatArticle() {
  const content = article.cloneNode(true);
  content.removeAttribute('id');
  content.setAttribute('style', 'font-size:16px;line-height:1.85;color:#182327;overflow-wrap:break-word;');
  for (const element of content.querySelectorAll('*')) {
    const style = styleByTag[element.tagName];
    if (style) element.setAttribute('style', style);
    if (element.tagName === 'IMG') element.src = new URL(element.getAttribute('src'), document.baseURI).href;
  }
  for (const link of content.querySelectorAll('a')) link.replaceWith(...link.childNodes);
  for (const figure of content.querySelectorAll('figure')) {
    const group = document.createElement('section');
    group.setAttribute('style', styleByTag.FIGURE);
    group.append(...figure.childNodes);
    figure.replaceWith(group);
  }
  for (const caption of content.querySelectorAll('figcaption, footer')) {
    const paragraph = document.createElement('p');
    paragraph.setAttribute('style', styleByTag[caption.tagName]);
    paragraph.append(...caption.childNodes);
    caption.replaceWith(paragraph);
  }
  return content.outerHTML;
}

function fallbackCopy(plain, html) {
  const input = document.createElement('textarea');
  const active = document.activeElement;
  input.value = plain;
  input.setAttribute('readonly', '');
  input.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none;';
  document.body.append(input);
  input.select();
  const setClipboard = (event) => {
    if (!event.clipboardData) return;
    event.clipboardData.setData('text/plain', plain);
    if (html) event.clipboardData.setData('text/html', html);
    event.preventDefault();
  };
  document.addEventListener('copy', setClipboard);
  try {
    return document.execCommand('copy');
  } finally {
    document.removeEventListener('copy', setClipboard);
    input.remove();
    active?.focus({preventScroll:true});
  }
}

function selectText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

document.querySelector('#copy-body').addEventListener('click', async () => {
  const plain = article.innerText.trim();
  const html = formatArticle();
  let copied = false;
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], {type:'text/html'}),
      'text/plain': new Blob([plain], {type:'text/plain'}),
    })]);
    copied = true;
  } catch {
    try { copied = fallbackCopy(plain, html); } catch {}
  }
  if (copied) {
    status.textContent = '已复制正文和配图。粘贴到公众号编辑器后，可在预览里确认图片。';
  } else {
    selectText(article);
    status.textContent = '已选中正文，请按 Ctrl+C 或 ⌘C 复制。';
  }
});

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const field = document.querySelector(button.dataset.copy);
    const value = field.innerText.trim();
    let copied = false;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch {
      try { copied = fallbackCopy(value); } catch {}
    }
    if (copied) {
      status.textContent = button.textContent.replace('复制', '') + '已复制。';
    } else {
      selectText(field);
      status.textContent = '已选中文本，请按 Ctrl+C 或 ⌘C 复制。';
    }
  });
}
