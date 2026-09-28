# 신서중3 동아(윤정미) — 삽화 미드저니 프롬프트 (12장)

> 규격 **`--ar 16:5 --v 8.1`** 고정. 실사 포토리얼 톤.
> 생성 후 `dist/{L5,L6,L7}/assets/illust-{N}.png` 로 저장(가로 2000px 축소) → 분석지 재빌드.
> ⚠️ 이 문서는 `_gen-prompts-doc.mjs` 가 `_author/L*.mjs` 에서 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로 지정** — `natural soft diffused daylight` / `bright overcast sky` /
   `high-key exposure` / `low contrast`. `sunlit`·`golden` 은 실사에서 역광·저녁빛으로 어두워진다.
2. **사람은 아예 뺀다** — 손가락·얼굴이 뭉개진다. 페이서·피트 크루·셰르파·Boggis 씨 모두
   **사물·장소**로 암시한다(풍선·깃발, 빈 피트 레인, 베이스캠프 텐트, 골동품 탁자).
3. **배제는 문장 속 NO 가 아니라 `--no` 파라미터로** — 문장 속 `NO xxx` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 풍선·완주 시간·가격표·지도 라벨·화면 글자가 생기기 쉬워 `text, letters, numbers` 를 늘 `--no` 에 넣었다.
5. **12장이 서로 닮지 않게** 각 프롬프트의 `--no` 에 다른 챕터의 핵심 소재를 넣었다.

---

## Lesson 5 — The Team Behind the Team (Hidden People in Sports)

### L5 Ch1 · Hidden People in Sports — Pacers
`dist/L5/assets/illust-1.png` — 스포츠의 숨은 조력자들 — 마라톤의 페이서

```
Wide banner photograph of an empty city marathon course just before the race, a broad clean asphalt road lined with low blue barriers, clusters of bright helium balloons in red, yellow, blue and green tied to the barriers and swaying at different heights, small plain colored pennant flags on poles, a long table of paper water cups at the roadside, an inflatable start arch far down the road. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, fresh clean colors. Crisp editorial sports photography, shallow depth of field on the far arch. --ar 16:5 --v 8.1 --no race car, tires, pit lane, mountains, snow, tents, people, faces, hands, runners, crowd, text, letters, numbers, logo, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows
```

### L5 Ch2 · Pacers Run for Others
`dist/L5/assets/illust-2.png` — 페이서는 남을 위해 달린다

```
Wide banner close-up still life at the side of a marathon road: a slim metal pole holding a bundle of three bright orange helium balloons and a plain blank orange triangular pennant flag, beside it on a small folding table a classic silver stopwatch and a neatly folded plain running bib with no printing, the empty asphalt road curving away softly out of focus behind. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean orange and pale grey palette. Crisp product-style editorial photography, shallow depth of field. --ar 16:5 --v 8.1 --no race car, tires, mountains, snow, tents, finish arch, people, faces, hands, runners, crowd, text, letters, numbers, logo, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows
```

### L5 Ch3 · Pit Crews in Car Racing
`dist/L5/assets/illust-3.png` — 자동차 경주의 피트 크루

```
Wide banner photograph of a clean empty motor racing pit lane: a sleek unmarked single-seater race car in glossy red parked in its pit box with its front wheels removed, neat stacks of new black racing tires wrapped in plain grey tire warmers, pneumatic wheel guns hanging from overhead hoses, a spotless painted floor with marked lines, open garage door behind. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, crisp red, black and white palette. Sharp editorial motorsport photography. --ar 16:5 --v 8.1 --no drivers, mechanics, helmets, balloons, flags, mountains, snow, tents, sponsor decals, people, faces, hands, runners, crowd, text, letters, numbers, logo, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows
```

### L5 Ch4 · Sherpas in Mountain Climbing
`dist/L5/assets/illust-4.png` — 등반의 셰르파 — 에베레스트의 보이지 않는 사람들

