# 봉영여중3 추가지문 4 — 삽화 미드저니 프롬프트 (12·13, 2장)

> 규격 **`--ar 16:5 --v 8.1`** 고정, 실사 포토리얼.
> 생성 후 원본을 `dist/EX4/{N}.png` 로 받고, 가로 2000px 축소본을 `dist/EX4/assets/illust-{N}.png` 로 넣은 뒤
> 분석지 재빌드(README 「추가지문 12·13」 절). 이미지가 없으면 INTRO 면에 placeholder 가 찍힌다.
> ⚠️ 이 문서는 `_gen-prompts-doc-EX4.mjs` 가 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로** — `natural soft diffused daylight, bright overcast sky, high-key exposure`. `sunlit`·`golden` 은 실사에서 역광·저녁빛이 된다.
2. **사람은 아예 뺀다** — 손가락·얼굴이 뭉개진다. Sarah·Jeevan·Arthur·살리에리·로미오와 줄리엣 모두 **사물·장소**로 암시했다.
3. **배제는 `--no` 파라미터로** — 문장 속 `NO xxx` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 매표기·노트북·시계 화면에 글자가 생기기 쉬워 `text, letters, words, numbers, signage` 를 늘 `--no` 에 넣었다.
5. **추가지문 1~13 전체가 서로 닮지 않게** — 09 운동화 받침대·10 부티크·07 공부 책상과 겹치지 않도록 12는 화장대, 13은 시장 사과 상자로 잡고 서로의 소재를 `--no` 에 넣었다.

---

## 12. Lesson 07 추가지문 4 · The Lipstick Effect

`dist/EX4/assets/illust-12.png` — 밝은 화장대 — 흰 쟁반 위 작은 립스틱과 작은 향수병(초점), 뒤쪽 선반의 큰 가죽 핸드백(흐림): 불황 속 작은 즐거움

```
Photorealistic still-life photograph, wide banner composition. A bright minimalist vanity table: one small lipstick in a plain white case and a tiny round perfume bottle stand in sharp focus on a white ceramic tray, while far behind them on a glass shelf a large leather handbag sits softly blurred and out of reach. Calm contrast between a small affordable pleasure and an expensive luxury. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white, blush pink and pale beige. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, sneakers, shoe boxes, watches, pedestal, spotlight, price tags, money, coins
```

## 13. Lesson 07 추가지문 4 · The Halo Effect

`dist/EX4/assets/illust-13.png` — 시장 좌판의 사과 상자 — 가운데 사과 하나만 후광처럼 부드럽게 빛나고 나머지는 똑같은 사과들(후광 효과)

```
Photorealistic still-life photograph, wide banner composition. A rustic wooden crate full of ordinary red apples at a bright market stall; one apple in the center is wrapped in a soft circular glow of light like a gentle halo, making it look special, while all the apples around it are plainly the same. Quiet contrast between one shining quality and the unexamined rest. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, fresh red, warm wood brown and soft cream. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, desk, books, textbooks, cards, sneakers, shoe boxes, handbags, lipstick, perfume, pedestal, stage, spotlight beam, price tags
```

