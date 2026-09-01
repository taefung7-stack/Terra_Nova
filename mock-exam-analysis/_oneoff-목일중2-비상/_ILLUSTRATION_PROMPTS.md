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
> **예외 — L6 Ch4 는 밤 장면이다.** 본문이 `At night, we watched hundreds of stars`
> 라서 밤하늘이 없으면 본문과 어긋난다. 대신 어두워지지 않도록
> `even ambient light` · `low contrast` · `muted` 로 누르고,
> `dramatic lighting` · `fire glow` · `heavy vignette` 를 `NO` 로 배제했다.
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

> ⚠️ **L5 는 정물이 아니라 '장면'으로 간다(2026-08-31 개정).** 초판은 네 장이
> 전부 꼬투리·창틀·줄기·꽃 **사물 접사**였는데, 본문은 **완두와 소녀 두 인물의
> 이야기**다. 소녀가 빠지면 "아픈 아이가 완두를 보며 회복한다"는 **줄거리가
> 그림에 전혀 안 담긴다.** 그래서 Ch2~4 에는 **소녀를 반드시 넣고**,
> 자세로 회복을 보여 준다(누움 → 앉음 → 일어섬).

## 필요한 장수 — 8장

| 과 | Ch | 파일 | 구성 |
|----|----|------|------|
| L5 | 1 | `dist/L5/assets/illust-1.png` | AI 단독 |
| L5 | 2 | `dist/L5/assets/illust-2.png` | AI 단독 |
| L5 | 3 | `dist/L5/assets/illust-3.png` | AI 단독 |
| L5 | 4 | `dist/L5/assets/illust-4.png` | AI 단독 |
| L6 | 1 | `dist/L6/assets/illust-1.png` | AI 단독 ✅ **반영 완료** |
| L6 | 2 | `dist/L6/assets/illust-2.png` | **AI 배경 + 교과서 Q1 도해 합성** ✅ **반영 완료** |
| L6 | 3 | `dist/L6/assets/illust-3.png` | **AI 배경 + 교과서 Q2 도해 합성** ✅ **반영 완료** |
| L6 | 4 | `dist/L6/assets/illust-4.png` | **AI 배경 + 교과서 Q3 도해 합성** ✅ **반영 완료** |

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

**본문은 완두 이야기가 아니라 '완두 + 소녀' 두 인물의 이야기다.**
그래서 네 장을 **정물 접사**가 아니라 **장면(scene)** 으로 간다 —
Ch1 만 완두 단독이고, **Ch2~4 는 소녀가 반드시 함께 나온다.**

| Ch | 본문 핵심 | 화면 |
|----|-----------|------|
| 1 | 꼬투리 속 다섯 완두의 대화 | 완두 다섯 알 (인물 없음) |
| 2 | 창가에 앉은 완두 + **침대에 누운 아픈 소녀**가 발견 | 방 안 — 침대의 소녀와 창가 |
| 3 | **날마다 창가로 와 햇볕에 앉는** 소녀, 쑥 자란 줄기 | 창가에 앉은 소녀 + 큰 줄기 |
| 4 | 분홍 꽃이 피고 소녀가 **엄마를 부르며 외침** | 꽃 + 소녀와 엄마 |

> **얼굴은 그리지 않는다.** 뒷모습·옆모습·손·실루엣으로 처리한다(교재 삽화 원칙).
> 아프던 소녀가 **점점 건강해지는 변화**가 자세로 드러나야 한다 —
> Ch2 누워 있음 → Ch3 앉아 있음 → Ch4 일어서서 창가로 달려감.

### L5 Ch1 — Five Little Peas in a Pod (`illust-1.png`)

> 본문: 완두 다섯 알이 한 꼬투리 안에서 산다. 가장 큰 완두는 세상에 나가고 싶어 하고,
> **가장 작은 완두**는 "나는 너무 작아"라며 풀이 죽는다.
> → **다섯 알이 세어지고, 맨 끝 하나가 눈에 띄게 작아야** 본문과 맞는다.

