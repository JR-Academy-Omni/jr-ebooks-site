#!/usr/bin/env python3
"""Keep every published ebook page self-canonical with one visible H1."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://jiangren.com.au/ebooks"
TITLE_PATTERN = re.compile(r"(<title>.*?</title>)", re.IGNORECASE | re.DOTALL)
H1_PATTERN = re.compile(r"<h1(?:\s|>)", re.IGNORECASE)


def published_index_files() -> list[Path]:
    return [ROOT / "index.html", *sorted(ROOT.glob("*/index.html"))]


def add_canonical(path: Path, html: str) -> str:
    if re.search(r'<link[^>]+rel=["\']canonical["\']', html, re.IGNORECASE):
        return html
    canonical = BASE_URL if path.parent == ROOT else f"{BASE_URL}/{path.parent.name}"
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


def main() -> None:
    files = published_index_files()
    for path in files:
        html = path.read_text(encoding="utf-8")
        html = promote_cover_title(add_canonical(path, html))
        path.write_text(html, encoding="utf-8")

    for path in files:
        html = path.read_text(encoding="utf-8")
        canonical_count = len(re.findall(r'<link[^>]+rel=["\']canonical["\']', html, re.IGNORECASE))
        h1_count = len(H1_PATTERN.findall(html))
        if canonical_count != 1 or h1_count != 1:
            raise ValueError(f"{path}: canonical={canonical_count}, h1={h1_count}")

    print(f"Verified {len(files)} ebook index pages: one canonical and one H1 each")


if __name__ == "__main__":
    main()
