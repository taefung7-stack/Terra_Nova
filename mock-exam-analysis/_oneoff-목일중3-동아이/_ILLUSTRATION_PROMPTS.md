# 목일중3 동아(이병민) — 삽화 미드저니 프롬프트 (12장)

> 규격 **`--ar 16:5 --v 8.1`** 고정. 실사 포토리얼 톤.
> 생성 후 `dist/{L6,L7,L8}/assets/illust-{N}.png` 로 저장 → 분석지 재빌드.

## 공통 규칙 (지키지 않으면 톤이 흐트러진다)

1. **밝기는 형용사가 아니라 조명 조건으로 지정한다.**
   `sunlit` · `golden` · `luminous` 는 실사에서 미드저니가 **황금빛 저녁 + 강한 역광**으로
   해석해 오히려 어두워진다. 대신
   `natural soft diffused daylight` / `bright overcast sky` / `high-key exposure`
   / `low contrast` 를 쓴다.
2. **12장이 서로 닮지 않게** 각 프롬프트에서 다른 챕터의 소재를 배제한다.
3. **인물 얼굴 클로즈업 회피.** 특히 **Lesson 8 은 실존 인물(Alfred Nobel)** 을 다루므로
   인물 묘사 대신 **사물·장소 중심 정물/실내**로 구성한다.
4. 글자·워터마크 차단(`NO text overlay, NO watermark`).

> ⚠️ **미드저니 인라인 NO 함정** — 문장 속 `NO chopsticks` 는 부정이 아니라
> 오히려 젓가락을 불러온다. 확실히 빼야 하는 요소는 문장 끝 **`--no a, b, c`**
> 파라미터로 지정하는 편이 안전하다. 아래 프롬프트는 두 방식을 섞어 두었으니,
> 결과에 원치 않는 요소가 나오면 그 단어를 `--no` 쪽으로 옮길 것.

---

## Lesson 6 — Make the World Beautiful (Nature Meets City)

### L6 Ch1 · Art Imitates Nature — The Egg
`dist/L6/assets/illust-1.png`

```
Wide banner architectural photograph of a tall egg-shaped glass skyscraper with a
diagonal diamond lattice pattern rising above a city skyline, its smooth rounded
curved silhouette tapering to a soft point at the top, clean modern office towers
much smaller around its base. Shot from street level looking up, full building
visible within the frame. Natural soft diffused daylight, bright overcast sky,
high-key exposure, low contrast, cool neutral glass-and-steel palette with pale
grey sky. Crisp architectural photography, sharp detail on the glass panels.
--ar 16:5 --v 8.1 --no cathedral, church spire, tree columns, opera house, sail
roof, harbour, water, curved silver metal panels, orange fruit, people, faces,
text, watermark, dramatic lighting, sunset, night
```

### L6 Ch2 · Sagrada Familia, Trees Indoors
`dist/L6/assets/illust-2.png`

```
Wide banner interior photograph of a vast basilica nave whose tall stone columns
branch overhead like the trunks and limbs of a forest of trees, the branching
supports meeting a honeycomb vaulted ceiling studded with star-shaped skylights,
pale cream and warm white stone. Symmetrical view straight down the empty nave.
Natural soft diffused daylight filtering through high stained glass, bright even
interior illumination, high-key exposure, low contrast, airy and spacious.
Architectural interior photography, sharp detail on the stone branching.
--ar 16:5 --v 8.1 --no egg-shaped tower, glass skyscraper, city skyline, opera
house, sail roof, harbour, orange fruit, silver curved building, crowds, people,
faces, text, watermark, dramatic lighting, sunset, night, heavy shadows
```

### L6 Ch3 · Sydney Opera House and an Orange
`dist/L6/assets/illust-3.png`