```
Soft watercolor storybook illustration, wide banner composition. Five round green peas resting in a row inside a long open pea pod that lies across the frame, the pod split lengthwise to reveal all five clearly countable, the pea at the far right noticeably smaller than the other four and sitting slightly apart from them. Thin curling vine and a few pea leaves at the edges. Delicate ink outlines with gentle watercolor washes, visible paper grain, generous white space. Warm gentle fairy-tale mood, children's picture book art. NO window, NO windowsill, NO soil, NO tall stem, NO pink blossom, NO house interior, NO bed, NO people, NO faces on the peas. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette of soft greens and cream, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L5 Ch2 — A Tiny Space by the Window (`illust-2.png`)

> 본문: 바람에 날린 완두가 창가 틈에 내려앉는다. 그 집에는 **하루 종일 침대에 누워 있는
> 아픈 소녀**가 살고, 소녀가 "창가의 저 초록색 건 뭐예요?"라고 **묻는다**.
> → 소녀가 빠지면 챕터의 절반이 사라진다. **누워서 창가를 바라보는 구도**가 핵심.

```
Soft watercolor storybook illustration, wide banner composition. Interior of a small modest bedroom seen from the side: on the left a child lying in a simple bed under a blanket, head turned away toward the right, one small hand resting on the blanket; on the right a bright window with a weathered sill where a tiny green pea sprout has just broken through a patch of dark soil in a crack. Soft empty floor between them. The child is seen from behind and in profile shadow only, face not visible. Delicate ink outlines with gentle watercolor washes, visible paper grain. Quiet, tender, hopeful fairy-tale mood, children's picture book art. NO open pea pod, NO row of five peas, NO tall climbing stem, NO pink blossom, NO visible face, NO facial features, NO close-up portrait. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L5 Ch3 — Growing Taller, Growing Stronger (`illust-3.png`)

> 본문: 소녀가 **날마다 창가로 가서** 식물을 보고, 완두는 **작은 나무만큼** 자란다.
> "**햇볕에 앉아** 너를 볼 때면 나도 더 건강해지는 기분이야" → 소녀가 **앉아 있어야** 한다.
> 앞 장의 '누워 있음'과 대비되는 **회복의 자세**가 이 장의 의미다.

```
Soft watercolor storybook illustration, wide banner composition. Interior of a small modest room: a child sitting upright on a low wooden stool close to a bright window, seen from behind over the shoulder, looking up at a tall pea plant whose climbing stem and curling tendrils rise high above the window latch with many green leaves, growing from a small pot of dark soil on the sill. Soft pool of daylight on the floor around the child. The child is seen from behind only, face not visible. Delicate ink outlines with gentle watercolor washes, visible paper grain. Calm, warm, quietly hopeful fairy-tale mood, children's picture book art. NO bed, NO lying down, NO pea pod, NO loose peas, NO pink blossom, NO open flower, NO visible face, NO facial features. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L5 Ch4 — The Blossom and the Thing It Could Do (`illust-4.png`)

> 본문: **어느 저녁** 소녀가 "엄마, 이것 좀 보세요!"라고 **외치고**, 분홍 꽃이 피어 있다.
> 소녀는 완두를 "**내가 기다려 온 친구**"라고 부른다.
> → **활짝 핀 분홍 꽃 + 일어서서 창가에 있는 소녀 + 다가오는 엄마**. 가장 밝고 화사하게.

```
Soft watercolor storybook illustration, wide banner composition. Interior of a small modest room: on the right a single delicate pink pea blossom fully opened on a tall green stem at a bright window, surrounded by soft leaves and curling tendrils; a child standing on tiptoe at the window with one arm raised pointing at the flower, seen from behind; on the left an adult woman stepping into the room toward them, also seen from behind. Warm cheerful atmosphere, the brightest and most colorful of the set. Both figures seen from behind only, faces not visible. Delicate ink outlines with gentle watercolor washes, visible paper grain. Joyful, tender, celebratory fairy-tale mood, children's picture book art. NO bed, NO lying down, NO pea pod, NO loose peas, NO bare soil, NO visible face, NO facial features. Natural soft diffused daylight, high-key exposure, low contrast, airy pastel palette with warm pink accents, clean bright background. NO dramatic lighting, NO golden hour, NO sunset, NO night scene, NO heavy shadows, NO dark moody grading, NO photorealism, NO 3D render, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

