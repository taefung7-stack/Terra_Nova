# 신목고 2학년 2학기 중간고사 — 세계문학 (본문분석 · 워크북 · 변형문제)

> 유닛: **U1**(완료) · **U2**(완료 — 삽화 4장 반영까지 끝, 아래 「Unit 2」 절 참조)

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

프롬프트 원본은 **`data/U1/{N}.json` 의 `illustration.prompt`**(single source of truth)이고,
복붙용 문서 **`_ILLUSTRATION_PROMPTS-U1.md`** 는 아래 스크립트로 생성되는 파생물이다.

```bash
node "_oneoff-신목고-세계문학/collect-prompts.mjs"
```

이 스크립트는 문서를 만들면서 **하우스 룰을 검증**한다(위반 시 exit 1):
`--ar 16:5 --v 8.1` 고정 / 지시부 금지어 0 / 얼굴 차단 문구 / 소재 배제절 존재.

### ⚠️ 2026-09-02 전면 재작성 — 인라인 `NO` 를 버렸다

초판 프롬프트는 문장 속 **인라인 `NO xxx` 를 16개**씩 달고 1000자에 육박했고,
**기괴한 이미지가 반복 생성**됐다. 원인은 둘이다.

1. **미드저니는 문장 속 `NO xxx` 를 부정으로 신뢰성 있게 처리하지 못한다.**
   오히려 그 명사를 *요청*으로 읽어 끌어온다 — `NO chopsticks` 가 젓가락을 부른다.
   배제 대상이 그 장면에 자연스럽게 어울리는 물건일 때(한식 상 + 젓가락) 특히 심하다.
   → 진짜 네거티브 파라미터 **`--no a, b, c`** 로 옮겼다.
2. **지시부가 길수록 주제가 희석된다.** 인물·소품·감정·배경을 욱여넣으면 어느 것도
   선명하지 않다. → **주어 하나, 장면 하나**로 줄였다(지시부 800자 상한, 검증기 강제).

### 규칙

- 규격: `--ar 16:5 --v 8.1 --style raw` 고정, **실사 포토리얼**.
- 밝기는 형용사가 아니라 조명 조건(`bright overcast sky`, `high-key exposure`)으로 지정한다.
  `sunlit` `golden hour` 를 **지시부**에 쓰면 황금빛 저녁+강한 대비로 해석돼
  **오히려 어두워진다** — 단 **`--no` 뒤에는 반드시 넣어** 밀어낸다.
  → 검증기는 `--no` 뒷부분을 **먼저 걷어낸 뒤** 금지어를 본다(단순 grep 은 오탐).
- **사람을 넣지 않는다.** 손·뒷모습도 쓰지 않는다 — 손가락이 뭉개져 기괴해지는 주범이었다.
  `--no face, portrait, distorted hands, extra fingers`. 사물·공간만으로 장면을 세운다.
- **글자를 넣지 않는다.** `--no text, letters, words, signage, logo` — 미드저니가 만드는
  가짜 한글/영문이 교재에 그대로 인쇄되면 치명적이다.
- 삽화 슬롯은 **16:5 레터박스 + `object-fit: cover`(중앙 크롭)** 이다.
  주제를 화면 중앙에 두고 위아래가 잘려도 살아남는 구도로 잡는다.
- 4개 챕터 소재: 노트·연필 / 지하철 배려석 / 한식 한 상 / 현관 신발.
  소재 자체가 겹치지 않으므로 **서로를 배제하는 절은 넣지 않는다**(넣으면 1번 함정 재발).

### 이미지 반영 방법 (2026-09-02 반영 완료)

미드저니 원본(3952×1232 PNG, 장당 6~7MB)은 **인쇄에 필요한 해상도의 약 2배**다
(180mm 폭 기준 558dpi). 그대로 쓰면 합본이 16MB 가 된다. 다음 순서로 줄인다.

```bash
# 1) 원본을 dist/U1/ 에 01~04.png 로 두고 → 300dpi JPEG 로 변환
python -c "
from PIL import Image
for n in [1,2,3,4]:
    im=Image.open(f'dist/U1/0{n}.png').convert('RGB')
    w=2200; h=round(im.height*w/im.width)          # 180mm@300dpi=2126px, 여유 2200
    im.resize((w,h), Image.LANCZOS).save(
        f'dist/U1/assets/illust-{n}.jpg','JPEG',quality=88,optimize=True,progressive=True)
"
# 2) JSON 의 illustration.file 을 .jpg 로 맞춘 뒤 재빌드·합본
```

