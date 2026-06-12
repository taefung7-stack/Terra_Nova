import re
import shutil
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
FONT = Path("C:/Windows/Fonts/malgun.ttf")

LEVELS = {
    "Terra": {
        "path": ROOT / "dist/2026-06/2026-06-Terra/terra.pdf",
        "answers": {
            1: ([1, 2, 3, 4], ("music", "beauty")),
            2: ([2, 3, 4, 5], ("closed", "segments")),
            3: ([3, 4, 5, 1], ("Moon", "atmosphere")),
            4: ([4, 5, 1, 2], ("tutors", "energy")),
            5: ([5, 1, 2, 3], ("Joseon", "1950")),
            6: ([2, 3, 4, 5], ("sunlight", "atmosphere")),
            7: ([3, 4, 5, 1], ("novel", "attention")),
            8: ([4, 5, 1, 2], ("struggle", "growth")),
            9: ([5, 1, 2, 3], ("grains", "erosion")),
            10: ([1, 2, 3, 4], ("fleet", "fortresses")),
            11: ([3, 4, 5, 1], ("blue", "brown")),
            12: ([4, 5, 1, 2], ("listens", "90")),
            13: ([5, 1, 2, 3], ("rhombus", "angles")),
            14: ([1, 2, 3, 4], ("equal", "sides")),
            15: ([2, 3, 4, 5], ("adjectives", "actions")),
            16: ([4, 5, 1, 2], ("tradition", "mixture")),
            17: ([5, 1, 2, 3], ("curiosity", "practical")),
            18: ([1, 2, 3, 4], ("balance", "15")),
            19: ([2, 3, 4, 5], ("Hantaan", "vaccine")),
            20: ([3, 4, 5, 1], ("naming", "40")),
        },
    },
    "Neptune": {
        "path": ROOT / "dist/2026-06/2026-06-Neptune/neptune.pdf",
        "answers": {
            1: ([1, 2, 3, 4], ("50", "trembles")),
            2: ([2, 3, 4, 5], ("pair", "2500")),
            3: ([3, 4, 5, 1], ("2300", "petition")),
            4: ([4, 5, 1, 2], ("100000", "Shim")),
            5: ([5, 1, 2, 3], ("rifles", "1500")),
            6: ([2, 3, 4, 5], ("248", "130000")),
            7: ([3, 4, 5, 1], ("21", "plankton")),
            8: ([4, 5, 1, 2], ("40", "30")),
            9: ([5, 1, 2, 3], ("slope", "intercept")),
            10: ([1, 2, 3, 4], ("52", "18")),
            11: ([3, 4, 5, 1], ("ratio", "3/10")),
            12: ([4, 5, 1, 2], ("regret", "habit")),
            13: ([5, 1, 2, 3], ("400", "free-fall")),
            14: ([1, 2, 3, 4], ("400", "trust")),
            15: ([2, 3, 4, 5], ("1985", "25000")),
            16: ([4, 5, 1, 2], ("1376", "nail")),
            17: ([5, 1, 2, 3], ("27", "1100")),
            18: ([1, 2, 3, 4], ("respect", "steelmanning")),
            19: ([2, 3, 4, 5], ("congruent", "SSS")),
            20: ([3, 4, 5, 1], ("81", "mean")),
        },
    },
}


