# 봉영여중3 추가지문 — 삽화 미드저니 프롬프트 (11장)

> 규격 **`--ar 16:5 --v 8.1`** 고정, 실사 포토리얼.
> 생성 후 원본을 `dist/EX/{N}.png` 로 받고, 가로 2000px 축소본을 `dist/EX/assets/illust-{N}.png` 로 넣은 뒤
> 분석지 재빌드(README 「추가지문」 절). 이미지가 없으면 INTRO 면에 placeholder 가 찍힌다.
> ⚠️ 이 문서는 `_gen-prompts-doc-EX.mjs` 가 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로** — `natural soft diffused daylight, bright overcast sky, high-key exposure`. `sunlit`·`golden` 은 실사에서 역광·저녁빛이 된다.
2. **사람은 아예 뺀다** — 손가락·얼굴이 뭉개진다. Sarah·Jeevan·Arthur·살리에리·로미오와 줄리엣 모두 **사물·장소**로 암시했다.
3. **배제는 `--no` 파라미터로** — 문장 속 `NO xxx` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 매표기·노트북·시계 화면에 글자가 생기기 쉬워 `text, letters, words, numbers, signage` 를 늘 `--no` 에 넣었다.
5. **11장이 서로 닮지 않게** — 책상 장면(04·07), 상점 장면(09·10), 모래시계(11만)가 겹치지 않도록 서로의 소재를 `--no` 에 넣었다.

---

## 1. 01 목적 파악 · Reopening the Ticket Offices

`dist/EX/assets/illust-1.png` — 문 닫힌 유인 매표소 창구와 나란히 선 승차권 자동판매기 — 밝은 옛 기차역 홀

```
Photorealistic interior photograph, wide banner composition. A quiet bright old railway station hall: a closed ticket office window with its blinds pulled down, beside a neat row of modern ticket vending machines, polished stone floor, tall arched windows. Calm, slightly nostalgic mood with lots of soft space. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft cream, pale grey and muted sage green. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, trains, stage, monkeys --ar 16:5 --v 8.1
```

## 2. 02 심경 분위기 파악 · Bringing Arthur Back

`dist/EX/assets/illust-2.png` — 공연이 끝난 빈 소극장 무대 — 붉은 막, 의자 하나, 무대 구석의 구급상자(위기 뒤의 안도)

```
Photorealistic interior photograph, wide banner composition. An empty small theater stage right after a performance with the bright house lights on: a deep red velvet curtain half open, a single wooden chair, a white first-aid kit resting near the corner of the stage, soft warm wooden floorboards. Calm, hopeful after-the-crisis mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, warm cream, soft red and light wood tones. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, ticket machines, monkeys, train station --ar 16:5 --v 8.1
```

## 3. 03 요지 주장 추론 · Why Our Emotions Exist

`dist/EX/assets/illust-3.png` — 밝은 초원 가장자리에서 귀를 세우고 경계하는 어린 사슴 — 생존 본능

```
Photorealistic nature photograph, wide banner composition. A young wild deer standing alert at the edge of a bright open meadow, ears raised and head turned, sensing something in the distance, tall grass and a soft forest edge behind it. Calm but watchful mood that suggests instinct and survival. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, fresh spring green, soft beige and pale sky blue. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, predators, blood, stage, office --ar 16:5 --v 8.1
```

## 4. 04 주제 제목 추론 · AI and an Inclusive Workplace

`dist/EX/assets/illust-4.png` — 보청기·헤드셋·점자 키보드가 놓인 밝은 사무 책상 — 포용적인 일터

```
Photorealistic interior photograph, wide banner composition. A bright modern accessible office desk: an open laptop with a plain screen, a small hearing aid in its case, a lightweight microphone headset, a tactile braille keyboard and a smartphone on a stand, a potted plant and a large window behind. Inclusive, hopeful, clean workplace mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white, soft teal and light grey. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, screens with writing, robots, textbooks, index cards, stage, monkeys --ar 16:5 --v 8.1
```

## 5. 05 빈칸 내용 추론 · Salieri and Original Ideas

`dist/EX/assets/illust-5.png` — 18세기풍 음악실 — 하프시코드와 그랜드피아노, 빈 오선지, 깃펜(작곡가와 독창성)

