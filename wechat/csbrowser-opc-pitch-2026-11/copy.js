const article = document.getElementById("article");
const status = document.getElementById("copy-status");
const imageOrigin = "https://jr-academy-omni.github.io/jr-ebooks-site/wechat/csbrowser-opc-pitch-2026-11/";
let statusTimer;

function announce(message) {
  clearTimeout(statusTimer);
  status.textContent = message;
  status.hidden = false;
  statusTimer = setTimeout(() => { status.hidden = true; }, 5500);
}

function copyWithEvent(html, plain) {
  const setClipboard = (event) => {
    event.preventDefault();
    if (html) event.clipboardData.setData("text/html", html);
    event.clipboardData.setData("text/plain", plain);
  };
  document.addEventListener("copy", setClipboard, { once: true });
  try {
    return document.execCommand("copy");
  } finally {
    document.removeEventListener("copy", setClipboard);
  }
}

async function copy(html, plain) {
  try {
    if (html) {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      })]);
    } else {
      await navigator.clipboard.writeText(plain);
    }
    return true;
  } catch {
    try {
      return copyWithEvent(html, plain);
    } catch {
      return false;
    }
  }
}

document.getElementById("copy-article").addEventListener("click", async () => {
  const markup = article.cloneNode(true);
  for (const image of markup.querySelectorAll("img")) {
    image.src = new URL(image.getAttribute("src"), imageOrigin).href;
    image.removeAttribute("width");
    image.removeAttribute("height");
  }
  if (await copy(markup.innerHTML.trim(), article.innerText.trim())) {
    announce("图文正文已复制，粘贴到公众号编辑器即可。");
    return;
  }

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(article);
  selection.removeAllRanges();
  selection.addRange(range);
  announce("正文已选中，请按 Ctrl+C 或 ⌘C 复制。");
});

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const field = document.getElementById(button.dataset.copy);
    if (await copy(null, field.textContent.trim())) {
      announce("已复制。");
      return;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(field);
    selection.removeAllRanges();
    selection.addRange(range);
    announce("内容已选中，请按 Ctrl+C 或 ⌘C 复制。");
  });
}
