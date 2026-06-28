# 외부 AI 검수본 검증·반영 절차 (External Review Intake)

> Codex / Gemini Deep Research 등 **외부 AI가 작성해 온 교재 검수본**을 받았을 때,
> 그 지적을 그대로 믿지 말고 **소스와 대조해 진짜 결함만 골라 반영**하는 표준 절차.
> 우리 자체 멀티에이전트 검수(`audit-*` 파이프라인)와는 별개이며, 그 앞단/뒷단 어디서든 쓸 수 있다.

핵심 원칙: **외부 검수본은 "제보"이지 "판정"이 아니다.** 모든 지적은 소스 대조로 1차 검증한 뒤에만 손댄다.
특히 PDF만 보고 작성된 리포트는 우리 소스의 의도된 마커/구조를 결함으로 오진하는 경향이 강하다.

---

## 0. 입력
- 외부 검수본 텍스트(여러 개일 수 있음 — 신뢰도가 제각각이라고 가정)
- 대상 교재의 **소스 JSON**: `textbook/content/passages/<month>/NN.json` (예: `2026-07-J`)
- (판매본 확인이 필요하면) `textbook/dist/<YYYY-MM>/<...>/<book>.pdf`

## 1. 오진 패턴 먼저 거르기 (가장 중요)
외부 리포트가 "치명적/시스템적 결함"이라고 주장할수록 먼저 의심한다. 알려진 오진 패턴:

| 외부 리포트의 주장 | 실제 정체 | 검증법 |
|---|---|---|
| "전 지문 마지막 문장이 잘림 / Overset / Truncation" | 의도된 **`<blank>` cloze 마커**(Q2 빈칸추론). 잘린 게 아님 | 소스 body 끝을 보면 `<blank>`. 전 지문 `<blank>` 1개씩이면 정상 |
| "Syntax 기호 깨짐 — `15)`, `IMI`, `Isi` 텍스트 쓰레기" | PDF 파싱/OCR 아티팩트. 소스 page3는 깨끗한 `{role:"S"/"V"/...}` JSON | 소스 page3.sentences 직접 확인 |
| "어휘목록 자간/띄어쓰기 붕괴(`권력 분 립`)" | Pretendard 글리프 이슈일 수 있으나 소스 텍스트는 정상 | 소스 확인 + 시각 QC로 별도 판단([[project_terra_nova_pretendard_glyph_fix]]) |
| "정답이 본문에 없음(plain vs plainest)" | Q4 조건 "그대로 활용"이 굴절형 허용일 수 있음 | 출제 의도 확인 — 실제 오류 아니면 해설 문구만 보강 |

> 한 리포트의 헤드라인 결함 2개가 모두 오진으로 판명되면, 그 리포트 전체 신뢰도를 낮춰 잡고 나머지도 전수 대조한다.

## 2. 지적별 소스 대조 → 분류
각 지적을 다음 4가지로 분류한다. 코드/소스 인용 없이 분류하지 말 것.

- **REAL-BLOCKER** — 사실이고 판매 차단급(정답 오류, 본문↔문제 밑줄 불일치, 사실 오류).
- **REAL-MINOR** — 사실이나 경미(표현 다듬기, 강조 일관성, 학술 한정어).
- **TASTE** — 결함 아님, 강화 제안일 뿐(오답 매력도, 동의어 고급화). 반영은 선택.
- **FALSE** — 오진(1번 표 + 소스 대조로 확정). 반영 금지, 반영하면 오히려 퇴행.

검증 도구: 소스 `NN.json`을 직접 읽고(`page1.body`, `page2.questions`, `page3`, `answers`, `page4.vocab`),
`<blank>`/`<u>`/`<mark>` 개수와 위치를 확인. 학년 간 비교(전 지문 `<mark>`=1인데 이 지문만 0 → 일관성 결함).

## 3. 반영 (REAL만)
수정 시 **동기화 규칙**을 반드시 지킨다(이게 핵심 함정):

- 본문 `<u>…</u>` 표현을 바꾸면 → 그 표현을 인용하는 **Q3 stem + 정답 보기 + evidence** 동기화 (validator **ERROR** 규칙 ②).
- 본문 문장을 바꾸면 → **page3.segments**(해당 sentence) + **translation_ko[n]** + 필요시 **tieback/vocab example** 동기화.
- 정답 길이 균형을 깨면(완화하다 보기가 길어짐) → 다른 보기 길이 조정(validator WARN, 정답 최장 & 오답평균 1.4배↑).
- `<mark>` 추가는 body-only(다른 필드 동기화 불필요). 본문에 실제 등장하는 도메인 핵심어로.
- vocab 단어는 본문 등장 필수(WARN). 본문에서 단어를 빼면 vocab example도 본문 등장 표현으로 교체.

AUTHORING 규칙 출처: `templates/AUTHORING-GUIDE.md` (3.3~3.6절), `schemas/passage.schema.json`.

## 4. 검증 (반영 후, 증거 남기기)
1. **JSON 유효성**: 수정한 NN.json `require()` 로드 성공.
2. **validator**: `node tools/validate-content.mjs --month <month>` → **ERROR 0** 필수. WARN은 기존분/비실질만 잔존 확인.
3. **재빌드(필요 시)**: `node tools/build-fullbook.mjs --month <month>` → `_finalize-*.mjs`.
   - ⚠️ build-fullbook **삽화 레이스 회귀** 가능 → `gs -sDEVICE=txtwrite … | grep -c "Illustration"` = **0** 필수([[project_terra_nova_fullbook_illustration_race]]).
   - 부분 재렌더만 필요하면 `node tools/build-pdf.mjs --month <month> --only NN [--merged]`.
4. **시각 QC**: 변경 지문 page1을 `gs -sDEVICE=png16m`로 PNG 렌더 후 Read 판독 — 수정 반영·`<blank>` 정상 밑줄·☰ 글리프 깨짐 없음 확인([[feedback_textbook_visual_qc_method]]). finalize 오프셋(+4: 앞표지·백지·판권·백지) 주의.

## 5. 커밋
- 소스 JSON만 커밋(`textbook/dist/`는 gitignore — 판매본 PDF는 로컬/Supabase 별도).
- 커밋 메시지에 **무엇이 REAL이고 무엇을 FALSE로 거부했는지** 명시(다음 사람이 같은 오진에 안 속게).

---

## 부록: 2026-07 Jupiter(고2) 적용 사례 (2026-06-28)
- 입력: Codex 검수본 + Gemini Deep Research 검수본.
- 판정: **Codex 신뢰**(지적 전부 사실). **Gemini 핵심 2건 오진**(`<blank>`→"잘림", 정상 page3→"기호 깨짐").
- 반영(5지문): Day01 멘델레예프 배열근거·noble gases / Day17 도함수=0 peak-valley 완화(+Q3 길이균형) / Day12 표본 한정어 / Day06·12·15 `<mark>` 누락 보강.
- 결과: validator ERROR 0, 삽화 QC 0, 141p 판매본 재빌드. 커밋 `4f7aa55`.
