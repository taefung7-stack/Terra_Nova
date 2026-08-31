# 목일중2 비상(황종배) Lesson 5·6 — 삽화 프롬프트 (전 8장)

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

## 필요한 장수 — 8장

| 과 | Ch | 파일 | 구성 |
|----|----|------|------|
| L5 | 1 | `dist/L5/assets/illust-1.png` | AI 단독 |
| L5 | 2 | `dist/L5/assets/illust-2.png` | AI 단독 |
| L5 | 3 | `dist/L5/assets/illust-3.png` | AI 단독 |
| L5 | 4 | `dist/L5/assets/illust-4.png` | AI 단독 |
| L6 | 1 | `dist/L6/assets/illust-1.png` | AI 단독 |
| L6 | 2 | `dist/L6/assets/illust-2.png` | **AI 배경 + 교과서 Q1 도해 합성** |
| L6 | 3 | `dist/L6/assets/illust-3.png` | **AI 배경 + 교과서 Q2 도해 합성** |
| L6 | 4 | `dist/L6/assets/illust-4.png` | **AI 배경 + 교과서 Q3 도해 합성** |

### 왜 L6 2·3·4 를 합성하는가 (2026-08-31 변경)

교과서 도해는 **정답 근거(A/B 선택지)** 를 담고 있어 **버릴 수 없다.**
그런데 도해 원본이 4:1~3:1 비율이라 16:5 배너에 그냥 얹으면
**좌우에 흰 여백이 크게 남는다**(실측: Q1 가로점유 70% · Q3 76%).
페이지에서 **잘린 클립아트 상자**처럼 보이고, AI 삽화 4장이 꽉 찬 L5 에 비해
L6 이 **눈에 띄게 빈약해 보인다.**

→ **AI 로 그 장면의 배경 사진을 만들고, 그 위에 교과서 도해를 얹는다.**
도해는 원본 그대로 유지되므로 **문제 풀이에 지장이 없고**, 배너는 꽉 찬다.

> ⚠️ 배경은 **도해를 방해하지 않아야 한다.** 프롬프트에 반드시
> `soft blurred background` · `shallow depth of field` · `empty center` 를 넣어
> **가운데를 비우고 초점을 흐린다.** 배경이 선명하면 도해의 A/B 라벨이 묻힌다.

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

Ch1 은 **AI 단독**, Ch2·3·4 는 **AI 배경 위에 교과서 도해를 얹는 합성**이다.
네 장이 **접힌 텐트 → 그늘진 잔디밭 → 호수 수면 → 모닥불 자리** 로
캠핑 하루의 시간 순서를 따라가도록 구성했다.

> Ch2·3·4 의 배경은 **가운데를 비우고 흐리게** 만든다. 도해가 그 위에 얹히기 때문이다.
> `soft blurred background` `shallow depth of field` `empty center` 를 반드시 유지할 것.

### L6 Ch1 — Science Is the Key (`illust-1.png`) · AI 단독

> 아빠와의 첫 캠핑 도입. 아직 텐트를 치기 **전** — 가방에서 막 꺼낸 상태.
> Q1 도해(텐트가 세워진 그림)와 겹치지 않게 **접힌 텐트**로 간다.

```
Photorealistic outdoor photograph, wide banner composition. A folded camping tent still half inside its carry bag lying on green grass at a riverside campsite, with tent poles and a rolled groundsheet beside it, tall leafy trees and open sky behind. Fresh, inviting, start-of-an-adventure feel. NO pitched tent, NO tent standing up, NO tree shadow diagram, NO compass directions, NO firewood stack, NO campfire, NO lake stones skipping, NO stars, NO night sky, NO faces. Shot on a 35mm lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO illustration, NO cartoon, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L6 Ch2 — The Sun, the Shadow, and the Tent (`illust-2.png`) · 배경

> 위에 **Q1 텐트 위치 도해**를 얹는다. 배경은 **나무 그늘이 드리운 잔디밭**.
> 도해가 놓일 **가운데를 비우고**, 그늘/햇빛의 대비만 은은하게 남긴다.

```
Photorealistic outdoor photograph, wide banner composition, soft blurred background. A wide empty green campsite lawn with the soft shadow of a large tree stretching across the grass on one side, open sky above, distant trees far out of focus. Empty center with nothing in the middle of the frame, plenty of clean open space. Shallow depth of field, gentle bokeh, very soft low-detail background. NO tent, NO people, NO compass letters, NO arrows, NO firewood, NO campfire, NO lake, NO stars, NO night. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, muted desaturated color. NO dramatic lighting, NO golden hour, NO sunset, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L6 Ch3 — Skipping Stones (`illust-3.png`) · 배경

