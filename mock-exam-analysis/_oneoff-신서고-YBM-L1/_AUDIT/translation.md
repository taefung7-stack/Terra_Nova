# 번역 정확성 + 한국어 품질 검수 — 신서고 YBM 부교재 EX / EX2

- 대상: `data/EX/{1,2,3,4}.json`, `data/EX2/{1,2,3,4}.json` (8개)
- 원문 정본: `_SOURCE-EX.js`, `_SOURCE-EX2.js`
- 관점: `passage_ko[]` · `sentences[].ko_full` / `ko_chunks` · `choices[].ko` · 한국어 품질 · 용어 일관성
- 검수일: 2026-08-26

## 0. 사전 기계 점검 결과 (전부 통과)

| 항목 | 결과 |
|---|---|
| `passage[]` ↔ `passage_ko[]` 인덱스 1:1 | **8/8 일치** (7/6/7/7 · 11/6/7/8), 누락·과잉 0 |
| `passage[]` 원문 정본 verbatim 대조 | **8/8 완전 일치** (따옴표 정규화 후 0 불일치) |
| 이중 공백 | **0건** |
| 구두점 앞 공백 | 검출된 건 전부 `... `(생략 기호) 및 `keep ... in check` / `nurse ... back to health` 표제어 — **오탐, 결함 아님** |
| 숫자·단위 정확도 | **전수 일치** (아래 표) |

### 숫자·단위 전수 대조 (BLOCKER 후보 — 결과 이상 없음)

| 파일 | 영어 | 한국어 | 판정 |
|---|---|---|---|
| EX/1 P4·P5 | `20 second time span` / `20 seconds` | 20초 / 20초 | OK |
| EX/1 P6 | `more than three stimuli` | 세 번을 넘는 자극 | OK (초과 의미 정확) |
| EX/3 P1 | `twenty-ninth day` / `Every four years` | 29번째 날 / 4년마다 | OK |
| EX/3 P3 | `365 days` / `365.2421 days` | 365일 / 365.2421일 | OK (소수점 자릿수 일치) |
| EX/4 P1·P5·P7 | `2011` / `5,000 miles` / `eight months` | 2011년 / 5,000마일 / 여덟 달 | OK |
| EX2/1 P1·P5·P6 | `72 people` / `10 percent` / `20 percent` | 72명 / 10퍼센트 / 20퍼센트 | OK |
| EX2/3 P6 | `24,000 feet` / `20 to 25 seconds` | 24,000피트 / 20~25초 | OK |

### 과학·기술 용어 전수 대조 (결과 이상 없음)

`negative pressure` → 음압 · `enclosed area` → 밀폐된 공간 · `stimuli` → 자극 · `enzymes` → 효소 ·
`trigger hairs` → 감각모 · `transmission` → 변속기 · `nitroaromatic compounds` → 질화방향족 화합물 ·
`gravitational pull` → 중력(의 힘) · `altitude` → 고도 · `weightless(ness)` → 무중력 (상태) ·
`municipal waterlines` → 상수도관 · `contaminated groundwater` → 오염된 지하수 · `orbit` → 궤도를 돌다 ·
`leap day/year` → 윤일/윤년 · `breeding` → 번식 · `migration` → 이주 — **전부 표준 역어, 오역 0.**

---

## 1. 등급별 집계

| 등급 | 건수 |
|---|---|
| **차단(BLOCKER)** | **0** |
| **권고(MAJOR)** | **2** |
| **경미(MINOR)** | **4** |
| 합계 | 6 |

> 8개 파일 · 총 59개 `passage_ko` 문장 · 총 50개 `sentences` 엔트리(ko_full + ko_chunks) 전수 대조.
> 의미가 반대로 뒤집힌 곳, 숫자 오기, 인덱스 어긋남은 **한 건도 없다.**

---

## 2. 권고(MAJOR) — 2건

### M-1. `make efforts` 를 "낭비하다"로 옮김 + 같은 파일 안에서 두 갈래 번역