> 원본 PNG 는 `.gitignore` 로 추적하지 않는다(장당 6~7MB). 빌드가 쓰는 것은
> `assets/illust-*.jpg` 뿐이다.

### 합본 PDF 압축 (필수)

렌더러가 JPEG 를 **재인코딩해 부풀린다** — 1.1MB 원본이 PDF 안에서 11.9MB 가 됐다.
ghostscript 로 다시 줄인다(**본문 텍스트 보존 확인 완료**, 15.9MB → 2.5MB).

```bash
MSYS_NO_PATHCONV=1 gs -q -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite   -dColorConversionStrategy=/LeaveColorUnchanged   -dAutoFilterColorImages=false -dEncodeColorImages=true   -dColorImageFilter=/DCTEncode -dColorImageResolution=300   -dDownsampleColorImages=true -dCompatibilityLevel=1.5   -sOutputFile=<출력>.pdf "<합본>.pdf"
```

⚠️ `-dPDFSETTINGS=/ebook` `/printer` 같은 **프리셋은 쓰지 말 것** — 본문 텍스트를 뭉갠다
(`project_terra_nova_elementary_pdf_compress`). 위 옵션 조합만 검증됐다.
⚠️ Git Bash 에서는 `MSYS_NO_PATHCONV=1` 이 없으면 `/LeaveColorUnchanged` 가
경로로 변환돼 실패한다.

### (참고) 최초 반영 절차

생성한 이미지를 `dist/U1/assets/illust-{1..4}.jpg` 로 저장한 뒤 PDF 를 다시 렌더하면
placeholder 자리에 자동으로 들어간다.

```bash
node builder/pdf.mjs "_oneoff-신목고-세계문학/dist/U1"
node "_oneoff-신목고-세계문학/combine.mjs" U1
```

⚠️ 반영 후 **삽화 누락 회귀 검사**를 반드시 할 것 — 빌더가 이미지 디코드 전에 캡처해
placeholder 로 굳는 사고가 있었다(`project_terra_nova_fullbook_illustration_race`).

**⚠️ `gs txtwrite | grep "삽화 영역"` 은 이 교재에서 쓸 수 없다** — placeholder 한글이
자간 분해되어 추출돼 항상 0건으로 나온다(= 거짓 안심). 대신 **임베드된 이미지 개수**를 센다.

```bash
# 합본 PDF 안의 이미지 XObject 개수 — 삽화 반영 후 4개여야 한다(반영 전 0개)
python -c "import re,sys; d=open(sys.argv[1],'rb').read();   print(len(re.findall(rb'/Subtype\s*/Image', d)))"   "dist/U1/신목고2-2중간_세계문학_Unit1_본문분석_합본.pdf"

# HTML 쪽에서도 placeholder 문구가 사라졌는지 확인 (4개 챕터 전부 0이어야 한다)
grep -c "삽화 영역" dist/U1/[1-4].html
```

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

---

# Unit 2 — A French Student in Dublin (교과서 pp.24~29)

**상태: 전체 완료 (2026-09-08).** 정본 전사 → 분석지 → 워크북 → 변형문제 →
**삽화 4장 반영**까지 끝났고 검증기 5종이 전부 오류 0 · 경고 0 이다.

삽화는 `dist/U2/assets/illust-{1..4}.jpg`(2200×686, 300dpi)로 반영돼 있고
본문분석 합본 p.3 / p.11 / p.18 / p.24 에 들어간다. 원본 PNG(3952×1232)는
`dist/U2/.gitignore` 의 `0*.png` 규칙으로 추적하지 않는다(장당 5~7MB).

