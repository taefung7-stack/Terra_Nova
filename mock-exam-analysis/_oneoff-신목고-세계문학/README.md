# 신목고 2학년 2학기 중간고사 — 세계문학 Unit 1 (본문분석 · 워크북 · 변형문제)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, 합본, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (정식 회차 목록 오염 방지 — `_oneoff-신서고-YBM-L1` 과 동일 정책).

## 무엇인가

**세계문학 Unit 1 — Cross-Cultural Encounters**(교과서 pp.34~38)를 테라노바
**모의고사 분석지 v1.0** 디자인 그대로 제작한 3종 세트입니다.

교과서 원문은 "Korean Culture from Different Angles"라는 소셜미디어 게시글 모음으로,
**게시글 1편 + 댓글 2개**가 한 챕터를 이룹니다.
(Ch4 는 댓글 쪽 분량이 더 많다 — 게시글 4문장 + Luvpanda 3 + Samba 3.)

| Ch | 게시글 제목 | 작성자 | 교과서 p | 본문 | 댓글 | 계 |
|----|-------------|--------|----------|------|------|-----|
| 1 | Korean Honorifics: When Being Polite Gets Tricky | Talia | p.34~35 | 15 | 4 | 19 |
| 2 | Subway in Seoul: It Is the Best | Brian | p.36 | 8 | 7 | 15 |
| 3 | The "Ppalli-Ppalli" Culture | Aussie | p.37 | 7 | 5 | 12 |
| 4 | Cultural Taboos to Avoid in Korea | turkish_delight | p.38 | 4 | 6 | 10 |
| | **합계** | | | **34** | **22** | **56** |

> **지문 추가 예정** — 시험 범위가 늘면 `_SOURCE-U1.js` 에 챕터를 추가하고 같은 절차로
> 3종을 만들면 됩니다. `verify-workbook.mjs` 는 챕터 수를 디스크에서 탐지하므로
> 스크립트 수정이 필요 없습니다.

## 폴더 구조

```
_SOURCE-U1.js               ← 원문 정본(ground truth). 임의 수정 금지
_AUTHORING-SPEC.md          ← 저작 스펙(스키마·함정). 새 챕터 추가 시 참조
data/U1/N.json              → dist/U1/N.{html,pdf}          분석지
data/U1/N-workbook.json     → dist/U1/workbook-N.{html,pdf} 워크북
data/U1/N-variant.json      → dist/U1/variant-book.{html,pdf} 변형문제
styles/{analysis,workbook,variant}.css
```

### ⚠️ 이 교과서만의 구조 — 댓글도 본문이다

원문 정본은 게시글(`sentences`)과 댓글(`comments[].sentences`)을 나눠 보관하지만,
**분석지 JSON 의 `passage` 는 둘을 순서대로 이어붙인 하나의 배열**입니다.
`verify.mjs` 의 `flatten()` 이 같은 규칙으로 펼쳐 대조하므로, 댓글을 빠뜨리면 차단됩니다.
(댓글에 시험 포인트가 몰려 있어 — 독일어 opa/oma, 파리 메트로 우선순위, Tagalog dali-dali,
브라질 OK 제스처 — 본문에서 제외하면 안 됩니다.)

## 빌드 방법

```bash
cd mock-exam-analysis
U=U1

# ── 분석지 ─────────────────────────────────────────────
# 0) 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-신목고-세계문학/verify.mjs"
node "_oneoff-신목고-세계문학/verify-tags.mjs"   # HTML 태그 균형(verify.mjs 사각지대)

# 1) HTML 빌드 (★ data 가 U1/ 로 한 단계 깊어 --styles 필수)
node builder/build.mjs "_oneoff-신목고-세계문학/data/$U" "_oneoff-신목고-세계문학/dist/$U" \
  --styles="_oneoff-신목고-세계문학/styles/analysis.css"

# 2) PDF 렌더
node builder/pdf.mjs "_oneoff-신목고-세계문학/dist/$U"

# 3) 넘침 검사 — overflow 0 이 절대 조건
for n in 1 2 3 4; do
  node builder/check-overflow.mjs "_oneoff-신목고-세계문학/dist/$U/$n.html"
done

# 4) 합본
node "_oneoff-신목고-세계문학/combine.mjs" $U

# ── 워크북 ─────────────────────────────────────────────
node "_oneoff-신목고-세계문학/verify-workbook.mjs"
node builder/build-workbook.mjs "_oneoff-신목고-세계문학/data/$U" "_oneoff-신목고-세계문학/dist/$U" \
  --styles="_oneoff-신목고-세계문학/styles/workbook.css"
for n in 1 2 3 4; do
  node builder/check-overflow.mjs "_oneoff-신목고-세계문학/dist/$U/workbook-$n.html"
done
node builder/pdf-image.mjs "_oneoff-신목고-세계문학/dist/$U" --match='^workbook-\d+\.html$'
node "_oneoff-신목고-세계문학/combine-workbook.mjs" $U

# ── 변형문제 ───────────────────────────────────────────
node "_oneoff-신목고-세계문학/verify-variant.mjs"
node builder/build-variant.mjs "_oneoff-신목고-세계문학/data/$U" "_oneoff-신목고-세계문학/dist/$U" \
  --styles="_oneoff-신목고-세계문학/styles/variant.css" --shared-writing-passage
node "_oneoff-신목고-세계문학/_measure-clip.mjs"  "_oneoff-신목고-세계문학/dist/$U/variant-book.html"
node "_oneoff-신목고-세계문학/_measure-pages.mjs" "_oneoff-신목고-세계문학/dist/$U/variant-book.html"
node "_oneoff-신목고-세계문학/render-variant-pdf.mjs" "_oneoff-신목고-세계문학/dist/$U/variant-book.html"
node "_oneoff-신목고-세계문학/combine-variant.mjs" $U
```

