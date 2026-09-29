# 봉영여중3 비상(김진완) — 삽화 미드저니 프롬프트 (15장)

> 규격 **`--ar 16:5 --v 8.1`** 고정. 실사 포토리얼 톤.
> 생성 후 원본을 `dist/{L5,L6,L7}/{N}.png` 로 받고, 가로 2000px 축소본을 `dist/{L}/assets/illust-{N}.png` 로 넣은 뒤 분석지 재빌드(README 참조).
> ⚠️ 이 문서는 `_gen-prompts-doc.mjs` 가 `_author-L*.mjs` 의 `prompt` 필드에서 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로 지정** — `natural soft diffused daylight` / `bright overcast sky` / `high-key exposure` / `low contrast`. `sunlit`·`golden` 은 실사에서 역광·저녁빛으로 어두워진다.
2. **사람은 아예 뺀다** — 손가락·얼굴이 뭉개진다. 가짜 뉴스 독자·Puru와 Puneet·Jeff·Lisa·Nathan 모두 **사물·장소**로 암시한다(돋보기와 신문, 빈 의자 두 개, 돈주머니 두 개, 가운과 낡은 가구, 헤드폰 옆의 닻).
3. **배제는 문장 속 NO 가 아니라 `--no` 파라미터로** — 문장 속 `NO xxx` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 신문·가격표·간판에 글자가 생기기 쉬워 `text, letters, words, numbers` 를 늘 `--no` 에 넣었다. 신문은 `blank`·`grey column blocks` 로 묘사했다.
5. **폭력·공포 배제** — L5 총격·동물 탈출 기사는 **빈 탄광촌·낡은 동물원 울타리**로만 암시하고 `guns, blood` 를 막았다.
6. **15장이 서로 닮지 않게** 각 프롬프트의 `--no` 에 다른 챕터의 핵심 소재를 넣었다.

---

## Lesson 5 — Critical Minds (Can You Spot Fake News?)

### L5 Ch1 · Can You Spot Fake News?
`dist/L5/assets/illust-1.png` — 가짜 뉴스를 알아챌 수 있는가 — 거짓 기사 뒤에 숨은 동기

```
Photorealistic editorial still life photograph, wide banner composition. A clean light wooden desk seen from slightly above: a neatly folded blank newspaper with only soft grey column blocks, a smartphone lying face down, a pair of reading glasses and a large magnifying glass resting on the newspaper as if someone is checking whether a story is true. A small cup of tea at the right edge, lots of calm empty space. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft white, pale wood and light grey. --no text, letters, words, numbers, headline, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, zoo, animals, rhinoceros, coal mine --ar 16:5 --v 8.1
```

### L5 Ch2 · Awful Disaster
`dist/L5/assets/illust-2.png` — 끔찍한 참사 — 동물원 탈출 가짜 기사와 헤럴드 사의 속셈

```
Photorealistic documentary photograph, wide banner composition. An empty city zoo enclosure in the morning: a heavy old wooden fence and iron gate of a rhinoceros pen that looks worn out, cracked and rusty, with loose planks and a weak hinge, suggesting unsafe conditions. Behind it a quiet grassy paddock and trees, a single calm rhinoceros standing far in the background, nothing broken or chaotic. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft greens, weathered wood and grey stone. --no text, letters, words, numbers, headline, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, guns, blood, crowds, city streets, newspaper --ar 16:5 --v 8.1
```

### L5 Ch3 · Slav Shoots a Friend in Argument
`dist/L5/assets/illust-3.png` — 슬라브인이 언쟁 중에 친구에게 총을 쏘다 — 두 번째 가짜 기사

```
Photorealistic historical documentary photograph, wide banner composition. An early twentieth century American coal mining camp in the hills: a wooden mine entrance with a timber frame, empty coal carts on narrow rails, small plain wooden cabins and a water tower, piles of dark coal beside a dirt road. Quiet and deserted, no action. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, muted earthy browns, soft grey sky and pale dust. --no text, letters, words, numbers, headline, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, guns, blood, police, zoo, animals, newspaper --ar 16:5 --v 8.1
```

### L5 Ch4 · We Fake News
`dist/L5/assets/illust-4.png` — 이름을 거꾸로 읽으면 — 기사 도용을 잡아낸 데일리 텔레그램

