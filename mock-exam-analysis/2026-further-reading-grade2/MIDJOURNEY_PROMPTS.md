# 2026 Further Reading (고2) 분석지 — 미드저니 삽화 프롬프트 시트

> 회사 규칙: **항상 `--ar 16:5 --v 7`** · 고등부 톤 = cinematic editorial + painterly 3D mix · soft pastel · 우드블록/폴크아트 금지
> **학생용 교재** — 밝고 따뜻하고 친근한 톤으로 통일 (어둡거나 무서운 연출 없음 — 도둑·죽음 모티프도 동화풍으로 부드럽게)
> 저장 위치: 생성한 PNG를 `2026-further-reading-grade2/assets/illust-{번호}.png` 로 저장
> ⚠️ 이 폴더는 ANSWER 제거를 위해 빌드 후 HTML 후처리를 했으므로 **재빌드 금지** — 삽화 교체 시 HTML의 `<img src>` 경로만 확인하거나, 재빌드 후 ANSWER 블록을 다시 수동 제거할 것.

| 번호 | 유형 | 제목 |
|---|---|---|
| 01 | 독해 분석 | David Swan — Asleep at the Crossroads of Fate |
| 02 | 독해 분석 | Ebony and Ivory — Black and White Keys, One Beautiful Song |
| 03 | 독해 분석 | Land Art — Art That Lives and Fades in Nature |
| 04 | 독해 분석 | Food Brings Us Together — Seasonal Food Wisdom Across Cultures |
| 05 | 독해 분석 | The Last Wild Race — Proving That Limits Don't Exist |

---

## 01번 · David Swan (Nathaniel Hawthorne)
**파일:** `assets/illust-01.png`
**제목:** Asleep at the Crossroads of Fate (운명의 갈림길에서 잠들다)
**핵심 장면:** 잠든 청년 옆을 부(노부부)·사랑(소녀)·죽음(도둑+개)이 스쳐 지나가는, 작품 전체를 한 컷에 압축한 메인 삽화.

### ✅ 메인 (전체 서사 압축 — JSON 등록본)
```
A young man in old colonial travel clothes sleeping peacefully beside a fresh bubbling spring under a cluster of maple trees on a warm summer day, his small cloth bag as a pillow, around him three gentle vignettes of unseen fate drifting past like soft daydream clouds — a kindly old couple, a shy pretty girl shooing a bee, and two harmless cartoonish sneaky men with a friendly watchful dog, a stagecoach faintly on the road behind, warm golden afternoon light, soft pastel butter and sage tones, bright friendly storybook mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

### 대안 A — 심플 (잠든 청년 + 운명 모티프, 인물 군상 없이 깔끔)
```
A peaceful young traveler in old colonial clothes napping beside a clear bubbling spring under maple trees on a warm summer afternoon, a small cloth bag under his head, a faint stagecoach passing on the distant road, soft dreamlike sense of unseen destiny drifting in the air, warm golden light, soft pastel butter and sage tones, bright gentle storybook mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

### 대안 B — 3분할 파노라마 (부·사랑·죽음 세 사건을 가로로 나열)
```
A wide horizontal triptych storybook scene around one young man asleep by a bubbling spring under maple trees: on the left a kindly old wealthy couple pausing by their carriage, in the center a shy pretty girl gently brushing a bee from his eyelid with a handkerchief, on the right two harmless cartoonish sneaky men backing away from a friendly alert dog, all softly connected, warm golden afternoon light, soft pastel butter coral and sage tones, bright friendly non-scary mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

### 대안 C — 사랑 사건 클로즈업 (소녀 + 벌, 가장 따뜻한 컷)
```
A tender close-up of a shy pretty young girl in old-fashioned dress gently removing a bee from a sleeping young man's eyelid with her handkerchief, her cheeks turning pink, beside a bubbling spring under maple trees on a warm summer day, soft romantic storybook atmosphere, warm golden light, soft pastel coral and butter tones, bright gentle mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

---

### 생성 팁
- **얼굴/손 깨짐**이 잦으면 `--v 7` 유지한 채 같은 프롬프트로 4컷 중 가장 깨끗한 것을 vary(subtle).
- 도둑·개 장면은 절대 어둡거나 위협적이지 않게 — `harmless cartoonish`, `friendly`, `non-scary` 키워드로 동화풍 유지.
- 16:5 와이드라 인물을 너무 많이 넣으면 작아짐 → 인물 강조가 필요하면 **대안 A(심플)** 또는 **대안 C(클로즈업)** 권장.
- 최종 PNG는 `assets/illust-01.png` 로 저장. (HTML `<img>`가 `assets/illust-01.png` 를 가리키며, 파일이 없으면 placeholder가 뜸 → 넣으면 자동 반영)

---

## 02번 · Ebony and Ivory (Paul McCartney & Stevie Wonder)
**파일:** `assets/illust-02.png`
**제목:** Black and White Keys, One Beautiful Song (검은건반·흰건반, 하나의 아름다운 곡)
**핵심 장면:** 나란히 빛나는 피아노 검은·흰 건반과, 그 주위로 손잡은 다양한 사람들 — 차이를 넘어선 화합.

