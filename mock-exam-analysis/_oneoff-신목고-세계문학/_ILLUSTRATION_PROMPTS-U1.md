# 신목고 2-2 중간 · 세계문학 Unit 1 — 챕터별 삽화 프롬프트

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
> **이 문서는 파생물입니다.** 프롬프트 원본은 `data/U1/{N}.json` 의
> `illustration.prompt` 이며, 수정 후 `node _oneoff-신목고-세계문학/collect-prompts.mjs`
> 로 이 문서를 다시 만듭니다.
>
> 생성한 이미지는 `dist/U1/assets/illust-{N}.png` 로 저장한 뒤 PDF 를 다시 렌더하면
> placeholder 자리에 자동으로 들어갑니다(빌드 방법은 README 참조).

---

## Chapter 1 — Korean Honorifics: When Being Polite Gets Tricky

- 작성자: **Talia** · 교과서 p.34~35 · 본문 19문장
- 저장 경로: `dist/U1/assets/illust-1.png`
- 장면: 위에서 내려다본 강의실 책상 위 펼친 노트와 연필 — 조용한 학습 분위기

```
Photorealistic photograph of a single open notebook on a wooden university desk, seen from directly above. A pencil rests on the page. Soft empty desk surface fills the rest of the frame. Calm, quiet, studious mood. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, distorted hands, extra fingers
```

---

## Chapter 2 — Subway in Seoul: It Is the Best

- 작성자: **Brian** · 교과서 p.36 · 본문 15문장
- 저장 경로: `dist/U1/assets/illust-2.png`
- 장면: 텅 빈 지하철 객실을 통로 정면에서 — 왼쪽 분홍 배려석, 오른쪽 회색 일반석

```
Photorealistic photograph of the interior of a clean modern subway train car, empty, seen straight down the aisle. A row of pale pink priority seats on the left, grey seats on the right, stainless steel poles and handrails. Bright, spotless, orderly public transport interior. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, distorted hands, extra fingers
```

---

## Chapter 3 — The "Ppalli-Ppalli" Culture: Korea's Unstoppable Taste for Haste

- 작성자: **Aussie** · 교과서 p.37 · 본문 12문장
- 저장 경로: `dist/U1/assets/illust-3.png`
- 장면: 위에서 내려다본 한식 한 상 — 가운데 찌개, 둘러싼 반찬 종지들

```
Photorealistic overhead photograph of a Korean restaurant meal on a table: one hot stew bowl in the center surrounded by many small white and steel bowls of colorful side dishes. Fresh, abundant, appetizing home-style spread. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, distorted hands, extra fingers
```

---

## Chapter 4 — Cultural Taboos to Avoid in Korea: Make the Smart Move

- 작성자: **turkish_delight** · 교과서 p.38 · 본문 10문장
- 저장 경로: `dist/U1/assets/illust-4.png`
- 장면: 한국 가정 현관에 가지런히 놓인 신발 — 안쪽으로 이어지는 나무 마루

```
Photorealistic photograph of a neat row of shoes placed side by side on the floor at the entrance of a Korean home, warm wooden floor beyond, plain wall. Tidy, quiet, respectful domestic entryway. Shot on 35mm, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus, wide horizontal banner crop with the subject centered --ar 16:5 --v 8.1 --style raw --no text, letters, words, signage, logo, watermark, caption, face, portrait, dramatic lighting, golden hour, sunset, neon, night, heavy shadows, dark moody grading, collage, split screen, multiple panels, distorted hands, extra fingers
```

