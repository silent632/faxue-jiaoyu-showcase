"""按 PDF 物理页导出全文及图像页。需要 Poppler。"""
import hashlib
import json
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parent.parent
sources = json.loads((root / "content/case-reading-sources.json").read_text())
destination = root / "public/case-text"
destination.mkdir(exist_ok=True)
for case_id, source in sources.items():
    pdf = root / "public/pdfs" / source["file"]
    fingerprint = hashlib.sha256(pdf.read_bytes()).hexdigest()
    if fingerprint != source["sha256"]:
        raise ValueError(f"{case_id} 原件指纹与台账不一致")
    transcript = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", str(pdf), "-"],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    ).stdout.decode("utf-8")
    pages = transcript.split("\f")
    if pages[-1] == "":
        pages.pop()
    if len(pages) != source["pages"]:
        raise ValueError(f"{case_id} 页数与台账不一致")
    for page_number, page in enumerate(pages, 1):
        if not page.strip():
            subprocess.run(
                ["pdftoppm", "-f", str(page_number), "-l", str(page_number), "-r", "150",
                 "-png", "-singlefile", str(pdf), str(destination / f"{case_id}-{page_number}")],
                check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            )
    (destination / f"{case_id}.json").write_text(
        json.dumps({"sha256": fingerprint, "pages": pages}, ensure_ascii=False, separators=(",", ":")) + "\n"
    )
print(f"完成 {len(sources)} 份逐页全文")
