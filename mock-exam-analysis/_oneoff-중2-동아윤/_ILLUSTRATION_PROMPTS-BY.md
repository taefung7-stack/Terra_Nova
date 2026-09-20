# 봉영여중 2학년 영어B 추가지문 — 삽화 프롬프트 (6장)

> 생성일 2026-09-12(Ch1~4) · 2026-09-19(Ch5~6 추가).
> 규격 `--ar 16:5 --v 8.1`, **실사 포토리얼** 톤.


## 규칙 (기존 L5~L7 과 동일)

- **밝기는 형용사가 아니라 조명 조건으로 지정** — `sunlit`·`golden`·`luminous` 는
  실사에서 미드저니가 황금빛 저녁 + 강한 역광으로 해석해 오히려 어두워진다.
  `natural soft diffused daylight` · `bright overcast sky` · `high-key exposure` 를 쓴다.
- **부정은 `--no` 파라미터로만.** 문장 속 `NO chopsticks` 같은 인라인 부정은
  오히려 그 물건을 불러온다(미드저니 인라인 NO 함정).
- **얼굴 클로즈업 회피** — 교재 삽화이므로 특정인 초상을 만들지 않는다.
- 여섯 장이 서로 닮지 않도록 각 프롬프트에서 다른 챕터의 소재를 `--no` 로 배제했다.

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

## Ch5 · Euphemisms: Softening What We Say — 모난 말을 부드럽게 바꾸는 표현들

- **저장 경로**: `dist/BY/assets/illust-5.png`
- **지문 주제**: Euphemisms: Polite Words That Soften What We Say
- **소재 선정 이유**: 본문 예시 중 `toilet → restroom` 만이 **사진으로 안전하게**
  담을 수 있다. 나머지 예시는 장례식(유족)·해고 통보·"학습이 더딘 학생" 이라
  실사로 그리면 특정인을 특정 처지에 놓는 그림이 된다. 그래서 **공공 안내 표지**
  라는 완곡어법의 일상적 얼굴만 정물로 잡았다.

```
Photorealistic architectural documentary photograph, wide banner composition, subject centered. A clean modern public building corridor with pale grey walls and a polished light concrete floor: a simple brushed-metal wall plate beside a doorway showing only a small universal restroom pictogram and a directional arrow, a second plain arrow plate further down the empty hallway, a low wooden bench and a potted green plant against the wall, tall frosted glass panels along one side letting soft light wash across the floor. Calm, orderly, quiet public-space atmosphere, nobody present. Shot on a wide-angle lens at eye level, natural soft diffused daylight, bright overcast sky outside, high-key exposure, low contrast, true-to-life color, sharp focus. --no people, person, face, hands, portrait, crowd, paragraphs of text, letters, words, sentences, numbers, readable writing, logo, watermark, funeral, coffin, flowers wreath, candles, crying, office desk, laboratory, DNA, microscope, pills, medicine, bacteria, stadium, sports fans, jersey, forest, axe, logs, lumberjack, cartoon, illustration, painting, golden hour, sunset, sunlit beams, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```

## Ch6 · A Good Prompt Is Like a Recipe — 좋은 질문이 좋은 답을 만든다

- **저장 경로**: `dist/BY/assets/illust-6.png`
- **지문 주제**: A Good Prompt Is Like a Recipe: Clear, Detailed Steps Get the Best Answers
- **소재 선정 이유**: 본문의 핵심 비유가 **프롬프트 = 요리법**이고, 본문이 든
  구체적 예시가 하필 `cookies with chocolate chips and marshmallows` 다.
  그래서 **레시피 카드 + 계량된 재료**를 플랫레이로 잡아 '분명하고 상세한 단계'를
  눈으로 보여 준다. AI 쪽은 로봇을 그리면 유치해지고 손가락·화면 글자가 뭉개지므로
  **덮은 노트북**으로만 암시한다.

```
Photorealistic documentary flat-lay photograph, top-down overhead view, wide banner composition. A bright white marble kitchen counter: an open handwritten recipe card lying flat with blurred illegible handwriting, beside it small white ceramic bowls of neatly measured ingredients in a tidy row — flour, brown sugar, dark chocolate chips, small round white marshmallows — plus a wooden spoon, a metal measuring cup and a folded grey linen cloth. A slim silver laptop rests closed on the right, lid down. Clean minimal composition, generous empty counter space, tidy step-by-step arrangement. Shot directly from above, natural soft diffused daylight from a large window, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus. --no readable text, legible handwriting, letters, words, numbers, labels, packaging, brand, logo, watermark, signage, screen, display, monitor, user interface, glowing screen, robot, robot toy, android, face, people, hands, portrait, laboratory, test tube, DNA, microscope, pills, capsules, medicine, bacteria, petri dish, stadium, crowd, sports, pennant, axe, logs, timber, forest, restroom sign, toilet, cartoon, illustration, painting, golden hour, sunset, candlelight, dramatic lighting, neon, night, heavy shadows, dark moody grading --ar 16:5 --v 8.1 --style raw
```
