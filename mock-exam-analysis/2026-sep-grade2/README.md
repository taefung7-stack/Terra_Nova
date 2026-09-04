# 2026학년도 9월 고2 전국연합학력평가 영어 — 분석지·워크북·변형문제

판매용 3종 산출물. 빌더는 **v1.0 LOCKED** 를 그대로 사용하며 이 회차는 데이터만 추가했다.

## 범위

18~45번 독해 전 문항. **25·27·28번 제외**(사용자 요청 — 도표 1 + 안내문 2).
→ **22지문**: 18, 19, 20, 21, 22, 23, 24, 26, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43

- `41.json` 하나가 **41·42번**을 함께 다룬다 (장문: 제목 + 어휘).
- `43.json` 하나가 **43·44·45번**을 함께 다룬다 (장문: 순서 + 지칭 + 내용 불일치).
- 듣기(1~17)는 분석지 대상이 아니다.

원문·정답 박제: [`_SOURCE_MANIFEST.md`](_SOURCE_MANIFEST.md) · 원문 전문: [`_EXAM_TEXT.md`](_EXAM_TEXT.md)
저작 규칙: [`_AUTHORING_BRIEF.md`](_AUTHORING_BRIEF.md)

## 빌드

```bash
cd mock-exam-analysis

npm run build:sep2       # 분석지 HTML (22개)
npm run workbook:sep2    # 워크북 HTML (22개)
npm run variant:sep2     # 변형문제 통합본 (variant-book.html)
npm run pdf:sep2         # 위 HTML 전부 → PDF
npm run combine:sep2     # 분석지 합본 PDF
npm run combine-wb:sep2  # 워크북 합본 PDF

npm run all:sep2         # build + workbook + variant + pdf 한 번에
```

## 산출물 (`dist/`)

| 산출물 | 파일 | 분량 |
|--------|------|------|
| 분석지 합본 | `2026-9월-고2-영어-분석지-합본.pdf` | 139p |
| 워크북 합본 | `2026-9월-고2-영어-워크북-합본.pdf` | 238p |
| 변형문제 | `variant-book.pdf` | 185p |
| 지문별 낱장 | `{N}.pdf` / `workbook-{N}.pdf` | 각 22개 |

## 출고 전 필수 검사 (순서대로)

```bash
# 1) 데이터 정합성 — ERROR 0 이어야 함
node 2026-sep-grade2/_qa-check.mjs

# 2) 페이지 넘침 — 전 페이지 overflow=NO (절대 조건)
for f in 2026-sep-grade2/dist/*.html; do node builder/check-overflow.mjs "$f"; done

# 3) 굿노트 백지 — 분석지는 항상 '위험'으로 나오므로 평탄화 필수
node builder/goodnotes-safe.mjs --check 2026-sep-grade2/dist/*.pdf
node builder/goodnotes-safe.mjs 2026-sep-grade2/dist/*.pdf   # 변환
```

`_qa-check.mjs` 가 잡는 것:
- 분석지 — `passage`/`passage_ko`/`sentences` 길이 일치, vocab 25·flow 4, 정답 1개,
  정답 길이 균형(오답 평균의 1.4배 초과 시 WARN), 삽화 프롬프트 `--ar 16:5 --v 8.1`·
  인라인 `NO xxx` 금지, 한글 이중 공백
- 워크북 — `{{n:A/B}}` 토큰 수 = `answers` 수, **고유명사 오탐**(빌더가 문항을 에러 없이
  삭제하는 함정 — 빌더의 `buildProperNounSet` 을 그대로 이식해 검사)
- 변형 — `underlined`/`blank_target`/`underlines[].text` 가 passage 에 글자 그대로 존재하는지,
  **빈칸 렌더 가능성**(`blank_sentence_index` 가 `___` 문장을 가리키는지 — 어긋나면 빈칸이
  조용히 렌더되지 않아 **정답이 그대로 노출**된다), 정답 ①~⑤ 분포 쏠림

## ⚠️ 이 회차에서 실제로 걸린 함정 (다음 회차에도 반복될 것)

1. **워크북/변형 CSS 에 글리프 보정이 없었다** — `analysis.css` 에만 있던
   `PretendardTN` @font-face(2026-09-04 추가)를 `workbook.css`·`variant.css` 로 포팅.
   안 하면 헤더 `[2026] … · 18번` 의 대괄호·가운뎃점이 **☰ 로 깨진다**.
   보정 범위에 `U+00B7`(·)를 추가했다. 분석지만 육안 확인하면 못 잡는다.
2. **`blank_sentence_index` 0-based** — 1-based로 쓰거나 `___` 위치와 어긋나면
   빌더(`build-variant.mjs:142`)가 그 문장에서만 치환을 시도하므로 **빈칸이 안 생기고
   정답이 노출**된다. 20번·21번에서 실제 발생, 수정 완료.
3. **고유명사 오탐** — 본문에서 늘 문두(대문자)로만 등장하는 평범한 단어
   (`what`·`taste`·`secretary`·`reproducing` 등)를 빌더가 고유명사로 보고 그 문항을
   **에러 없이 삭제**한다. 5건 발생, 정답 토큰을 다른 슬롯으로 옮겨 해결.
   참고로 **6월 회차에는 이 함정으로 11문항이 이미 유실된 채 출고**되어 있다.
4. **굿노트 백지** — 분석지는 형광펜 그라데이션 때문에 항상 루미노시티 마스크가 생긴다.
   `pdf:sep2` 를 다시 돌리면 평탄화가 **되돌아가므로**, PDF 재생성 → 합본 → 평탄화 순서를 지킬 것.

## 삽화

미드저니 PNG 는 아직 없다. 프롬프트 22개는 [`MIDJOURNEY_PROMPTS.md`](MIDJOURNEY_PROMPTS.md).
`assets/illust-{N}.png` 로 저장 후 `npm run build:sep2` 재실행하면 자동 반영된다
(현재는 삽화 자리에 placeholder 박스가 렌더된다).
