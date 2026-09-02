# 중2 동아(윤정미) Lesson 5·6 — 삽화 프롬프트 (전 7장)

> 규격: **`--ar 16:5 --v 8.1 --style raw`** (와이드 배너)
> 톤: **실사 사진(포토리얼)** — 여행·다큐멘터리 톤, 흐린 날 확산광.
>
> ### 작성 규칙 (2026-09-02 전면 재작성)
>
> **1. 부정은 전부 `--no` 파라미터로.** 문장 속 인라인 `NO xxx` 는 부정으로
> 작동하지 않고 오히려 그 물건을 화면에 불러온다. 지시부에는 **그리고 싶은 것만** 쓴다.
> (구판은 인라인 NO 를 장당 16~22개씩 달고 있었다 — 전면 폐기)
>
> **2. 지시부는 800자 이하, 주어 하나·장면 하나.** 길수록 주제가 희석된다.
>
> **3. 사람은 아예 넣지 않는다.** 손·뒷모습도 손가락이 뭉개져 기괴해진다.
> 사물과 공간만으로 장면을 세우고 `--no people, face, hands` 로 막는다.
> **특히 Lesson 6 은 실존 인물(Frank W. Schofield)** 이라 인물 묘사를 절대 하지 않는다.
>
> **4. 밝기는 형용사가 아니라 조명 조건으로.** `bright`·`sunlit` 은 실사에서
> 황금빛 역광으로 해석돼 오히려 어두워진다. 대신
> `natural soft diffused daylight` · `overcast sky` · `high-key exposure` · `low contrast`.
> `golden hour` `dramatic lighting` 같은 다크 키워드는 **`--no` 뒤에만** 쓴다.
>
> **5. 글자 차단 필수** — `--no text, letters, words, signage, logo, watermark`.
> 미드저니가 만든 가짜 글자가 교재에 인쇄되면 치명적이다.
>
> **6. `subject centered` 명시** — 삽화 슬롯이 16:5 레터박스 + 중앙 크롭이라
> 상하가 잘려도 주제가 살아남아야 한다.
>
> **7. 저작권** — Banksy·STIK·Ben Wilson 은 실존 작가다. 실제 작품을 재현하지 말고
> **기법만 차용한 무명의 유사 장면**으로 만든다(`--no famous artwork, replica`).
>
> 생성한 이미지를 `dist/{L5,L6}/assets/illust-{N}.png` 로 저장한 뒤 재빌드하면 자동 반영.
>
> ```bash
> cd mock-exam-analysis
> L=L5   # 또는 L6
> node builder/build.mjs "_oneoff-중2-동아윤/data/$L" "_oneoff-중2-동아윤/dist/$L" \
>   --styles="_oneoff-중2-동아윤/styles/analysis.css"
> node builder/pdf.mjs "_oneoff-중2-동아윤/dist/$L"
> node "_oneoff-중2-동아윤/combine.mjs" $L
> node builder/goodnotes-safe.mjs --check "_oneoff-중2-동아윤/dist/$L"/*.pdf
> ```

---

## Lesson 5 — Street Art in London

교과서 소재: 런던 거리 예술 투어 → STIK(선과 점 인물) → Banksy(초록 나무) → Ben Wilson(껌 그림).
세 장이 **거리 전경 / 공원 벽면 / 보도 바닥 접사**로 확실히 갈린다.

### Ch1 · Street Art in London & STIK — 벽화로 뒤덮인 이스트런던 거리

- 저장 경로: `dist/L5/assets/illust-1.png`
- 본문 근거: *"Modern street art … makes cities colorful and lively"* /
  *"Shoreditch … one of the hippest areas"* / *"only lines and dots in his paintings of human bodies"*
- 장면 의도: 투어의 출발점. **거리 전체가 컬러풀**하다는 인상 + STIK 풍의 단순 선·점 인물 벽화.

