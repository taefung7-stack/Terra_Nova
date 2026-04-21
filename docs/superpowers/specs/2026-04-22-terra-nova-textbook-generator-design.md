# Terra Nova 고1 교재 생성기 — Design Spec

- **Date:** 2026-04-22
- **Owner:** taefung7@gmail.com
- **Status:** Approved (brainstorming → writing-plans 대기)
- **Scope:** Terra Nova STANDARD 레벨 고1 대상 월간 영어 교재의 커리큘럼 + 4페이지 템플릿 + 자동화 빌드 도구 + 첫 달 샘플 1지문 완성

---

## 1. 목적과 배경

Terra Nova는 고1 교과과정 전과목(수학·통합과학·통합사회·국어·한국사 등)을 실제 교과서 단원과 연계해 영어 비문학 지문으로 학습시키는 월간 구독 학습지다. 본 프로젝트는:

1. **12개월 × 20지문(총 240지문) 커리큘럼**을 교과서 단원·성취기준과 매핑하여 설계
2. **4페이지 고정 템플릿**(본문·문제·구문·어휘)을 "글자만 교체" 방식으로 자동화
3. 폰트·컬러를 **CSS 토큰 한 곳에서 교체** 가능하도록 분리
4. 첫 달(2026-05)의 **샘플 지문 1개**를 본문·문제·구문분석·어휘·삽화까지 완전 구현해 파이프라인을 검증

을 목표로 한다.

## 2. 비목표 (Non-Goals)

- 기존 Terra Nova 웹사이트(index.html 등) 수정은 이번 범위가 아니다.
- 첫 달 2~20 지문, 2~12월 지문 콘텐츠 생성은 본 범위가 아니다 (커리큘럼 메타데이터까지만).
- AI 이미지 생성 자동화는 제외 (삽화는 슬롯 방식으로 외부 투입).
- 사용자 계정/결제/배포는 별개 시스템이며 손대지 않는다.

## 3. 전체 아키텍처 (승인된 접근법 A)

```
Terra Nova/
└── textbook/
    ├── textbook.html                   # 유일한 HTML 템플릿
    ├── styles/
    │   ├── tokens.css                  # 폰트·컬러 변수 (리브랜딩 단일 지점)
    │   ├── layout.css                  # 4페이지 그리드·컴포넌트
    │   └── print.css                   # A4 @page, 페이지 브레이크
    ├── scripts/
    │   └── render.js                   # JSON→DOM 바인딩, 슬롯 주입, 오버플로우 감지
    ├── content/
    │   ├── curriculum.json             # 12개월 × 20지문 메타데이터 (240 entries)
    │   └── passages/
    │       └── 2026-05/
    │           ├── 01.json             # 샘플 완성본 (이번 세션)
    │           └── 02~20.json          # 후속 작업에서 채움 (이번 세션 제외)
    ├── assets/
    │   └── illustrations/
    │       └── 2026-05/01.svg          # 이번 세션에서 제작
    ├── tools/
    │   ├── validate-content.mjs        # AJV 스키마 검증
    │   ├── build-pdf.mjs               # Puppeteer PDF 배치 생성
    │   └── dev-server.mjs              # 로컬 미리보기 정적 서버
    ├── tests/
    │   ├── schema.test.mjs
    │   └── render.test.mjs
    ├── dist/                           # PDF 출력 (gitignore)
    └── package.json                    # puppeteer, ajv, vitest
```

**런타임 흐름**
브라우저에서 `textbook.html?month=2026-05&passage=01` 열기 → `render.js`가 해당 JSON fetch → 템플릿 슬롯(`data-slot="…"`)에 주입 → 4페이지 DOM 완성 → 인쇄 대화상자(Ctrl+P)로 PDF 저장도 가능.

**배치 PDF 흐름**
`npm run build -- --month 2026-05` → `validate-content.mjs`가 스키마 검증 → `build-pdf.mjs`가 헤드리스 Puppeteer로 각 지문 URL 방문 → `dist/2026-05/01.pdf … 20.pdf` 저장 → 선택적 `--merged`로 합본 PDF도 생성.

## 4. 커리큘럼 설계 (12개월 × 20지문)

### 4.1 핵심 원리

- **한 달 = 한 테마 아크**: 20지문이 한 달 동안 하나의 큰 주제를 다각도로 조명
- **한 지문 = 한 단원 깊이 학습**: 4페이지 × 40~60분 ≈ 지문당 50분, 월간 약 17시간 집중 학습량 확보
- **교과서 단원·성취기준 매핑**: 모든 지문에 연계 단원 + 성취기준 코드(`10통사01-02` 형식) 기록

### 4.2 월별 20지문 과목 분배 (고정)