```
Photorealistic still life photograph, wide banner composition. An old-fashioned newspaper office desk: a vintage black typewriter, a stack of blank folded newspapers, a brass magnifying glass and a round mirror standing upright, the mirror reflecting a row of wooden letter blocks to suggest reading a word backwards, the blocks themselves blank and unreadable. Warm pale wood, tidy composition with open space. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, cream, pale wood and soft black. --no text, letters, words, numbers, headline, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, coal mine, guns, zoo, animals --ar 16:5 --v 8.1
```

### L5 Ch5 · How to Spot Fake News
`dist/L5/assets/illust-5.png` — 가짜 뉴스를 찾아내는 방법 — 비판적 독자의 네 가지 점검

```
Photorealistic flat lay photograph, wide banner composition. A bright white desk seen from directly above with four neat items in a row, like a checklist for spotting fake news: a small stack of trusted reference books, a desk calendar page with blank squares, a folded newspaper with the top half hidden under a sheet of paper, and three different blank newspapers overlapping side by side for comparison. A pencil and a magnifying glass nearby. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white, soft grey and light blue accents. --no text, letters, words, numbers, headline, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, typewriter, mirror, zoo, animals, coal mine --ar 16:5 --v 8.1
```

## Lesson 6 — Words of Wisdom (A Father’s Wisdom)

### L6 Ch1 · The Father’s Last Words
`dist/L6/assets/illust-1.png` — 아버지의 마지막 충고 — 설명 없이 남겨진 네 가지 말

```
Photorealistic interior photograph, wide banner composition. A quiet old room in a wealthy traditional Indian house: an empty carved wooden bed with white linen by a tall open window with sheer curtains, a small brass oil lamp and a folded letter on a side table, two empty wooden chairs placed side by side facing the bed, as if two sons had just been listening to their father’s last words. Calm and gentle mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, ivory, soft teak brown and pale saffron. --no text, letters, words, logo, watermark, people, person, hands, faces, man, boy, sunset, golden hour, night, dark moody grading, heavy shadows, coins, gold, feast, market --ar 16:5 --v 8.1
```

### L6 Ch2 · Five Years Later
`dist/L6/assets/illust-2.png` — 5년 후 — 가난해진 Puru 와 더 부자가 된 Puneet

```
Photorealistic conceptual still life photograph, wide banner composition. Two small traditional cloth money pouches side by side on a plain wooden table in soft daylight: the left pouch lies flat, empty and crumpled with a single copper coin beside it, the right pouch stands full and bulging with a neat pile of gold coins next to it, showing two brothers with opposite fortunes after five years. Simple clean background. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, warm linen, copper and gold. --no text, letters, words, logo, watermark, people, person, hands, faces, man, boy, sunset, golden hour, night, dark moody grading, heavy shadows, bed, house, city, feast --ar 16:5 --v 8.1
```

### L6 Ch3 · Puru’s Question
`dist/L6/assets/illust-3.png` — Puru 의 질문 — 아버지 말을 글자 그대로 따른 결과

```
Photorealistic interior photograph, wide banner composition. A grand but strangely empty mansion room in a traditional Indian style: a luxurious custom-made carved bed with silk cushions, a long dining table set with fancy silver dishes that are all empty, expensive vases and decorations, but a bare open wooden chest with nothing inside in the foreground, suggesting money spent on luxury until nothing was left. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, ivory, pale gold and deep teal accents. --no text, letters, words, logo, watermark, people, person, hands, faces, man, boy, sunset, golden hour, night, dark moody grading, heavy shadows, coins, gold coins, money pouches, market, city skyline --ar 16:5 --v 8.1
```

### L6 Ch4 · Puneet’s Answer
`dist/L6/assets/illust-4.png` — Puneet 의 대답 — 같은 말을 다르게 이해하다

```
Photorealistic still life photograph, wide banner composition. A simple wooden floor of a modest room with a thin rolled cotton sleeping mat and a folded blanket, and beside it on a low wooden stool a plain homemade meal: a bowl of rice, a small bowl of lentil curry and a piece of flatbread on a steel plate, looking warm and delicious. A small open window showing a friendly neighborhood street of houses. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, warm beige, soft green and steel grey. --no text, letters, words, logo, watermark, people, person, hands, faces, man, boy, sunset, golden hour, night, dark moody grading, heavy shadows, gold, coins, luxury bed, silver dishes, silk --ar 16:5 --v 8.1
```

