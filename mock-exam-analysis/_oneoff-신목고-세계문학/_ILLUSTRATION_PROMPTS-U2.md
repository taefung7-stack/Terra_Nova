# 신목고 2-2 중간 · 세계문학 Unit 2 — A French Student in Dublin — 챕터별 삽화 프롬프트

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
> **이 문서는 파생물입니다.** 프롬프트 원본은 `data/U2/{N}.json` 의
> `illustration.prompt` 이며, 수정 후 `node _oneoff-신목고-세계문학/collect-prompts.mjs U2`
> 로 이 문서를 다시 만듭니다.
>
> 생성한 이미지는 `dist/U2/assets/illust-{N}.png` 로 저장한 뒤 PDF 를 다시 렌더하면
> placeholder 자리에 자동으로 들어갑니다(빌드 방법은 README 참조).

---

## Chapter 1 — Delphine arrives at the O'Briens

- **PART 1** · 교과서 p.24~25 · 본문 0문장
- 저장 경로: `dist/U2/assets/illust-1.jpg`
- 장면: 비 갠 더블린 주택가 — 젖은 벽돌 계단과 현관, 붉은 문

```
Photorealistic photograph of the front steps of a Dublin terraced brick house after rain, seen straight on from the pavement. Wet red brick, a painted front door, a small stone doorstep holding shallow puddles that mirror the pale sky. Quiet residential street, empty and still. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 2 — Delphine's first day at school

- **PART 2** · 교과서 p.26 · 본문 0문장
- 저장 경로: `dist/U2/assets/illust-2.jpg`
- 장면: 학교 책상 위 교복 넥타이와 필기구 — 등교 첫날의 정돈된 책상

```
Photorealistic photograph of a school uniform tie lying folded on a wooden classroom desk, seen from directly above. Beside it a pencil, an eraser and a closed notebook, arranged neatly. Plain desk surface, calm and orderly, nothing else on the table. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 3 — After school

- **PART 3** · 교과서 p.27 · 본문 0문장
- 저장 경로: `dist/U2/assets/illust-3.jpg`
- 장면: 식탁 위 감자 그라탱 오븐 접시 — 저녁 식사 직전

```
Photorealistic photograph of a baked potato gratin in a white oven dish resting on a home dining table, seen from a low three-quarter angle. Golden browned cheese crust, a serving spoon beside the dish, a folded cloth napkin. Warm domestic kitchen table, simple and uncluttered. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

---

## Chapter 4 — St. Patrick's Day

- **PART 4** · 교과서 p.28~29 · 본문 0문장
- 저장 경로: `dist/U2/assets/illust-4.jpg`
- 장면: 초록 클로버 장식과 거리의 초록 깃발 — 성 패트릭 데이 거리

```
Photorealistic photograph of green shamrock decorations and small green flags strung along a city street railing, seen straight on. Fresh green paper clovers and fabric bunting fluttering, pale stone buildings blurred far behind. Festive empty street, no crowd. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, people, hands, distorted hands, extra fingers, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels
```