```
Wide banner photograph of a modern harbourside opera house with a cluster of
white curved shell roofs shaped like overlapping segments of peel, rising from a
broad stone platform beside calm blue harbour water. Viewed from across the water
so the whole roof cluster is visible, a few small sailing boats far in the
background. Natural soft diffused daylight, bright overcast sky, high-key
exposure, low contrast, clean white and pale blue palette. Crisp architectural
photography.
--ar 16:5 --v 8.1 --no egg-shaped tower, glass skyscraper, cathedral interior,
tree columns, stone vaulting, silver curved panels, spaceship, people, faces,
text, watermark, dramatic lighting, golden hour, sunset, night
```

### L6 Ch4 · DDP and the Curves of Nature
`dist/L6/assets/illust-4.png`

```
Wide banner architectural photograph of a large futuristic building clad in
thousands of smooth silver aluminium panels, its form one long flowing curved
line with no sharp corners, sweeping horizontally across the frame like a
rounded hill, set in a landscaped urban plaza with low green planting. Exterior
daytime view from the plaza. Natural soft diffused daylight, bright overcast sky,
high-key exposure, low contrast, cool silver and soft green palette. Crisp
architectural photography, sharp detail on the panel seams.
--ar 16:5 --v 8.1 --no egg-shaped tower, cathedral, tree columns, opera house,
sail roof, harbour, water, orange fruit, crowds, people, faces, text, watermark,
dramatic lighting, sunset, night
```

---

## Lesson 7 — Feel the Wonder (Under the Sea)

### L7 Ch1 · Under the Sea — 도입
`dist/L7/assets/illust-5.png`

```
Wide banner underwater photograph of a vast healthy coral reef seen from a
distance, many small colorful reef fish of different species scattered across the
frame above branching corals and sea fans, open blue ocean and the bright surface
visible above. No single subject dominates — a broad view of ocean biodiversity.
Bright clear blue water, natural daylight filtering down from the surface,
high-key exposure, low contrast, vivid but airy palette. Professional underwater
photography, sharp detail.
--ar 16:5 --v 8.1 --no whale, humpback, large single fish, clam, shell, seabird,
bird, sandy empty seabed, diver, people, faces, text, watermark, dark deep water,
murky, dramatic lighting, night
```

### L7 Ch2 · Sweet Dreams — 혹등고래
`dist/L7/assets/illust-6.png`

```
Wide banner underwater photograph of a small group of large humpback whales
floating motionless in a vertical position just below the ocean surface, heads
angled downward and tails upward, their long pectoral fins hanging still, spaced
apart in open blue water, the bright surface shimmering above them. Seen from a
distance so several whales fit in the frame. Clear blue water, natural daylight
from the surface, high-key exposure, low contrast, calm serene mood.
Professional underwater wildlife photography.
--ar 16:5 --v 8.1 --no coral reef, small reef fish, clam, shell, rock, seabird,
bird, jumping fish, splash, diver, people, faces, text, watermark, dark deep
water, murky, dramatic lighting, night
```

### L7 Ch3 · Enjoy Your Meal — tuskfish
`dist/L7/assets/illust-7.png`

```
Wide banner underwater photograph of a single medium-sized brightly colored
wrasse-type reef fish holding a closed pale clam shell crosswise in its mouth,
poised beside a large hard coral rock on a clean sandy seabed, a small puff of
sand drifting near the bottom. Side view, the fish and the rock both clearly
visible. Clear blue-green shallow water, natural daylight from above, high-key
exposure, low contrast, bright sandy palette. Professional underwater wildlife
photography, sharp detail on the fish scales and the shell.
--ar 16:5 --v 8.1 --no whale, humpback, school of fish, coral reef panorama,
seabird, bird, jumping fish, splash, diver, people, faces, text, watermark, dark
deep water, murky, dramatic lighting, night
```

### L7 Ch4 · One, Two, Three, Jump!
`dist/L7/assets/illust-8.png`

