# 신목고 2-2 기말 · 세계문화 Culture in Idioms — 챕터별 삽화 프롬프트

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
> **이 문서는 파생물입니다.** 프롬프트 원본은 `data/WI/{N}.json` 의
> `illustration.prompt` 이며, 수정 후 `node _oneoff-신목고-세계문학/collect-prompts.mjs WI`
> 로 이 문서를 다시 만듭니다.
>
> 생성한 이미지는 `dist/WI/assets/illust-{N}.png` 로 저장한 뒤 PDF 를 다시 렌더하면
> placeholder 자리에 자동으로 들어갑니다(빌드 방법은 README 참조).

---

## Chapter 1 — Culture in Idioms (Intro)

- **INTRO** · 교과서 p.104 · 본문 7문장
- 저장 경로: `dist/WI/assets/illust-1.jpg`
- 장면: 오래된 사암 사원 계단에 앉은 원숭이 한 마리 — 문화마다 다른 동물에 대한 시선

```
Photorealistic image of a small monkey sitting calmly on the worn steps of an old carved sandstone temple, soft green foliage at the edges, a brass offering bowl of grain on the step beside it. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop, warm sandstone beige and soft green --ar 16:5 --v 8.1 --style raw --no text, letters, words, writing, signage, logo, watermark, caption, flag, people, person, face, portrait, hands, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, rats, mice, statues of gods, crowds
```

---

## Chapter 2 — Easy-to-Guess Animal Idioms

- **EASY IDIOMS** · 교과서 p.105 · 본문 10문장
- 저장 경로: `dist/WI/assets/illust-2.jpg`
- 장면: 지갑 공방 작업대 위 가지런한 가죽 지갑과 악어 무늬 가죽 — "지갑 공장의 악어"

```
Photorealistic still life on a clean leather-crafting workbench: a neat row of finished brown leather wallets, a large rolled crocodile-pattern leather hide, brass rivets and simple cutting tools, bright small workshop. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop, warm tan, chestnut brown and soft cream --ar 16:5 --v 8.1 --style raw --no text, letters, words, writing, signage, logo, watermark, caption, flag, people, person, face, portrait, hands, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, live animals, blood, money, cards
```

---

## Chapter 3 — Hard-to-Guess Animal Idioms

- **HARD IDIOMS** · 교과서 p.106 · 본문 8문장
- 저장 경로: `dist/WI/assets/illust-3.jpg`
- 장면: 흙벽돌 농가 마당의 흰 암탉과 달걀 바구니 — 이집트에서 닭은 안정된 수입

```
Photorealistic image of a single healthy white hen standing in the courtyard of a simple mud-brick farmhouse beside a woven basket full of fresh brown eggs, a few palm fronds at the edge of the frame. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop, sandy beige, warm white and soft palm green --ar 16:5 --v 8.1 --style raw --no text, letters, words, writing, signage, logo, watermark, caption, flag, people, person, face, portrait, hands, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, rats, mice, cliffs, pyramids, money
```

---

## Chapter 4 — Same Idea, Different Animals

- **SAME IDEA** · 교과서 p.107 · 본문 6문장
- 저장 경로: `dist/WI/assets/illust-4.jpg`
- 장면: 목초지 울타리 옆의 당나귀 — 같은 고집, 다른 동물

```
Photorealistic image of a single grey donkey standing calmly beside an old wooden fence in a green alpine meadow, small wildflowers in the grass and soft hills behind. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop, soft grey, meadow green and pale sky blue --ar 16:5 --v 8.1 --style raw --no text, letters, words, writing, signage, logo, watermark, caption, flag, people, person, face, portrait, hands, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, rider, saddle, cart, wolves, sheep, cats
```

---

## Chapter 5 — Idioms with Two Animals

- **TWO ANIMALS** · 교과서 p.108 · 본문 6문장
- 저장 경로: `dist/WI/assets/illust-5.jpg`
- 장면: 헛간 벽 틈의 쥐를 노려보는 고양이 — 고양이와 쥐 놀이

```
Photorealistic image inside a rustic wooden barn: a grey tabby cat crouches low on the straw-covered floor, intently watching a small brown field mouse peeking out from a gap at the bottom of the old plank wall. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop, warm straw yellow, weathered wood brown and soft grey --ar 16:5 --v 8.1 --style raw --no text, letters, words, writing, signage, logo, watermark, caption, flag, people, person, face, portrait, hands, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, blood, dogs, monkeys
```

---

## Chapter 6 — Where Do Idioms Come From? (Closing)

- **CLOSING** · 교과서 p.108 · 본문 4문장
- 저장 경로: `dist/WI/assets/illust-6.jpg`
- 장면: 스웨덴 농가의 얼어붙은 호수와 호숫가 목초지의 소들 — 얼음 위에 소가 없다

```
Photorealistic winter landscape in the Swedish countryside: a calm frozen lake with smooth pale ice and light snow in the foreground, and on the far shore a red wooden farmhouse with a few brown dairy cows grazing peacefully on a snowy pasture. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop, icy blue, snow white and barn red --ar 16:5 --v 8.1 --style raw --no text, letters, words, writing, signage, logo, watermark, caption, flag, people, person, face, portrait, hands, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, skaters, boats, broken ice, cracks
```

