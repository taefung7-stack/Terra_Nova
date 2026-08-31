# 중2 동아(윤정미) Lesson 5·6 — 삽화 프롬프트 (전 7장)

> 규격: **`--ar 16:5 --v 8.1`** (와이드 배너)
> 톤: **실사 사진(포토리얼)** — 여행·다큐멘터리 톤, 흐린 날 확산광.
>
> **밝기는 형용사가 아니라 조명 조건으로 지정한다.** `bright`·`sunlit`·`luminous`
> 같은 형용사는 실사에서 미드저니가 **황금빛 저녁 + 강한 역광**으로 해석해
> 오히려 어두워진다. 대신 다음을 쓴다 —
> `natural soft diffused daylight` · `bright overcast sky` · `high-key exposure`
> · `low contrast` · `airy` · `clean bright background`.
>
> `cinematic` `golden hour` `dramatic lighting` `chiaroscuro` `moody` `neon` `night`
> 는 **지시부에서 금지**. 단 `NO ~` 배제절 안에서는 오히려 명시해 밀어낸다.
>
> 인물은 **얼굴 클로즈업을 피하고** 손·뒷모습·소품 위주로 — 교재 삽화이므로
> 특정인 초상을 만들지 않는다. 중학생 대상이라 무겁거나 비장한 연출도 피한다.
> **Lesson 6 은 실존 인물(Frank W. Schofield)을 다루므로 인물을 그리지 않는다.**
>
> **7장이 서로 닮지 않도록** 각 프롬프트에 다른 챕터의 소재를 `NO ~` 로 배제했다.
>
> 생성한 이미지를 `dist/{L5,L6}/assets/illust-{N}.png` 로 저장한 뒤
> 분석지를 재빌드하면 자동 반영된다.
>
> ```bash
> cd mock-exam-analysis
> L=L5   # 또는 L6
> node builder/build.mjs "_oneoff-중2-동아윤/data/$L" "_oneoff-중2-동아윤/dist/$L" >   --styles="_oneoff-중2-동아윤/styles/analysis.css"
> node builder/pdf.mjs "_oneoff-중2-동아윤/dist/$L"
> node "_oneoff-중2-동아윤/combine.mjs" $L
> ```

---

## Lesson 5 — Street Art in London

교과서 소재: 런던 거리 예술 투어 → STIK(선과 점) → Banksy(초록 나무) → Ben Wilson(껌 그림).
세 장이 **거리 벽화 / 공원 벽면 / 보도 바닥 접사**로 확실히 갈리게 구성했다.

### Ch1 · Street Art in London & STIK — Shoreditch 와 STIK

- 저장 경로: `dist/L5/assets/illust-1.png`
- 원문 10문장 · 키워드: modern, form, colorful, lively

```
Photorealistic urban documentary photograph, wide banner composition. A lively East-London street-art district: a narrow city street lined with old brick warehouse walls completely covered in large colorful abstract murals, one prominent wall painting of simple stick-like human figures drawn with bold black outlines and small dot eyes, standing side by side. A few bicycles and a lamppost along the pavement, distant pedestrians seen only from behind at small scale. Fresh, open, welcoming city-guide feel. NO green spray-painted tree, NO leafless tree, NO person holding a spray can, NO stencil graffiti of Banksy style, NO chewing gum on the pavement, NO tiny miniature paintings on the ground, NO close-up faces, NO identifiable real people, NO real existing artwork reproduction. Shot on a wide-angle lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch2 · Banksy in Finsbury Park — 전개

- 저장 경로: `dist/L5/assets/illust-2.png`
- 원문 9문장 · 키워드: closely, figure, dot, clue

```
Photorealistic documentary photograph, wide banner composition. A quiet city park corner: a bare leafless tree with thin dark branches stands close in front of a plain flat brick wall, and a large soft green leafy shape is spray-painted on the wall directly above and behind the branches so the painted green reads as the tree's missing foliage. A single metal spray can and a small hand sprayer rest on the pavement beside the trunk. Simple environmental-message street-art feel, plain wall, ordinary park pavement. NO stick figure murals, NO outlined human figures with dot eyes, NO cartoon line-and-dot characters, NO tiny miniature paintings on chewing gum, NO close-up pavement gum, NO recognizable existing artwork, NO close-up human faces. Shot on a wide-angle lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch3 · Ben Wilson's Gum Paintings — 마무리

- 저장 경로: `dist/L5/assets/illust-3.png`
- 원문 9문장 · 키워드: final, stop, tour, artwork