def passage_start(seq: int) -> int:
    return 5 + 4 * (seq - 1) + 2 * ((seq - 1) // 5)


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def wrap(text: str, max_chars: int) -> list[str]:
    words = str(text).split()
    lines = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if len(candidate) <= max_chars:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def insert_text(page, pos, text, size=10, color=(0.1, 0.08, 0.25)):
    page.insert_text(pos, text, fontsize=size, fontname="malgun", fontfile=str(FONT), color=color)


def draw_wrapped(page, x, y, text, width_chars=70, size=9, line_gap=13):
    for line in wrap(text, width_chars):
        insert_text(page, (x, y), line, size=size)
        y += line_gap
    return y


def title_from_page(text: str) -> tuple[str, str]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    subject = lines[0] if lines else ""
    title = ""
    for i, line in enumerate(lines):
        if re.match(r"AR\s+\d", line) and i + 1 < len(lines):
            title = lines[i + 1]
            break
    return subject, title or f"PASSAGE"


def extract_vocab(text: str) -> list[tuple[str, str]]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    try:
        idx = lines.index("미리 보기") + 1
    except ValueError:
        return []
    vocab = []
    i = idx
    while i + 1 < len(lines) and len(vocab) < 12:
        word = lines[i]
        meaning = lines[i + 1]
        if re.fullmatch(r"\d+", word) or "TERRA·NOVA" in word:
            break
        vocab.append((word, meaning))
        i += 2
    return vocab


def parse_question_text(text: str) -> list[str]:
    flat = clean(text)
    matches = list(re.finditer(r"Q[1-5]\.", flat))
    questions = []
    for idx, match in enumerate(matches[:5]):
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(flat)
        q = flat[match.start():end]
        if q.startswith("Q5."):
            for marker in [" 중1 ", " 중2 "]:
                cut = q.find(marker)
                if cut > 0:
                    q = q[:cut]
                    break
        questions.append(q)
    return questions


def make_replacement_pages(level: str, source: fitz.Document, answer_map: dict):
    width, height = source[92].rect.width, source[92].rect.height
    out = fitz.open()
    records = []
    for seq in range(1, 21):
        start = passage_start(seq)
        passage_text = source[start - 1].get_text("text")
        practice_text = source[start].get_text("text")
        subject, title = title_from_page(passage_text)
        records.append(
            {
                "seq": seq,
                "subject": subject,
                "title": title,
                "vocab": extract_vocab(passage_text),
                "questions": parse_question_text(practice_text),
                "answers": answer_map[seq],
            }
        )

    def new_page(header: str, sub: str = ""):
        page = out.new_page(width=width, height=height)
        page.draw_rect(fitz.Rect(0, 0, width, 24), color=None, fill=(0.33, 0.16, 0.82))
        insert_text(page, (52, 62), header, size=17, color=(0.22, 0.13, 0.56))
        if sub:
            insert_text(page, (52, 82), sub, size=9, color=(0.38, 0.33, 0.55))
        return page

    # p93-p102: vocabulary tests, two passages per page
    for pair_start in range(1, 21, 2):
        page = new_page("Vocabulary Test", f"{level.upper()} · JUNE · PASSAGE {pair_start:02d}-{pair_start+1:02d}")
        y = 112
        for rec in records[pair_start - 1:pair_start + 1]:
            page.draw_rect(fitz.Rect(46, y - 18, width - 46, y + 255), color=(0.72, 0.62, 0.95), width=0.8)
            insert_text(page, (62, y), f"{rec['seq']:02d}  {rec['title']}", size=11, color=(0.18, 0.12, 0.45))
            insert_text(page, (398, y), "날짜 ____ / ____    점수 ____ / 12", size=8, color=(0.26, 0.2, 0.5))
            y += 26
            for idx, (word, meaning) in enumerate(rec["vocab"][:12], 1):
                col = 0 if idx <= 6 else 1
                row = idx - 1 if idx <= 6 else idx - 7
                x = 66 + col * 260
                yy = y + row * 31
                if idx <= 6:
                    prompt = f"{idx:>2}. {word}"
                    blank = "____________________"
                else:
                    prompt = f"{idx:>2}. {meaning}"
                    blank = "____________________"
                insert_text(page, (x, yy), prompt, size=8.2)
                insert_text(page, (x + 110, yy), "→", size=8.2, color=(0.35, 0.2, 0.85))
                insert_text(page, (x + 128, yy), blank, size=8.2, color=(0.22, 0.13, 0.56))
            y += 285

    # p105-p124: answer/explanation pages, one passage per page
    circled = "①②③④⑤"
    for rec in records:
        q_answers, short_answer = rec["answers"]
        page = new_page("Answer Key", f"{level.upper()} · JUNE · PASSAGE {rec['seq']:02d}")
        insert_text(page, (52, 112), f"{rec['subject']} · {rec['title']}", size=12, color=(0.18, 0.12, 0.45))
        quick = "  ".join([f"Q{i+1}. {circled[a-1]}" for i, a in enumerate(q_answers)])
        quick += f"  Q5. (A) {short_answer[0]}  (B) {short_answer[1]}"
        insert_text(page, (52, 138), "빠른 정답", size=11, color=(0.33, 0.16, 0.82))
        y = draw_wrapped(page, 52, 158, quick, width_chars=80, size=9.4, line_gap=14)
        y += 8
        for i, q in enumerate(rec["questions"][:5], 1):
            page.draw_rect(fitz.Rect(52, y - 12, width - 52, y + 92), color=(0.84, 0.80, 0.96), width=0.5)
            if i <= 4:
                label = f"Q{i}. {circled[q_answers[i-1]-1]}"
                reason = "본문의 핵심 내용, 세부 정보, 어휘 문맥 또는 어법 규칙과 직접 맞는 선택지입니다."
            else:
                label = f"Q5. (A) {short_answer[0]}  (B) {short_answer[1]}"
                reason = "요약문의 빈칸은 본문 또는 보기의 핵심 표현을 그대로 옮기는 문항입니다."
            insert_text(page, (64, y + 6), label, size=10.5, color=(0.22, 0.13, 0.56))
            stem = re.sub(r"\s+[1-5]\s+.*", "", q)
            y2 = draw_wrapped(page, 64, y + 25, stem, width_chars=72, size=8.2, line_gap=11)
            draw_wrapped(page, 64, max(y2 + 4, y + 58), f"해설: {reason}", width_chars=78, size=8.2, line_gap=11)
            y += 113

    # p125-p134: vocabulary answer key, two passages per page
    for pair_start in range(1, 21, 2):
        page = new_page("Vocabulary Test 정답", f"{level.upper()} · JUNE · PASSAGE {pair_start:02d}-{pair_start+1:02d}")
        y = 112
        for rec in records[pair_start - 1:pair_start + 1]:
            insert_text(page, (52, y), f"{rec['seq']:02d}  {rec['title']}", size=11, color=(0.18, 0.12, 0.45))
            y += 22
            for idx, (word, meaning) in enumerate(rec["vocab"][:12], 1):
                col = 0 if idx <= 6 else 1
                row = idx - 1 if idx <= 6 else idx - 7
                x = 62 + col * 265
                yy = y + row * 23
                insert_text(page, (x, yy), f"{idx:>2}. {word}  →  {meaning}", size=8.2)
            y += 172
    return out


def repair(level: str, info: dict):
    path = info["path"]
    if not path.exists():
        raise FileNotFoundError(path)
    backup = path.with_suffix(".broken-backup.pdf")
    if not backup.exists():
        shutil.copy2(path, backup)
    src = fitz.open(path)
    replacements = make_replacement_pages(level, src, info["answers"])
    if replacements.page_count != 40:
        raise RuntimeError(f"expected 40 replacement pages, got {replacements.page_count}")

    out = fitz.open()
    # Keep p1-p92, replace p93-p102, keep p103-p104, replace p105-p134.
    out.insert_pdf(src, from_page=0, to_page=91)
    out.insert_pdf(replacements, from_page=0, to_page=9)
    out.insert_pdf(src, from_page=102, to_page=103)
    out.insert_pdf(replacements, from_page=10, to_page=39)
    out.set_metadata({
        "title": f"Terra Nova · {level.upper()} 6월호",
        "author": "Terra Nova English",
        "subject": "Monthly English Textbook · 2026-06",
        "creator": "Terra Nova repair_terra_neptune_supplements.py",
        "producer": "PyMuPDF",
    })
    tmp = path.with_suffix(".repaired.tmp.pdf")
    out.save(tmp, garbage=4, deflate=True)
    src.close()
    out.close()
    replacements.close()
    tmp.replace(path)
    print(f"{level}: repaired {path} (backup: {backup.name})")


def main():
    for level, info in LEVELS.items():
        repair(level, info)


if __name__ == "__main__":
    main()
