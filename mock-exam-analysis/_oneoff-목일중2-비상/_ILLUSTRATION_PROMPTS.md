# 목일중2 비상(황종배) Lesson 5·6 — 삽화 프롬프트 (신규 5장)

> 규격: **`--ar 16:5 --v 8.1`** (와이드 배너)
>
> **밝기는 형용사가 아니라 조명 조건으로 지정한다.** `bright`·`sunlit`·`luminous`
> 같은 형용사는 미드저니가 **황금빛 저녁 + 강한 역광**으로 해석해 오히려 어두워진다.
> 대신 `natural soft diffused daylight` · `bright overcast sky` · `high-key exposure`
> · `low contrast` · `airy` · `clean bright background` 를 쓴다.
>
> `golden hour` `dramatic lighting` `moody` `neon` `night` 은 **지시부에서 금지**.
> 단 `NO ~` 배제절 안에서는 오히려 명시해 밀어낸다.
>
> 인물은 **얼굴 클로즈업을 피하고** 손·뒷모습·소품 위주로 — 교재 삽화이므로
> 특정인 초상을 만들지 않는다.

## ⚠️ L5 와 L6 는 톤을 분리한다

| 과 | 성격 | 톤 |
|----|------|-----|
| **L5** The Pea Blossom | 안데르센 **동화** | **부드러운 스토리북 일러스트** (수채 + 소프트 파스텔) |
| **L6** Science Is the Key | 캠핑 **체험 수기** | **실사 포토리얼** (자연 다큐 톤) |

L5 를 실사로 뽑으면 "완두콩 접사 사진"이 되어 **동화의 정서가 사라진다**.
반대로 L6 를 일러스트로 뽑으면 교과서 원본 도해(Q1·Q2·Q3)와 **톤이 충돌한다**.
그래서 **두 과의 프롬프트 계열을 다르게** 간다.

## 필요한 장수 — 5장

| 과 | Ch | 파일 | 상태 |
|----|----|------|------|
| L5 | 1 | `dist/L5/assets/illust-1.png` | ⬜ 생성 필요 |
| L5 | 2 | `dist/L5/assets/illust-2.png` | ⬜ 생성 필요 |
| L5 | 3 | `dist/L5/assets/illust-3.png` | ⬜ 생성 필요 |
| L5 | 4 | `dist/L5/assets/illust-4.png` | ⬜ 생성 필요 |
| L6 | 1 | `dist/L6/assets/illust-1.png` | ⬜ 생성 필요 |
| L6 | 2·3·4 | `illust-{2,3,4}.png` | ✅ **교과서 원본 도해 사용** (생성 불필요) |

L6 2·3·4 는 **정답 근거(A/B 선택지)를 담은 교과서 도해**라 AI 삽화로 대체하면
문제를 풀 수 없다. 이미 원본을 넣었으므로 **새로 만들지 말 것.**

---

## Lesson 5 — The Pea Blossom (동화 · 스토리북 일러스트)

네 장이 **꼬투리 속 → 창가의 흙 → 자란 줄기 → 핀 꽃** 으로
**한 식물의 성장 단계**를 순서대로 보여 주도록 구성했다.
서로 닮지 않게 각 프롬프트에 앞뒤 단계를 `NO ~` 로 배제했다.

### L5 Ch1 — Five Little Peas in a Pod (`illust-1.png`)

> 완두콩 다섯 알이 한 꼬투리 안에서 각자의 꿈을 이야기하는 도입.
> **다섯 알이 또렷이 세어지는 것**이 핵심. 맨 끝 하나만 눈에 띄게 작게.

```
Soft watercolor storybook illustration, wide banner composition. Five round green peas resting in a row inside an open pea pod, the pod split lengthwise to reveal them, one pea at the far end noticeably smaller than the other four. Delicate ink outlines with gentle watercolor washes, visible paper grain, generous white space around the pod. Warm gentle fairy-tale mood, children's picture book art. NO window sill, NO soil, NO tall stem, NO pink blossom, NO house, NO people, NO faces on the peas. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L5 Ch2 — A Tiny Space by the Window (`illust-2.png`)

> 바람에 날려 창가 틈에 내려앉아 흙 속으로 가라앉는 장면.
> **아직 싹이 거의 안 보이는 단계** — 3과의 큰 줄기와 확실히 구분한다.

```
Soft watercolor storybook illustration, wide banner composition. A weathered wooden window sill of a small modest house seen from outside, with a narrow crack where dark soil has gathered, and one tiny pea half-buried in the soil with the faintest green shoot just breaking through. A few loose petals of wind drifting past. Delicate ink outlines with gentle watercolor washes, visible paper grain. Quiet, tender, hopeful fairy-tale mood, children's picture book art. NO open pea pod, NO row of five peas, NO tall climbing stem, NO pink blossom, NO people, NO faces. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L5 Ch3 — Growing Taller, Growing Stronger (`illust-3.png`)

