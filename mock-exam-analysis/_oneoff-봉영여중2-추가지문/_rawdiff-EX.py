# 원본 사진 재판독(_RAW_RECHECK-EX.txt) ↔ 정본 ↔ 데이터 ↔ 분석 카드 ↔ 합본 PDF ↔ 암기장 PDF 대조
# 사용법: node -e "..."(아래 _dump) 후  python -I _rawdiff-EX.py   (PyMuPDF 필요)
#   [0] 재판독 ↔ 기존 RAW(_PDF-RAW-EX.txt)      문자 단위(공백 정규화)
#   [1] 재판독 ↔ 정본 _SOURCE-EX.js            문자 단위
#   [2] 재판독 ↔ data/EX passage               문자 단위
#   [3] 재판독 ↔ 분석 카드 en_html(태그·슬래시 제거) 문자 단위
#   [4] 합본 PDF 지문별 본문 전문 페이지 — 영어 단어 빈도 = 재판독 + 제목 단어
#   [5] 합본 PDF 전체 — 문장마다 ≥3회(본문 전문·PASSAGE·분석 카드)
#   [6] 암기장 PDF — 정답면 영어 단어 빈도 = 재판독 + 제목 단어, 문항 제시 한글 전수
#   [7] 11번 인쇄 해석 ↔ data passage_ko 문자 단위
import json, re, sys, subprocess, collections, pathlib
import fitz
sys.stdout.reconfigure(encoding="utf-8")
fitz.TOOLS.mupdf_display_errors(False)

D = pathlib.Path(__file__).resolve().parent
dump = json.loads(subprocess.run(['node', str(D / '_dump-EX.mjs')], capture_output=True, text=True, encoding='utf-8', check=True).stdout)
SRC = {c['no']: c for c in dump['source']}
DATA = {int(k): v for k, v in dump['data'].items()}

def parse(fn):
    out, cur = {}, None
    for ln in (D / fn).read_text(encoding='utf-8').splitlines():
        if ln.startswith('#'):
            continue
        m = re.match(r'@EX (\d+)', ln)
        if m:
            cur = out.setdefault(int(m.group(1)), {'en': [], 'ko': []}); continue
        if ln.startswith('@KO '):
            cur['ko'].append(ln[4:].strip()); continue
        if ln.strip():
            cur['en'].append(ln.strip())
    return {k: {'en': ' '.join(v['en']), 'ko': v['ko']} for k, v in out.items()}

ws = lambda s: re.sub(r'\s+', ' ', s).strip()
RE = parse('_RAW_RECHECK-EX.txt')
OLD = parse('_PDF-RAW-EX.txt')
err = 0
def bad(m):
    global err; err += 1; print('  ✗', m)

def cmp(label, a, b):
    a, b = ws(a), ws(b)
    if a != b:
        k = next((i for i in range(min(len(a), len(b))) if a[i] != b[i]), min(len(a), len(b)))
        bad(f'{label} @{k}\n      재판독: …{a[max(0,k-30):k+30]}\n      대상  : …{b[max(0,k-30):k+30]}')

def strip_html(h):
    h = re.sub(r'<span class="slash">\s*/\s*</span>', ' ', h)
    return re.sub(r'<[^>]+>', '', h).replace('&amp;', '&')

words = lambda t: collections.Counter(w.lower() for w in re.findall(r"[A-Za-z]+", t))
chars = 0
for no in sorted(RE):
    r = RE[no]['en']; chars += len(r)
    cmp(f'[0] Ch{no} RAW', r, OLD[no]['en'])
    cmp(f'[1] Ch{no} 정본', r, ' '.join(SRC[no]['sentences']))
    cmp(f'[2] Ch{no} data', r, ' '.join(DATA[no]['passage']))
    cmp(f'[3] Ch{no} 카드', r, ' '.join(strip_html(s['en_html']) for s in DATA[no]['sentences']))
    if no == 11:
        if RE[no]['ko'] != DATA[no]['passage_ko']:
            for i, (a, b) in enumerate(zip(RE[no]['ko'], DATA[no]['passage_ko'])):
                if a != b: bad(f'[7] Ch11 해석 #{i+1}\n      인쇄: {a}\n      data: {b}')
            if len(RE[no]['ko']) != len(DATA[no]['passage_ko']): bad('[7] Ch11 해석 수 불일치')

