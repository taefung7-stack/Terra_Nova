# 신목고 2-2 중간 · 세계문학 Unit 3 — Noodle Dishes from Around the World — 챕터별 삽화 프롬프트

> 규격: **`--ar 16:5 --v 8.1`** (와이드 배너, 본문 180mm 폭 전면)
> 톤: **실사 사진(포토리얼)** — 현대 한국의 일상, 흐린 날 확산광.
>
> ### 2026-09-02 전면 재작성 — 왜 바꿨나
> 이전 프롬프트는 **인라인 `NO xxx` 를 16개**씩 달고 1000자에 육박했다. 결과가 이상했다.
> 원인 두 가지:
> 1. **미드저니는 문장 속 `NO xxx` 를 부정으로 신뢰성 있게 처리하지 못한다.**
>    오히려 그 명사를 *요청*으로 읽어 끌어온다 — "NO chopsticks" 가 젓가락을 부른다.
>    특히 배제 대상이 그 장면에 **자연스럽게 어울리는 물건**일 때(한식 상 + 젓가락)
>    모순이 생겨 기괴한 결과가 나온다.
>    → 진짜 네거티브 파라미터 **`--no a, b, c`** 로 옮겼다.
> 2. **지시부가 길수록 주제가 희석된다.** 인물·소품·감정·배경을 한 문장에 욱여넣으면
>    어느 것도 선명하지 않다. → **주어 하나, 장면 하나**로 줄였다(지시부 800자 상한, 검증기 강제).
>
> ### 규칙
> - 밝기는 형용사가 아니라 **조명 조건**으로: `natural soft diffused daylight`
>   `bright overcast sky` `high-key exposure` `low contrast`.
>   `golden hour` `sunlit` 등은 지시부 금지(황금빛 저녁 + 고대비로 해석돼 되레 어두워진다).
>   단 **`--no` 뒤에는 반드시 넣어** 밀어낸다.
> - **사람을 등장시키지 않는다.** 손·뒷모습도 쓰지 않는다 — 미드저니가 손가락을 뭉개
>   기괴한 결과를 만드는 주범이었다. `--no face, portrait, distorted hands, extra fingers`.
>   사물·공간만으로 장면을 세운다.
> - **글자를 넣지 않는다.** `--no text, letters, words, signage, logo` — 미드저니가 만드는
>   가짜 한글/영문은 교재에 그대로 인쇄되면 치명적이다.
> - `--style raw` 로 과장된 연출을 억제한다.
> - 삽화 슬롯은 **16:5 레터박스 + `object-fit: cover`(중앙 크롭)** 이다.
>   주제를 **화면 중앙**에 두고, 위아래가 잘려도 살아남는 구도로 잡는다.
>
> **이 문서는 파생물입니다.** 프롬프트 원본은 `data/U3/{N}.json` 의
> `illustration.prompt` 이며, 수정 후 `node _oneoff-신목고-세계문학/collect-prompts.mjs U3`
> 로 이 문서를 다시 만듭니다.
>
> 생성한 이미지는 `dist/U3/assets/illust-{N}.png` 로 저장한 뒤 PDF 를 다시 렌더하면
> placeholder 자리에 자동으로 들어갑니다(빌드 방법은 README 참조).
>
> ⚠️ **Ch7 은 이 문서의 자동 파생 대상에서 빠집니다.** `collect-prompts.mjs` 는
> `_SOURCE-U3.js`(면 요리 6챕터)만 순회하는데, Ch7(The Hundred-Foot Journey)은
> 의도적으로 그 정본에 등록하지 않았습니다(README 「Ch7」 절 참조). 그래서 아래
> Ch7 섹션은 **손으로 추가**했습니다 — `collect-prompts.mjs U3` 를 다시 돌리면
> Ch7 섹션이 사라지니, 돌린 뒤에는 이 섹션을 다시 붙여 넣으세요.

---

## Chapter 1 — Noodle Dishes from Around the World (Intro)

- **INTRO** · 교과서 p.58 · 본문 5문장
- 저장 경로: `dist/U3/assets/illust-1.jpg`
- 장면: 삼베천 위에 놓인 마른 국수 다발 — 밝은 자연광 정물