> ### ⚠️ 분석지를 다시 렌더할 때 — 워크북이 깨진다
>
> `builder/pdf.mjs` 는 **`--match` 인자를 무시하고** dist 안의 모든 HTML 을
> 다시 렌더한다. 이때 워크북까지 **벡터 PDF 로 덮여** 글리프 안전성이 사라진다
> (2026-09-08 검수·삽화 반영에서 두 번 발생).
>
> → 분석지 재렌더 후에는 **반드시** 아래를 실행해 워크북을 되돌린다.
>
> ```bash
> node builder/pdf-image.mjs "_oneoff-신목고-세계문학/dist/U2" --match='^workbook-\d+\.html$'
> node "_oneoff-신목고-세계문학/combine-workbook.mjs" U2
> ```
>
> 확인법: 워크북 합본이 **46페이지 전부 이미지**여야 한다(`pypdf` 로 page.images 계수).
> 이미지 0 이면 벡터로 덮인 것이다.

| 산출물 | 페이지 | 파일 |
|--------|--------|------|
| 본문분석 합본 | 28p | `신목고2-2중간_세계문학_Unit2_본문분석_합본.pdf` |
| 워크북 합본 | 46p | `신목고2-2중간_세계문학_Unit2_워크북_합본.pdf` |
| 변형문제 합본 | 38p | `신목고2-2중간_세계문학_Unit2_변형문제_합본.pdf` |