---

## Lesson 6 — Science Is the Key (체험 수기 · 실사 포토리얼)

**본문은 거의 전부 민호와 아빠의 대화다.** 초판 프롬프트는 네 장 모두
`NO people` 이라 **두 주인공이 한 번도 안 나왔다.** 본문 장면에 맞게 재작성한다.

| Ch | 본문 핵심 | 화면 |
|----|-----------|------|
| 1 | 첫 캠핑, 가방에서 텐트를 꺼내고 아빠가 **주위를 둘러봄** | 접힌 텐트 + 둘러보는 아빠와 아이 |
| 2 | 태양·그림자를 따져 **텐트 자리를 정함** (+ Q1 도해) | 나무 그늘 진 잔디밭 (도해가 주인공) |
| 3 | **아빠가 물수제비를 뜨고** 민호가 지켜봄 (+ Q2 도해) | 호숫가에서 던지는 아빠의 뒷모습 |
| 4 | 장작 쌓기 → **밤에 함께 수백 개의 별을 봄** (+ Q3 도해) | 밤하늘의 별과 올려다보는 두 사람 |

> **Ch2·3·4 는 위에 도해가 얹히므로 가운데를 비운다.** 인물은 **좌우 가장자리**에
> 배치하고 `soft blurred background` `shallow depth of field` 를 유지한다.
> 인물이 가운데 있으면 도해에 가려 무의미해진다.
>
> 얼굴은 그리지 않는다 — **뒷모습·실루엣**으로 처리(교재 삽화 원칙).

### L6 Ch1 — Science Is the Key (`illust-1.png`) · AI 단독

> 본문: 아빠와의 **첫 캠핑**. 가방에서 텐트를 꺼냈고, 아빠는 자리를 찾아 **둘러본다**.
> → Q1 도해(세워진 텐트)와 겹치지 않게 **아직 접힌 텐트**. 두 사람이 함께 있어야 한다.

```
Photorealistic outdoor photograph, wide banner composition. A riverside campsite on a green lawn: a folded camping tent still half inside its carry bag on the grass with tent poles beside it, an adult man standing near it looking away toward the trees as if searching for a spot, and a boy crouching beside the tent bag. Both figures seen from behind, faces not visible, small in the frame. Tall leafy trees and open sky behind. Fresh, inviting, start-of-an-adventure feel. NO pitched tent, NO tent standing up, NO compass letters, NO diagram arrows, NO firewood stack, NO campfire, NO skipping stones, NO stars, NO night sky, NO visible face, NO facial features. Shot on a 35mm lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO heavy shadows, NO dark moody grading, NO illustration, NO cartoon, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L6 Ch2 — The Sun, the Shadow, and the Tent (`illust-2.png`) · 배경

> 위에 **Q1 텐트 위치 도해**를 얹는다. 본문 핵심은 **나무 그림자의 이동**이므로
> 배경도 **그늘이 드리운 잔디밭**이어야 한다. 도해가 정답을 담고 있으므로
> 배경은 **가운데를 완전히 비우고** 인물도 넣지 않는다(이 장은 도해가 주인공).

```
Photorealistic outdoor photograph, wide banner composition, soft blurred background. A wide empty green campsite lawn with the long soft shadow of a large leafy tree stretching across the grass from the left edge, bright open sky above, distant trees far out of focus along the horizon. Completely empty center with nothing in the middle of the frame, plenty of clean open grass. Shallow depth of field, gentle bokeh, very soft low-detail background. NO tent, NO people, NO compass letters, NO diagram arrows, NO firewood, NO campfire, NO lake, NO stars, NO night. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, muted desaturated color. NO dramatic lighting, NO golden hour, NO sunset, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L6 Ch3 — Skipping Stones (`illust-3.png`) · 배경

