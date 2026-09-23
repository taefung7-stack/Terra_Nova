# 신남중2 추가지문 Worksheet 5-9 · 6-9 (More Reading) — 삽화 프롬프트

> 규격 **`--ar 16:5 --v 8.1 --style raw`** · 실사(포토리얼) · 흐린 날 확산광(high-key)
> 부정은 전부 `--no` 파라미터로(문장 속 `NO xxx` 는 오히려 그 물건을 불러옴) · 글자 차단 필수
> 사람 없음 — 벽화 속 아이는 **평면 검정 스텐실 실루엣**이라 손가락 뭉개짐 위험이 낮다.
>
> 저장: `dist/MR5/assets/illust-1.png` (가로 2000px로 축소 후) → 분석지 재빌드
> ```bash
> cd mock-exam-analysis && D=_oneoff-신남중2-추가지문
> node builder/build.mjs "$D/data/MR5" "$D/dist/MR5" --styles="$D/styles/analysis.css"
> node builder/pdf.mjs "$D/dist/MR5" && node $D/combine.mjs MR5 && node $D/build-memorize.mjs MR5
> ```

## A안 (채택 — JSON에 반영됨) · 다리 아래 벽의 스텐실 벽화

본문 7·9문장: 워털루 다리 아래 벽에 등장 / 아이가 빨간 풍선을 향해 손을 뻗는다.

```
Photorealistic documentary photograph, wide banner, subject centered. A weathered gray concrete wall under a riverside bridge in London. In the center of the wall, a small black stencil street-art silhouette of a little girl reaching up toward a single floating red heart-shaped balloon, the only red in the frame. Quiet empty riverside walkway in front, soft-focus bridge arches beyond. Thoughtful, poetic, gently emotional mood, lots of empty wall space. Wide-angle lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy, true-to-life color, sharp focus --no people, face, portrait, crowd, distorted hands, extra fingers, text, letters, words, signature, graffiti tags, logo, signage, golden hour, sunset, night, neon, dramatic lighting, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

## B안 (대안) · 아이 없이 풍선만 — 상징 강조

벽화 재현이 부담스럽거나 A안 실루엣이 어색하게 나올 때. 본문 11·12문장(풍선 = 어린 시절, 그것을 잃는 것의 상징).

```
Photorealistic fine-art photograph, wide banner, subject centered. A single glossy red heart-shaped balloon drifting upward beside a plain weathered gray concrete wall under a riverside bridge, its thin string trailing loose, slightly out of reach. Minimal composition, the red balloon the only color accent, vast calm empty space. Poetic, quietly wistful mood about childhood and hope slipping away. Wide-angle lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy, true-to-life color, sharp focus --no people, child, face, hands, crowd, text, letters, words, graffiti, logo, signage, multiple balloons, golden hour, sunset, night, neon, dramatic lighting, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

---

## MR6 — Worksheet 6-9 (호머 헐버트) · 한옥 창가의 옛 책상 정물

저장: `dist/MR6/assets/illust-1.png`. 인물 초상 대신 **사물로 이야기**한다 — 닫힌 옛 책(한글 연구),
잉크병·펜(국제 신문 기고), 편지 봉투, 동아시아를 향한 지구본(국경을 넘는 우정), 한옥 창호.
책·신문의 가짜 글자가 찍히지 않도록 `text, handwriting, calligraphy, newspaper print` 를 막고,
형태가 뭉개지기 쉬운 국기도 `flag` 로 뺐다.

```
Photorealistic still-life photograph, wide banner, subject centered. An antique wooden writing desk beside a traditional Korean hanok lattice window with soft white paper panes. On the desk, a small stack of closed old leather-bound books, a brass inkwell with a vintage fountain pen, a folded plain envelope, and a small vintage world globe turned toward East Asia. Calm historic early-1900s atmosphere, quiet respect and friendship across countries, plenty of empty space. Natural soft diffused daylight through the paper window, bright overcast, high-key exposure, low contrast, airy, true-to-life color, sharp focus --no people, face, portrait, hands, text, letters, words, handwriting, calligraphy, newspaper print, logo, signage, flag, golden hour, sunset, night, neon, dramatic lighting, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```