```
Photorealistic close-up street photograph, wide banner composition, low camera angle just above a grey city pavement. Several small flattened dots of chewing gum stuck on the concrete slabs have been painted with tiny colorful miniature pictures — simple bright shapes and patterns the size of a coin. Shallow depth of field on the painted gum dots, one or two walking shoes softly blurred far in the background. Charming, delicate, look-down-and-look-closely feeling, fine surface texture of the pavement. NO large wall murals, NO stick-figure murals, NO dot-eye cartoon figures, NO green spray-painted tree, NO leafless tree, NO Banksy-style stencil, NO spray can, NO close-up human faces, NO identifiable existing artwork. Shot on a macro lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy clean bright look, true-to-life color, sharp focus on the foreground. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

---

## Lesson 6 — Dr. Schofield, a Foreigner Who Loved Korea

교과서 소재: 1919년 3·1 운동 촬영 → 석호필의 삶 → 기사 송고 → 귀환과 영면.
실존 인물이므로 **인물 묘사 대신 사물·장소 중심 정물/풍경**으로 구성했다.
네 장이 **창밖 군중 / 의학 강의실 / 타자기 책상 / 현충원 풍경**으로 갈린다.

### Ch1 · A Special Favor — 도입(극본)

- 저장 경로: `dist/L6/assets/illust-1.png`
- 원문 11문장 · 키워드: favor, special, ask, gather

```
Photorealistic historical documentary photograph, wide banner composition. The view from inside a dim upper-floor room of an early-20th-century building, looking out through a plain wooden-framed window onto a Korean street in 1919: a vintage folding bellows camera rests on the wide windowsill in the foreground, and far below and beyond the glass a very large crowd of people fills a broad street, all seen from behind and above as small distant figures in period-accurate white Korean hanbok. Quiet, observational, archival feel, strong sense of watching from a hidden window. NO close-up faces, NO identifiable persons, NO flags with legible markings, NO hospital, NO medical classroom, NO lecture hall, NO newspaper printing press, NO printing machinery, NO cemetery, NO gravestone, NO memorial monument. Shot on a wide-angle lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch2 · Seok Hopil, the Man Who Loved Korea — 전개

- 저장 경로: `dist/L6/assets/illust-2.png`
- 원문 7문장 · 키워드: English, sound, similar, real

```
Photorealistic interior photograph, wide banner composition. A bright early-twentieth-century medical lecture room: rows of empty wooden desks and benches receding toward a large dark green blackboard that is completely blank, tall windows along one wall letting in plain even daylight. On a side table an antique varnished wooden anatomical model stands beside a row of clear glass laboratory bottles. On the front desk an open notebook lies with a fountain pen resting across it. Worn wooden floorboards, chalk dust in the still air, quiet scholarly period atmosphere. NO street crowd, NO protest scene, NO view of a crowd through a window, NO newspaper printing press, NO printing machinery, NO cemetery, NO gravestone, NO memorial monument. Shot on a wide-angle lens, natural soft diffused daylight, bright overcast sky outside the windows, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO people, NO close-up faces, NO legible writing on the blackboard, NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch3 · Telling the World About March 1st — 절정

- 저장 경로: `dist/L6/assets/illust-3.png`
- 원문 5문장 · 키워드: take a picture, event, camera, article

```
Photorealistic documentary still-life photograph, wide banner composition. A period 1919 foreign correspondent's wooden desk beside a window: an antique black typewriter with a sheet of blank paper in the carriage, a loose scattering of developed black-and-white photographs spread across the desktop, a fountain pen resting on a blank writing pad, and a sealed paper envelope ready for mailing placed at the edge of the desk. Worn wood grain, a plain glass window pane behind the desk showing only soft pale sky, quiet archival reporting mood. NO people, NO close-up faces, NO hands, NO legible text on the papers or photographs, NO street crowd seen from a window, NO protest march, NO medical lecture room, NO classroom, NO anatomy chart, NO cemetery, NO gravestone, NO memorial monument. Shot on a normal lens at desk height, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus, fine material detail. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch4 · He Never Left Again — 마무리

- 저장 경로: `dist/L6/assets/illust-4.png`
- 원문 3문장 · 키워드: return, invitation, at the invitation of, government

```
Photorealistic landscape photograph, wide banner composition. A peaceful, well-kept Korean national cemetery on a calm bright day: neat orderly rows of low simple memorial stones set on a wide green lawn, tall straight pine trees standing along the far edge, a broad clean walking path curving gently through the grounds. In the foreground, a single small bunch of white chrysanthemums lies on the grass beside the nearest row. Respectful, serene, quiet and dignified, generous open space, NOT gloomy. NO street crowd seen from a window, NO view looking down from a building, NO medical lecture room, NO classroom, NO desk with a typewriter, NO newspapers or printed articles, NO camera, NO people, NO close-up faces, NO legible inscriptions, NO readable letters or numbers on the stones, NO flags, NO gravestone crosses. Shot on a wide-angle lens at eye level, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```
