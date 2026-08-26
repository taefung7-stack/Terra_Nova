# 신서고 부교재 EX·EX2 전수 검수 리포트

- 검수일: 2026-08-26
- 대상: `dist/EX` (05 수식어는 괄호로 묶어라) · `dist/EX2` (상관접속사와 병렬)
- 범위: 본문분석지 8 + 워크북 8 + 변형문제 8 = **24개 JSON / 약 860문항**
- 방법: Terra Nova 교재 검수 파이프라인(멀티에이전트 5관점 병렬 + 기계 대조 + 적대 검증)
- ※ 타사(신서고/YBM) 교재이며 Terra Nova 판매본 아님. 원문은 정본으로 고정, 원문 자체는 결함으로 보지 않음.


> ## ⚠️ 사후 정정 (2026-08-26 수정 작업 중 확인)
> **아래 B-4~B-7(워크북 차단 4건)은 오탐이었다.** `verify-workbook-EX2.mjs:97-101` 주석에
> "워크북은 올바른 영어로 훈련해야 하므로 `passage_corrected` 가 있으면 그것을 기준으로 한다"는
> 설계 원칙이 명시돼 있고, `passage_corrected` 를 가진 파일은 정확히 어법·어휘 지문인 EX2/3·EX2/4 뿐이다.
> 즉 워크북이 `pushed`·`detect` 로 훈련시키는 것은 정상 동작이다. 되돌렸다.
> **실제 차단은 8건이 아니라 4건**(B-1·B-2·B-3·B-8). 수정 내역은 `FIXES.md` 참조.

## 1. 종합 판정

| 구분 | 차단 | 권고 | 경미 |
|---|---|---|---|
| EX 분석지 | 2 | 6 | 4 |
| EX2 분석지 | 1 | 3 | 5 |
| 워크북 | 4 | 3 | 3 |
| 변형문제 | 1 | 3 | 2 |
| 번역 | 0 | 2 | 4 |
| **합계** | **8** | **17** | **18** |

기계 검증(빌드 무결성)은 **전부 통과** — 아래 2절 참조. 결함은 전부 *내용* 결함이다.

## 2. 기계 검증 — 이상 없음

| 항목 | 결과 |
|---|---|
| verify 스크립트 6종(EX/EX2 × 본문·워크북·변형) | 오류 0 · 경고 0 |
| 페이지 overflow (HTML 18개, 전 페이지) | **0건** (PDF 페이지수와 일치) |
| 글리프 깨짐 `☰`/`.notdef` (PDF 20개) | **0건** |
| 삽화 placeholder 텍스트 | 0건 |
| jumble 단어집합 ↔ answer (42문항) | 일치 (구두점 차이는 설계) |
| fill_first_letter 첫글자 ↔ answer (117개) | 일치 |
| ref_sentence 범위 (323개) | 전건 유효 |

## 3. 차단(BLOCKER) 8건