- **파일 · 위치**: `data/EX/1.json` · `passage_ko[6]` (P7) 및 `sentences[5].ko_full`
- **영어 원문**: `Thanks to this process, the Venus flytrap **doesn't make meaningful efforts** trying to trap and digest raindrops or fallen leaves.`
- **현재 번역**:
  - `passage_ko[6]` / `sentences[5].ko_full` — "…의미 있는 노력을 **낭비하지 않는다**."
  - `sentences[5].ko_chunks` — "…의미 있는 노력을 **들이지 않는다**"  ← 다른 동사
- **문제**:
  1. `make efforts` 는 "노력을 들이다/기울이다"이지 "낭비하다(waste)"가 아니다. 원문에 `waste` 는 없다.
     "의미 있는 노력을 낭비하지 않는다"는 국어로도 어색하다(의미 있는 것을 낭비한다는 형용 모순).
  2. **같은 파일 안에서 `ko_full` 과 `ko_chunks` 가 서로 다른 동사**를 쓴다 — 일관성 위반.
     끊어읽기(`ko_chunks`)에서 맞게 옮긴 "들이지 않는다"가 `ko_full` 로 반영되지 않았다.
  3. 참고로 `choices[4].comment` 에서는 "에너지를 낭비하지 않는" 표현이 쓰이는데, 이는 선택지
     `A Careless Hunter That Wastes Its Energy` 를 받는 말이라 그 자리에서는 적절하다.
     즉 "낭비"라는 말이 본문 번역으로 새어 들어간 것으로 보인다.
- **수정안**: `passage_ko[6]` 과 `sentences[5].ko_full` 을 `ko_chunks` 에 맞춰 통일 →
  **"이 과정 덕분에, 파리지옥풀은 빗방울이나 떨어진 나뭇잎을 가두고 소화하려 애쓰는 데 의미 있는 노력을 들이지 않는다."**

### M-2. 문장삽입 P4 의 계속적 용법이 `ko_full` 에서만 제한적 용법으로 뒤집힘

- **파일 · 위치**: `data/EX/2.json` · `passage_ko[3]` (P4) / `sentences[3].ko_full`
- **영어 원문**: `This is much better than the opposite scenario**, in which** oil would be released into the ocean.`
- **현재 번역**: "이는 **기름이 바다로 방출되는 반대의 상황보다** 훨씬 더 낫다."
- **문제**: 원문의 `, in which …` 는 콤마가 붙은 **계속적 용법**이고, 같은 파일의
  `sentences[3].note` 가 스스로 "콤마 뒤의 `in which …` 는 … 계속적 용법이므로 **'그리고 그 상황에서는'으로
  이어 읽으면 자연스럽다**"고 지도한다. `sentences[3].ko_chunks` 도 그 지도대로
  "반대의 상황보다 / 그 상황에서는 기름이 바다로 방출될 것이다"로 뒤로 풀어 놓았다.
  그런데 **`ko_full` 과 `passage_ko[3]` 만 관계절을 앞으로 끌어올려 제한적 용법처럼 번역**했다.
  의미가 틀린 것은 아니지만, note 지시대로 읽은 학습자가 `ko_full` 과 맞지 않아 혼선을 겪는다.
  (이 지문은 문장삽입 유형이라 문장 간 논리 연결 감각이 학습 목표이므로 방향 통일이 특히 중요하다.)
- **수정안**: `ko_full` / `passage_ko[3]` 을 계속적 용법으로 통일 →
  **"이는 반대의 상황보다 훨씬 더 나은데, 그 반대의 경우라면 기름이 바다로 방출될 것이다."**
  (또는 note 의 지도 문구를 제한적 해석도 허용하도록 완화 — 둘 중 하나로 방향을 맞출 것)

---

## 3. 경미(MINOR) — 4건

### m-1. 빈칸 뒤 조사 앞의 불필요한 공백 (3곳)