## 검증이 잡는 조용한 실패 (반드시 돌릴 것)

빌더는 **에러 없이 조용히 내용을 지우는** 실패 모드가 셋 있습니다.
`_oneoff-신서고-YBM-L1/README.md` 에 사고 기록이 상세히 있고, 요약하면:

1. **변형문제 — 밑줄·빈칸 증발**
   `underlines[].text` / `blank_target` 이 그 유형의 `passage` 에 문자 그대로 없으면
   밑줄·빈칸이 사라진 채 빌드된다(문제가 성립하지 않음). → `verify-variant.mjs`
2. **워크북 — 고유명사 오탐으로 문항 삭제**
   `buildProperNounSet` 이 문두 대문자 단어(`Although` `Only` `Never` 등)를 고유명사로
   오판해, 그 단어가 정답인 양자택일 문항을 조용히 삭제한다(정답지 문항 수만 줄어듦).
   → **문두 단어를 정답 슬롯으로 쓰지 말 것.** 저작 문항 수 = 렌더 문항 수 대조 필수.
3. **HTML 태그 불균형 — 렌더만 깨짐**
   `verify.mjs` 는 `en_html` 의 태그를 *벗겨서* 원문과 대조하므로
   `<span style="font-family:Inter">…</strong>` 처럼 **여는 태그와 닫는 태그가 다른**
   실수를 통과시킨다. 데이터는 정상인데 렌더만 깨진다.
   → **`verify-tags.mjs`** 로 별도 검사(2026-09-01 검수에서 실제 5건 발견).
4. **PDF 에서만 잘림**
   `check-overflow.mjs` 는 `.page-body` 만 보므로 자식이 `overflow:hidden` 으로 이미
   잘린 경우를 못 잡는다. → `_measure-clip.mjs` / `_measure-pages.mjs` 를 함께 돌릴 것.

## 삽화

`illustration.prompt` — `--ar 16:5 --v 8.1` 고정, **실사 포토리얼**.
밝기는 형용사가 아니라 조명 조건(`bright overcast sky`, `high-key exposure`)으로 지정한다.
`sunlit` `golden hour` 를 지시부에 쓰면 미드저니가 황금빛 저녁+강한 대비로 해석해
**오히려 어두워진다** — 단 `NO ~` 배제절 안에서는 써야 한다.
인물은 `NO visible face`(손·뒷모습·실루엣).

## 2026-09-01 원본 대조 전수 검수

원본 캡처와 3종을 전면 대조해 다음을 바로잡았다. **본문 56문장 자체는 오탈자 0** 이었고,
결함은 전부 귀속·해설·정답배치 쪽이었다.

| # | 등급 | 내용 |
|---|------|------|
| 1 | 치명 | 변형 서술형 조건 "총 14단어"인데 정답이 16단어 — 채점 불가 문항이었다(Ch4) |
| 2 | 치명 | **정답 ① 쏠림** — 44문항 중 24개(55%)가 ①, ⑤는 0개. 주제·요지·제목을 전부 ①로 찍으면 만점이었다 → `_rebalance-variant.mjs` 로 재배치(① 6 / ② 6 / ③ 11 / ④ 15 / ⑤ 6) |
| 3 | 중요 | HTML 태그 불균형 5건(`<span …>` 를 `</strong>` 로 닫음) — 렌더 깨짐 |
| 4 | 중요 | Ch4 본문/댓글 귀속 2단 오류: 엘리베이터 3문장은 Luvpanda, 브라질 3문장은 Samba 몫인데 각각 한 칸씩 밀려 있었다(4+3+3 으로 정정) |
| 5 | 중요 | 어법 해설 오류 — "형용사 병렬"(lightning speed 는 명사구), "명사 없이 홀로 쓰였으므로 anything"(any 도 단독 대명사 가능) |
| 6 | 경미 | 없는 양보("~는데도") 번역 1건, 정답 재배치 후 원 번호 조사 13건(②이→②가), 빈칸 밑줄 길이 불일치, `dining` 품사 표기 |

> **정답 재배치는 보기 "내용"을 바꾸지 않는다** — 순서만 바꾸고 `explanation_ko` /
> `distractor_ko` 안의 ①~⑤ 표기를 함께 remap 한다. `grammar`·`vocab`·`irrelevant`·
> `insert` 4개 유형은 정답이 밑줄·문장 위치에 묶여 있어 **재배치 대상에서 제외**한다
> (순서를 바꾸면 정답과 위치가 어긋난다).

### 원본에 있으나 그대로 둔 것 (오류 아님)

- `order a food`, `이해가 안 되요` — 교과서 원문의 비원어민 영어·의도된 학습자 오류.
  본문 인용이므로 **고치지 않는다**(Ch1 은 이 오류를 지적하는 것이 지문의 요지다).
- `A as well as B` → "B뿐만 아니라 A도" 어순 뒤집기 — 카드가 이 뒤집힘 자체를
  시험 포인트로 가르치므로 매끄러운 어순으로 바꾸지 않는다.