> 위에 **Q2 물수제비 각도 도해**를 얹는다. 배경은 **잔잔한 호수 수면**.
> 물결만 은은하게 — 돌이나 사람이 있으면 도해와 충돌한다.

```
Photorealistic outdoor photograph, wide banner composition, soft blurred background. A calm wide lake surface with very gentle ripples catching soft light, a far shoreline of blurred green trees along the top edge, open pale sky. Empty center with nothing in the middle of the frame, plenty of clean open water. Shallow depth of field, gentle bokeh, very soft low-detail background. NO stones, NO splashing, NO people, NO arms throwing, NO angle lines, NO tent, NO firewood, NO campfire, NO stars, NO night. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, muted desaturated color. NO dramatic lighting, NO golden hour, NO sunset, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L6 Ch4 — Room for Air and a Sky Full of Stars (`illust-4.png`) · 배경

> 위에 **Q3 장작 쌓기 도해**를 얹는다. 배경은 **저녁 무렵 야영장의 빈 모닥불 자리**.
> 실제 장작더미가 배경에 있으면 도해와 겹치므로 **돌 화덕만** 남긴다.

```
Photorealistic outdoor photograph, wide banner composition, soft blurred background. An empty circular stone fire ring on bare ground at a quiet campsite in the early evening, surrounded by soft grass, blurred trees far behind, wide pale sky with the first faint stars barely visible high above. Empty center with nothing in the middle of the frame, plenty of clean open space. Shallow depth of field, gentle bokeh, very soft low-detail background. NO stacked firewood, NO logs, NO flames, NO burning fire, NO smoke, NO people, NO tent, NO lake. Natural soft diffused evening daylight, overcast sky, high-key exposure, low contrast, airy and open feel, muted desaturated color. NO dramatic lighting, NO golden hour, NO orange sunset, NO fire glow, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### 합성 방법 (Ch2·3·4)

생성한 배경을 `dist/L6/assets/_bg-{2,3,4}.png` 로 두고 아래를 실행한다.
교과서 도해는 `비상황 6과.pdf` 에서 추출한 원본(`q1-tent` / `q2-angle` / `q3-wood`)이다.

```bash
python - <<'EOF'
from PIL import Image
TW,TH=2000,625
jobs=[('_bg-2.png','q1-tent.jpg','illust-2.png'),
      ('_bg-3.png','q2-angle.jpg','illust-3.png'),
      ('_bg-4.png','q3-wood.jpg','illust-4.png')]
for bgf,dgf,out in jobs:
    bg=Image.open(bgf).convert('RGB').resize((TW,TH), Image.LANCZOS)
    dg=Image.open(dgf).convert('RGB')
    # 도해를 배너 높이의 96% 로 키우되 가로는 92% 를 넘지 않게(둘 중 작은 배율)
    r=min((TH*0.96)/dg.height, (TW*0.92)/dg.width)
    dg=dg.resize((int(dg.width*r), int(dg.height*r)), Image.LANCZOS)
    # 도해 뒤에 흰 카드 + 여백을 깔아 배경 위에서 또렷하게
    pad=16
    card=Image.new('RGB',(dg.width+pad*2, dg.height+pad*2),(255,255,255))
    card.paste(dg,(pad,pad))
    bg.paste(card, ((TW-card.width)//2, (TH-card.height)//2))
    bg.save(out, optimize=True)
    print(out, bg.size)
EOF
```

> 도해 뒤에 **흰 카드**를 깔아야 배경 위에서 A/B 라벨이 묻히지 않는다.
> 합성 후 반드시 **페이지를 렌더해 도해 글자가 읽히는지 눈으로 확인**할 것.
>
> 배율은 **높이 96% / 가로 92% 중 작은 쪽**을 쓴다(실측 결과 가로점유
> Q1 67% · Q2 92% · Q3 74%). 도해를 더 키우면 잘리고, 줄이면 흰 여백이 다시 커진다.
> 남는 좌우는 **배경 사진이 채우므로** 흰 여백처럼 보이지 않는다.

---

## 생성 후 반영 절차

1. 생성한 이미지를 **가로 2000px 로 축소**한다(인쇄 폭 180mm ≈ 280dpi).
   원본 3952px 을 그대로 넣으면 합본이 3~4배로 부푼다.

```bash
python -c "from PIL import Image; im=Image.open('IN.png'); \
im.resize((2000,int(2000*im.size[1]/im.size[0])), Image.LANCZOS).save('OUT.png', optimize=True)"
```

2. L5 4장 + L6 Ch1 은 그대로 `dist/{L}/assets/illust-{N}.png` 로 저장.
   L6 Ch2·3·4 는 배경을 `_bg-{2,3,4}.png` 로 두고 **위 합성 스크립트를 먼저 실행**한다.

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