| 과목 | 지문 수 | 비중 |
|------|---------|------|
| 통합과학 | 6 | 30% |
| 통합사회 | 6 | 30% |
| 수학 (개념·응용) | 3 | 15% |
| 국어 (문학·비문학) | 3 | 15% |
| 한국사 | 1 | 5% |
| 예체능·정보 | 1 | 5% |
| **합계** | **20** | **100%** |

### 4.3 월별 난이도 분포 (고정)

| 난이도 | 지문 수 | 인지 유형 예시 |
|--------|---------|----------------|
| 쉬움 | 5 | 요지/주제/제목 |
| 중간 | 7 | 빈칸/어휘/함의 |
| 어려움 | 6 | 간접서술/순서/삽입 |
| 도전 | 2 | 장문/실전 오답 빈출 |

### 4.4 12개월 테마

| 월 | 테마 | 연계 과목 축 |
|----|------|-------------|
| 2026-05 | The Cosmic Address | 통합과학 시스템·상호작용 × 통합사회 시공간과 인간 |
| 2026-06 | Living Together | 통합과학 환경·생태 × 통합사회 지속가능성·인구 |
| 2026-07 | Shaping the Modern World | 통합사회 근대화 × 한국사 개항·식민 |
| 2026-08 | Numbers that Decide | 수학 함수·통계 × 통합과학 데이터과학 |
| 2026-09 | Rights and Voices | 통합사회 인권·민주주의 × 국어 논설문 |
| 2026-10 | Machines Rising | 통합과학 기술 × 통합사회 미래사회·노동 |
| 2026-11 | Stories We Tell | 국어 현대·고전문학 × 예술사 |
| 2026-12 | Choices and Markets | 통합사회 시장·합리적 선택 × 수학 최적화 |
| 2027-01 | The Fabric of Matter | 통합과학 물질·규칙성·화학반응 |
| 2027-02 | Words That Move Us | 국어 화법·매체 × 통합사회 미디어리터러시 |
| 2027-03 | Memory and Identity | 한국사 근현대 × 통합사회 정체성 |
| 2027-04 | The Big Picture | 12개월 핵심 주제 재조명, 수능 실전 대비 |

### 4.5 `curriculum.json` 엔트리 구조

각 엔트리는 지문 콘텐츠가 아닌 **메타데이터만** 기록한다:

```jsonc
{
  "id": "2026-05-01",
  "month": "2026-05",
  "sequence": 1,
  "theme_en": "The Cosmic Address",
  "passage_topic_en": "Where Do Atoms Come From?",
  "passage_topic_ko": "원자는 어디서 왔을까?",
  "subject": "통합과학",
  "linked_unit": "I-1 우주의 시작과 원소의 생성",
  "achievement_standard": "10통과01-01",
  "difficulty": "중간",
  "cognitive_skill": "빈칸 추론",
  "key_concepts": ["빅뱅", "핵융합", "원소주기율"]
}
```

## 5. 4페이지 템플릿 명세

모든 페이지 공통: A4 세로(210×297mm), 여백 15mm, 상단 3mm 테마 컬러 바, 좌하 회차 마크, 우하 Terra Nova 로고.

### 5.1 페이지 1 — The Passage
- 상단 메타 바: `subject`, `difficulty` 점 표시
- 타이틀 (22pt Axiforma Semibold), 서브타이틀 (12pt italic)
- 본문: 영어 지문 150~200 단어, Axiforma Regular 12pt, line-height 1.7, 본문 영역 전체의 65%
- 하단 25% (65mm 고정 높이): 삽화 슬롯, `object-fit: cover`, 1줄 캡션
- **글자수/이미지 높이 고정으로 레이아웃 불변**

### 5.2 페이지 2 — Practice & 교과서 지식
- 상단 60%: 3개 문제
  - Q1: 모의고사형 객관식 5지선다
  - Q2: 모의고사형 객관식 5지선다
  - Q3: 내신 서술형 (3~4줄 답란)
- 하단 35~40%: 한국 교과서 연계 지식 (150~230자 한글)
- Key Concept 3개 태그 표시

### 5.3 페이지 3 — Syntax Breakdown
- 본문 재수록 (10pt, 문장별 번호 [1][2][3]…)
- 문장별 구문 분석 테이블: S/V/O/C 라벨, 끊어 읽기 `/`, 문법 메모
- 핵심 문법 포인트 2~4개
- 문단별 자연스러운 한글 해석

### 5.4 페이지 4 — Vocabulary Lab
- 단어 카드 8~10개: 단어, 품사, 뜻, 동의어/반의어, 실제 모의고사 출처 예문
- 하단: 셀프 테스트 체크박스 표

### 5.5 "템플릿 불변성" 보장 장치

1. **모든 텍스트 슬롯 maxLength 강제** (AJV 스키마)
2. **모든 이미지 슬롯 고정 높이 + `object-fit: cover`** → 이미지 비율과 무관
3. **모든 폰트·컬러 CSS 변수 (`tokens.css` 단일 지점)**
4. **각 `<section>`에 `break-after: page` + `overflow` 감시**: 넘치면 빌드 경고

