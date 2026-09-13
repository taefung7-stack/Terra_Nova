# 신목고 세계문학 Unit 3 — 저작 스펙 (에이전트 공용)

> U1 스펙(`_AUTHORING-SPEC.md`) · U2 스펙(`_AUTHORING-SPEC-U2.md`)을 상속한다.
> **아래는 U3 에서 달라지는 점만** 적는다.
> 스키마·밀도의 기준 구현은 `data/U2/{1,1-workbook,1-variant}.json` 이다.

## U1·U2 와 무엇이 다른가 — 구조

| | U1 | U2 | **U3** |
|---|---|---|---|
| 원문 성격 | 소셜미디어 게시글 4편 | 서사문 1편을 4파트로 | **설명문 — 나라별 면 요리 소개** |
| 한 챕터 구성 | 게시글 + 댓글 2개 | PART 본문 + 블로그 1개 | **단일 산문 한 덩어리** |
| 정본 필드 | `sentences` + `comments[].sentences` | `sentences` + `blog.sentences` | **`sentences` 만** |
| 평탄화 함수 | `flatten()` | `flattenBlog()` | **`flattenPlain()`** |
| 챕터 수 | 4 | 4 | **6** |
| 총 문장 | 56 | 83 | **36** |

`passage` = 그 챕터의 `sentences` 그대로. 댓글·블로그처럼 이어붙일 것이 없다.

## 챕터 구성

| Ch | 소재 | 나라 | 교과서 p | 문장 |
|----|------|------|----------|------|
| 1 | INTRO — Noodle Dishes from Around the World | — | p.58 | 5 |
| 2 | PASTA | Italy | p.59 | 7 |
| 3 | PHO | Vietnam | p.60 | 7 |
| 4 | RECHTA | Algeria | p.61 | 7 |
| 5 | SOPA CRIOLLA | Peru | p.62 | 7 |
| 6 | CLOSING — Noodles Bring Us Together | — | p.63 | 3 |

> ⚠️ **Ch1·Ch6 은 문장이 적다(5·3).** 분량이 얇으므로 문장 카드를 **문장당 1장**으로
> 쪼개고(묶지 말 것), `points`·`paraphrasing`을 U2 평균보다 **두텁게** 채워
> 페이지가 비어 보이지 않게 한다. Ch2~5 는 U2 와 같은 밀도로 간다.

## 이 지문만의 저작 주의점

### 1. 설명문이므로 '심경'이 성립하지 않는다

U2 는 서사문이라 심경·심경 변화가 자연스러웠지만, U3 는 **정보 전달 설명문**이다.
심경·분위기 유형을 쓰면 근거가 없다. 챕터 성격에 맞춰 고른다.

| Ch | 권장 `type` | 이유 |
|----|------------|------|
| 1 | 주제 / 요지 | 글 전체의 도입 — 면의 보편성과 다양성을 선언한다 |
| 2 | 내용 일치 | 기원(시칠리아·17세기)·종류·조리법의 사실 관계가 촘촘 |
| 3 | 내용 일치 | 쌀 생산 조건 → 면 → pho bo/pho ga 인과가 분명 |
| 4 | 내용 일치 | 어원(rishta)·재료·축제·돼지고기 금기의 사실 관계 |
| 5 | 내용 일치 | creole 어원·재료·달걀 고명의 사실 관계 |
| 6 | 주제 / 요지 | 맺음말 — 보편성과 다양성의 종합 |

내용 일치가 4챕터 연속이면 단조로우니, **Ch3 또는 Ch5 하나는 '빈칸 추론'** 으로
바꿔도 좋다. 단 근거 문장이 반드시 본문에 있어야 한다.

### 2. 이탤릭 외국어·요리명이 매우 많다

이 유닛의 최대 함정이다. 다음 어휘는 **교과서가 이탤릭으로 인쇄**한다.

```
macaroni, lasagna, spaghetti, pho, pho bo, pho ga, rishta,
ghee, Eid al-Fitr, haram, halal, creole, sopa criolla
A tavola non si invecchia   (이탈리아어 속담 — 통째로 이탤릭)
```

- `en_html` 에서 `<span style="font-style:italic">…</span>` 로 살린다.
- **한글 음차를 본문에 끼워 넣지 않는다.** 뜻풀이는 `vocab` 이나
  `points[].kind === "culture"` 로 뺀다.
- 여는 태그와 닫는 태그를 다르게 쓰는 실수가 잦다 → `verify-tags.mjs` 필수.

### 3. 서수 위첨자 — 17th / 20th

교과서는 `17th` `20th` 의 th 를 위첨자로 인쇄하지만 **정본·JSON 은 평문 `17th`**
로 적는다. `<sup>` 를 쓰면 `verify.mjs` 가 원문 대조에서 불일치로 잡는다.

### 4. 고유명사·요리명 — 워크북 오탐 위험

