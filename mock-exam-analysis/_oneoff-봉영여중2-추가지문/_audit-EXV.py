# 변형문제 PDF ↔ data/EXV 대조 (PyMuPDF 필요)   사용법: python -I _audit-EXV.py
#  ① 문항 번호 1..N 연속  ② 정답지 객관식 정답이 유형 순서·지문 순서대로 데이터와 일치
#  ③ 서술형 정답 전수 인쇄  ④ 렌더 HTML 의 밑줄 수·빈칸·삽입 슬롯
import json, re, sys, pathlib
import fitz
sys.stdout.reconfigure(encoding='utf-8'); fitz.TOOLS.mupdf_display_errors(False)
D = pathlib.Path(__file__).resolve().parent
TYPES = ['theme', 'gist', 'title', 'implication', 'grammar', 'vocab', 'blank', 'irrelevant', 'order', 'insert', 'summary']
V = {n: json.loads((D / f'data/EXV/{n}-variant.json').read_text(encoding='utf-8'))['by_type'] for n in (7, 8, 9, 10, 11)}
err = 0
def bad(m):
    global err; err += 1; print('  ✗', m)

pdf = fitz.open(str(D / 'dist/EXV/봉영여중2_영어B_기말추가지문_변형문제.pdf'))
pages = [p.get_text() for p in pdf]
ans_pages = [t for t in pages if '정답 · 해설' in t or '정답·해설' in t]
txt_ans = '\n'.join(ans_pages)
flat = lambda t: re.sub(r'\s+', '', t)
N = '①②③④⑤'
expected = [N[V[n][t]['answer'] - 1] for t in TYPES for n in (7, 8, 9, 10, 11)]
got = re.findall(r'정답\s*([①②③④⑤])', txt_ans)
if got[:len(expected)] != expected:
    bad(f'정답지 객관식 순서 불일치\n    기대 {"".join(expected)}\n    인쇄 {"".join(got)}')
else:
    print(f'  정답지 객관식 {len(expected)}개 — 순서까지 데이터와 일치')
# 서술형 정답 인쇄
wa = 0
for n in V:
    for w in V[n]['writing']:
        keys = [w['answer_a'], w['answer_b']] if w['subtype'] == 'summary_word' else [w['answer']]
        for k in keys:
            if flat(k) not in flat(txt_ans): bad(f'{n}번 {w["subtype"]} 정답 미인쇄: {k[:40]}')
            else: wa += 1
print(f'  서술형 정답 인쇄 {wa}건 확인')
# 문항 번호
qn = sorted({int(x) for x in re.findall(r'^(\d{1,2})$', '\n'.join(pages[:-6]), re.M)})
total = 11 * 5 + sum(len(V[n]['writing']) for n in V)
missing = [i for i in range(1, total + 1) if i not in qn]
if missing: bad(f'문항 번호 누락 의심 {missing[:10]}')
else: print(f'  문항 번호 1~{total} 확인')
# 렌더 HTML 구조
html = (D / 'dist/EXV/variant-book.html').read_text(encoding='utf-8')
#   어법·어휘 밑줄 5×5×2=50(class="ul") + 함축 5(vq-underline) / 삽입 슬롯 5×5=25 /
#   빈칸 30 = 객관식 빈칸 5 + 서술형 fill_blank 5 + summary_word 10 + 요약문 템플릿 10
for cls, want in [('class="ul"', 50), ('class="vq-underline"', 5), ('class="slot"', 25), ('class="blank-inline"', 30)]:
    n = html.count(cls)
    if n != want: bad(f'HTML {cls} {n}개 ≠ {want}')
print('  HTML: 밑줄 55 · 삽입 슬롯 25 · 빈칸 30 확인')
print(f"\n{'❌' if err else '✅'} 변형문제 PDF 대조 — 오류 {err}")
sys.exit(1 if err else 0)
