#!/usr/bin/env python3
"""Prepare the published ebook shelf for its canonical, slashless URLs."""

from __future__ import annotations

from html import escape, unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import quote, urljoin, urlsplit


ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://jracademy.ai/ebooks"
TITLE_PATTERN = re.compile(r"(<title>.*?</title>)", re.IGNORECASE | re.DOTALL)
H1_PATTERN = re.compile(r"<h1(?:\s|>)", re.IGNORECASE)
ATTRIBUTE_PATTERN = re.compile(
    r"\s+([^\s=/>]+)(?:\s*=\s*(\"[^\"]*\"|'[^']*'|[^\s>]+))?"
)
RESOURCE_ATTRIBUTES = {
    "a": "href",
    "img": "src",
    "link": "href",
    "script": "src",
}
READER_LAYOUT = f"""<!-- ebook-reader-layout -->
<link rel="stylesheet" href="{BASE_URL}/theme/reader-layout.css" />
<script defer src="{BASE_URL}/theme/reader-layout.js"></script>
"""


def published_index_files() -> list[Path]:
    return [ROOT / "index.html", *sorted(path.with_name("index.html") for path in ROOT.glob("*/meta.json"))]


def add_canonical(path: Path, html: str) -> str:
    if re.search(r'<link[^>]+rel=["\']canonical["\']', html, re.IGNORECASE):
        return html
    canonical = BASE_URL if path.parent == ROOT else f"{BASE_URL}/{quote(path.parent.name)}"
    return TITLE_PATTERN.sub(rf'\1\n<link rel="canonical" href="{canonical}" />', html, count=1)


def promote_cover_title(html: str) -> str:
    if H1_PATTERN.search(html):
        return html
    patterns = [
        (re.compile(r'<div class="cv2-title">(.*?)</div>', re.DOTALL), "margin:3mm 0 0"),
        (re.compile(r'<div class="wp-cover-title">(.*?)</div>', re.DOTALL), "margin:0"),
    ]
    for pattern, style in patterns:
        if pattern.search(html):
            return pattern.sub(
                rf'<h1 class="{("cv2-title" if "cv2" in pattern.pattern else "wp-cover-title")}" style="{style}">\1</h1>',
                html,
                count=1,
            )
    raise ValueError("page has no H1 or recognized visible cover title")


class EbookMarkup(HTMLParser):
    def __init__(self, html: str) -> None:
        super().__init__(convert_charrefs=False)
        self.has_base = False
        self.has_viewport = False
        self.has_a4_theme = False
        self.resource_tags: list[tuple[int, str, str]] = []
        self.line_offsets = [0, *(match.end() for match in re.finditer("\n", html))]
        self.feed(html)
        self.close()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        self.has_base |= tag == "base" and bool(attributes.get("href"))
        self.has_viewport |= tag == "meta" and (attributes.get("name") or "").lower() == "viewport"
        if tag == "link" and (attributes.get("href") or "").endswith("/ebook.css"):
            self.has_a4_theme = True

        attribute = RESOURCE_ATTRIBUTES.get(tag)
        if not attribute or not attributes.get(attribute):
            return
        line, column = self.getpos()
        self.resource_tags.append((self.line_offsets[line - 1] + column, self.get_starttag_text(), attribute))


def fix_reader_resources(path: Path, html: str) -> str:
    markup = EbookMarkup(html)
    if markup.has_base:
        return html

    book_directory = f"{BASE_URL}/{quote(path.parent.name)}/"
    changes = []
    for offset, tag, attribute in markup.resource_tags:
        for match in ATTRIBUTE_PATTERN.finditer(tag):
            name, raw_value = match.groups()
            if name.lower() != attribute or not raw_value:
                continue
            value = unescape(raw_value.strip("\"'")).strip()
            parts = urlsplit(value)
            if parts.path and not parts.scheme and not value.startswith("/"):
                target = escape(urljoin(book_directory, value), quote=True)
                start, end = match.span(2)
                changes.append((offset + start, offset + end, f'"{target}"'))
            break
    for start, end, target in reversed(changes):
        html = html[:start] + target + html[end:]

    if markup.has_a4_theme and "<!-- ebook-reader-layout -->" not in html:
        layout = READER_LAYOUT
        if not markup.has_viewport:
            layout = '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' + layout
        html = re.sub(r"</head\s*>", lambda match: layout + match.group(), html, count=1, flags=re.IGNORECASE)
    return html


