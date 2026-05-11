# Terra Nova 중학교 교재 작성 가이드 (Schema v2.2-mid, NEPTUNE 계열)

이 문서는 **NEPTUNE(중학교) 신간을 만들 때 4페이지 포맷이 깨지지 않도록** 틀을 고정합니다.
JSON 하나만 규격대로 작성하면 HTML + PDF 레이아웃은 자동으로 맞춰집니다.

> **공식 디자인 템플릿 PDF**: `templates/midschool-template.pdf` (= `dist/2026-06-N/sample-01.pdf` 사본, 2026-05-12 확정)
> **페이지별 PNG 미리보기**: `templates/midschool-template-p{1..4}.png`
> **Canonical 샘플 JSON**: `content/passages/2026-06-N/01.json`
> **스키마 원본**: `schemas/passage.mid.schema.json`
> **렌더러**: `textbook-mid.html` + `styles/layout-mid.css` + `scripts/render-mid.js`
> **샘플 빌드 스크립트**: `tools/build-mid-sample.mjs`

> ⚠️ **이 가이드는 고등부(`AUTHORING-GUIDE.md`, Schema v2.1)와 별개입니다.**
> 고등부는 Saturn/Jupiter/Sun/Mars 계열 — 페이지 구성과 스키마가 다릅니다.
> 중학교 신간은 반드시 이 문서 + `passage.mid.schema.json` 규격을 따릅니다.

---

## 1. 파일 & 폴더 규칙

| 항목 | 규칙 |
|------|------|
| 지문 JSON | `content/passages/{YYYY-MM-N}/{NN}.json` — `-N` 접미사 필수, `NN`은 01~20 |
| 삽화 이미지 | `assets/illustrations/{YYYY-MM-N}/{NN}.{png\|jpg\|webp}` |
| `page1.illustration` 경로 | `"../../assets/illustrations/YYYY-MM-N/NN.확장자"` (상대경로 고정) |
| PDF 출력 | `dist/{YYYY-MM-N}/sample-{NN}.pdf` (개별), `dist/{YYYY-MM-N}/2026-06-Neptune.pdf` (풀북) |

---

## 2. 4페이지 공식 구성 (NEPTUNE 디자인 기준)

샘플 PDF의 페이지 순서·블록 구성은 **변경 없이** 사용합니다. JSON의 어떤 필드가 어떤 페이지에 매핑되는지만 기억하면 됩니다.

### Page 1 — PASSAGE (지문)

| 블록 | 내용 |
|------|------|
| 헤더 | `PASSAGE` 라벨 + 우상단 `part_ko` |
| 메타 칩 행 | `subject` / `part_ko` / `Lexile` / `AR` / `CEFR` (예: 과학·생명과학·830L·AR4.7·B2) |
| 제목 + 부제 | `page1.title` (영문 큰글씨) + `page1.subtitle` (한 줄 영문 부제) |
| 본문 | `page1.body` — 5문단 권장, 첫 초안 295~310 단어 목표 (290 직선보다 5~10 단어 마진) |
| 본문 내 마커 | `<u>nucleus</u>` 핵심 어휘 밑줄, `<mark>chloroplasts</mark>` 강조, `<blank>` 빈칸 (Q4 본문 단답형과 연동) |
| 일러스트 | `page1.illustration` (가로 16:5 와이드 배너, 본문 180mm 폭 전면 사용 — 자르지 않음) |
| 일러스트 캡션 | `page1.illustration_caption` |
| 푸터 | 좌하단 페이지 번호 ①, 우하단 `TERRA NOVA` |

### Page 2 — PRACTICE (학교시험 복합형 4문제)

NEPTUNE의 **차별점**: 단일 모의고사 객관식 하나가 아니라, 학교 내신·서답형까지 포함한 4문제 콤보.

| 번호 | type | 형식 |
|---|---|---|
| **Q1** | `mock_objective` | 5지선다 객관식 (주제·요지 등) |
| **Q2** | `tf_evidence` | T/F 4문항 + 본문 근거 줄 번호(`evidence_line`) — 자동 채점용 |
| **Q3** | `short_translate` | 영↔한 짧은 서답형 2문항 (`en2ko` 1개 + `ko2en` 1개) |
| **Q4** | `blank_short` | 본문 단답형 — 본문의 `<blank>` 위치에 들어갈 단어/구 (보통 2단어) |

상단에 우상단 `part_ko` 표시 유지. 하단에는 **고2 과학 단원 미니맵**(현재 단원 위치 시각화) 박스. 푸터: `DAY 01` + 페이지 번호.

> ⚠️ 6차 피드백 반영: Q2 `statements`의 `evidence_line`은 채점 키 용도만 (학생용 카드 화면에서 제거됨).

### Page 3 — SYNTAX + 우리말 해석

고등부 SYNTAX 페이지와 거의 동일한 구조이되, 본문 라인 앞에 `[번호]` 표기로 Q2 evidence 참조 가능하게.