`buildProperNounSet` 함정. 이 유닛은 나라명·요리명이 문장 주어로 계속 나온다
(`Pasta ~`, `Pho ~`, `Rechta ~`, `Sopa criolla ~`, `Italians ~`, `Algerians ~`).

→ **나라명·요리명·민족명을 `{{n:A/B}}` 정답 슬롯으로 절대 쓰지 말 것.**
→ 문두 대문자어(`Although`, `Though`, `However`, `Usually`, `Thus`,
  `Regardless`, `No wonder`, `Now`, `Like`, `As`)도 금지.
→ 토큰은 **문장 중반의 동사·전치사·형용사**로 잡는다
  (`boiled`, `seasoned`, `thin`, `worth`, `depending on` 등).

저작 후 반드시 **저작 문항 수 = 렌더 문항 수** 대조
(`project_terra_nova_workbook_propernoun_trap`).

### 5. 변형문제 — 설명문의 유형별 함정

- **order(순서 배열)**: 설명문이라 시간축이 없다. 대신 **논리 전개**
  (정의 → 어원 → 재료 → 조리 → 문화적 의미)로 풀리게 만든다.
- **irrelevant(무관 문장)**: **다른 나라의 요리를 끌어오면 티가 너무 크다.**
  같은 나라·같은 요리 안에서 그럴듯하지만 흐름에 안 맞는 문장을 만든다.
  (예: pasta 단락에 '이탈리아의 커피 문화' — 나라는 맞지만 면 요리가 아님)
- **blank(빈칸)**: `blank_sentence_index` 는 **0-based** 이고 `______` 위치와
  반드시 일치해야 한다. 어긋나면 빈칸이 안 생기고 정답이 그대로 노출된다
  (`project_terra_nova_variant_blank_index`).
- **grammar**: 이 지문은 어법 포인트가 풍부하다 —
  관계대명사 계속적 용법(`which`), 과거분사구 후치수식(`made of`, `known as`,
  `served in`, `seasoned with`, `used`), `it is believed that`,
  `not just A but also B`, 사역동사 `make + 목적어 + 원형`,
  `worth -ing`, `one of the + 최상급 + 복수명사`.
- 정답 위치는 `_rebalance-variant.mjs` 로 재배치한다(① 쏠림 방지).
  `grammar`·`vocab`·`irrelevant`·`insert` 4유형은 재배치 제외.

### 6. 문화 배경 — points[].kind === "culture" 로 뺄 것

이 지문은 문화 설명이 핵심이라 culture 포인트를 적극 쓴다.

- `A tavola non si invecchia` — 식탁의 시간은 늙지 않는다는 이탈리아 식문화
- `Eid al-Fitr` — 라마단 종료를 축하하는 이슬람 축제
- `haram` / `halal` — 이슬람 식사법의 금지/허용
- `creole` — 유럽 정복자의 후손인 현지인을 가리키는 용어
- `angel hair` — 아주 가는 면을 부르는 이름
- `pho bo` / `pho ga` — 소고기 국물 / 닭고기 국물

## 삽화 — 6챕터 소재

U1·U2 규칙 그대로: 실사 포토리얼, `--ar 16:5 --v 8.1 --style raw`,
**사람·글자 배제**, 밝기는 조명 조건으로 지정, **인라인 `NO` 금지 → `--no` 파라미터**,
지시부 800자 이하.

| Ch | 소재 | 겹침 방지 |
|----|------|-----------|
| 1 | 마른 국수 다발이 삼베천 위에 놓인 정물 | 국물 없음 |
| 2 | 스파게티와 바질·토마토가 있는 이탈리아 식탁 | 아시아 소품 없음 |
| 3 | 쌀국수 그릇과 고수·라임·숙주 | 파스타 소품 없음 |
| 4 | 납작한 밀가루 면과 병아리콩·향신료가 놓인 북아프리카 놋그릇 | 젓가락 없음 |
| 5 | 달걀프라이를 얹은 페루식 수프 그릇 | 바질 없음 |
| 6 | 여러 나라의 면 요리 그릇이 나란히 놓인 나무 식탁 | 특정 나라 국기 없음 |

⚠️ **요리 사진은 젓가락·포크가 자연스럽게 어울리는 장면이라
`--no chopsticks` 류 배제가 오히려 그 물건을 부를 수 있다**
(`feedback_midjourney_inline_no_trap`). 배제는 `--no` 파라미터에만,
정말 필요한 것만 최소로 적는다.

## 빌드

U1·U2 와 동일하되 `$U=U3`, 챕터 루프는 **1..6**.

```bash
node _oneoff-신목고-세계문학/verify-source.mjs U3   # ★ 정본 (완료: 36문장)
node _oneoff-신목고-세계문학/verify.mjs U3
node _oneoff-신목고-세계문학/verify-tags.mjs
```