- **파일 · 위치**: `data/EX2/2.json` · `passage_ko[1]` (P2), `sentences[1].ko_full`, `sentences[1].ko_chunks`
- **영어 원문**: `… also means having ________________.`
- **현재 번역**: "… 곧 `________________ 이` 늘어난다는 뜻이기도 하다고 경고한다."
- **문제**: 빈칸과 주격조사 "이" 사이에 **공백**이 들어가 있다. 한국어 조사는 앞말에 붙여 쓰며,
  여기서는 밑줄이 앞말 역할을 하므로 붙여야 한다. 세 곳 모두 동일한 형태.
- **수정안**: `________________이` (공백 제거).
  또는 조사를 빼고 "`________________` 도 늘어난다는 뜻" 형태로 다듬어도 된다.

### m-2. `The participants` 의 정관사가 번역에서 탈락

- **파일 · 위치**: `data/EX2/1.json` · `passage_ko[2]` (P3) / `sentences[1].ko_full` · `ko_chunks`
- **영어 원문**: `**The** participants then rated how funny the jokes were.`
- **현재 번역**: "그런 다음 참가자들은 그 농담들이 얼마나 웃긴지를 평가했다."
- **문제**: `The participants` 는 앞 문장의 바로 그 72명을 되받는 정관사다. "그 참가자들"로 하면
  지시 관계가 분명해진다. 문맥상 오해 소지는 낮아 **경미**로만 표시.
- **수정안**: "그런 다음 **그** 참가자들은 …" (선택 사항)

### m-3. `annual migration` 이 장황하고 "해마다"가 두 문장 연속 반복

- **파일 · 위치**: `data/EX/4.json` · `passage_ko[6]` (P7), `sentences[4].ko_full`, `ko_chunks`
- **영어 원문**: `he goes on his **annual migration** for his **breeding routine**, only to return once again.`
- **현재 번역**: "그는 **번식이라는 정해진 일과**를 위해 **해마다 하는 이주**를 떠나지만, 결국 또다시 돌아온다."
- **문제**: 의미는 정확하다. 다만 바로 앞 문장(P6)이 이미 "그는 이 여정을 **해마다** 한다"이므로
  "해마다"가 연달아 두 번 나와 국어가 늘어진다. `annual migration` 은 "연례 이주"라는 굳은 역어가 있고,
  `breeding routine` 도 "번식이라는 정해진 일과"보다 "번식 일과"가 간결하다.
- **수정안**: "그는 **번식 일과**를 위해 **연례 이주**를 떠나지만, 결국 또다시 돌아온다."

### m-4. `keep ... in check` 뜻풀이가 vocab 과 points 에서 다른 순서

- **파일 · 위치**: `data/EX/3.json` · `vocab[23].meaning` vs `sentences[4].points[2].text`
- **현재**:
  - `vocab[23]` — "~을 **감독하다**, ~을 제자리에 붙들다"
  - `sentences[4].points[2]` — "keep ... in check(~을 **억제하다**, 감독하다)"
- **문제**: 이 문맥(`leap years to keep the calendar in check` = 달력이 어긋나지 않게 붙들어 주는 윤년)에서
  1순위 뜻은 "제자리에 붙들다 / 어긋나지 않게 관리하다"이고, "억제하다"는 문맥에 맞지 않는 사전 1번 뜻이다.
  `passage_ko[6]` 의 "달력을 **감독해** 줄 윤년"과도 어긋난다. **의미 오류가 아니라 제시 순서 문제.**
- **수정안**: `points[2]` 를 vocab 에 맞춰
  "keep ... in check(~을 제자리에 붙들다, 어긋나지 않게 관리하다)" 로 통일.

---

## 4. 결함 아님 — 오탐 방지를 위해 명시적으로 판정한 항목

아래는 검수 중 의심했으나 원문 대조 결과 **정상**으로 확정했다. 재검수 시 중복 지적을 피할 것.

1. **`choices[].ko` 가 8개 파일 전부 빈 문자열** — 설계상 의도. 선택지는
   (a) 영어 제목형(EX/1~4, EX2/1~2) 이거나 (b) `pushing → pushed (정답)` 처럼 **이미 한국어가 섞인
   어법·어휘 라벨**(EX2/3~4) 이며, 한국어 설명은 전부 `choices[].comment` 가 담당한다.
   8개 파일이 **예외 없이 동일**하므로 누락이 아니라 스키마 운용 방식이다. **결함 아님.**