```
Wide banner photograph of a high Himalayan base camp on a clear morning: a row of bright yellow and orange expedition tents pitched on a snowy rocky ridge, large packed climbing backpacks, coiled ropes and ice axes resting neatly beside the tents, a line of colorful prayer flags stretched between poles, and the majestic snow-covered pyramid peak of Mount Everest rising against a clean pale blue sky in the distance. Natural soft diffused daylight, bright hazy sky, high-key exposure, low contrast, crisp white snow with yellow and blue accents. Epic editorial mountain photography, sharp detail. --ar 16:5 --v 8.1 --no climbers, porters, race car, tires, balloons, marathon, people, faces, hands, runners, crowd, text, letters, numbers, logo, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows
```

## Lesson 6 — Stories for All Time (One Lucky Sunday)

### L6 Ch1 · Mr. Boggis’ Secret
`dist/L6/assets/illust-1.png` — 골동품 판매상 Boggis 씨의 비밀

```
Wide banner interior photograph of an elegant old London antique furniture shop: polished eighteenth-century English furniture arranged in rows — carved mahogany chairs, a tall grandfather clock, glass-fronted cabinets, a writing desk with brass handles — on worn wooden floorboards, a large paned shop window letting in bright soft light from a quiet street. Natural soft diffused daylight, bright overcast sky outside, high-key exposure, low contrast, warm wood tones against cream walls. Refined editorial interior photography, sharp detail on the wood grain. --ar 16:5 --v 8.1 --no saw, broken furniture, table legs on floor, car, farmhouse, people, person, faces, hands, figures, text, letters, numbers, logo, signage, price tags, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows, dark moody grading
```

### L6 Ch2 · A Priceless Table
`dist/L6/assets/illust-2.png` — 값을 매길 수 없는 탁자 — 그리고 Boggis 씨의 거짓말

```
Wide banner interior photograph of a plain, slightly shabby English countryside farmhouse living room: in the center stands a magnificent eighteenth-century English mahogany table with elegantly carved curved cabriole legs and a deep glossy polish, looking wildly out of place among a worn armchair, a faded rug, bare whitewashed walls and a small cottage window. Natural soft diffused daylight from the window, bright even illumination, high-key exposure, low contrast, the rich red-brown wood glowing against the pale plain room. Editorial interior photography, sharp detail on the carving. --ar 16:5 --v 8.1 --no saw, sawdust, cut-off legs, car, antique shop, rows of furniture, people, person, faces, hands, figures, text, letters, numbers, logo, signage, price tags, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows, dark moody grading
```

### L6 Ch3 · The Deal and the Saw
`dist/L6/assets/illust-3.png` — 흥정, 그리고 톱을 꺼낸 Bert

```
Wide banner photograph of the front of a small old English countryside farmhouse with a gravel yard: a compact vintage 1950s car with a tiny rounded body and a small boot parked by the wooden gate, the farmhouse front door standing open, and on a rough wooden workbench beside the door lies a large old hand saw with a wooden handle next to a coil of rope. Green hedges and a pale sky. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, gentle pastoral greens and creams. Cinematic editorial photography, sharp detail. --ar 16:5 --v 8.1 --no antique shop, table legs, sawdust, broken table, people, person, faces, hands, figures, text, letters, numbers, logo, signage, price tags, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows, dark moody grading
```

### L6 Ch4 · The Legs Had Been Cut Off
`dist/L6/assets/illust-4.png` — 돌아온 Boggis 씨 — 잘려 나간 탁자 다리

```
Wide banner photograph of a plain farmhouse room floor: a beautiful glossy eighteenth-century mahogany tabletop lying flat on worn wooden floorboards with no legs, and beside it four elegantly carved curved cabriole table legs laid neatly in a row, their freshly sawn ends pale, a small scatter of fine sawdust around them, an old hand saw resting against the wall. Natural soft diffused daylight from a side window, bright even illumination, high-key exposure, low contrast, warm red-brown wood on pale boards. Quiet ironic still-life editorial photography, sharp detail. --ar 16:5 --v 8.1 --no car, antique shop, complete table standing, armchair, people, person, faces, hands, figures, text, letters, numbers, logo, signage, price tags, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows, dark moody grading
```