```
Photorealistic urban documentary photograph, subject centered, wide banner composition. A lively East-London street-art district: a narrow street lined with old red brick warehouse walls entirely covered in large colorful abstract murals. On the largest wall, a mural of three simple standing human figures drawn with thick black outlines and small round dot eyes. Bicycles leaning against a lamppost, worn pavement, colorful and energetic city-guide atmosphere. Shot on a wide-angle lens, natural soft diffused daylight, overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, face, hands, text, letters, words, signage, logo, watermark, famous artwork, replica, green spray-painted tree, leafless tree, spray can, chewing gum, macro close-up, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

### Ch2 · Banksy in Finsbury Park — 잎 없는 나무 뒤 벽에 뿌린 초록 잎

- 저장 경로: `dist/L5/assets/illust-2.png`
- 본문 근거: *"he created a green tree by spraying green paint on a wall behind a leafless tree"* /
  *"Next to the tree, there is a person who is holding a sprayer"*
- 장면 의도: **본문의 핵심 트릭**을 그대로. 앙상한 실제 나무 + 그 뒤 벽의 초록 잎 페인트가
  겹쳐 보여 "없는 잎"이 채워진 것처럼 읽혀야 한다. 인물 대신 **분무기만** 바닥에 둔다.

```
Photorealistic documentary photograph, subject centered, wide banner composition. A quiet city park corner: a bare leafless tree with thin dark branches stands directly in front of a plain flat brick wall, and a large soft green leafy shape is spray-painted on the wall behind the branches so the painted green fills in where the missing foliage would be. A single metal spray can rests on the pavement beside the trunk. Plain ordinary wall, simple environmental-message street-art feel. Shot on a wide-angle lens, natural soft diffused daylight, overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, face, hands, text, letters, words, signage, logo, watermark, famous artwork, replica, stick figure mural, dot eyes, cartoon characters, chewing gum, macro close-up, colorful murals, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

### Ch3 · Ben Wilson's Gum Paintings — 보도 위 껌에 그린 작은 그림들 (접사)

- 저장 경로: `dist/L5/assets/illust-3.png`
- 본문 근거: *"look down and look closely"* / *"painting pictures on gum that people drop on the street"* /
  *"Wilson's gum paintings are tiny, but they give great pleasure"*
- 장면 의도: 앞 두 장이 넓은 풍경이므로 여기만 **매크로 접사**로 확실히 대비.
  "내려다보고 자세히 봐야 보인다"는 본문의 지시를 카메라 앵글로 표현.

```
Photorealistic macro street photograph, subject centered, wide banner composition, low camera angle just above a grey concrete pavement. Several small flat discs of chewing gum pressed into the paving slabs have each been painted with a tiny colorful miniature picture — simple bright shapes and patterns about the size of a coin, glossy with varnish. Shallow depth of field on the painted dots, fine gritty texture of the pavement, charming and delicate look-closely feeling. Shot on a macro lens, natural soft diffused daylight, overcast sky, high-key exposure, low contrast, true-to-life color, sharp foreground focus. --no people, face, hands, shoes, text, letters, words, signage, logo, watermark, famous artwork, replica, wall mural, stick figure, dot eyes, green spray-painted tree, leafless tree, spray can, wide street view, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

---

## Lesson 6 — Dr. Schofield, a Foreigner Who Loved Korea

교과서 소재: 1919년 3·1 운동 촬영 → 석호필의 삶(의학 교육) → 기사 송고 → 귀환과 영면.
**실존 인물이므로 인물을 그리지 않고** 사물·장소 중심 정물/풍경으로 구성했다.
네 장이 **창밖 군중 / 의학 강의실 / 타자기 책상 / 현충원 풍경**으로 갈린다.

### Ch1 · A Special Favor — 창밖으로 내려다본 1919년 거리의 군중

- 저장 경로: `dist/L6/assets/illust-1.png`
- 본문 근거: *"Dr. Schofield was hiding in a building and saw a large group of people gathering outside"* /
  *"He began to take pictures"*
- 장면 의도: **"숨어서 창밖을 내려다본다"** 는 시점 자체가 이 장의 핵심.
  창턱의 접이식 사진기가 "촬영"을 말해준다. 군중은 멀리 작게 — 얼굴이 보이면 안 된다.

```
Photorealistic historical documentary photograph, subject centered, wide banner composition. The view from inside an upper-floor room of an early-20th-century building, looking out through a plain wooden-framed window onto a Korean street in 1919. A vintage folding bellows camera rests on the wide wooden windowsill in the foreground. Far below beyond the glass, a very large crowd fills a broad street, seen from high above as small distant figures in white traditional Korean clothing. Quiet observational archival atmosphere, strong sense of watching unseen from a window. Shot on a wide-angle lens, natural soft diffused daylight, overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no face, portrait, close-up people, identifiable person, hands, text, letters, words, signage, flags, logo, watermark, lecture room, blackboard, typewriter, desk, cemetery, gravestone, monument, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

### Ch2 · Seok Hopil, the Man Who Loved Korea — 20세기 초 의학 강의실