> 위에 **Q2 각도 도해**를 얹는다. 본문에서 민호는 **아빠가 물수제비를 뜨는 것을 본다**
> (`I saw Dad skipping stones ~ He was very good at it`).
> → **왼쪽 가장자리에 던지는 아빠의 뒷모습**을 넣고, 가운데 물 위는 비운다.

```
Photorealistic outdoor photograph, wide banner composition, soft blurred background. A calm wide lake seen from the shore: at the far left edge the back silhouette of an adult man in mid-throw, arm swept low across his body having just released a stone toward the water, standing on a pebbly bank; the rest of the frame is open calm water with very gentle ripples spreading out, a far shoreline of blurred green trees along the top edge. Empty center with nothing in the middle of the frame. The man is small, at the edge, seen from behind, face not visible, softly out of focus. Shallow depth of field, gentle bokeh. NO angle lines, NO degree marks, NO diagram, NO tent, NO firewood, NO campfire, NO stars, NO night, NO visible face, NO facial features. Natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, muted desaturated color. NO dramatic lighting, NO golden hour, NO sunset, NO heavy shadows, NO dark moody grading, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### L6 Ch4 — Room for Air and a Sky Full of Stars (`illust-4.png`) · 배경

> 위에 **Q3 장작 쌓기 도해**를 얹는다. 본문 마지막은 **밤에 수백 개의 별을 함께 보는**
> 장면이고 여기서 "과학은 어디에나 있다"는 결론이 나온다.
> → 초판은 `NO stars` 였는데 **정반대**다. **별이 보이는 밤하늘**이 이 장의 핵심.
> 좌우 가장자리에 **올려다보는 두 사람의 실루엣**을 작게 넣는다.

```
Photorealistic outdoor photograph, wide banner composition, soft blurred background. A quiet campsite under a wide deep blue evening sky filled with many small stars, a low stone fire ring resting on the grass at the far left edge, and at the far right edge the small back silhouettes of an adult and a child standing close together looking up at the sky. Dark treeline low along the bottom, softly out of focus. Empty center with nothing in the middle of the frame, wide open starry sky across the upper half. Shallow depth of field, gentle bokeh, very soft low-detail foreground. NO stacked firewood, NO logs, NO flames, NO burning fire, NO smoke, NO tent, NO lake, NO visible face, NO facial features. Clear calm starlit sky, even ambient light, low contrast, muted desaturated color, gentle blue tones, nothing harsh. NO dramatic lighting, NO golden hour, NO orange sunset, NO fire glow, NO light beams, NO heavy vignette, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### 합성 방법 (Ch2·3·4)

생성한 배경을 `dist/L6/assets/_bg-{2,3,4}.png` 로 두고 아래를 실행한다.
교과서 도해는 `비상황 6과.pdf` 에서 추출한 원본(`q1-tent` / `q2-angle` / `q3-wood`)이다.

```bash
python - <<'EOF'
from PIL import Image
TW,TH=2000,625
pad=16
jobs=[('_bg-2.png','q1-tent.jpg','illust-2.png'),
      ('_bg-3.png','q2-angle.jpg','illust-3.png'),
      ('_bg-4.png','q3-wood.jpg','illust-4.png')]
for bgf,dgf,out in jobs:
    bg=Image.open(bgf).convert('RGB').resize((TW,TH), Image.LANCZOS)
    dg=Image.open(dgf).convert('RGB')
    # 도해를 키우되, ★ 카드(도해+흰 여백 pad*2)가 배너를 넘지 않게 pad 를 먼저 뺀다.
    # (pad 를 안 빼면 카드 높이가 632 > 배너 625 가 되어 도해 위아래가 잘린다)
    r=min((TH*0.96-pad*2)/dg.height, (TW*0.92-pad*2)/dg.width)
    dg=dg.resize((int(dg.width*r), int(dg.height*r)), Image.LANCZOS)
    # 도해 뒤에 흰 카드 + 여백을 깔아 배경 위에서 또렷하게
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
