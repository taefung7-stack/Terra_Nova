# 금옥중3 능률(김성곤) — 삽화 미드저니 프롬프트 (12장)

> 규격 **`--ar 16:5 --v 8.1`** 고정. 실사 포토리얼 톤.
> 생성 후 `dist/{L5,L6,L7}/{N}.png` 로 원본을 받고, 가로 2000px 축소본을 `dist/{L}/assets/illust-{N}.png` 로 넣은 뒤 분석지 재빌드(README 참조).
> ★ 프롬프트 원본은 `_author-L{5,6,7}.mjs` 의 `prompt` 필드다. 여기를 고치지 말고 그쪽을 고친 뒤 이 문서를 다시 생성할 것.

## 공통 규칙

1. **밝기는 형용사가 아니라 조명 조건으로 지정** — `natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast`. `sunlit`·`golden` 은 실사에서 오히려 어두워진다.
2. **배제 요소는 문장 속 NO 가 아니라 끝의 `--no` 파라미터**로 — 문장 속 `NO xxx` 는 오히려 그 물건을 불러온다.
3. **사람은 넣지 않는다**(손가락·얼굴 뭉개짐 방지). 대화문(Lesson 6)도 강아지·물건·장소로 장면을 만든다. 단 L5 Ch2 수중 박물관은 **사람 모양 조각상**이 핵심이라 `people` 대신 `living people, diver` 만 막았다.
4. 12장이 서로 닮지 않도록 각 프롬프트의 `--no` 에 다른 챕터 소재를 넣었다.
5. 글자·로고·화면 UI 차단(`--no text, letters, logo, screen interface`).

---

## Lesson 5 — Environmental Innovations (Join Hands, Save the Earth)

### L5 Ch1 · 힘을 합쳐 지구를 구하자 — 위기에 처한 칸쿤의 바다
`dist/L5/assets/illust-1.png`

```
Photorealistic aerial travel photograph, wide banner composition. The shallow turquoise Caribbean sea off Cancun, Mexico, seen from above: a coral reef visible through crystal-clear water, and several small white tour boats crowded together and anchored right over the reef, showing tourist pressure on the sea. White sand coastline with a row of hotels along the left edge. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, vivid turquoise and white. --no text, letters, words, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, statues, sculptures --ar 16:5 --v 8.1
```

### L5 Ch2 · 수중 박물관 — 관광객을 돌려 바다를 살리는 조각상
`dist/L5/assets/illust-2.png`

```
Photorealistic underwater photograph, wide banner composition. An underwater sculpture museum on a sandy seabed about 14 meters deep: dozens of life-size grey concrete human statues standing in neat rows, their surfaces partly covered with young coral, green algae and small sponges, a few small colorful reef fish swimming between them. Clear blue water with gentle light rays from the bright surface above. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, clean bright blue palette. --no text, letters, logo, watermark, diver, swimmer, living people, hands, boat, murky water, sunset, night, dark moody grading, heavy shadows --ar 16:5 --v 8.1
```

### L5 Ch3 · 싱가포르의 친환경 건물 — 바람이 통하는 개방형 구조
`dist/L5/assets/illust-3.png`

```
Photorealistic architectural photograph, wide banner composition. A modern eco-friendly high-rise building in tropical Singapore with an open structure: large open-air voids and breezeways cut through the middle floors, open terraces and louvered walls letting outside air pass straight through the building, pale concrete and white steel, a clear view of the sky visible through the openings. Street-level wide angle, surrounding tropical trees. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, fresh white and soft green. --no text, letters, words, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, air conditioner units, rooftop pool, vertical garden wall --ar 16:5 --v 8.1
```

### L5 Ch4 · 녹지와 미래 — 인간과 자연의 조화를 향한 혁신
`dist/L5/assets/illust-4.png`

```
Photorealistic architectural photograph, wide banner composition. A modern tropical apartment tower in Singapore whose balconies and sky terraces overflow with large lush gardens: mature trees, hanging plants and shrubs on every level, the greenery casting soft shade across the pale facade and shielding it from direct sun. Shot from a low angle across a leafy public garden in the foreground. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, vivid fresh greens and white concrete. --no text, letters, words, logo, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, open-air voids, cars, traffic --ar 16:5 --v 8.1
```

---

## Lesson 6 — Take Part in the Economy (Life in the Sharing Economy)

### L6 Ch1 · 캠핑 계획 — 텐트도 없고 강아지는 누가 돌보지?
`dist/L6/assets/illust-1.png`

