# 봉영여중 2학년 영어B 추가지문 — 삽화 프롬프트 (4장)

> 생성일 2026-09-12. 규격 `--ar 16:5 --v 8.1`, **실사 포토리얼** 톤.


## 규칙 (기존 L5~L7 과 동일)

- **밝기는 형용사가 아니라 조명 조건으로 지정** — `sunlit`·`golden`·`luminous` 는
  실사에서 미드저니가 황금빛 저녁 + 강한 역광으로 해석해 오히려 어두워진다.
  `natural soft diffused daylight` · `bright overcast sky` · `high-key exposure` 를 쓴다.
- **부정은 `--no` 파라미터로만.** 문장 속 `NO chopsticks` 같은 인라인 부정은
  오히려 그 물건을 불러온다(미드저니 인라인 NO 함정).
- **얼굴 클로즈업 회피** — 교재 삽화이므로 특정인 초상을 만들지 않는다.
- 네 장이 서로 닮지 않도록 각 프롬프트에서 다른 챕터의 소재를 `--no` 로 배제했다.

## 사용법

```bash
# 생성한 이미지를 아래 경로에 저장한 뒤 재빌드하면 반영된다
#   dist/BY/assets/illust-{N}.png

# ⚠ 원본 8MB PNG 를 그대로 넣지 말 것 — 가로 2000px 로 축소(약 280dpi)
python -c "from PIL import Image; im=Image.open('illust-1.png'); im.resize((2000,int(2000*im.size[1]/im.size[0])), Image.LANCZOS).save('illust-1.png', optimize=True)"

cd mock-exam-analysis
node builder/build.mjs "_oneoff-중2-동아윤/data/BY" "_oneoff-중2-동아윤/dist/BY" --styles="_oneoff-중2-동아윤/styles/analysis.css"
node builder/pdf.mjs "_oneoff-중2-동아윤/dist/BY"
node "_oneoff-중2-동아윤/combine.mjs" BY
```

> ⚠️ **문서만 고치면 반영되지 않는다.** 빌드는 `data/BY/{N}.json` 의
> `illustration.prompt` 를 읽는다. 이 문서의 프롬프트를 고쳤다면
> 반드시 해당 JSON 도 함께 고칠 것.

---

## Ch1 · Gene-editing and Its Ethical Questions — 유전자 편집이 남긴 윤리적 질문

- **저장 경로**: `dist/BY/assets/illust-1.png`
- **지문 주제**: Editing Genes, Raising Questions: Science Ahead of Ethics

```
Photorealistic science documentary photograph, subject centered, wide banner composition. A modern molecular biology laboratory bench: a transparent glass DNA double-helix model standing on a clean white counter beside a microscope, rows of small clear sample vials in a metal rack, a stack of printed research papers and a closed notebook at the edge, pale gray-blue walls behind. Quiet, careful, thoughtful research atmosphere, wide establishing view. Shot on a wide-angle lens at eye level, natural soft diffused daylight through a large window, bright overcast sky outside, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, person, face, portrait, hands, fingers, text, letters, words, numbers, signage, logo, watermark, cartoon, illustration, 3d render, cgi, futuristic hologram, blue neon glow, purple glow, sci-fi interface, baby, infant, embryo, syringe, blood, biohazard, sunset, golden hour, dramatic lighting, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

## Ch2 · Basking in Reflected Glory — 남의 성공에 나를 잇는 심리

- **저장 경로**: `dist/BY/assets/illust-2.png`
- **지문 주제**: Basking in Reflected Glory: Borrowing Pride from Others' Wins

```
Photorealistic sports documentary photograph, wide banner composition, subject centered. A packed American college football stadium seen from high above and behind one end zone: tightly filled grandstands forming a solid block of crimson and white school colors, rows of team pennants and pom-poms held up across the stands, a green striped football field with yard lines below, empty concrete steps and railings in the foreground. Distant anonymous crowd only, seen from far away as small blurred shapes, no individual visible. Collective school spirit atmosphere on a game day. Shot on a long telephoto lens from the upper deck, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no face, portrait, close-up, hands, text, letters, words, numbers, scoreboard, signage, logo, watermark, flags with writing, jersey numbers, mascot costume, confetti, fireworks, stage lights, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

## Ch3 · Antibiotics and Superbugs — 죽이기 대신 공존하기

- **저장 경로**: `dist/BY/assets/illust-3.png`
- **지문 주제**: Superbugs and Why We Should Live With Bacteria, Not Kill Them

```
Photorealistic scientific documentary photograph, subject centered, wide banner composition. A clean modern microbiology laboratory bench: a neat row of open glass petri dishes holding pale cream and soft pink bacterial colonies on agar, small round white antibiotic test discs placed on the agar surface with clear circular zones around them, a silver research microscope and a rack of labeled glass test tubes behind, stainless steel bench top and a white tiled wall. Calm, precise, clinical research atmosphere. Shot on a macro lens at low eye level, natural soft diffused daylight, bright overcast sky through a window, high-key exposure, low contrast, true-to-life color, shallow depth of field, sharp focus. --no people, person, face, portrait, hands, text, letters, words, numbers, labels, signage, logo, watermark, cartoon, illustration, 3d render, gore, blood, horror, green slime, mold, dirt, rust, cluttered mess, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

## Ch4 · Paul Bunyan and American Tall Tales — 과장으로 빚은 미국의 이야기

- **저장 경로**: `dist/BY/assets/illust-4.png`
- **지문 주제**: Tall Tales: America's Stories Built on Exaggeration

```
Photorealistic documentary photograph, subject centered, wide banner composition. A clearing in a tall North American pine forest at an old logging camp: freshly cut timber and stacked logs on damp earth, a heavy steel axe left standing in a wide tree stump, coiled rope and a tin kettle beside a low ring of stones holding cold grey ashes, rough log benches arranged in a circle. Dense evergreen trunks rise into thin mist behind the clearing. Quiet rustic frontier atmosphere, wide establishing view. Shot on a wide-angle lens at eye level, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, face, hands, portrait, text, letters, words, numbers, signage, logo, watermark, fire, flames, smoke, sparks, cartoon, illustration, painting, giant statue, ox, animals, snow, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```