### L6 Ch5 · Spend Money like a Rich Man
`dist/L6/assets/illust-5.png` — 부자처럼 돈을 쓴다는 것 — 돈을 불리는 지혜

```
Photorealistic conceptual still life photograph, wide banner composition. On a plain wooden table in soft daylight, a small clay pot of rich soil with a young green sapling growing out of it, and a few coins placed at its roots as if planted like seeds, symbolizing money that grows. Beside it a humble notebook, a pencil and a small wooden abacus. A pile of shiny luxury jewelry pushed aside and out of focus at the far edge. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, fresh green, earthy brown and soft gold. --no text, letters, words, logo, watermark, people, person, hands, faces, man, boy, sunset, golden hour, night, dark moody grading, heavy shadows, bed, floor mat, food, mansion --ar 16:5 --v 8.1
```

## Lesson 7 — Spend Wisely (Why We Buy What We Buy)

### L7 Ch1 · Why We Buy What We Buy
`dist/L7/assets/illust-1.png` — 우리는 왜 그것을 사는가 — 구매에 영향을 주는 것들

```
Photorealistic interior photograph, wide banner composition. A bright bedroom closet corner overflowing with unused purchases: several shopping bags still folded shut, boxes of new sneakers never opened, clothes hanging with the tags still attached, a new gadget box unopened on the floor. Clean, calm and slightly humorous mood, lots of soft white space. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft white, pale pink and light grey. --no text, letters, words, numbers, price tags, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, parade, wagon, headphones, soccer field --ar 16:5 --v 8.1
```

### L7 Ch2 · The Bandwagon Effect
`dist/L7/assets/illust-2.png` — 밴드왜건 효과 — 남들이 사니까 나도 산다

```
Photorealistic street photograph, wide banner composition. A cheerful old-fashioned wooden parade bandwagon painted red and gold, decorated with bunting flags and brass instruments resting on its benches, parked on a festive town street with colorful balloons and paper streamers along the buildings. Next to it a sports shop window displaying many identical pairs of bright soccer shoes in neat rows. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, bright red, gold and fresh green. --no text, letters, words, numbers, price tags, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, coat, gown, furniture, headphones --ar 16:5 --v 8.1
```

### L7 Ch3 · The Diderot Effect
`dist/L7/assets/illust-3.png` — 디드로 효과 — 새 물건 하나가 부르는 연쇄 구매

```
Photorealistic interior photograph, wide banner composition. An elegant eighteenth century French study: a luxurious new crimson silk dressing gown hanging on a stand in the center, looking far finer than the old worn wooden desk, faded armchair and shabby bookshelves around it; at the right side of the room several brand-new elegant pieces of furniture wrapped in paper are waiting to replace the old ones. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, crimson, cream and pale wood. --no text, letters, words, numbers, price tags, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, parade, soccer shoes, headphones, shopping bags --ar 16:5 --v 8.1
```

### L7 Ch4 · The Anchoring Effect
`dist/L7/assets/illust-4.png` — 앵커링 효과 — 처음 본 가격이 닻이 된다

```
Photorealistic product still life photograph, wide banner composition. A pair of sleek over-ear headphones displayed on a white store shelf, and next to them a small heavy iron ship anchor resting on the same shelf as a visual metaphor, its chain curling gently toward the headphones. Clean minimal electronics shop background softly out of focus. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white, silver and soft navy blue. --no text, letters, words, numbers, price tags, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, gown, furniture, parade, soccer shoes, shopping bags --ar 16:5 --v 8.1
```

### L7 Ch5 · Think before You Buy
`dist/L7/assets/illust-5.png` — 사기 전에 생각하라 — 현명한 소비의 첫걸음

```
Photorealistic still life photograph, wide banner composition. A calm clean white desk with a closed wallet lying beside a small notepad and a pencil, a single shopping bag standing unopened next to it, and a small potted plant, suggesting a quiet pause to think before buying. Very minimal, peaceful, lots of empty white space. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft white, sage green and light tan. --no text, letters, words, numbers, price tags, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, parade, headphones, anchor, gown, soccer shoes --ar 16:5 --v 8.1
```