```
Photorealistic lifestyle photograph, wide banner composition. A cozy bright living room on a weekend morning: a friendly golden retriever sitting on a wooden floor next to an empty camping backpack, a folded map and a smartphone lying face-down, a big window showing green trees outside. The scene suggests a camping trip is being planned. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, warm neutral whites and soft greens. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, tent --ar 16:5 --v 8.1
```

### L6 Ch2 · 이웃에게 빌리세요 — 물건 공유 앱과 사용자 후기
`dist/L6/assets/illust-2.png`

```
Photorealistic still-life photograph, wide banner composition. A bright clean apartment hallway doorstep where neighbors share things: a board game box with a plain blank lid and a slightly cracked bicycle helmet resting side by side on a small wooden bench next to a neighbor's front door, a smartphone lying face-down beside them. Simple, tidy, everyday feeling. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft white walls and light wood. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, dog, tent --ar 16:5 --v 8.1
```

### L6 Ch3 · 반려동물 돌보미 찾기 — 반려동물 돌봄 공유 앱과 후기
`dist/L6/assets/illust-3.png`

```
Photorealistic outdoor photograph, wide banner composition. A happy beagle trotting along a clean paved path in a leafy city park, a red leash trailing from its collar out of the frame to the right, green lawns and trees on both sides, apartment buildings softly visible in the distance. Joyful, light, everyday mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, fresh greens and soft blue sky. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, tent, helmet --ar 16:5 --v 8.1
```

### L6 Ch4 · 공유 경제 — 약점이 있어도 쓸수록 나아진다
`dist/L6/assets/illust-4.png`

```
Photorealistic outdoor photograph, wide banner composition. A peaceful lakeside campsite in the morning: a small green dome tent pitched on grass near calm water, a golden retriever lying relaxed in front of the tent, two folding camping chairs and a small table beside it, forested hills across the lake. Calm, satisfied, happy mood. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, fresh greens and soft lake blue. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, campfire smoke, bicycle helmet --ar 16:5 --v 8.1
```

---

## Lesson 7 — Future Changes through Technology (Life with Robots)

### L7 Ch1 · 우리는 어디에서 로봇을 보는가 — 곳곳에서 일하는 로봇
`dist/L7/assets/illust-1.png`

```
Photorealistic urban photograph, wide banner composition. A white quadcopter delivery drone carrying a small cardboard parcel flies over a clean modern city, seen from a rooftop level: rows of bright apartment buildings and green street trees below, wide open pale sky filling most of the frame. Clear, optimistic, near-future everyday scene. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft sky blue and white. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, humanoid face, sunset, golden hour, night, dark moody grading, heavy shadows, neon, robot dog, robot arm, factory --ar 16:5 --v 8.1
```

### L7 Ch2 · 똑똑해지는 로봇 — 인공지능(AI)이 가능하게 한 일
`dist/L7/assets/illust-2.png`

```
Photorealistic interior photograph, wide banner composition. A bright modern living room with a small white robot dog, sleek and friendly with rounded plastic body panels, sitting on a light wooden floor and looking up attentively, and a round cylindrical smart speaker glowing with a soft blue ring light on a low shelf beside a sofa. Minimal Scandinavian decor, large window. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, white, light wood and soft blue accents. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, humanoid face, sunset, golden hour, night, dark moody grading, heavy shadows, neon, drone, car, real dog --ar 16:5 --v 8.1
```

### L7 Ch3 · 우리 주변의 로봇 — 가정 도우미·자율 주행차·로봇 군집
`dist/L7/assets/illust-3.png`

```
Photorealistic agricultural technology photograph, wide banner composition. A robot swarm working on a wide green farm field: dozens of small identical white wheeled robots spread evenly in neat rows between crops, moving together like a colony of ants, some tending plants, gentle rolling farmland and a row of trees on the horizon. Organized, cooperative, futuristic yet calm. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, fresh greens and clean white. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, humanoid face, sunset, golden hour, night, dark moody grading, heavy shadows, neon, drone, humanoid robot, tractor driver, rubble --ar 16:5 --v 8.1
```

### L7 Ch4 · 미래를 바라보며 — 수색 구조 로봇과 로봇 시대의 과제
`dist/L7/assets/illust-4.png`

```
Photorealistic documentary photograph, wide banner composition. A rugged four-legged search-and-rescue robot with tracked sensor head and bright orange safety panels carefully climbing over broken concrete rubble of a collapsed building after an earthquake, a cleared path visible behind it, light dust in the air, the open bright sky above suggesting hope. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, pale concrete greys with vivid safety orange accents. --no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, humanoid face, sunset, golden hour, night, dark moody grading, heavy shadows, neon, fire, flames, smoke, blood, injured, drone, robot dog pet --ar 16:5 --v 8.1
```