## 6. 데이터 스키마 (`content/passages/*/NN.json`)

### 6.1 AJV 스키마 핵심 제약

- `schema_version`: "1.0" 고정
- `id`: `YYYY-MM-NN` 패턴
- `meta.difficulty`: enum (`쉬움|중간|어려움|도전`)
- `page1.body`: 영어 단어 수 150~200 (공백 기준)
- `page2.questions`: 정확히 3개 (`[mock_objective, mock_objective, school_descriptive]` 순서)
- `page2.questions[*].choices`: mock_objective는 정확히 5개
- `page2.textbook_tieback.body_ko`: 한글 150~230자
- `page3.sentences`: 최소 4, 최대 15
- `page4.vocab`: 8~10개

### 6.2 스키마 위반 시

- `validate-content.mjs`가 해당 파일 경로·필드·원인 출력 후 **exit 1**
- `build-pdf.mjs`는 검증 통과 전까지 실행 자체가 안 됨
- 결과: **잘못된 데이터가 템플릿에 들어가는 시나리오 자체가 불가능**

## 7. 테마 토큰 (`styles/tokens.css`)

```css
:root {
  --tn-bg: #F8FAF9;
  --tn-ink: #032221;
  --tn-accent: #00DF81;
  --tn-accent-2: #03624C;
  --tn-muted: #AAC8C4;
  --tn-divider: #E3EDE9;
  --tn-theme: var(--tn-accent);

  --font-body: 'Axiforma', 'Pretendard', system-ui, sans-serif;
  --font-display: 'Axiforma', 'Pretendard', sans-serif;
  --font-ko: 'Pretendard', 'Noto Sans KR', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --fs-title: 22pt;
  --fs-subtitle: 12pt;
  --fs-body: 12pt;
  --fs-body-small: 10pt;
  --fs-caption: 9pt;
  --lh-body: 1.7;
}

[data-month="2026-05"] { --tn-theme: #6EA8FF; }
[data-month="2026-06"] { --tn-theme: #2CC295; }
/* ... 12개월 전체 */
```

**운영 원칙**: 교재 전체 폰트·컬러 변경은 이 파일 수정만으로 즉시 반영. 재빌드 불필요 (런타임 CSS 변수).

## 8. PDF 빌드 CLI

### 8.1 명령어

| 명령 | 동작 |
|------|------|
| `npm install` | 의존성 설치 (puppeteer, ajv, vitest) |
| `npm run preview` | `localhost:4173`에서 `textbook.html` 서빙 |
| `npm run validate -- --month 2026-05` | 월 폴더 JSON 스키마 검증만 |
| `npm run build -- --month 2026-05` | 해당 월 20 PDF 생성 |
| `npm run build -- --month 2026-05 --only 1` | 1번 지문만 |
| `npm run build -- --month 2026-05 --merged` | 20개 + 합본 PDF |

### 8.2 에러 처리

- 스키마 실패: 파일·필드·원인 출력 + exit 1
- 오버플로우 감지: 해당 지문 스킵, 경고 로그, 나머지 계속 진행
- 이미지 누락: placeholder 삽입 + 경고

### 8.3 테스트 (vitest)

- `tests/schema.test.mjs`: 의도적 글자수 초과 JSON이 실제로 거부되는지
- `tests/render.test.mjs`: Puppeteer로 샘플 1지문 렌더 후 page 4개, 각 297mm 정확 검증

## 9. 이번 세션 산출물 (실제로 만들 것)

1. `textbook/` 디렉터리 전체 파일 (템플릿·CSS·스크립트·빌드·테스트)
2. `content/curriculum.json` — 240 엔트리 전체 메타데이터
3. `content/passages/2026-05/01.json` — 샘플 1지문 완전본 (영어 본문, 3문제, 구문분석, 어휘 8~10개)
4. `assets/illustrations/2026-05/01.svg` — 샘플 삽화 1장 (Terra Nova 브랜드 팔레트 기반 라인아트)
5. 이 샘플이 `npm run build`로 실제 PDF 생성까지 확인

## 10. 향후 확장(이번 세션 밖)

- 나머지 239개 지문 콘텐츠
- 실제 Axiforma 웹폰트 로드 (라이선스 확인 후)
- 해설 PDF(정답지) 별도 템플릿
- 학생용 vs 선생님용(정답 숨김/노출) 모드
- Terra Nova 사이트 `/textbook/` 경로 통합

## 11. 승인 이력

- 2026-04-22: 접근법 A(HTML + Puppeteer PDF) 승인
- 2026-04-22: 샘플 1지문만 완성 범위 승인
- 2026-04-22: 삽화 이미지 슬롯 방식 승인
- 2026-04-22: 문제 구성 "모의 2 + 서술 1 = 3문제" 승인
- 2026-04-22: 전체 설계(섹션 1~6) 승인