def add_reading_edition(path: Path, html: str) -> str:
    html = re.sub(
        r'<div class="cv2-strip">.*?</div>',
        lambda match: match.group().replace("JIANGREN.COM.AU", urlsplit(BASE_URL).hostname.upper()),
        html,
        flags=re.DOTALL,
    )
    cover_start = re.search(
        r'<section class="page cover2(?: study-guide-cover| ebook-draft-cover(?: course-selection-cover)?)?">',
        html,
    )
    if cover_start:
        cover_end = html.index("</section>", cover_start.end())
        content = html[cover_start.end():cover_end]
        if 'class="cv2-title"' in content and 'class="cv2-body"' in content:
            classes = "page cover2 ebook-draft-cover"
            if path.parent.name.endswith("-course-selection-guide"):
                classes += " course-selection-cover"
            content = re.sub(
                r'(<div class="cv2-head">\s*<img\s+src=")[^"]+',
                lambda match: match.group(1) + f"{BASE_URL}/theme/assets/logo/logo-zh-full.svg",
                content,
                count=1,
            )
            content = re.sub(
                r'(<h1 class="cv2-title"[^>]*>.*?<br\s*/?>)([^<]+)(</h1>)',
                r'\1<span class="cv2-marker">\2</span>\3',
                content,
                count=1,
                flags=re.DOTALL,
            )
            html = html[:cover_start.start()] + f'<section class="{classes}">' + content + html[cover_end:]
    metadata = json.loads(path.with_name("meta.json").read_text(encoding="utf-8"))
    info = json.dumps({
        "title": metadata.get("title", path.parent.name),
        "description": metadata.get("subtitle") or metadata.get("description") or "",
    }, ensure_ascii=False).replace("<", "\\u003c")
    edition = f'''<!-- reading-edition:start -->
<link rel="stylesheet" href="{BASE_URL}/theme/tokens/jr-craft.css" />
<link rel="stylesheet" href="{BASE_URL}/theme/styles/jr-craft.css" />
<link rel="stylesheet" href="{BASE_URL}/theme/reading-edition.css" />
<script type="application/json" id="reading-edition-info">{info}</script>
<script defer src="{BASE_URL}/theme/reading-edition.js"></script>
<!-- reading-edition:end -->
'''
    html = re.sub(r"<!-- reading-edition:start -->.*?<!-- reading-edition:end -->\s*", "", html, flags=re.DOTALL)
    if not re.search(r'<link\b[^>]*\brel=["\']icon["\']', html, re.IGNORECASE):
        edition = f'<link rel="icon" type="image/svg+xml" href="{BASE_URL}/theme/assets/logo/jr-box.svg" />\n' + edition
    return re.sub(r"</head\s*>", lambda match: edition + match.group(), html, count=1, flags=re.IGNORECASE)


def main() -> None:
    files = published_index_files()
    for path in files:
        html = path.read_text(encoding="utf-8")
        html = promote_cover_title(add_canonical(path, html))
        if path.parent != ROOT:
            html = add_reading_edition(path, fix_reader_resources(path, html))
        path.write_text(html, encoding="utf-8")

    for path in files:
        html = path.read_text(encoding="utf-8")
        canonical_count = len(re.findall(r'<link[^>]+rel=["\']canonical["\']', html, re.IGNORECASE))
        h1_count = len(H1_PATTERN.findall(html))
        if canonical_count != 1 or h1_count != 1:
            raise ValueError(f"{path}: canonical={canonical_count}, h1={h1_count}")

    print(f"Prepared {len(files)} ebook index pages: one canonical and one H1 each")


if __name__ == "__main__":
    main()
