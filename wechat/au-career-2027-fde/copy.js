const status = document.querySelector('#status');
const formats = {
  H2: 'margin:28px 0 12px;font-size:21px;line-height:1.55;color:#215244;font-weight:700;',
  H3: 'margin:20px 0 8px;font-size:17px;line-height:1.6;color:#182d28;font-weight:700;',
  P: 'margin:0 0 15px;font-size:16px;line-height:1.9;color:#182d28;',
  IMG: 'display:block;width:100%;max-width:100%;height:auto;margin:0 auto;',
  BLOCKQUOTE: 'border-left:3px solid #8aa28c;background:#f3f7f2;padding:12px 16px;color:#215244;margin:21px 0;',
  FIGURE: 'margin:19px 0 23px;',
  FIGCAPTION: 'margin:6px 0 0;color:#4d625c;font-size:13px;line-height:1.65;',
};

function formattedArticle(article) {
  const copy = document.createElement('section');
  copy.style.cssText = 'font-size:16px;line-height:1.9;color:#182d28;overflow-wrap:break-word;';
  copy.innerHTML = article.innerHTML;
  for (const element of copy.querySelectorAll('*')) {
    const style = formats[element.classList.contains('source') ? 'FIGCAPTION' : element.tagName];
    if (style) element.style.cssText = style;
    if (element.tagName === 'IMG') {
      element.src = element.dataset.online || new URL(element.getAttribute('src'), window.location.href).href;
      element.removeAttribute('data-online');
    }
    if (element.tagName === 'FIGURE' || element.tagName === 'FIGCAPTION' || element.tagName === 'BLOCKQUOTE') {
      const replacement = document.createElement(element.tagName === 'FIGCAPTION' ? 'p' : 'section');
      replacement.style.cssText = element.style.cssText;
      replacement.append(...element.childNodes);
      element.replaceWith(replacement);
    }
    element.removeAttribute('class');
  }
  return copy.outerHTML;
}

function copyWithEvent(plain, html) {
  const input = document.createElement('textarea');
  input.value = plain;
  input.style.cssText = 'position:fixed;opacity:0;pointer-events:none;top:0;left:0;';
  input.setAttribute('readonly', '');
  const previousFocus = document.activeElement;
  document.body.append(input);
  input.select();
  const handler = (event) => {
    if (!event.clipboardData) return;
    event.clipboardData.setData('text/plain', plain);
    if (html) event.clipboardData.setData('text/html', html);
    event.preventDefault();
  };
  document.addEventListener('copy', handler);
  try {
    return document.execCommand('copy');
  } finally {
    document.removeEventListener('copy', handler);
    input.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}

async function copyContent(event) {
  const button = event.currentTarget;
  const target = document.getElementById(button.dataset.copy);
  const isArticle = target.id === 'article';
  const plain = target.innerText.trim();
  const html = isArticle ? formattedArticle(target) : '';
  let copied = false;
  try {
    if (isArticle) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })]);
    } else {
      await navigator.clipboard.writeText(plain);
    }
    copied = true;
  } catch {
    try { copied = copyWithEvent(plain, html); } catch {}
  }
  if (copied) {
    status.textContent = isArticle ? '已复制正文、排版和在线配图。' : button.textContent.slice(2) + '已复制。';
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(target);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  status.textContent = '已选中内容，请按 Ctrl+C 或 ⌘C 复制。';
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', copyContent);
}