> 몇 주 만에 작은 나무만큼 자란 완두. 소녀가 날마다 보러 오는 창가.
> **키가 크게 자란 줄기**가 주인공 — 아직 **꽃은 피지 않은 상태**여야 4과와 갈린다.

```
Soft watercolor storybook illustration, wide banner composition. A tall healthy pea plant with a climbing stem and curling tendrils growing from a small pot of dark soil beside a bright window, seen from inside a simple modest room, the stem reaching well above the window latch with many green leaves. An empty wooden chair beside the window. Delicate ink outlines with gentle watercolor washes, visible paper grain. Calm, warm, quietly triumphant fairy-tale mood, children's picture book art. NO pea pod, NO loose peas, NO pink blossom, NO open flower, NO people, NO faces. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L5 Ch4 — The Blossom and the Thing It Could Do (`illust-4.png`)

> 분홍 꽃이 피고 가장 작은 완두가 마침내 할 일을 찾는 결말.
> **활짝 핀 분홍 꽃 한 송이**가 화면의 주인공. 가장 밝고 화사하게.

```
Soft watercolor storybook illustration, wide banner composition. A single delicate pink pea blossom fully opened on a slender green stem beside a bright window, surrounded by soft green leaves and curling tendrils, petals catching the light. A few more buds waiting to open. Delicate ink outlines with gentle watercolor washes, visible paper grain, generous white space. Joyful, tender, celebratory fairy-tale mood, children's picture book art. NO pea pod, NO loose peas, NO bare soil, NO empty window sill, NO people, NO faces. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette with warm pink accents, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

---

## Lesson 6 — Science Is the Key (체험 수기 · 실사 포토리얼)

Ch2·3·4 는 **교과서 원본 도해**를 쓰므로 **Ch1 한 장만** 새로 만든다.
원본 도해가 전부 **일러스트 톤**이라, Ch1 은 대비되게 **실사**로 간다.

### L6 Ch1 — Science Is the Key (`illust-1.png`)

> 아빠와의 첫 캠핑 도입. 아직 텐트를 치기 **전** — 가방에서 막 꺼낸 상태.
> Q1 도해(텐트가 세워진 그림)와 겹치지 않게 **접힌 텐트**로 간다.

```
Photorealistic outdoor photograph, wide banner composition. A folded camping tent still half inside its carry bag lying on green grass at a riverside campsite, with tent poles and a rolled groundsheet beside it, tall leafy trees and open sky behind. Fresh, inviting, start-of-an-adventure feel. NO pitched tent, NO tent standing up, NO tree shadow diagram, NO compass directions, NO firewood stack, NO campfire, NO lake stones skipping, NO stars, NO night sky, NO faces. Shot on a 35mm lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO illustration, NO cartoon, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

---

## 생성 후 반영 절차

1. 생성한 이미지를 **가로 2000px 로 축소**한다(인쇄 폭 180mm ≈ 280dpi).
   원본 3952px 을 그대로 넣으면 합본이 3~4배로 부푼다.

```bash
python -c "from PIL import Image; im=Image.open('IN.png'); \
im.resize((2000,int(2000*im.size[1]/im.size[0])), Image.LANCZOS).save('OUT.png', optimize=True)"
```

2. `dist/L5/assets/illust-{1,2,3,4}.png` · `dist/L6/assets/illust-1.png` 로 저장

3. 재빌드

```bash
cd mock-exam-analysis
L=L5   # 또는 L6
node builder/build.mjs "_oneoff-목일중2-비상/data/$L" "_oneoff-목일중2-비상/dist/$L" \
  --styles="_oneoff-목일중2-비상/styles/analysis.css"
node builder/check-overflow.mjs "_oneoff-목일중2-비상/dist/$L/1.html"   # overflow 0 필수
node builder/pdf.mjs "_oneoff-목일중2-비상/dist/$L"
node "_oneoff-목일중2-비상/combine.mjs" $L
```

4. **삽화가 실제로 박혔는지 눈으로 확인** — placeholder 인 채로도 빌드는 성공한다.

```bash
python -c "
import pypdf; r=pypdf.PdfReader('dist/L5/목일중2_비상_Lesson5_본문분석_합본.pdf')
for i,p in enumerate(r.pages,1):
    xo=p.get('/Resources',{}).get('/XObject')
    n=sum(1 for v in xo.get_object().values() if v.get_object().get('/Subtype')=='/Image') if xo else 0
    if n or 'Illustration' in (p.extract_text() or ''): print(i,n,'Illustration' in (p.extract_text() or ''))
"
```

> `illustration.prompt` 는 각 `data/{L}/{N}.json` 에도 들어 있다.
> 이 문서를 고쳤다면 **JSON 쪽도 같이 고쳐야** 실제 빌드에 반영된다.
