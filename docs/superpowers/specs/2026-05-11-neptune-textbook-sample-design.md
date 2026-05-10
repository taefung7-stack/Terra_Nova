# NEPTUNE (중2) 6월호 샘플 지문 설계

**Date:** 2026-05-11
**Topic:** 중등부 교재 (TERRA / NEPTUNE / URANUS) 첫 샘플
**Scope:** 중2 NEPTUNE, 1지문(4페이지) PDF 샘플 — 풀북 빌드 아님

---

## 배경

기존 Terra Nova 교재는 4-page 레이아웃(고1 SATURN 6월호)을 기준 캐논으로 두고, MARS(초5)·JUPITER(고2)·SUN(고3)이 같은 레이아웃·다른 톤으로 파생됨. **중등부(TERRA/NEPTUNE/URANUS)는 비어 있고, Mars의 친근한 톤과 Saturn의 학술 톤 사이를 메워야 함.**

사용자 결정으로 중2 NEPTUNE은 **page2(문제)와 page3(문장분석) 둘 다 새 레이아웃으로 교체**한다. page1·page4는 기존 구조 유지(톤만 조절).

## 결정 사항 (사용자 답변 반영)

| 항목 | 결정 |
|------|------|
| 학년 | 중2 (NEPTUNE) |
| 본문 톤 | 담담한 설명형 — '너' 어조 없는 3인칭 평서문 |
| 본문 길이 | 200~220 단어 |
| Lexile | 800~870L, AR 4.5~5.0 |
| page2 | 학교시험 복합형 4문제 (T/F+근거 / 동의어·반의어 매칭 / 영↔한 서답형 / 단답형) |
| page3 | Reading Strategy 카드 + Mind Map (S/V/O/C 카드 대체) |
| page4 | 콜로케이션 8개 + 각 예문 2개 |
| 컬러 | 6월호 공유 purple (`#7546E8` / `#2D1C7F` / `#E8E2FA`) |
| 빌드 결과 | `dist/2026-06-N/sample-01.pdf` 4페이지 단일 PDF |
| 주제 | 중2 과학·생명과학 — "세포와 생물의 구성" (식물세포 vs 동물세포) |
| 교과 코드 | `9과05-01` 형식 추정값 + `achievement_verified: false` (NCIC 검수 대기) |

## 폴더·ID 컨벤션

- 콘텐츠: `content/passages/2026-06-N/01.json`
- 일러스트: `assets/illustrations/2026-06-N/01.png` (없으면 placeholder)
- ID 패턴: `2026-06-N-01` (기존 `^\d{4}-\d{2}(-[A-Z][a-zA-Z]*)?-\d{2}$` 정규식과 호환)
- 토큰: `tokens.css` 의 `[data-month="2026-06-N"]`을 기존 6월호 그룹에 추가

## 페이지별 디자인

### page1 — Passage (고등과 동일 레이아웃, 톤만 다름)

기존 캐논 그대로:
- header: PASSAGE / chapter-tag
- meta chips: subject(과학) / part_ko(생명과학) / Lexile / AR
- title + subtitle + body(200~220w) + illustration + caption
- footer: page-num / DAY 라벨 / brand

### page2 — School-Style Practice (신규)

기존 5지선다 4문제 대신 **중등 학교시험 복합형 4문제**.

```
header: PRACTICE / chapter-tag
body:
  Q1. T/F + 근거 찾기 (4 statements, T/F + line# 적기)
  Q2. 동의어·반의어 매칭 (4 단어 × 풀에서 SYN 또는 ANT 고르기)
  Q3. 영↔한 짧은 서답형 (영문 1문장 한국어로 / 한국어 1문장 영어로)
  Q4. 본문 단답형 (영어 두 단어 이내)
  --- (남은 공간) ---
  textbook_tieback: unit_label / body_ko / tags / visual_aid
footer: page-num / DAY / brand
```

**JSON 스키마 변경 (page2):**
- `questions[]`에 새로운 4가지 type 추가 (oneOf 분기):
  - `tf_evidence`: { type, style, statements[4]: {text_en, answer: "T"|"F", evidence_line: int}, model_answer }
  - `match`: { type, style, prompt, words[4]: {text, kind: "SYN"|"ANT", target: 풀의 인덱스}, pool[6]: string, model_answer }
  - `short_translate`: { type, style, items[2]: {direction: "en2ko"|"ko2en", text}, model_answer }
  - `short_answer`: { type, style, prompt, max_words: int, model_answer }