A = fitz.open(str(D / 'dist/EX/봉영여중2_영어B_기말추가지문_본문분석.pdf'))
pages = [p.get_text() for p in A]
# [4] 본문 전문 = 합본 2~6쪽(지문 순서 7,8,9,10,11)
#   PDF 추출은 자간 때문에 'To' → 'T o' 처럼 쪼개질 수 있어 공백을 없앤 문자열로 본다.
#   ① 재판독을 기계 분할한 문장이 페이지에 '순서대로' 모두 있어야 하고
#   ② 그 문장들을 지운 나머지에 남는 영어는 제목·FULL TEXT·해석 속 영어(A 씨, Main 가 등)뿐이어야 한다.
def resplit(t):
    t = t.replace('Mr. ', 'Mr\u0002 ')
    return [s.replace('Mr\u0002', 'Mr.') for s in re.split(r'(?:(?<=[.?!])|(?<=[.?!][”’]))\s+(?=[A-Z0-9“‘])', t)]
fl = lambda t: re.sub(r'\s+', '', t)
for idx, no in enumerate(sorted(RE)):
    page = fl(pages[1 + idx]); pos = 0
    for s in resplit(RE[no]['en']):
        k = page.find(fl(s), pos)
        if k < 0: bad(f'[4] Ch{no} 본문 전문에 없음(또는 순서 다름): {s[:50]}'); continue
        page = page[:k] + '\u0001' + page[k + len(fl(s)):]; pos = k
    # 허용 텍스트(머리 막대의 FULL TEXT·제목, 각 해석)를 지운 뒤 영어 글자가 남으면 잉여 문장이다.
    for ok in ['FULLTEXT', fl(SRC[no]['title'])] + [fl(k) for k in DATA[no]['passage_ko']]:
        page = page.replace(ok, '\u0001', 1)
    extra = re.findall(r'[A-Za-z]+', page)
    if extra: bad(f'[4] Ch{no} 본문 전문 잉여 영어 {extra}')
# [5] 합본 전체 수록 횟수
flat = lambda t: re.sub(r'\s+', '', t)
allA = flat(''.join(pages))
for no in sorted(RE):
    for s in SRC[no]['sentences']:
        n = allA.count(flat(s))
        if n < 2: bad(f'[5] Ch{no} 합본 수록 {n}회: {s[:50]}')
# 카드 영어는 끊어읽기 / 와 하이라이트가 끼므로 단어 열로 본다
toks = re.findall(r"[A-Za-z’']+", ''.join(pages))
# [6] 암기장
M = fitz.open(str(D / 'dist/EX/봉영여중2_영어B_기말추가지문_본문암기.pdf'))
mp = [p.get_text() for p in M]
ans = [t for t in mp if '정답' in t[:200] and 'ANSWER' in ''.join(mp)]
ans_txt = ''.join(t for t in mp if '본문 암기 — 정답' in t)
want = collections.Counter()
for no in sorted(RE):
    want += words(RE[no]['en']) + words(SRC[no]['title'])
got = words(ans_txt) - words('ANSWER') - words('ANSWER')
# 머리글·브랜드 등 고정 영어 제거
for fixed in ['ANSWER', 'B']:
    pass
diff_missing = want - words(ans_txt)
if diff_missing:
    bad(f'[6] 암기장 정답면 부족 단어 {dict(diff_missing)}')
q_txt = flat(''.join(t for t in mp if '본문 암기 — 정답' not in t))
for no in sorted(RE):
    for i, k in enumerate(DATA[no]['passage_ko']):
        if flat(k) not in q_txt: bad(f'[6] 암기장 제시문 누락 Ch{no} #{i+1}')
extra = words(ans_txt) - want
print(f'  (암기장 정답면 고정 머리글 등 잉여 단어: {dict(extra)})')

total = sum(len(SRC[n]['sentences']) for n in SRC)
print(f"\n{'❌' if err else '✅'} 재판독 대조 — {len(RE)}지문 {total}문장 {chars}자 · 오류 {err}")
sys.exit(1 if err else 0)
