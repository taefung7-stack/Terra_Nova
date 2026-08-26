# EX·EX2 검수 결함 수정 완료 보고

- 수정일: 2026-08-26
- 기준 리포트: `REPORT.md`
- 결과: **verify 6종 전부 오류 0 · 경고 0**, overflow 0, 글리프 깨짐 0, 전 산출물 재빌드 완료

## 1. 검수 판정 정정 — 워크북 차단 4건은 오탐이었음 ★중요

`REPORT.md` 의 **B-4~B-7**(워크북이 원문의 의도적 오류를 정답으로 뒤집음)은
**결함이 아니라 의도된 설계**였다. 수정 착수 후 `verify-workbook-EX2.mjs:97-101` 에서 근거를 확인했다:

```js
/* 어법·어휘 지문은 본문에 '일부러 틀린 낱말'이 들어 있다(문제의 정답 대상).
 * 워크북은 올바른 영어로 훈련해야 하므로, 분석지 JSON 에 passage_corrected 가
 * 있으면 그것을 기준으로 검증한다. 없으면 기존대로 passage 를 쓴다. */
```

`passage_corrected` 를 가진 파일은 정확히 **EX2/3·EX2/4 둘뿐**이며, 이 둘이 바로
어법·어휘 지문이다. 즉 워크북이 `pushed`·`detect`(정정형)로 훈련시키는 것은
**"워크북은 올바른 영어로 훈련한다"는 설계 원칙의 정상 동작**이다.

→ 되돌렸다(`git checkout`). **차단 8건 → 실제 4건.**
→ 교훈: 외부/에이전트 검수 결과는 "제보"이지 "판정"이 아니다.
  빌더·validator 주석까지 확인해야 설계 의도와 결함을 구분할 수 있다.

## 2. 수정한 차단 4건

| # | 위치 | 수정 내용 |
|---|---|---|
| B-1 | `data/EX/2.json` + `_SOURCE-EX.js` | 누락된 삽입문장을 5번째 문장으로 복원(+ko/카드/covers 동기화). `these municipal waterlines` 의 선행사 확보 |
| B-2 | `data/EX/1.json` | `meaningful` 오역 교정 → "의미 있는(→헛된) 노력을 **들이지** 않는다" + 어휘 정답임을 note·points 에 명시 |
| B-3 | `data/EX2/4.json` | 정정 병기 방향 반전 `감지할(→숨길)` → **`숨길(→감지할)`** (2곳). 원문 `hide`/정정 `detect` 와 일치 |
| B-8 | `data/EX/3-variant.json` | `implication` 지문 인덱스 3↔4 교체 — `these events` 선행사를 밑줄 앞으로 이동 |

### B-1 파급 수정
- `data/EX/2-workbook.json`: `ref_sentence>=5` **14건 +1 시프트**
- 새 문장(현재분사 `carrying` 수식)에 대한 워크북 문항 **6종 신규 출제** — 7문장 전수 커버 유지
- `dist/EX` 분석지 5p→**6p**, 워크북-2 9p→**10p**, 본문분석 합본 22p→**23p**, 워크북 합본 39p→**40p**

## 3. 수정한 권고·경미

| 항목 | 수정 |
|---|---|
| `EX/2` `, in which` 계속적 용법 | `ko_full`·`passage_ko` 를 "…훨씬 더 나은데, 그 반대의 경우라면…" 으로 교정(note·ko_chunks 와 방향 일치) |
| `EX2/3` ③ 해설 근거 | "앞 절의 태가 유지되므로 수동"이라는 **없는 규칙** 삭제 → "목적어와 보어의 의미 관계로만 판단" + 힘의 방향 근거로 교체 |
| `EX2/4` `as well as` | 무게 방향 교정 → "토양과 물의 더 미묘한 변화뿐만 아니라 **다가오는 가뭄까지**" (note 규칙·ko_chunks 와 일치) |
| `EX/3-variant order` 날조 인용 | `'Additionally'` → **`'Besides that'`**(실제 본문 표현) 2곳 |
| 정답 길이 불균형 | `EX/2 title` 60자→36자, `EX/4 gist` 43자→31자 (오답 평균 29~45자 대역 안으로) |
| 아포스트로피 혼용 | EX2 워크북 4파일 곡선 `’`→직선 `'` **30곳**, `EX2/2.json` 본문 1곳(원문 정본이 직선) |
| 빈칸 뒤 조사 공백·이중 공백 | `EX2/2.json`·`EX2/2-workbook.json` 정규화 |
| index `type` 라벨 | 8파일 `"어휘"` → `"어휘 · 본문분석"` 등 — 실제 제공물이 본문분석지임을 명시 |

## 4. 재발 방지 — verify 스크립트 강화

`verify-workbook-EX.mjs` · `verify-workbook-EX2.mjs` 에 **8-b 템플릿 정합 검사** 추가:

> `en_template` 에 `answers` 를 대입한 결과가 기준 본문(`passage_corrected` 우선)과
> 완전히 일치하는지 검사. 고정 텍스트 임의 개서·`ref_sentence` 어긋남을 차단한다.

**회귀 주입 테스트로 작동 확인** — `EX2/4` 고정 텍스트를 `detect`→`hide` 로 바꾸자
`❌ 어법 #5 템플릿 대입 결과가 본문과 불일치` 로 검출되고 빌드가 차단됐다.

## 5. 빌드 함정 발견 (기록)

`builder/build.mjs` 의 `cssPathFor()` 는 CSS 를 `<data의 부모>/styles/analysis.css` 로 찾는다.
이 프로젝트는 data 가 `data/EX` 로 **한 단계 더 깊어** `--styles=` 없이 빌드하면
**CSS 없이 실측**되어 페이지 분배가 무너진다(분석지 5p→3p 로 축소, overflow 검사는 통과해
**조용히 잘못된 산출물**이 나옴). `build-variant.mjs` 는 파일이 없어 즉시 에러가 나지만
`build.mjs`·`build-workbook.mjs` 는 **에러 없이 잘못 빌드**되므로 특히 위험하다.

→ EX·EX2 재빌드는 반드시 README 절차대로:
```
--styles="_oneoff-신서고-YBM-L1/styles/{analysis,workbook,variant}.css"
build-variant 는 --shared-writing-passage 도 필수
pdf.mjs 로 분석지 → 그 뒤 pdf-image.mjs 로 워크북 재렌더(순서 중요)
```

## 6. 미완료 (결함 아님)

- **삽화 8장 미생성** — `dist/{EX,EX2}/assets/` 부재. 프롬프트 문서는 작성 완료.
  `onerror` 로 조용히 접히므로 깨져 보이지는 않음.
- **EX2 합본 PDF 부재** — EX 에만 본문분석·워크북 합본 2종 존재.
