# 중1 — 2022 개정 동아(윤정미) 중학교 영어 1 본문암기 (Lesson 6·7·8)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에 **절대 연결하지 마세요.**

요청(2026-11-17): 교과서 본문 PDF(`중1 동아윤 6과/7과/8과.pdf`)로 **본문암기 PDF만** 제작.
빌더는 `_oneoff-신서중1-미래엔` 복제(표기만 "중1 · 동아(윤정미)"). 중2 동아윤 폴더(`_oneoff-중2-동아윤`)와는 별개.

| 과 | 제목 | 문장 | 산출물 |
|----|------|------|--------|
| L6 | Join the Zero-Waste Challenge | 23 (도입 + 챌린지 4개) | `dist/L6/중1_동아윤정미_Lesson6_본문암기.pdf` — 표지1 + 문제2(12·11) + 정답1 = **4p** |
| L7 | Let’s Make a Movie! | 28 (감독 + 스태프 5명) | `dist/L7/중1_동아윤정미_Lesson7_본문암기.pdf` — 표지1 + 문제2(14·14) + 정답1 = **4p** |
| L8 | Goldilocks Learns Her Lesson | 41 (3구획) | `dist/L8/중1_동아윤정미_Lesson8_본문암기.pdf` — 표지1 + 문제3(14·14·13) + 정답1 = **5p** |

- **원문 + 해석은 `_SOURCE.js` 한 파일** — `[영어, 우리말]` 쌍. PDF 에 우리말이 없어 해석은 새로 썼다.
  `node _make-data.mjs` 가 `_SOURCE-{L}.js`(빌더 입력 정본)와 `data/{L}/{N}.json` 을 **생성**한다 — 생성물을 직접 고치지 말 것.
- **문장 나누기** — L6 챌린지 후기는 화자 표시(`Olivia:` …)를 글의 첫 문장 앞에만, 소제목(Challenge 01 …)은 제외.
  L8 은 대화가 많은 이야기라 따옴표 안도 문장 끝마다 나누고 `said ~` 류 화자 표시는 따옴표 끝 문장에 붙였다.
- **인쇄본 표기 정리** — 닫는 따옴표가 여는 모양(“)으로 찍힌 곳은 ”로, 느낌표 뒤 조판 공백은 붙여, 영화 제목 이탤릭(*Happy Days*)은 평문으로. 철자·단어는 그대로.
- 인명은 영문 그대로(Minsu 만 '민수'), 곰 가족은 아기 곰·엄마 곰·아빠 곰.
- 검수: `_memaudit.mjs`(교과서 원문 문단 → 문장 기준) L6 23/23 · L7 28/28 · L8 41/41, 문제면 한글 전부, 번호 연속·순서·잘림 0 · PNG 렌더 육안 확인.

```bash
cd mock-exam-analysis/_oneoff-중1-동아윤
node _make-data.mjs
node build-memorize.mjs            # L6·L7·L8 (한 과만: node build-memorize.mjs L8)
python _memaudit-extract.py && node _memaudit.mjs
```