### ✅ 메인 (JSON 등록본)
```
A warm friendly close-up of a grand piano keyboard where the black and white keys sit side by side glowing softly, gentle musical notes floating up like soft daydream clouds, and around the piano a diverse circle of smiling people of different skin colors holding hands in harmony, soft golden warm light, soft pastel butter coral and sage tones, bright friendly storybook mood about peace and togetherness, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

### 대안 A — 건반 클로즈업 (가장 깔끔, 인물 없이 상징만)
```
A warm artistic close-up of black and white piano keys side by side under soft golden light, gentle glowing musical notes rising like daydream clouds, a subtle sense of harmony and unity, soft pastel butter and sage tones, bright gentle storybook mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

---

## 03번 · Land Art (Spiral Jetty, Robert Smithson)
**파일:** `assets/illust-03.png`
**제목:** Art That Lives and Fades in Nature (자연 속에 살아 사라지는 예술)
**핵심 장면:** 분홍빛 소금호수로 뻗은 거대한 돌 나선(Spiral Jetty)이 물속의 잠든 뱀처럼 보이는 항공 뷰.

### ✅ 메인 (JSON 등록본)
```
A wide aerial storybook view of a huge spiral made of dark stones stretching into a calm pink-tinged salt lake, looking gently like a sleeping snake resting in the water, soft reflections, a tiny visitor walking along the spiral, distant mountains, warm golden afternoon light, soft pastel coral sage and butter tones, bright peaceful land-art mood where nature is the gallery, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

### 대안 A — 지상 시점 (방문객이 나선 위를 걷는 따뜻한 컷)
```
A peaceful ground-level storybook view of a person walking along a long spiral path of dark stones reaching into a calm pink salt lake at golden hour, gentle reflections and distant mountains, soft pastel coral and sage tones, bright tranquil land-art mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

---

## 04번 · Food Brings Us Together (Eating with the Seasons)
**파일:** `assets/illust-04.png`
**제목:** Seasonal Food Wisdom Across Cultures (문화를 넘나드는 제철 음식의 지혜)
**핵심 장면:** 한국 삼계탕(여름)·김장(가을), 일본 벚꽃 과자(봄), 멕시코 옥수수 요리(늦여름)를 한 컷에 담은 4분할 콜라주.

### ✅ 메인 (JSON 등록본)
```
A warm friendly four-part storybook collage of seasonal foods around the world: a steaming bowl of Korean samgyetang chicken soup on a hot summer day, a grandmother making winter kimchi in autumn, delicate pink Japanese cherry-blossom sweets in spring, and Mexican grilled corn elote and tamales in late summer, all arranged in a gentle circle with seasonal scenery behind each, warm golden light, soft pastel coral butter and sage tones, bright cheerful food-and-family mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

### 대안 A — 한 식탁에 모인 세계 제철 음식 (단일 장면)
```
A warm overhead storybook view of one big wooden table bringing together world seasonal foods — Korean samgyetang, a jar of winter kimchi, pink Japanese cherry-blossom sweets, and Mexican corn elote and tamales — with diverse hands reaching in to share, warm golden light, soft pastel coral butter and sage tones, bright cheerful togetherness mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

---

## 05번 · The Last Wild Race (Proving That Limits Don't Exist)
**파일:** `assets/illust-05.png`
**제목:** Proving That Limits Don't Exist (한계는 없다는 증명)
**핵심 장면:** 붕대 감은 발로 결승선을 통과하며 두 팔을 든 여성 주자와, 곁에서 사막 경주를 끝낸 일흔의 남성 — 인간 잠재력의 희망적 한 컷.

### ✅ 메인 (JSON 등록본)
```
An uplifting wide storybook scene of a determined woman runner crossing an ultramarathon finish line with a bandaged foot, arms raised in triumph, and beside her an older grey-haired man finishing a vast golden desert race smiling calmly, warm sunrise light glowing over the horizon, soft pastel coral butter and sage tones, bright inspiring never-give-up mood about human potential, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

### 대안 A — 사막 주자 단독 (일흔의 남성, 가장 잔잔한 컷)
```
An inspiring wide storybook scene of an older grey-haired runner calmly crossing the finish line of a vast golden desert ultramarathon at sunrise, smiling with quiet pride, gentle wind and warm light over endless dunes, soft pastel butter and coral tones, bright hopeful never-give-up mood, cinematic editorial + painterly 3D mix, --ar 16:5 --v 7
```

---

### 02~05 공통 메모
- 모두 학생용 톤(밝고 따뜻·친근), `--ar 16:5 --v 7` 고정. 빌드 후 ANSWER 블록 수동 제거 완료(재빌드 시 다시 제거 필요 — `dist/*.html`의 coral `section-bar`(ANSWER · 정답) + `wrong-box` 삭제).
- PNG를 `assets/illust-0X.png`로 저장하면 placeholder가 자동으로 실제 삽화로 교체됨.