### B-1 · `data/EX/2.json` — 삽입문장 누락으로 본문 논리 공백 ★최우선
원문 `insertSentence`("However, negative pressure is not always beneficial, such as in the case of
pipes carrying drinking water to a city.")가 `passage`·`passage_ko`·`sentences`·`flow`·`vocab`
어디에도 없다(passage 6문장). 그 결과 5번 문장의 `these municipal waterlines`가 **선행사 없는 these**가 된다.
`sentences[4].points[2]`는 "상수도관을 처음 소개하는 문장이 바로 앞에 있어야 these가 성립한다"고
정확히 지적하는데 정작 그 문장이 없어 **본문과 해설이 자기모순**.
→ 수정: passage 인덱스 4 앞에 삽입문장 추가 + ko/sentences/covers 동기화. `verify-EX.mjs` 문장수 기대값도 갱신.

### B-2 · `data/EX/1.json` — 어휘 정답 `meaningful` 오역(의미 반전)
`passage_ko[6]` "…**의미 있는 노력**을 낭비하지 않는다". 원문 논리는 "빗방울·낙엽을 잡으려는
**헛된(meaningless)** 노력을 하지 않는다"이며 `Thanks to this process`(긍정적 인과)와 충돌한다.
`meaningful`은 이 지문 어휘문제의 **정답(틀린 낱말)** 이므로 오역이 곧 오학습.
→ 수정: "빗방울이나 낙엽을 가두고 소화하려는 **헛된 노력을 들이지 않는다**" + `(→meaningless)` 정정 병기.

### B-3 · `data/EX2/4.json` — 정정 화살표 방향 반대
`passage_ko[4]` / `sentences[3].ko_full`: "시금치가 폭발물을 **감지할(→숨길)** 수 있는지".
원문 인쇄어가 `hide`, 정정어가 `detect`이므로 정확히 거꾸로다. 같은 파일 `passage_corrected[4]`(`could detect`)·
choices③ comment와도 자기모순. → **`숨길(→감지할)`** 로 2곳 수정.

### B-4~B-7 · 워크북이 "원문의 의도된 오류"를 정답으로 뒤집음 (EX2/3, EX2/4)
EX2/3(어법)·EX2/4(어휘)는 **원문이 일부러 틀린 낱말을 품은 지문**이다. 워크북 저작이 이를
"고쳐야 할 실수"로 오인해 정답 방향을 반대로 잡았고, 같은 문장이 한 책 안에서 상충 인쇄된다.

| # | 위치 | 현재 | 문제 |
|---|---|---|---|
| B-4 | `EX2/3-workbook` grammar_choice no=4 | `{{pushed/pushing}}` ans=`pushed` | 원문 정답은 `pushing`(=틀린 것). 본문에 없는 형태를 정답이라 함 |
| B-5 | `EX2/3-workbook` vocab_choice no=3 | 고정 텍스트가 `pushing`→`pushed` | 지문 재현 오류 |
| B-6 | `EX2/4-workbook` vocab_choice no=5 | `{{detect/hide}}` ans=`detect` | 원문 정답은 `hide`. STEP5 해석 정답지(`(→숨길)`)와 **정답지끼리 모순** |
| B-7 | `EX2/4-workbook` grammar no=5·6 + fill no=4 | 고정 영문 `hide`→`detect` 개서 | 같은 문장 최소 4회 상충 인쇄 |

→ 수정 원칙: **원문 오류를 보존**하고, 해당 문장은 양자택일 출제에서 제외하거나 다른 포인트로 교체.

### B-8 · `data/EX/3-variant.json` · `by_type.implication` — 선행사가 밑줄보다 뒤
변형 지문이 원문 문장 순서를 뒤집어, 밑줄 문장의 `these events`가 가리킬 선행사(명절·문화 행사)가
밑줄 시점에 없다. 정답 ①이 그 연결에 전적으로 의존하므로 **풀 수 없다**.
→ 수정: `passage` 인덱스 3↔4 교체(`underlined` 문자열은 그대로 유지).

## 4. 권고(MAJOR) 주요 17건

- **EX 분석지 `type`↔`choices` 불일치** — `choices`가 원문 유형(어휘/삽입/순서)이 아니라 **영어 제목 5지선다**.
  단 `hide_answer:true` + `build.mjs:222 return ''` 로 ANSWER 블록이 렌더되지 않고, 발문도 subtitle로 대체되어
  (`build.mjs:288`) 학생에게 도달하지 않는다. **index 카드의 `type` 라벨만 노출**되므로 차단이 아닌 권고.
  → 라벨을 실제 제공물(본문분석)에 맞추거나 choices를 원문 유형으로 교체.
- `EX/1` `make efforts`를 "낭비"로 옮겨 `ko_full`↔`ko_chunks` 불일치 (B-2와 연동)
- `EX/2` `, in which` 계속적 용법인데 `ko_full`만 제한적으로 번역 — note·ko_chunks와 방향 반대
- `EX2/3` ③ 해설이 "앞 절의 태가 유지되므로 수동"이라는 **존재하지 않는 문법 규칙**을 근거로 제시
  (정답 `pushed`는 유지 — 단 `push down on`은 능동 결합이 전형적이라 근거 서술만 교체 권장)
- `EX2/1` S7 `contagious` 대응 설명이 S8과 자기모순
- `EX2/4` `A as well as B` 번역 무게가 note 규칙과 정반대(ko_chunks는 정상)
- `EX/3 order` 해설 **날조 인용** — `'Additionally'`를 인용하나 문항 내 등장 0회(실제 `Besides that`). 정답 ④는 정상
- 정답 길이 불균형 2건 — `EX/2 title`(1.41배) · `EX/4 gist`(1.45배)
- EX2 워크북 4파일 아포스트로피 곡선/직선 혼용 23문항

## 5. 미완료 항목 (결함 아님)

**삽화 8장 전량 미생성.** `data/{EX,EX2}/*.json` 이 `assets/illust-{1..4}.png` 를 참조하나
`dist/EX/assets`·`dist/EX2/assets` 디렉터리 자체가 없다(L1·L2는 존재). 프롬프트 문서
(`_ILLUSTRATION_PROMPTS-EX*.md`)는 작성 완료. HTML `onerror`가 이미지를 숨기고 placeholder도
`display:none`이라 **깨져 보이지는 않고 조용히 빈 영역으로 접힌다**.

**EX2 합본 PDF 부재.** EX에는 본문분석·워크북 합본 2종이 있으나 EX2에는 없다.

## 6. 오탐으로 배제한 항목 (박제)

- `choices[].ko` 8파일 전부 빈 문자열 → 누락 아님. 선택지가 영어 제목형이고 한국어는 `comment` 담당
- jumble `words[]`에 구두점 없음 → 설계(학생이 부호 복원). 토큰 수 42문항 전건 일치
- EX2 4파일 `order`·`summary` answer가 모두 1 → 조응 관계로 강제되는 설계 결과
- `EX2/4` "감지할(→숨길)" 병기 자체 → 표기 방향만 문제(B-3), 병기 방식은 의도된 것
- 어법 변형 8문항 밑줄 5개 개별 검증 → 정답 외 복수 오류 **0건**

## 7. 재발 방지 제안

1. **워크북 템플릿 정합 검사 추가** — `en_template`에 `answers`를 대입한 결과가
   `passage[ref_sentence-1]`과 완전 일치하는지 비교. **B-4~B-7 4건 전부 자동 검출**된다.
2. **정정 병기 방향 검사** — `A(→B)` 표기의 A가 `passage`에, B가 `passage_corrected`에 있는지 대조. B-3 검출.
3. **원문 문장수 ↔ passage 문장수 대조**(insertSentence 포함). B-1 검출.
4. 빌더 고유명사 오탐(`buildProperNounSet`)은 이번 8파일에서 삭제 0건이나,
   판정식이 `capCount>=1 && !lowCount`라 문두 전용 대문자어를 오판하는 구조적 위험은 잔존.
   `EX2/4 grammar no=7`(`{{It/That}}`)은 본문에 소문자 `it`이 있어서만 살아남았다.