| 블록 | 내용 |
|------|------|
| 헤더 | `SYNTAX` 라벨 + 우상단 `part_ko` |
| 범례 | S 주어 / V 동사 / O 목적어 / SC/OC 보어 / M 수식어 / 접 접속사 / 관 관계사 (배지 색) |
| 문장 카드 | 본문의 핵심 문장 11개 — `[번호]` 앞표기 + 각 문장 끝에 영어 라벨(예: `enables`, `however`) |
| 칩 라인 | 각 문장 아래에 토큰별 역할 chip (균등 간격, 색상 통일) |
| 우리말 해석 | 하단 한 블록에 전 문단 한국어 번역 — `[번호]` 표기로 영문 카드와 1:1 매칭 |
| 푸터 | 좌하단 ③, 우하단 `TERRA NOVA` |

### Page 4 — VOCAB (12장 카드)

| 블록 | 내용 |
|------|------|
| 헤더 | `VOCAB` 라벨 + 우상단 `part_ko` |
| 카드 그리드 | **12장** (4행 × 3열 또는 6행 × 2열) — 모두 같은 색·테두리·간격 |
| 카드 한 장 | 영문 표제어(`be made of`, `hold one's shape` 등 collocation 위주) + 우상단 패턴 칩 (`be + p.p. + of + n`) + 좌상단 빈도 라벨 (`출제빈도`) + 영문 예문 1개 + 한국어 의미 |
| 단어 카드 일부 | `organism`처럼 단일 명사일 경우 `root:`(어근 분해) + `(그리스/라틴) ...` 출처 표기 |
| 푸터 | 좌하단 `DAY 01`, 우하단 페이지 번호 ④ + `TERRA NOVA` |

> 6차 피드백 반영: 4페이지 vocab 카드는 **색을 통일** (이전 collocation/word_root/word 3분류 색상 분리 → 단일 디자인).

---

## 3. 일러스트 가이드 (MARS 초5와 분리)

- **NEPTUNE(중학교) 일러스트 톤**: 시네마틱 에디토리얼 + 페인터리 3D 혼합 (Saturn/Jupiter 고등부와 같은 V1 톤 차용 가능). 우드블록·폴크아트 비선호.
- **모든 미드저니 프롬프트는 항상 `--ar 16:5`** (와이드 배너 비율, Mars/Saturn/Jupiter 공통)
- **본문 180mm 폭 전면 사용**, 절대 자르지 않음
- 초5(MARS) 프롬프트와 한 문서에 섞지 않음 — 톤·키워드·파일 분리

---

## 4. 빌드 워크플로

```bash
# 1) Canonical 샘플(01.json)을 복사
cp content/passages/2026-06-N/01.json content/passages/2026-07-N/01.json

# 2) 에디터에서 meta / page1~page4 필드를 수정

# 3) 단일 지문 PDF 미리보기 (4페이지)
node textbook/tools/build-mid-sample.mjs --month 2026-07-N --passage 01

# 4) 결과 확인: dist/2026-07-N/sample-01.pdf

# 5) 풀북(20지문 + supplements) 빌드
node textbook/tools/build-fullbook.mjs --month 2026-07-N
```

스키마 검증 실패 시 빌드가 시작되지 않으므로 4페이지 포맷 불변성이 유지됩니다.

---

## 5. 학교시험 단원 미니맵 (Page 2 하단)

NEPTUNE만의 특징적 블록. 현재 단원이 전체 단원 트리에서 어디인지 시각적으로 보여줍니다. JSON 필드:

```json
"page2": {
  "unit_minimap": {
    "subject_label": "중2 과학 · 생물의 구성과 다양성",
    "axes": ["식물세포", "동물세포", "세포벽", "엽록체"],
    "current_emoji": "🧬"
  }
}
```

샘플 01에는 4축 미니맵으로 식물세포·동물세포·세포벽·엽록체가 배치되어 있습니다.

---

## 6. 향후 신간 만들기 — 빠른 체크리스트

새 달 만들 때 첫 참조:

- [ ] `content/passages/{YYYY-MM-N}/` 디렉토리 생성
- [ ] `01.json`을 canonical `2026-06-N/01.json`에서 복사 후 meta·본문·문제만 수정
- [ ] `assets/illustrations/{YYYY-MM-N}/01.png` 일러스트 추가 (16:5 와이드)
- [ ] `node tools/build-mid-sample.mjs --month YYYY-MM-N --passage 01`로 미리보기
- [ ] **출력 PDF가 `templates/midschool-template.pdf`와 동일한 4페이지 구성인지 시각 비교**
- [ ] 20지문 모두 작성 후 `build-fullbook.mjs`로 풀북 빌드

차이가 발견되면 디자인이 아닌 JSON 데이터에 원인이 있음 — 누락 필드나 잘못된 `type` 값을 점검.

---

## 7. 이 가이드의 효력

이 문서가 박제하는 디자인은 **`templates/midschool-template.pdf` (2026-05-12 확정)** 입니다.
디자인 변경은 사용자가 명시 지시한 경우에만 진행하며, 이 가이드도 함께 갱신해야 합니다.
