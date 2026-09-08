#!/usr/bin/env python3
"""只生成字段核查候选和原文证据，不直接修改案例数据。需要 Poppler pdftotext。"""
import hashlib
import json
import re
import subprocess
import sys
import unicodedata
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIGITS = dict(zip("〇零○ＯO一二三四五六七八九", "00000123456789"))
DATE_PATTERN = r"([〇零○ＯO一二三四五六七八九二0-9]{4})年([一二三四五六七八九十0-9]{1,3})月([一二三四五六七八九十廿0-9]{1,3})日"


def compact(text):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", text))


def chinese_number(value):
    if value.isdecimal():
        return int(value)
    if "廿" in value:
        return 20 + (int(DIGITS[value[-1]]) if value[-1] != "廿" else 0)
    if "十" in value:
        left, right = value.split("十")
        return (int(DIGITS[left]) if left else 1) * 10 + (int(DIGITS[right]) if right else 0)
    return int("".join(DIGITS.get(c, c) for c in value))


def signature_date(groups):
    year = int("".join(DIGITS.get(c, c) for c in groups[0]))
    return date(year, chinese_number(groups[1]), chinese_number(groups[2])).isoformat()


def audit(row, text, digest):
    pages = text.split("\f")
    head = compact("".join(pages[:2]))
    docket = compact(row["case_number"])
    docket_matches = bool(docket and docket in head)
    candidates = []
    for page_index, page in enumerate(pages):
        if page_index < 2:
            for match in re.finditer(r"(?:审结日期|裁判日期)[:：]\s*(\d{4})[.年/-]\s*(\d{1,2})[.月/-]\s*(\d{1,2})", compact(page)):
                try:
                    value = date(*map(int, match.groups())).isoformat()
                except ValueError:
                    continue
                candidates.append({"value": value, "page": page_index + 1, "kind": "metadata", "quote": match.group(0)})
        lines = page.splitlines()
        for line_index, line in enumerate(lines):
            match = re.fullmatch(DATE_PATTERN, compact(line))
            if not match:
                continue
            context = "\n".join(lines[max(0, line_index - 6):line_index + 7]).strip()
            if not re.search(r"审判|书记|法官|执行员|人民法院|赔偿委员会", compact(context)):
                continue
            try:
                value = signature_date(match.groups())
            except (ValueError, KeyError):
                continue
            candidates.append({"value": value, "page": page_index + 1, "kind": "signature", "quote": context})
    values = set(item["value"] for item in candidates)
    status = "candidate" if docket_matches and len(values) == 1 else "conflict" if len(values) > 1 else "unresolved"
    return {
        "caseId": row["case_id"], "sourceFile": row["pdf_file"], "sourceSha256": digest,
        "caseNumber": {"value": row["case_number"], "foundInOpeningPages": docket_matches},
        "judgmentDate": {"previousValue": row["judgment_date"], "status": status, "candidates": candidates},
    }


def main():
    out = ROOT / "output/evidence"
    out.mkdir(parents=True, exist_ok=True)
    rows = json.loads((ROOT / "data/generated/cases-extracted.json").read_text())
    verify = "--verify" in sys.argv
    ledger = json.loads((ROOT / "content/case-evidence.json").read_text())["cases"] if verify else None
    errors = []
    records = []
    for row in rows:
        source = ROOT / "public/pdfs" / row["pdf_file"]
        result = subprocess.run(["pdftotext", "-layout", str(source), "-"], capture_output=True, text=True, check=True)
        (out / f'{row["case_id"]}.txt').write_text(result.stdout)
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if verify:
            entry = ledger.get(row["case_id"])
            if not entry or entry["sourceSha256"] != digest:
                errors.append(f'{row["case_id"]}: 来源指纹不一致')
                continue
            pages = result.stdout.split("\f")
            for proof in entry["judgmentDate"]["evidence"]:
                page = proof["page"]
                if not 1 <= page <= len(pages) or compact(proof["quote"]) not in compact(pages[page - 1]):
                    errors.append(f'{row["case_id"]}: 第 {page} 页原文片段不匹配')
        else:
            records.append(audit(row, result.stdout, digest))
    if verify:
        if errors:
            print("\n".join(errors))
            raise SystemExit(1)
        print(f"{len(rows)} 篇来源指纹及已录入证据的页码/片段回查通过；不改变核查结论。")
        return
    (out / "case-candidates.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    counts = {state: sum(row["judgmentDate"]["status"] == state for row in records) for state in ["candidate", "conflict", "unresolved"]}
    print(json.dumps(counts, ensure_ascii=False))
    for row in records:
        if row["judgmentDate"]["status"] != "candidate":
            print(row["caseId"], row["judgmentDate"]["status"], row["caseNumber"], [(i["kind"], i["value"]) for i in row["judgmentDate"]["candidates"]])


if __name__ == "__main__":
    main()
