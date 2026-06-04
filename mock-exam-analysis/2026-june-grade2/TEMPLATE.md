# Terra Nova 모의고사 분석지 — 표준 포맷

> 매월 모의고사가 끝나면 시험지(PDF/텍스트)만 넣으면 자동 빌드되도록 만든 표준 데이터 스키마.

## 폴더 구조

```
mock-exam-analysis/
├── 2026-march-grade2/          ← 회차별 폴더 (예: 2026 3월 고2)
│   ├── styles/analysis.css      ← 공용 스타일 (1회 작성, 모든 회차 공유 가능)
│   ├── assets/
│   │   ├── illust-21.png        ← 지문별 미드저니 삽화 (16:5, v7)
│   │   ├── illust-22.png
│   │   └── ...
│   ├── data/
│   │   ├── 21.json              ← 지문별 데이터 (스키마 v1)
│   │   └── ...
│   ├── sample-21.html           ← 현재 샘플 (수동 렌더 결과물)
│   └── dist/                    ← (추후) 자동 빌드 산출물
└── TEMPLATE.md                  ← 이 문서
```

## 데이터 스키마 v1 (지문 1개당 1 JSON)

```json
{
  "exam": "[2026] 3월 모의고사 2학년",
  "question_no": 21,
  "type": "밑줄 추론",
  "score": 3,
  "summary_ko": "수학 수업에서 모든 학생의 답변을 존중·수용하여 안전한 학습 공동체를 만들어야 학생들이 사고를 발전시킬 수 있다.",
  "main_idea_en": "Accepting all student answers creates safe learning environments for mathematical growth.",
  "title_en": "Building Respectful Classroom Communities Through Accepting All Student Ideas",
  "illustration_prompt": "A respectful math classroom where a teacher records all student answers on a blackboard with a calm, neutral expression, students engaged and raising hands, soft pastel pink and warm beige tones, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7",
  "vocab": [
    { "no": 1, "word": "establishing", "pos": "동명사", "meaning": "확립하는 것" },
    { "no": 2, "word": "respectful",   "pos": "형용사", "meaning": "존중하는" }
  ],
  "flow": [
    { "label": "쉽게 이해하기 1", "title": "안전한 학습 환경의 기초", "body": "..." },
    { "label": "쉽게 이해하기 2", "title": "학생의 적극적 참여 유도", "body": "..." }
  ],
  "sentences": [
    {
      "no": 5,
      "en_chunks": [
        { "text": "It is important" },
        { "text": "to model and expect", "key": true },
        { "text": "the acceptance of all ideas" },
        { "text": "without derogatory comments", "key": true }
      ],
      "ko_chunks": "중요하다 / 모범을 보이고 기대하는 것이 / 모든 아이디어의 수용을 / 경멸적인 언급 없이.",
      "ko_full":   "경멸하는 발언 없이 모든 아이디어를 받아들이는 것을 모범으로 보이고 기대하는 것이 중요하다.",
      "highlight_word": null,
      "points": [
        { "tag": "어법 P.", "kind": "grammar", "text": "It-가주어 / to부정사-진주어. 'to model and (to) expect' 병렬 — 두 번째 to 생략." },
        { "tag": "어휘 P.", "kind": "vocab",   "text": "derogatory(경멸하는) = disparaging, insulting ↔ respectful" }
      ]
    }
  ],
  "answer": {
    "value": "② suppressing evaluative responses to students’ answers",
    "core_logic": "교사는 동의·반대를 드러내는 언어적·신체적 표현을 주지 않아야 한다 → 평가성 반응의 억제."
  },
  "choices": [
    { "no": 1, "text": "avoiding the urge to resolve students’ emotional conflicts", "correct": false, "comment": "정서적 갈등이 아니라 수학적 답변에 대한 반응이 핵심." },
    { "no": 2, "text": "suppressing evaluative responses to students’ answers",     "correct": true,  "comment": "본문 핵심 문구와 정확히 일치." },
    { "no": 3, "text": "treating all answers as correct to facilitate learning",     "correct": false, "comment": "‘수용’이지 ‘정답 처리’가 아님." },
    { "no": 4, "text": "indicating misconceptions in mathematical discussions",      "correct": false, "comment": "오히려 표정으로 드러내지 않는 것이 핵심." },
    { "no": 5, "text": "controlling facial expressions to maintain strict authority", "correct": false, "comment": "권위 유지가 아니라 평가 보류가 목적." }
  ],
  "structure": [
    { "label": "도입 (Topic)",      "title": "...", "body": "..." },
    { "label": "전개 (Reason)",     "title": "...", "body": "..." },
    { "label": "방법 (How)",        "title": "...", "body": "..." },
    { "label": "결론 (Conclusion)", "title": "...", "body": "..." }
  ],
  "one_line_summary": "교사가 평가성 반응을 억제(blank face)하고 모든 아이디어를 수용할 때, 지식의 출처가 교사에서 학생으로 전환된다."
}
```

## 3종 제품 라인업 (market.html과 연동)

| 제품         | 파일 prefix    | 가격     | 비고 |
|--------------|----------------|----------|------|
| 분석지       | `analysis-`    | ₩4,900   | 본 샘플 형식 (3p/지문 기준) |
| 워크북       | `workbook-`    | ₩4,900   | 본문 + 빈칸·어휘 자기검수 |
| 변형문제     | `variant-`     | ₩4,900   | 원지문 → 어휘 교체·순서·빈칸 변형 |
| **3종 묶음** | `bundle-`      | ₩11,760  | **20% 할인** (4,900×3 = 14,700 → 11,760) |

## 미드저니 프롬프트 규칙 (회사 메모리 확정)

- **항상** `--ar 16:5 --v 7`
- 고등부(Saturn/Jupiter) 톤: 시네마틱 에디토리얼 + 페인터리 3D 혼합 (V1)
- 본문 180mm 폭 전면 사용, 자르지 않음
- 우드블록/폴크아트 톤 금지

## 워크플로 (지문 1개 추가 시)

1. 시험지에서 지문 본문 + 보기 + 정답 추출 → `data/{번호}.json` 작성
2. 미드저니로 16:5 배너 1장 → `assets/illust-{번호}.png`
3. 빌더 스크립트 (추후) → `dist/{번호}.html` 또는 통합 PDF 생성
4. market.html에 회차 등록