- 저장 경로: `dist/L6/assets/illust-2.png`
- 본문 근거: *"a Canadian doctor, and he first came to Korea in 1916 to teach medicine"* /
  *"He wanted to teach in Korean, so he began to learn Korean right away"*
- 장면 의도: "의학을 **가르치러** 왔다"가 요지. 강의실 + 해부 모형으로 의학 교육을 표현하고,
  펼쳐진 공책은 "한국어를 배웠다"를 암시. 칠판은 반드시 **백지**(가짜 글자 방지).

```
Photorealistic interior photograph, subject centered, wide banner composition. An early-twentieth-century medical lecture room: rows of empty wooden desks and benches receding toward a large dark green blackboard that is completely blank and clean, tall windows along one wall letting in plain even daylight. On a side table, an antique varnished wooden anatomical model stands beside a row of clear glass laboratory bottles. An open blank notebook lies on the front desk with a fountain pen across it. Worn wooden floorboards, quiet scholarly period atmosphere. Shot on a wide-angle lens, natural soft diffused daylight, overcast sky outside, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, face, hands, text, letters, words, writing, chalk writing, signage, logo, watermark, street crowd, window view of crowd, camera, typewriter, cemetery, gravestone, monument, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

### Ch3 · Telling the World About March 1st — 1919년 특파원의 책상

- 저장 경로: `dist/L6/assets/illust-3.png`
- 본문 근거: *"He then wrote an article about the historic event and sent it to foreign newspapers with his pictures"*
- 장면 의도: **글(타자기·기사)과 사진(인화된 흑백 사진)을 함께 봉투에 넣어 보낸다**는
  본문의 행위를 정물로 압축. 사진과 종이는 전부 백지여야 한다(가짜 글자 방지).

```
Photorealistic documentary still-life photograph, subject centered, wide banner composition. A 1919 foreign correspondent's worn wooden desk beside a window: an antique black typewriter with a blank sheet of paper in the carriage, several developed black-and-white photographs with plain blank surfaces scattered across the desktop, a fountain pen resting on a blank writing pad, and a sealed paper envelope ready for mailing at the edge of the desk. Soft pale sky visible through the plain window pane behind. Quiet archival reporting mood, fine material detail of wood and metal. Shot on a normal lens at desk height, natural soft diffused daylight, overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, face, hands, text, letters, words, printed text, headlines, signage, logo, watermark, street crowd, window view of crowd, lecture room, blackboard, anatomical model, cemetery, gravestone, monument, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

### Ch4 · He Never Left Again — 국립현충원의 낮은 묘비 행렬과 소나무

- 저장 경로: `dist/L6/assets/illust-4.png`
- 본문 근거: *"he returned to Korea … and never left again"* /
  *"Dr. Schofield died in April 1970, and he was buried in Seoul National Cemetery"*
- 장면 의도: 마무리 장면. **차분하고 존중하는 톤이되 음울하지 않게** — 중학생 교재이므로
  넓은 잔디와 소나무로 평온하게. 흰 국화 한 다발이 추모를 조용히 전한다.

```
Photorealistic landscape photograph, subject centered, wide banner composition. A peaceful, well-kept Korean national cemetery on a calm day: neat orderly rows of low simple memorial stones with plain blank faces set across a wide green lawn, tall straight pine trees along the far edge, a broad clean walking path curving gently through the grounds. In the foreground, a single small bunch of white chrysanthemums lies on the grass beside the nearest row. Serene, dignified, generous open space, gentle and calm rather than sorrowful. Shot on a wide-angle lens at eye level, natural soft diffused daylight, overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, face, hands, text, letters, words, inscriptions, numbers, signage, flags, crosses, logo, watermark, street crowd, window view, lecture room, blackboard, typewriter, desk, camera, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading, gloomy, somber --ar 16:5 --v 8.1 --style raw
```

---

## 검증

```bash
cd mock-exam-analysis/_oneoff-중2-동아윤
node _sync-prompts.mjs          # data/*.json 의 illustration.prompt 동기화
```

체크리스트:
- [ ] 지시부(`--no` 앞) 800자 이하 · 인라인 `NO ` 0개
- [ ] 전 7장 `--ar 16:5 --v 8.1 --style raw`
- [ ] 지시부에 다크 키워드(`golden hour`·`dramatic`·`sunset`) 0건 — `--no` 뒤에만 존재
- [ ] 전 7장 `--no` 에 `text, letters, words` + `people, face` 포함