```
Photorealistic interior photograph, wide banner composition. A bright eighteenth-century style music room: a polished harpsichord beside a grand piano, loose sheets of music with blank staff lines scattered on a small table, a feather quill in an inkpot, tall windows with pale curtains. Elegant, thoughtful classical mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, ivory, soft gold and pale blue. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, musical notation, portraits, stage audience, monkeys, office --ar 16:5 --v 8.1
```

## 6. 06 요약문 완성 · Capuchins and Unfair Rewards

`dist/EX/assets/illust-6.png` — 나란한 칸의 카푸친 원숭이 두 마리 — 한쪽은 포도, 한쪽은 오이(불공평한 보상)

```
Photorealistic wildlife photograph, wide banner composition. Two small capuchin monkeys sitting in neighbouring clean enclosures at a bright animal research center, separated by a clear panel: one monkey happily eating from a small bunch of purple grapes, the other staring at a slice of green cucumber lying untouched on the floor in front of it, a few smooth grey pebbles nearby. Curious, gently humorous mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft green, warm beige and pale grey. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, cages with bars, zoo visitors, stage, office --ar 16:5 --v 8.1
```

## 7. 07 무관한 문장 찾기 · The Illusion of Cramming

`dist/EX/assets/illust-7.png` — 공부 책상 — 펼친 교과서, 높이 쌓인 빈 카드와 뒤집어 둔 카드 더미(복습·자기 시험)

```
Photorealistic interior photograph, wide banner composition. A bright study desk late in the morning: an open textbook with plain pages, a tall messy stack of blank index cards beside a neat small pile of flipped cards, several highlighter pens and a half-finished cup of tea, a window with soft daylight behind. Focused, calm study mood that hints at reviewing and self-testing. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white, soft yellow and light blue. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, writing on pages, hourglass, clock, laptop, monkeys, stage --ar 16:5 --v 8.1
```

## 8. 08 문장의 위치 파악 · Analogy and Homology

`dist/EX/assets/illust-8.png` — 자연사 박물관 진열대 — 박쥐 날개뼈와 말 앞다리뼈, 유리 덮개 속 새 날개와 벌(상동·상사)

```
Photorealistic museum photograph, wide banner composition. A bright natural history museum display table: a pale bat wing skeleton and a horse foreleg skeleton laid side by side on white linen, with a preserved bird wing and a small bee specimen under glass domes nearby, soft museum lighting. Curious, scientific, clean mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, ivory, bone white and soft grey-blue. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, labels, skulls, monkeys, stage --ar 16:5 --v 8.1
```

## 9. Lesson 07 추가지문 · The snob effect

`dist/EX/assets/illust-9.png` — 흰 받침대 위 한정판 운동화 한 켤레와 뒤쪽 선반의 똑같은 신발 상자들(스놉 효과)

```
Photorealistic interior photograph, wide banner composition. A bright minimalist sneaker boutique: one pair of clean white limited-edition sneakers displayed alone on a tall white pedestal under a soft spotlight, while the long shelves behind are packed with many identical plain shoe boxes. Calm contrast between the rare and the common. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white, soft grey and pale mint. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, wagon, parade, handbags, watches, marble, monkeys, stage --ar 16:5 --v 8.1
```

## 10. Lesson 07 추가지문 2 · The Veblen effect

`dist/EX/assets/illust-10.png` — 흰 대리석 받침 위 명품 손목시계와 디자이너 핸드백 — 가격표 없는 고급 부티크(베블런 효과)

```
Photorealistic interior photograph, wide banner composition. A bright upscale boutique display: an elegant luxury wristwatch resting on a white marble stand beside a structured designer handbag on a velvet tray, glass shelves and soft reflections behind. Refined, aspirational, clean mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white marble, champagne gold and soft taupe. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, price tags, sneakers, shoe boxes, crowd, monkeys, stage --ar 16:5 --v 8.1
```

## 11. Lesson 07 추가지문 · Romeo and Juliet effect

`dist/EX/assets/illust-11.png` — 붉은 장미 덩굴의 베로나풍 발코니와 모래가 떨어지는 작은 모래시계(사라질 것 같은 시간)

```
Photorealistic exterior photograph, wide banner composition. An old stone balcony of a Verona-style house covered with climbing red roses, a small brass hourglass with falling sand standing on the balcony ledge, warm stone walls and a pale sky behind. Romantic, wistful mood with a quiet sense of time running out. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft rose red, warm stone beige and pale sky blue. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, clock, shop signs, price tags, books, desk, sneakers, monkeys, stage --ar 16:5 --v 8.1
```