```
Wide banner action photograph taken at the sea surface of a large powerful silver
fish launching its whole body clear out of the water in an upward arc, water
spraying from its fins, a single seabird gliding low just above the surface a
short distance ahead of it, open ocean and sky behind. Side view capturing both
the fish and the bird in the frame. Bright overcast sky, natural soft diffused
daylight, high-key exposure, low contrast, cool blue and silver palette. Fast
shutter wildlife action photography, sharp spray droplets.
--ar 16:5 --v 8.1 --no whale, humpback, coral reef, clam, shell, underwater view,
seabed, flock of birds, boat, diver, people, faces, text, watermark, dramatic
lighting, sunset, golden hour, night
```

---

## Lesson 8 — Up to You (How Will You Be Remembered?)

> ⚠️ **Alfred Nobel 은 실존 인물이다.** 얼굴·초상을 그리지 않는다.
> 네 장 모두 **사물과 공간**으로 장면을 만든다.

### L8 Ch1 · The Merchant of Death
`dist/L8/assets/illust-9.png`

```
Wide banner still-life photograph of a 19th-century wooden writing desk seen from
a low side angle, an open broadsheet newspaper lying flat across it, a white
porcelain coffee cup tipped over on its saucer with dark coffee spilled in a pool
across the desk and the newspaper edge, a fountain pen and a few papers nearby.
Empty chair pushed back behind the desk. Natural soft diffused daylight from a
window to the side, bright overcast, high-key exposure, low contrast, warm wood
and cream paper palette. Period still-life photography, sharp detail, newspaper
text blurred and illegible.
--ar 16:5 --v 8.1 --no portrait, man, face, person, hands, gold medal, award
ceremony, armchair by window, laboratory, dynamite, explosion, readable text,
headline, watermark, dramatic lighting, candlelight, sunset, night, dark moody
```

### L8 Ch2 · Reading His Own Obituary
`dist/L8/assets/illust-10.png`

```
Wide banner overhead still-life photograph looking straight down at an old
broadsheet newspaper page lying open on a plain wooden surface, its columns of
print and a small decorative rule visible but the type deliberately soft and
illegible, one corner of the page slightly curled, a pair of reading spectacles
resting on the paper. Nothing else in the frame. Natural soft diffused daylight,
bright overcast, high-key exposure, low contrast, cream paper and grey ink
palette. Flat-lay period still-life photography.
--ar 16:5 --v 8.1 --no portrait, man, face, person, hands, coffee cup, spill,
desk clutter, gold medal, award ceremony, armchair, window, readable text,
headline, letters, words, watermark, dramatic lighting, sunset, night, dark moody
```

### L8 Ch3 · Nobel's Resolve
`dist/L8/assets/illust-11.png`

```
Wide banner interior photograph of a quiet 19th-century study, one empty
high-backed armchair turned toward a tall window with sheer curtains, a small
side table beside it, bookshelves along the wall behind, bare wooden floor. The
room is unoccupied and still, contemplative mood. Natural soft diffused daylight
flooding in through the window, bright overcast outside, high-key exposure, low
contrast, muted warm neutral palette. Period interior photography, sharp detail
on the upholstery and the book spines.
--ar 16:5 --v 8.1 --no portrait, man, face, person, silhouette, hands, newspaper,
coffee cup, spill, writing desk, gold medal, award ceremony, crowd, readable
text, watermark, dramatic lighting, candlelight, sunset, night, dark moody
```

### L8 Ch4 · The Nobel Prize
`dist/L8/assets/illust-12.png`

```
Wide banner still-life photograph of a single round gold medal resting on a deep
blue velvet cushion on a polished table, a folded ribbon beside it, the medal's
engraved surface catching soft light, the blurred interior of a grand formal hall
with rows of empty seats far behind. Close side view, the medal sharp and
centered. Natural soft diffused daylight, bright even hall lighting, high-key
exposure, low contrast, gold and deep blue palette. Elegant product still-life
photography, shallow depth of field.
--ar 16:5 --v 8.1 --no portrait, man, face, person, hands, audience, crowd,
newspaper, coffee cup, writing desk, armchair, window, dynamite, readable text,
engraving letters, watermark, dramatic lighting, spotlight, sunset, night, dark
moody
```
