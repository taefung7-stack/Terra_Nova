# Terra Nova Textbook Generator

HTML 기반 템플릿 + JSON 콘텐츠 + Puppeteer PDF 빌드 파이프라인.
한 달치 학습서(**134페이지 풀북** = 본문 90 + 답안 20 + 단어팩 20 + 속지 4)를 한 줄 명령으로 생산.

## Quickstart

```bash
cd textbook
npm install

# 한 달 풀북 1발 빌드 (지문 20개 작성 후)
node tools/build-fullbook.mjs --month 2026-06

# 미리보기 서버 (라이브 확인)
npm run preview
# → http://127.0.0.1:4173/textbook.html?month=2026-06&passage=01
# → http://127.0.0.1:4173/supplements.html?type=answers&month=2026-06&passage=01
```

산출물: `dist/2026-06/2026-06-fullbook.pdf` (134p, ~184MB)

## 새 지문·새 달 작성 시

1. **새 지문 작성**: `templates/AUTHORING-GUIDE.md` 의 Schema v2.2 명세 따라 JSON 작성
2. **새 달 풀북**: `MONTHLY-PRODUCTION.md` 의 5단계 체크리스트 따라 생산
3. **빈 스캐폴드**: `templates/passage.scaffold.json` 복사 → `content/passages/YYYY-MM/NN.json`
4. **검증**: `node tools/validate-content.mjs --month YYYY-MM` (20개 모두 OK 떠야 진행)
5. **빌드**: `node tools/build-fullbook.mjs --month YYYY-MM`

> 4-페이지 본문 레이아웃과 정답·단어팩 포맷은 **고정**입니다. JSON과 일러스트만 갈아 끼우면 다음 달 책이 나옵니다.

## 문서 인덱스

| 문서 | 용도 |
|------|------|
| [`README.md`](README.md) | (이 문서) 프로젝트 개요 |
| [`MONTHLY-PRODUCTION.md`](MONTHLY-PRODUCTION.md) | **다음 달 신간 생산 5단계 체크리스트** |
| [`templates/AUTHORING-GUIDE.md`](templates/AUTHORING-GUIDE.md) | 지문 JSON 작성 가이드 (Schema v2.2 필드 명세 + 해설 톤) |
| [`templates/passage.scaffold.json`](templates/passage.scaffold.json) | 빈 지문 JSON 스캐폴드 |
| [`schemas/passage.schema.json`](schemas/passage.schema.json) | 단일 진실 — 검증 스키마 |

## 일러스트 워크플로 (Midjourney 등 외부 이미지)

JSON에는 경로만 적고, 이미지 파일은 별도로 드롭합니다:

1. JSON: `"illustration": "../../assets/illustrations/YYYY-MM/NN.png"`
2. 파일이 없는 동안: 보라 사선 placeholder 표시 → 빌드 깨지지 않음
3. 인쇄 직전 실제 이미지를 `assets/illustrations/YYYY-MM/NN.png` 에 떨어뜨리면 자동 교체

권장: **3.21:1 비율** (3904×1216 px), 16:5 가까운 가로 슬라이스. 본문 텍스트와 같은 180mm 폭으로 풀폭 배치되며 잘리지 않습니다.

## 디렉토리 맵

```text
textbook/
├── README.md                       # (이 문서) 프로젝트 개요
├── MONTHLY-PRODUCTION.md           # 다음 달 생산 체크리스트
├── package.json
│
├── textbook.html                   # 본문 4페이지 템플릿
├── cover.html                      # TOC + Week divider 템플릿
├── supplements.html                # 답안·단어장·시험지·정답·속지 템플릿
│
├── styles/
│   ├── tokens.css                  # 월별 팔레트 + 타이포
│   ├── layout.css                  # 본문 4페이지 레이아웃
│   ├── cover.css                   # TOC/Week
│   ├── supplements.css             # 답안·단어팩·속지
│   └── print.css                   # A4 @page
│
├── scripts/
│   ├── render.js                   # 본문 렌더러
│   ├── cover-render.js             # 표지 렌더러
│   └── supplements-render.js       # 답안·단어팩·속지 렌더러
│
├── schemas/
│   └── passage.schema.json         # v2.2 (answers 섹션 포함)
│
├── content/
│   ├── curriculum.json             # 240지문 메타 인덱스 (12개월 × 20)
│   └── passages/{YYYY-MM}/{NN}.json
│
├── assets/illustrations/{YYYY-MM}/{NN}.png
│
├── templates/
│   ├── AUTHORING-GUIDE.md          # 지문 작성 가이드 (Schema 명세)
│   └── passage.scaffold.json       # 빈 스캐폴드
│
├── tools/
│   ├── validate-content.mjs        # AJV + 비즈니스 룰 + answers 정합성
│   ├── build-pdf.mjs               # 단일 지문 (4p)
│   ├── build-month-pdf.mjs         # 본문 90p
│   ├── build-supplements.mjs       # 답안·단어팩·속지 (단독)
│   ├── build-fullbook.mjs          # 134p 합본 — 메인 빌드 명령
│   └── dev-server.mjs              # sirv 미리보기 서버
│
├── tests/                          # vitest — schema + render E2E
└── dist/                           # 생성된 PDF (gitignored)
```

## 디자인 불변값 (모든 월 공통, 변경 금지)

- A4 portrait, 15mm 페이지 패딩
- 상단 그라데이션 바 1cm
- 본문 4페이지 = Passage / Practice / Syntax / Vocab
- 답안 1페이지 = 4문항 풀해설
- 단어팩 1주 = 단어장 2p + 시험지 2p (Part A 60문제 / Part B 20문제 4지선다)
- 속지 = 펼침 2p (왼쪽 제목, 오른쪽 백지 + TERRA·NOVA)
- 페이지 좌/우 푸터 룰: 홀수 = 페이지번호+브랜드, 짝수 = 식별자+페이지번호
- S/V/O/C/M 색상 코드 (월별 동일)

월별 컬러는 `styles/tokens.css` 의 `[data-month="YYYY-MM"]` 에서만 변경.

## 의존성

- Node.js ≥ 18
- puppeteer (Chromium 자동 다운로드)
- pdf-lib (병합)
- ajv 2020 + ajv-formats (검증)
- sirv (미리보기 서버)
- vitest (테스트)

## 알려진 운영 팁

- **Windows에서 PDF 뷰어가 잠금**: 빌드 전 PDF 뷰어 닫기, 또는 `--out` 으로 다른 파일명 사용
- **build-fullbook 중 빈 PDF (~7KB)**: 일러스트 로딩 전 PDF 캡처됨. `tools/build-month-pdf.mjs` 가 `networkidle0` 사용 — 동일 패턴이 supplements 빌더에도 적용됨
- **stale node 프로세스**: 이전 sirv가 포트 잡고 있을 수 있음. `Get-Process node | Stop-Process` (PowerShell) 또는 빌드 도구가 사용하는 포트 변경 (4175~4185 사용)

## 사양 문서

`../docs/superpowers/specs/2026-04-22-terra-nova-textbook-generator-design.md`