### page3 — Reading Strategy + Mind Map (신규)

기존 S/V/O/C 카드 + 우리말해석 대신 **읽기 전략 카드 + 마인드맵**.

```
header: READING / chapter-tag
body:
  좌측 (40%): Reading Strategy 카드 3개
    - 각 카드: title + tip + 본문 line# 또는 keyword
  우측 (60%): Mind Map
    - 중심 노드 (큰 원, 본문 키워드 1개)
    - 가지 3~4개 (단락별 핵심 개념, 각 가지에 짧은 한글 설명)
  하단: 우리말 해석 (compact, 핵심 문장 5~7개만)
footer: page-num / DAY / brand
```

**JSON 스키마 변경 (page3):**
- `sentences[]` 와 `translation_ko` 제거하고 다음 필드로 대체:
  - `strategies[]` (3개): { title, tip, source: "line N" 또는 "keyword: …" }
  - `mindmap`: { central: string, branches[]: { label, summary } } (3~4 branches)
  - `translation_compact`: string (5~7문장만 핵심)

### page4 — Vocabulary (콜로케이션)

기존 단어 12개 카드 대신 **콜로케이션 8개 카드**. 카드 더 큼.

**JSON 스키마 변경 (page4):**
- `vocab[]` (8개): 
  - `phrase`: 영어 콜로케이션 (예: "be made of", "look at carefully")
  - `pattern`: 문법 패턴 라벨 (예: "be + p.p. + of", "V + adv")
  - `meaning_ko`
  - `examples[2]`: { en, ko }
- 기존 vocab의 `synonyms`/`antonyms`/`pos` 필드 제거 (콜로케이션엔 부적합)

### answers (기존 구조 유지하되 분기)

`answers.explanations[]`은 4개 그대로. 단 새 question type별 해설:
- `tf_evidence`: 각 statement의 정답·근거 line, rationales 4개 (각 항목별)
- `match`: 각 단어의 정답 풀 인덱스 + 이유, rationales 4개
- `short_translate`: model translation + 핵심 어휘 rationale
- `short_answer`: model answer + evidence

## 인프라 변경

### 신규 파일
- `schemas/passage.mid.schema.json` — v2.2-mid 신규 스키마
- `templates/textbook-mid.html` — 중등 전용 4페이지 템플릿
- `scripts/render-mid.js` — 중등 전용 렌더러
- `styles/layout-mid.css` — 중등 전용 page2/page3 스타일 (page1/page4는 기존 layout.css import)
- `tools/build-mid-sample.mjs` — 단일 지문 4페이지 PDF 빌더

### 수정 파일
- `styles/tokens.css` — `[data-month="2026-06-N"]` 셀렉터를 기존 6월호 그룹에 추가

### 빌드 명령
```bash
node tools/build-mid-sample.mjs --month 2026-06-N --passage 01
# → dist/2026-06-N/sample-01.pdf  (4 페이지)
```

## 검증

- 신규 스키마는 AJV로 validate
- body 단어수 200~220 범위 enforce
- 4문제 모두 다른 type (oneOf)
- mindmap branches 3~4개
- collocation 정확히 8개

## 작업 순서

1. tokens.css 팔레트 매핑 추가
2. passage.mid.schema.json 작성
3. 2026-06-N/01.json 본문 작성
4. textbook-mid.html + render-mid.js + layout-mid.css
5. build-mid-sample.mjs (단일 지문 PDF 빌더)
6. 검증 + PDF 빌드 + 결과 확인

## 비목표 (이번 작업에서 안 함)

- 풀북(134p) 빌드 — 지문 1개만 있으니까
- 중1(TERRA), 중3(URANUS) 톤 분기 — 중2 샘플 보고 사용자 피드백 후 결정
- TOC/Week divider/Answer book/Wordpack — 단일 지문 샘플엔 불필요
- MONTHLY-PRODUCTION.md 업데이트 — 중등부 파이프라인이 정리된 후 일괄
- 미드저니 일러스트 발주 — placeholder로 진행, 사용자 승인 후 별도 작업
