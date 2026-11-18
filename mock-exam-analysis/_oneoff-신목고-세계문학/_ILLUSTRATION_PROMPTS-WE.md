# 신목고 2-2 기말 · 세계문화 World Englishes — 챕터별 삽화 프롬프트

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
> **이 문서는 파생물입니다.** 프롬프트 원본은 `data/WE/{N}.json` 의
> `illustration.prompt` 이며, 수정 후 `node _oneoff-신목고-세계문학/collect-prompts.mjs WE`
> 로 이 문서를 다시 만듭니다.
>
> 생성한 이미지는 `dist/WE/assets/illust-{N}.png` 로 저장한 뒤 PDF 를 다시 렌더하면
> placeholder 자리에 자동으로 들어갑니다(빌드 방법은 README 참조).

---

## Chapter 1 — World Englishes (Intro)

- **INTRO** · 교과서 p.92~93 · 본문 11문장
- 저장 경로: `dist/WE/assets/illust-1.jpg`
- 장면: 라벨 없는 앤티크 지구본이 놓인 밝은 나무 책상 — 세계로 퍼진 영어

```
Photorealistic still life of an antique brass and walnut desk globe with plain unlabeled continents painted in soft blue and cream, standing on a pale oak table beside a closed leather notebook. Studio still life, nothing else on the table. Shot on 50mm, natural soft diffused daylight, bright overcast sky through a window, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the globe centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, map labels, signage, logo, watermark, caption, flag, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 2 — British English

- **BRITISH** · 교과서 p.94 · 본문 8문장
- 저장 경로: `dist/WE/assets/illust-2.jpg`
- 장면: 돌담이 가로지르는 북잉글랜드의 초록 언덕(fell) — 바이킹이 남긴 단어

```
Photorealistic landscape of rolling green fells in Northern England, old dry stone walls crossing the grassy slopes and a small grey stone farmhouse at the foot of the hills, empty open countryside. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the hills centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, flag, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 3 — American English

- **AMERICAN** · 교과서 p.95 · 본문 8문장
- 저장 경로: `dist/WE/assets/illust-3.jpg`
- 장면: 흰 선이 그어진 거의 빈 주차장 항공 사진 — parking lot vs. car park

```
Photorealistic aerial top-down photograph of a nearly empty suburban parking lot with crisp white painted parking lines on clean grey asphalt, three small colorful cars parked far apart, a strip of green trees along one edge. Shot from a drone, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the lot centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, numbers, license plates, signage, logo, watermark, caption, flag, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 4 — Australian English

- **AUSTRALIAN** · 교과서 p.96 · 본문 9문장
- 저장 경로: `dist/WE/assets/illust-4.jpg`
- 장면: 유칼립투스가 드문드문 선 마른 초원 위의 캥거루 한 마리 — 새 단어가 필요했던 낯선 동물

```
Photorealistic wildlife photograph of a single grey kangaroo standing upright in a wide dry pale-green grassland, a few scattered eucalyptus trees in the soft background, open Australian bush landscape. Shot on 200mm telephoto, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus on the animal, wide horizontal banner crop with the kangaroo centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, flag, human face, portrait, people, hands, distorted hands, extra fingers, extra limbs, cartoon, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 5 — South Asian English

- **SOUTH ASIAN** · 교과서 p.97 · 본문 8문장
- 저장 경로: `dist/WE/assets/illust-5.jpg`
- 장면: 놋쇠 쟁반 위 짜이 유리잔과 향신료, 금잔화 — 남아시아의 일상

```
Photorealistic overhead still life of a round polished brass tray holding three small glasses of milky masala chai, a few green cardamom pods, cinnamon sticks, and a loose garland of orange marigold flowers, resting on a pale cream cotton cloth. Studio still life, no hands reaching in. Shot on 50mm, natural soft diffused daylight, bright overcast sky through a window, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the tray centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, flag, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 6 — African English

- **AFRICAN** · 교과서 p.98 · 본문 11문장
- 저장 경로: `dist/WE/assets/illust-6.jpg`
- 장면: 보랏빛 자카란다 꽃나무 아래 교차로의 신호등 — 남아공에서는 robot

```
Photorealistic street photograph of a single traffic light on a pole at a quiet suburban intersection in Johannesburg, the light glowing green, framed by rows of jacaranda trees in full purple bloom with fallen petals on the clean empty road. Shot on 50mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the traffic light centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, numbers, street signs, signage, logo, watermark, caption, flag, face, portrait, people, pedestrians, cars, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 7 — A Language for Everyone (Closing)

- **CLOSING** · 교과서 p.99 · 본문 4문장
- 저장 경로: `dist/WE/assets/illust-7.jpg`
- 장면: 코르크 보드에 꽂힌 여러 색의 빈 말풍선 종이 — 모두의 언어

```
Photorealistic still life of many blank paper speech bubbles cut from colored card in soft pastel tones of blue, yellow, coral, and mint, pinned in a loose cheerful cluster on a pale cork board, every bubble left completely empty. Studio still life. Shot on 50mm, natural soft diffused daylight, bright overcast sky through a window, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the cluster centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, writing, handwriting, signage, logo, watermark, caption, flag, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