## Lesson 7 — Technology in Our Lives (Living with Big Data)

### L7 Ch1 · What Is Big Data?
`dist/L7/assets/illust-1.png` — 빅데이터란 무엇인가 — 온라인 서점의 추천에서 시작하다

```
Wide banner photograph of a bright minimalist study desk by a large window: a closed silver laptop, neat stacks of colorful hardcover books with blank spines, a cup of tea, and rising from the laptop a soft translucent stream of tiny glowing dots and thin light lines that flows upward and branches out like a constellation network into the airy room. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean white, pale blue and warm pastel palette. Photorealistic editorial technology photography with a subtle light-trail effect, shallow depth of field. --ar 16:5 --v 8.1 --no soccer ball, stadium, city map, thermometer, medicine, pills, people, person, faces, hands, players, crowd, text, letters, numbers, digits, logo, user interface, screen text, watermark, dramatic lighting, sunset, golden hour, night, neon, dark background, heavy shadows
```

### L7 Ch2 · Disease Forecast
`dist/L7/assets/illust-2.png` — 빅데이터가 바꾸는 삶 — 질병을 예보하다

```
Wide banner photograph of a bright clean home table by a window on a cool day: a classic glass thermometer, a mug of hot lemon tea with rising steam, a box of plain white tissues, a small unlabeled amber medicine bottle, and a smartphone lying face down; behind them on the pale wall a soft projected pastel weather style map glow of blue and orange blobs without borders or labels, like a forecast of spreading warmth. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, calm white, lemon and sky-blue palette. Photorealistic editorial still life, shallow depth of field. --ar 16:5 --v 8.1 --no soccer ball, stadium, bookstore, laptop, police, city aerial, people, person, faces, hands, players, crowd, text, letters, numbers, digits, logo, user interface, screen text, watermark, dramatic lighting, sunset, golden hour, night, neon, dark background, heavy shadows
```

### L7 Ch3 · Improving Performance in Sports
`dist/L7/assets/illust-3.png` — 스포츠 경기력 향상 — 독일 축구 대표팀의 데이터베이스

```
Wide banner photograph of an empty modern soccer stadium on a bright day seen from a high angle: a vivid green freshly striped pitch with crisp white lines, a single white soccer ball resting on the center spot, and faint translucent glowing light trails and small dots arcing across the grass like tracked running paths and pass lines, a subtle data overlay effect. Empty stands in soft grey. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, fresh green, white and pale cyan palette. Photorealistic sports editorial photography with a light-trail effect. --ar 16:5 --v 8.1 --no scoreboard, flags, trophy, bookstore, laptop, thermometer, medicine, police, people, person, faces, hands, players, crowd, text, letters, numbers, digits, logo, user interface, screen text, watermark, dramatic lighting, sunset, golden hour, night, neon, dark background, heavy shadows
```

### L7 Ch4 · Crime Prevention
`dist/L7/assets/illust-4.png` — 범죄 예방 — 그리고 빅데이터의 미래

```
Wide banner aerial photograph of a clean modern city district in bright daylight seen from high above: a grid of streets, rooftops, small parks and a river, with several soft translucent glowing circles in warm coral red and amber floating over a few neighborhoods like hot spots on a heat map, fading gently at their edges. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, pale grey city tones with warm coral highlights. Photorealistic drone photography with a subtle data-overlay effect, sharp detail. --ar 16:5 --v 8.1 --no police cars, sirens, handcuffs, soccer, stadium, bookstore, thermometer, medicine, map labels, street names, people, person, faces, hands, players, crowd, text, letters, numbers, digits, logo, user interface, screen text, watermark, dramatic lighting, sunset, golden hour, night, neon, dark background, heavy shadows
```