2. **EX2/3 P3 `you feel yourself pushing down on your seat` → "자신이 좌석에 눌리는 것을 느낀다"**
   — 원문 그대로의 `pushing`(능동)은 "좌석을 내리누른다"이지만, 이 지문은 **어법 문제이고
   ③ `pushing` 이 정답(=틀린 것)** 이므로 정답 `pushed` 기준의 수동 해석이 맞다.
   `sentences[2].note` · `points` · `choices[2].comment` 가 모두 같은 방향으로 일관 서술한다. **번역 결함 아님.**
3. **EX2/4 P5 "시금치가 폭발물을 감지할(→숨길) 수 있는지"** — 어휘 문제 ③ `hide` 의 정정 표기
   (`hide` → `detect`)를 본문 번역에 병기한 것. `ko_chunks` 는 정답 기준 "감지할"만 쓴다.
   어휘 유형 지문의 표준 처리로 **의도된 표기.**
4. **EX/1 P6 `more than three stimuli` → "세 번을 넘는 자극"** — `more than` 을 "이상"이 아니라
   **"초과"로 정확히** 옮겼다(원 실험 조건도 3회 초과). **정확.**
5. **EX/2 P3 `undersea pipes used to transport oil`** — "~하곤 했다"가 아니라 과거분사구
   "수송하는 데 쓰이는"으로 정확히 처리. note 도 이 함정을 명시적으로 경고한다. **정확.**
6. **상관접속사 3종 무게 방향** — EX2/1 P8 `not just A but also B` → "A뿐만 아니라 B에도",
   P10 `not only A but also B`, EX2/4 P7 `A as well as B` → "B뿐만 아니라 A도".
   **셋 다 강조가 실리는 쪽까지 정확.** (EX2 전체의 공통 문법 포인트라 특히 중점 확인)
7. **EX/3 P3 `While we think …` → "…생각하지만"** — `While` 을 시간이 아닌 **양보**로 정확히 처리. **정확.**
8. **EX2/2 P4 `while someone else was driving it`** — `ko_full` 은 "다른 사람이 운전하고 있는 차를
   컴퓨터를 사용해 장악했다"로 자연스럽게 도치 의역, `ko_chunks` 는 "다른 누군가가 그 차를 운전하고
   있는 동안에"로 원 구조를 보존. **두 층위의 역할 분담이 의도대로 작동**하며 의미 동일. **결함 아님.**
9. **`ko_chunks` 청크 분할 ↔ `en_html` 슬래시 대응** — 50개 문장 전수 확인, **분할 지점 전부 대응.**
   한국어 어순상 마지막 청크가 앞으로 올라오는 도치는 끊어읽기 교재의 표준 방식이며 결함이 아니다.
10. **`summary_ko` (8건) · `flow[].body` (32건)** — 본문과 대조, 숫자·인과 관계 **전부 일치.**
11. **고유명사 표기** — `Joao Pereira de Souza` / `Dindim` / `Rio de Janeiro`(리우데자네이루) /
    `Argentina`(아르헨티나) / `Chile`(칠레) / `NASA` — **표기 일관, 파일 내 흔들림 없음.**

---

## 5. 조치 우선순위

| 순위 | 항목 | 파일 | 성격 |
|---|---|---|---|
| 1 | M-1 `make efforts` 오역 + ko_full ↔ ko_chunks 불일치 | `EX/1.json` | 내용 정정 |
| 2 | M-2 계속적 용법 ↔ note 지도 방향 불일치 | `EX/2.json` | 내용 정정 |
| 3 | m-1 빈칸 뒤 조사 앞 공백 (3곳) | `EX2/2.json` | 표기 |
| 4 | m-4 뜻풀이 어순 통일 | `EX/3.json` | 표기 |
| 5 | m-2, m-3 | `EX2/1.json`, `EX/4.json` | 문체(선택) |

**판매 차단 사유 없음.** BLOCKER 0건이며, 숫자·과학용어·인덱스 정합은 전수 통과했다.