원문 정본은 **83문장**(PART 본문 59 + Delphine's Blog 24).

| Ch | PART 본문 | Blog | 계 | 분석카드 | 대표문제 |
|----|-----------|------|----|----------|----------|
| 1 | 16 | 9 | 25 | 12 | 심경 |
| 2 | 16 | 7 | 23 | 9 | 심경 변화 |
| 3 | 21 | 3 | 24 | 9 | 내용 일치 |
| 4 | 6 | 5 | 11 | 6 | 요지 |

### 저작 중 실제로 터진 함정 (다음 유닛에서도 그대로 재현된다)

1. **블로그 누락** — Ch3 에서 `Delphine's Blog 3`(3문장)을 통째로 빠뜨렸다.
   `verify.mjs` 가 "원문 24 vs passage 21" 로 차단해서 잡혔다. README 가 경고한
   그대로이니 **블로그도 passage 에 이어붙일 것.**
2. **태그 경계로 쪼갠 축약형** — `<span>I</span> <span>'m glad</span>` 처럼 나누면
   공백이 삽입돼 본문 대조가 깨진다. 축약형은 한 태그 안에 둘 것.
3. **워크북 고유명사 오탐** — `is`(아일랜드어 "Is mise Delphine" 때문에 대문자로만
   등장), `Cathedral`, `Literature` 가 정답 슬롯에 들어가 **문항이 조용히 삭제**될
   뻔했다. 저작 전에 `buildProperNounSet` 을 그대로 돌려 금지 토큰을 뽑아 둘 것.
4. **곡선따옴표 누락** — 대화문이 많은 Ch3 에서 워크북 `en_template` 이 닫는 `”` 를
   빠뜨려 복원문이 본문과 불일치했다.
5. **verify-source.mjs 오탐 2종** — 문장 끝 검사가 곡선따옴표(`”`)·이모티콘(`:)`)을
   문장부호로 인정하지 않고, 문장 맨 끝의 `p.m.` 까지 오분할로 의심했다.
   진짜 잘림은 계속 잡히는지 케이스로 확인한 뒤 검사식을 고쳤다(U1 회귀 없음).

## U1 과 구조가 다르다 — 반드시 읽을 것

U1 은 **게시글 + 댓글 2개**가 한 챕터였지만, U2 는 **PART 본문 + Delphine's Blog 1개**가
한 챕터다. Delphine 한 사람의 시점으로 이어지는 **서사문**이라는 점도 다르다.

| Ch | PART | 소제목 | 교과서 p |
|----|------|--------|----------|
| 1 | PART 1 | Delphine arrives at the O'Briens | p.24~25 |
| 2 | PART 2 | Delphine's first day at school | p.26 |
| 3 | PART 3 | After school | p.27 |
| 4 | PART 4 | St. Patrick's Day | p.28~29 |

- 정본 필드가 `comments[]` 가 아니라 **`blog.sentences`** 다.
- `verify.mjs` 는 U2 에 **`flattenBlog()`** 를 쓴다(U1 은 `flatten()`).
- `passage` 는 U1 과 마찬가지로 **본문 + 블로그를 이어붙인 하나의 배열**이다.
  블로그를 빠뜨리면 검증이 차단한다.
- p.24 상단 도입 문단은 **Ch1 맨 앞**에 넣는다.
  ※ 이 문서 초안은 4문장이라고 적었으나 **실제 원문은 5문장**이다
  (Meeting people… / We can discover… / We can also build… /
  In March, Delphine Froissart… / She wanted to practise…).

저작 규칙·함정은 **`_AUTHORING-SPEC-U2.md`** 에 있다(서사문이라 대표 문제 유형이
U1 과 다르고, 인물명 때문에 워크북 고유명사 오탐이 U1 보다 잘 터진다).

## 원문 전사 — 완료 (2026-09-08)

`_SOURCE-U2.js` 의 각 챕터 `sentences` / `blog.sentences` 는 **전사 완료**다
(83문장, 챕터별 수치는 파일 하단 체크리스트 참조).
**정본을 고칠 일이 생기면** 반드시 교과서 실물로 재확인한 뒤 아래 검증기를 돌린다.

```bash
node "_oneoff-신목고-세계문학/verify-source.mjs" U2
```

이 검증기(`verify-source.mjs`, U2 와 함께 신설)는 **정본 자체가 비어 있는 상태를
잡는다.** `verify.mjs` 는 정본과 JSON 을 대조하므로 **둘 다 비어 있으면 통과하는
착시**가 생기는데, 그 구멍을 막는 검사다. 검사 항목:

- 챕터별 본문/블로그 빈 슬롯 (→ 오류, 차단)
- 문장 끝 구두점 누락 (전사 중 잘림 의심)
- 약어(`p.m.` `St.` `Ms.`) 뒤에서 끊긴 문장 오분할
- 중복 문장(복붙 사고) · 이중 공백

> ⚠️ 스캔본은 **지도서**라 영어 본문 위에 한글 주석이 겹쳐 인쇄돼 있다.
> 아일랜드어 인사말, PART 2 대화문 구두점, PART 3 프랑스어 음식명 표기가 특히
> 오독하기 쉬우니 **교과서 실물로 확인**할 것
> (`feedback_textbook_transcription_traps` — 문장 조용한 누락은 정본만 보면 못 잡는다).

전사가 끝나면 `verify-source.mjs` 가 출력하는 문장 수 표를 `_SOURCE-U2.js` 하단
체크리스트에 옮겨 적어 둔다(다음 사람이 대조할 기준).

## 빌드

U1 절차와 동일하며 `$U` 만 바꾼다. **`U=U2`** 로 두고 위 「빌드 방법」의 명령을
그대로 실행하면 된다. 순서만 요약하면:

```bash
cd mock-exam-analysis
U=U2

node "_oneoff-신목고-세계문학/verify-source.mjs" U2   # ★ 정본 채움 (0순위)
node "_oneoff-신목고-세계문학/verify.mjs" U2          # 정본 ↔ JSON 대조
node "_oneoff-신목고-세계문학/verify-tags.mjs"        # 태그 균형(유닛 자동 탐지, 인자 없음)
# 이후 분석지 → 워크북 → 변형문제 순서는 U1 과 동일
```

`check-overflow.mjs` · `_measure-clip.mjs` · `_measure-pages.mjs` · 합본 압축 ·
삽화 반영 후 이미지 XObject 개수 확인까지 **U1 의 주의사항이 전부 그대로 적용된다.**

## 삽화 소재 (4장, 서로 겹치지 않게)

| Ch | 소재 |
|----|------|
| 1 | 비 내린 더블린 주택가의 젖은 벽돌 계단과 현관 |
| 2 | 교복 넥타이와 학교 책상 위 필기구 |
| 3 | 감자 그라탱이 담긴 오븐 접시와 식탁 |
| 4 | 초록 클로버 장식과 거리의 초록 깃발 |

규격·금지어는 U1 「삽화」 절과 동일(`--ar 16:5 --v 8.1 --style raw`, 실사 포토리얼,
사람·글자 배제, 밝기는 조명 조건으로, **인라인 `NO` 금지 → `--no` 파라미터**).
소재가 서로 겹치지 않으므로 **서로를 배제하는 절은 넣지 않는다**(U1 1번 함정 재발 방지).
