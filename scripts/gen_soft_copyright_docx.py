# -*- coding: utf-8 -*-
"""Generate soft著 source code Word: first 1500 + last 1500 lines."""
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
OUT = ROOT / "文档" / "软著源代码_数字孪生平台_V1.0.docx"

SOFTWARE_NAME = "数字孪生平台"
VERSION = "V1.0"
HEAD_N = 1500
TAIL_N = 1500

EXTS = {".ts", ".tsx", ".js", ".jsx", ".css"}
SKIP_PARTS = {"node_modules", "dist", "__pycache__"}


def collect_files():
    files = []
    for p in sorted(SRC.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() not in EXTS:
            continue
        if p.name.endswith(".d.ts"):
            continue
        if any(part in SKIP_PARTS for part in p.parts):
            continue
        files.append(p)
    return files


def read_lines(path: Path):
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = path.read_text(encoding="gbk", errors="replace")
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    if lines and lines[-1] == "":
        lines = lines[:-1]
    return lines


def build_all_lines(files):
    all_lines = []
    for f in files:
        rel = f.relative_to(ROOT).as_posix()
        all_lines.append(f"// ===== FILE: {rel} =====")
        all_lines.extend(read_lines(f))
        all_lines.append("")
    return all_lines


def set_run_font(run, name="Courier New", size=9, east_asia="宋体"):
    run.font.name = name
    run.font.size = Pt(size)
    r = run._element
    rPr = r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.insert(0, rFonts)
    rFonts.set(qn("w:ascii"), name)
    rFonts.set(qn("w:hAnsi"), name)
    rFonts.set(qn("w:eastAsia"), east_asia)
    rFonts.set(qn("w:cs"), name)


def add_page_number(paragraph):
    run = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)
    set_run_font(run, size=9)


def set_header_footer(doc):
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(2.0)
    section.right_margin = Cm(2.0)
    section.top_margin = Cm(2.2)
    section.bottom_margin = Cm(2.0)
    section.header_distance = Cm(1.2)
    section.footer_distance = Cm(1.2)

    header = section.header
    header.is_linked_to_previous = False
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = hp.add_run(f"{SOFTWARE_NAME} {VERSION} 源代码")
    set_run_font(run, name="宋体", size=9, east_asia="宋体")

    footer = section.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = fp.add_run("第 ")
    set_run_font(r1, name="宋体", size=9, east_asia="宋体")
    add_page_number(fp)
    r2 = fp.add_run(" 页")
    set_run_font(r2, name="宋体", size=9, east_asia="宋体")


def add_code_line(doc, text):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(0)
    pf.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    pf.line_spacing = Pt(14)

    safe = "".join(ch if (ord(ch) >= 32 or ch in "\t") else " " for ch in text)
    if len(safe) > 200:
        safe = safe[:197] + "..."

    run = p.add_run(safe)
    set_run_font(run, name="Courier New", size=9, east_asia="宋体")
    return p


def main():
    files = collect_files()
    all_lines = build_all_lines(files)
    total = len(all_lines)
    print(f"files={len(files)} total_lines={total}")

    if total <= HEAD_N + TAIL_N:
        selected = list(all_lines)
        print("Note: total <= 3000, using all lines")
        split = False
    else:
        selected = list(all_lines[:HEAD_N]) + [None] + list(all_lines[-TAIL_N:])
        split = True

    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Courier New"
    style.font.size = Pt(9)
    style._element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")

    set_header_footer(doc)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tr = title.add_run(
        f"{SOFTWARE_NAME} {VERSION}\n源代码（前{HEAD_N}行 + 后{TAIL_N}行）"
    )
    set_run_font(tr, name="黑体", size=14, east_asia="黑体")
    title.paragraph_format.space_after = Pt(12)

    meta = doc.add_paragraph()
    mr = meta.add_run(
        f"摘取说明：按 src 目录源文件路径排序拼接后，提取全文前 {HEAD_N} 行与后 {TAIL_N} 行，"
        f"合计 {HEAD_N + TAIL_N} 行。全文合计 {total} 行，源文件 {len(files)} 个。"
        "仅包含 .ts/.tsx/.js/.jsx/.css。"
    )
    set_run_font(mr, name="宋体", size=9, east_asia="宋体")
    meta.paragraph_format.space_after = Pt(12)

    sec1 = doc.add_paragraph()
    s1 = sec1.add_run(f"【前 {HEAD_N} 行】")
    set_run_font(s1, name="黑体", size=11, east_asia="黑体")

    for item in selected:
        if item is None:
            doc.add_page_break()
            sec2 = doc.add_paragraph()
            s2 = sec2.add_run(f"【后 {TAIL_N} 行】")
            set_run_font(s2, name="黑体", size=11, east_asia="黑体")
            continue
        add_code_line(doc, item)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUT))
    print(f"saved={OUT}")
    if split:
        print(f"head={HEAD_N} tail={TAIL_N} selected_code_lines={HEAD_N + TAIL_N}")
    else:
        print(f"selected_code_lines={total}")


if __name__ == "__main__":
    main()