```
Photorealistic still life photograph of several bundles of dried noodles resting on a piece of natural linen cloth, shot straight on from slightly above. Pale wheat-colored dried strands tied loosely into round bundles, a few loose strands scattered on the woven fabric, subtle texture of flour dust on the linen. Plain neutral tabletop, quiet and uncluttered composition. Shot on 50mm macro, natural soft diffused daylight, bright overcast window light, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the bundles centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, people, hands, face, broth, soup bowl, steam, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 2 — Pasta, Italy

- **PASTA** · 교과서 p.59 · 본문 7문장
- 저장 경로: `dist/U3/assets/illust-2.jpg`
- 장면: 이탈리아 식탁 위의 스파게티 — 바질과 토마토

```
Photorealistic overhead still life of a nest of cooked long spaghetti twirled on a white ceramic plate on a rustic Italian kitchen table, glossy with olive oil and a spoonful of red tomato sauce, fresh green basil leaves and ripe tomatoes on the vine beside it, a small bowl of grated hard cheese, a bottle of olive oil and a head of garlic on worn pale wood and a linen cloth. Shot on 50mm macro, natural soft diffused daylight from a side window, bright overcast sky, high-key exposure, low contrast, true-to-life color, fine steam, sharp focus, wide horizontal banner crop with the plate centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, logo, watermark, caption, people, face, hands, soup, broth, bowl of soup, rice noodles, chopsticks, lime, cilantro, bean sprouts, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen
```

---

## Chapter 3 — Pho, Vietnam

- **PHO** · 교과서 p.60 · 본문 7문장
- 저장 경로: `dist/U3/assets/illust-3.jpg`
- 장면: 쌀국수 한 그릇 — 맑은 국물과 고수·라임·숙주

```
Photorealistic close-up photograph of a single white ceramic bowl of Vietnamese rice noodle soup on a plain wooden table, seen from a low three-quarter angle. Clear amber broth, flat white rice noodles, thin slices of beef, fresh cilantro leaves and sliced spring onion on top. Beside the bowl, a small plate of raw bean sprouts and two lime wedges. Faint steam rising. Shot on 50mm, natural soft diffused daylight from a window, bright overcast sky, high-key exposure, low contrast, true-to-life color, shallow depth of field, sharp focus on the bowl, wide horizontal banner crop with the bowl centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, people, face, hands, spaghetti, pasta, cheese, tomato sauce, dramatic lighting, golden hour, sunset, neon, night, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 4 — Rechta, Algeria

- **RECHTA** · 교과서 p.61 · 본문 7문장
- 저장 경로: `dist/U3/assets/illust-4.jpg`
- 장면: 북아프리카 놋그릇에 담긴 납작한 밀가루 면 — 병아리콩과 향신료

```
Photorealistic overhead still life of flat ribbon wheat noodles heaped in a hammered brass bowl on a North African table, surrounded by chickpeas, turnip and potato pieces, and small mounds of warm-toned ground spices in shallow copper dishes. Woven textile and worn wood beneath. Shot on 50mm macro, natural soft diffused daylight from a window, bright overcast sky, high-key exposure, low contrast, true-to-life color, fine steam, sharp focus, wide horizontal banner crop with the bowl centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, logo, watermark, caption, people, face, hands, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen
```

---

## Chapter 5 — Sopa Criolla, Peru

- **SOPA CRIOLLA** · 교과서 p.62 · 본문 7문장
- 저장 경로: `dist/U3/assets/illust-5.jpg`
- 장면: 달걀프라이를 얹은 페루식 수프 — 소고기 육수 속 아주 가는 면

```
Photorealistic overhead photograph of a single Peruvian soup bowl on a plain earthenware table. Clear brown beef broth holds very thin pale noodles, small pieces of onion and tomato, and a whole fried egg resting on top with a soft yellow yolk and lightly crisped white. Steam rises faintly from the surface. Shot on 50mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, shallow depth of field, sharp focus on the egg, wide horizontal banner crop with the bowl centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, people, hands, basil, green herb leaves, pasta, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 6 — Noodles Bring Us Together (Closing)

- **CLOSING** · 교과서 p.63 · 본문 3문장
- 저장 경로: `dist/U3/assets/illust-6.jpg`
- 장면: 여러 나라의 면 요리 그릇이 나란히 놓인 나무 식탁 — 맺음말

```
Photorealistic overhead photograph of several noodle bowls from different countries arranged side by side on a plain wooden table. A pasta plate, a clear rice-noodle soup, a flat wheat-noodle dish in a brass bowl, and a broth bowl topped with a fried egg, each in its own vessel, evenly spaced on bare pale wood. Studio still life, no hands reaching in. Shot on 50mm, natural soft diffused daylight, bright overcast sky through a window, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the bowls centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, flag, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 7 — The Hundred-Foot Journey (Reconciliation) — 손추가, 자동생성 아님

- 추가 지문 · 교과서 pp.68~72 · 본문 38개 passage entry(리처드 C. 모라이스 소설 발췌)
- 저장 경로: `dist/U3/assets/illust-7.jpg`
- 장면: 병실 트레이 위에 놓인 아몬드·살구 페이스트리 — 화해의 순간
- 겹침 방지: 면 요리(Ch1~6)와 소재가 완전히 다름(페이스트리·병실) — 겹침 위험 없음

```
Photorealistic close-up photograph of a small open paper package of almond and apricot pastries on a white portable hospital tray, beside a woven wicker basket and a folded white cloth napkin, set on a pale blue hospital blanket. Pastries with visible pale almond glaze and light golden-brown crust, soft crumbs, a thin sheet of wax paper beneath them. Shot on 50mm macro, natural soft diffused daylight from a side window, bright overcast sky, high-key exposure, low contrast, true-to-life color, shallow depth of field, sharp focus on the pastries, wide horizontal banner composition with the tray centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, flag, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, sunlit, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

