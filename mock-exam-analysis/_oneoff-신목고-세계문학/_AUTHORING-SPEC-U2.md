# 신목고 세계문학 Unit 2 — 저작 스펙 (에이전트 공용)

> Unit 1 스펙(`_AUTHORING-SPEC.md`)을 상속한다. **아래는 U2 에서 달라지는 점만** 적는다.
> 스키마·밀도의 기준 구현은 여전히 `data/U1/{1,1-workbook,1-variant}.json` 이다.

## U1 과 무엇이 다른가 — 구조

| | U1 | U2 |
|---|---|---|
| 원문 성격 | 소셜미디어 게시글 4편 | 서사문(내러티브) 1편을 4파트로 |
| 한 챕터 구성 | 게시글 + 댓글 2개 | **PART 본문 + Delphine's Blog 1개** |
| 정본 필드 | `sentences` + `comments[].sentences` | `sentences` + **`blog.sentences`** |
| 평탄화 함수 | `flatten()` | **`flattenBlog()`** (verify.mjs) |
| 화자 | 게시글마다 다른 작성자 | **전편 Delphine 시점으로 연속** |

`passage` 는 U1 과 마찬가지로 **본문 문장 + 블로그 문장을 순서대로 이어붙인 하나의
배열**이다. 블로그를 빠뜨리면 `verify.mjs` 가 차단한다.

### 도입부 처리

교과서 p.24 상단의 도입 문단(`Meeting people from different cultures ~`, 4문장)은
**Ch1 의 `sentences` 맨 앞**에 넣는다. 즉 Ch1 = 도입 4문장 + PART 1 본문 + Blog 1.

## 챕터 구성

| Ch | PART | 소제목 | 교과서 p |
|----|------|--------|----------|
| 1 | PART 1 | Delphine arrives at the O'Briens | p.24~25 |
| 2 | PART 2 | Delphine's first day at school | p.26 |
| 3 | PART 3 | After school | p.27 |
| 4 | PART 4 | St. Patrick's Day | p.28~29 |

> 문장 수는 전사 완료 후 `verify-source.mjs U2` 가 출력하는 표를 `_SOURCE-U2.js`
> 하단 체크리스트에 옮겨 적는다.

## 이 지문만의 저작 주의점

### 1. 서사문이므로 '주제' 유형이 어색하다

U1 은 주장·설명 글이라 `type: "주제"` 가 자연스러웠지만, U2 는 **사건이 시간순으로
흐르는 서사문**이다. 분석지 대표 문제는 챕터 성격에 맞춰 고른다.

| Ch | 권장 `type` | 이유 |
|----|------------|------|
| 1 | 심경 / 분위기 | 도착 첫날 — 낯섦·긴장이 지배적 |
| 2 | 심경 변화 | delighted ↔ nervous, 당황 → 즐거움으로 이동 |
| 3 | 내용 일치 | 저녁 식사 장면의 사실 관계가 촘촘함 |
| 4 | 주제 / 요지 | 성 패트릭 데이의 의미를 설명하는 단락이 있음 |

심경 유형은 `question_text` 를 "다음 글에 드러난 …의 심경으로 가장 적절한 것은?"
으로 쓰고, `choices[].en` 에 형용사 쌍(`nervous → relieved` 등)을 넣는다.

### 2. 시제 — 과거 서사 + 블로그의 현재/현재완료

본문은 과거시제 서사인데 **블로그는 그날 밤 쓰는 글이라 시제가 섞인다**
(현재완료·현재). 어법 포인트로 삼기 좋지만, `ko_full` 해석에서 시제를 뭉개지 말 것.

### 3. 고유명사·외국어 표기

인물명(Delphine, Dara, Ms. O'Brien), 지명(Dublin, Lyon), 아일랜드어 인사말,
프랑스어 음식명이 섞인다. 다음을 지킨다.

- **아일랜드어·프랑스어 표기는 원문 그대로.** 한글 음차를 본문에 끼워 넣지 않는다.
  뜻풀이는 `vocab` 이나 `points[].kind === "culture"` 로 뺀다.
- 원문이 이탤릭으로 표기한 외국어는 `en_html` 에서
  `<span style="font-style:italic">…</span>` 로 살린다.
- `Ms.` `p.m.` 의 마침표에서 문장을 쪼개지 않는다(전사·분석 카드 양쪽).

### 4. 워크북 고유명사 오탐 — U2 는 특히 위험하다

`buildProperNounSet` 함정이 U1 보다 **훨씬 잘 터진다.** 인물명이 문장 주어로
계속 나오기 때문이다(`Delphine ~`, `Dara ~`, `Ms. O'Brien ~`).

→ **인물명·지명을 `{{n:A/B}}` 정답 슬롯으로 절대 쓰지 말 것.**
→ 문두 대문자어(`After`, `When`, `Although`, `Finally`, `Today` 등)도 금지.
→ 토큰은 **문장 중반의 동사·전치사·형용사**로 잡는다.

저작 후 반드시 **저작 문항 수 = 렌더 문항 수**를 대조한다
(`project_terra_nova_workbook_propernoun_trap`).

### 5. 변형문제 — 서사문의 유형별 함정

- **order(순서 배열)**: 서사문이라 시간 부사(`After that`, `Finally`)가 답을 그냥
  알려 준다. 패러프레이즈할 때 **시간 부사를 일부 걷어내고** 사건의 인과로
  풀리게 만든다.
- **insert(삽입)**: 지시어(`It`, `that`, `there`)가 가리키는 대상이 분명해야 한다.
- **irrelevant(무관 문장)**: 다른 PART 의 소재를 끌어오면 티가 크게 나므로,
  **같은 장면 안에서** 그럴듯하지만 흐름에 안 맞는 문장을 만든다.
- 정답 위치는 `_rebalance-variant.mjs` 로 재배치한다(① 쏠림 방지).
  `grammar`·`vocab`·`irrelevant`·`insert` 4유형은 재배치 제외.

## 삽화 — 4챕터 소재

U1 규칙(실사 포토리얼, `--ar 16:5 --v 8.1 --style raw`, 사람·글자 배제,
밝기는 조명 조건으로, 인라인 `NO` 금지 → `--no` 파라미터)을 그대로 따른다.

| Ch | 소재 | 겹침 방지 |
|----|------|-----------|
| 1 | 비 내린 더블린 주택가의 젖은 벽돌 계단과 현관 | 실내 없음 |
| 2 | 교복 넥타이와 학교 책상 위 필기구 | 인물 없음 |
| 3 | 감자 그라탱이 담긴 오븐 접시와 식탁 | 학교 소품 없음 |
| 4 | 초록 클로버 장식과 거리의 초록 깃발 | 실내 없음 |

소재가 서로 겹치지 않으므로 **서로를 배제하는 절은 넣지 않는다**(U1 1번 함정 재발).

## 빌드

U1 과 동일하되 `$U=U2`. 자세한 명령은 `README.md` 빌드 절차 참조.

```bash
node _oneoff-신목고-세계문학/verify-source.mjs U2   # ★ 정본 채움 먼저
node _oneoff-신목고-세계문학/verify.mjs U2
node _oneoff-신목고-세계문학/verify-tags.mjs        # data/ 하위 유닛을 자동 탐지(인자 없음)
```
