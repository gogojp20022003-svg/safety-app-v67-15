"""article.md から、noteへコピペするためのプレビューHTML（article.html）を作る。
実行: python3 src/build_html.py
画像はnoteへ直接貼れないため「[図解] ファイル名」の目印に置き換える。
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "article.md"
OUT = ROOT / "article.html"


def inline(text: str) -> str:
    text = html.escape(text, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


def convert(md: str) -> str:
    out, lines, i = [], md.splitlines(), 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            i += 1
            buf = []
            while i < len(lines) and not lines[i].startswith("```"):
                buf.append(html.escape(lines[i], quote=False))
                i += 1
            out.append("<pre><code>" + "\n".join(buf) + "</code></pre>")
        elif m := re.match(r"!\[(.*?)\]\((.*?)\)", line):
            out.append(f'<p class="fig">[図解] {html.escape(Path(m[2]).name)}（{html.escape(m[1])}）</p>')
        elif m := re.match(r"(#{1,3}) (.*)", line):
            level = len(m[1])
            out.append(f"<h{level}>{inline(m[2])}</h{level}>")
        elif line.strip() == "---":
            out.append("<hr>")
        elif line.startswith("> "):
            out.append(f"<blockquote>{inline(line[2:])}</blockquote>")
        elif line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip("|").split("|")]
                if not all(re.fullmatch(r"-+", c) for c in cells):
                    rows.append(cells)
                i += 1
            i -= 1
            head = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f"<table><tr>{head}</tr>{body}</table>")
        elif re.match(r"(- |\d+\. )", line):
            tag = "ol" if line[0].isdigit() else "ul"
            items = []
            while i < len(lines) and re.match(r"(- |\d+\. )", lines[i]):
                items.append("<li>" + inline(re.sub(r"^(- |\d+\. )", "", lines[i])) + "</li>")
                i += 1
            i -= 1
            out.append(f"<{tag}>{''.join(items)}</{tag}>")
        elif line.strip():
            out.append(f"<p>{inline(line)}</p>")
        i += 1
    return "\n".join(out)


TEMPLATE = """<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>note下書きプレビュー</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
<style>
body {{ font-family: "Noto Sans JP", sans-serif; max-width: 680px; margin: 0 auto; padding: 24px 16px 80px; line-height: 1.9; color: #222; background: #fff; }}
h1 {{ font-size: 1.6em; line-height: 1.4; }} h2 {{ margin-top: 2em; border-left: 6px solid #6d5dfc; padding-left: 10px; }} h3 {{ margin-top: 1.6em; }}
pre {{ background: #f5f5f7; padding: 14px; white-space: pre-wrap; border-radius: 8px; }}
blockquote {{ border-left: 4px solid #ccc; margin: 1em 0; padding: 4px 14px; color: #444; }}
table {{ border-collapse: collapse; width: 100%; }} th, td {{ border: 1px solid #ddd; padding: 6px 8px; font-size: .92em; }}
.fig {{ background: #fff7e6; border: 2px dashed #ef7d1a; padding: 10px; text-align: center; font-weight: 700; color: #b45309; }}
</style></head><body>
{body}
</body></html>
"""

IMAGES_OUT = ROOT / "images.html"


def image_list(md: str) -> str:
    """本文に出てくる順に画像を並べた、保存用ページの本文を作る。"""
    items = ['<h1>画像一覧（本文の順）</h1>',
             '<p>スマホは画像を長押し→保存。PCは「保存」リンクから。見出し画像は一番上の 00_eyecatch.png です。</p>',
             '<figure><img src="images/00_eyecatch.png" alt=""><figcaption>00_eyecatch.png（見出し画像）'
             ' <a href="images/00_eyecatch.png" download>保存</a></figcaption></figure>']
    for alt, src in re.findall(r"!\[(.*?)\]\((.*?)\)", md):
        name = html.escape(Path(src).name)
        items.append(f'<figure><img src="{html.escape(src)}" alt="">'
                     f'<figcaption>{name}（{html.escape(alt)}） <a href="{html.escape(src)}" download>保存</a></figcaption></figure>')
    return "\n".join(items)


if __name__ == "__main__":
    md = SRC.read_text(encoding="utf-8")
    OUT.write_text(TEMPLATE.format(body=convert(md)), encoding="utf-8")
    print("wrote", OUT)
    IMAGES_OUT.write_text(TEMPLATE.format(body=image_list(md)).replace(
        "</style>", "img {{ width: 100%; border-radius: 8px; }} figure {{ margin: 0 0 28px; }} figcaption {{ font-size: .9em; color: #555; }}</style>".replace("{{", "{").replace("}}", "}")), encoding="utf-8")
    print("wrote", IMAGES_OUT)
