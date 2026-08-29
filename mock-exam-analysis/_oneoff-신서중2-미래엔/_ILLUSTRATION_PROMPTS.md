# 신서중2 미래엔(문영인) Lesson 5·6 — 삽화 프롬프트 (전 7장)

> 규격: **`--ar 16:5 --v 8.1`** (와이드 배너)
> 톤: **실사 사진(포토리얼)** — 여행·다큐멘터리 톤, 흐린 날 확산광.
>
> **밝기는 형용사가 아니라 조명 조건으로 지정한다.** `bright`·`sunlit`·`luminous`
> 같은 형용사는 실사에서 미드저니가 **황금빛 저녁 + 강한 역광**으로 해석해
> 오히려 어두워진다. 대신 다음을 쓴다 —
> `natural soft diffused daylight` · `bright overcast sky` · `high-key exposure`
> · `low contrast` · `airy` · `clean bright background`.
>
> `cinematic` `golden hour` `dramatic lighting` `chiaroscuro` `moody` `neon` `night`
> 는 **지시부에서 금지**. 단 `NO ~` 배제절 안에서는 오히려 명시해 밀어낸다.
>
> 인물은 **얼굴 클로즈업을 피하고** 손·뒷모습·소품 위주로 — 교재 삽화이므로
> 특정인 초상을 만들지 않는다. 중학생 대상이라 무겁거나 비장한 연출도 피한다.
>
> **7장이 서로 닮지 않도록** 각 프롬프트에 다른 챕터의 소재를 `NO ~` 로 배제했다.
> (L5 = 호수·기념관·건축 / L6 = 스케이트파크·보호장비·석양 없는 오후)
>
> 생성한 이미지를 `dist/{L5,L6}/assets/illust-{N}.png` 로 저장한 뒤
> 분석지를 재빌드하면 자동 반영된다.
>
> ```bash
> cd mock-exam-analysis
> L=L5   # 또는 L6
> node builder/build.mjs "_oneoff-신서중2-미래엔/data/$L" "_oneoff-신서중2-미래엔/dist/$L" \
>   --styles="_oneoff-신서중2-미래엔/styles/analysis.css"
> node builder/pdf.mjs "_oneoff-신서중2-미래엔/dist/$L"
> node builder/pdf-image.mjs "_oneoff-신서중2-미래엔/dist/$L" --match='^workbook-\d+\.html$'
> node "_oneoff-신서중2-미래엔/combine.mjs" $L
> ```

---

## Lesson 5 — My Hometown, Chuncheon

교과서 소재: 춘천 소개 블로그 → 에티오피아 참전 기념관 → 자매도시·기념관 건축.
세 장이 **풍경 / 실내 전시 / 건축 외관**으로 확실히 갈리게 구성했다.

### Ch1 · Welcome to my blog, "Happy Yujin!" — 춘천 소개

- 저장 경로: `dist/L5/assets/illust-1.png`
- 원문 7문장 · 키워드: hometown, mountains and lakes, foreign tourists

```
Photorealistic travel photograph, wide banner composition. A wide panoramic view of a Korean lakeside city in early autumn: a broad calm lake in the foreground reflecting rounded green mountains, a gentle curving road along the shore, and a small low-rise city skyline resting between the water and the hills. A few distant sightseeing boats on the water. Fresh, open, welcoming tourist-brochure feel. NO memorial building, NO museum interior, NO domed roof, NO skateboard, NO skatepark, NO sports equipment. Shot on a wide-angle lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO people in the foreground, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch2 · Today's Focus & Friendship Across the World — 참전 기념관 전시

- 저장 경로: `dist/L5/assets/illust-2.png`
- 원문 9문장 · 키워드: memorial hall, first/second floor, brave soldiers, cultural items

```
Photorealistic documentary photograph, wide banner composition. A quiet memorial exhibition hall interior seen along its length: one wall lined with evenly spaced framed black-and-white portrait photographs, a polished pale floor reflecting the even light from tall windows, and a clean glass display case on the right holding woven traditional Ethiopian textiles and handcrafted vessels. Respectful, calm, orderly museum atmosphere. NO lake, NO mountains, NO outdoor landscape, NO domed roof exterior, NO skateboard, NO skatepark. Shot on a wide-angle lens, natural soft diffused daylight from high windows, bright overcast sky outside, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO spotlights, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO people, NO readable text, NO flags, NO watermark --ar 16:5 --v 8.1
```

> ⚠️ 이 장면은 전쟁 추모가 소재이므로 **비장·엄숙한 연출을 피한다**.
> 중학생 교재이므로 차분하고 정돈된 전시실 느낌까지만.
> 국기·군복·무기·실제 인물 사진은 넣지 않는다(`NO flags` 로 배제).

### Ch3 · Sister Cities and the Memorial Hall — 기념관 건축

- 저장 경로: `dist/L5/assets/illust-3.png`
- 원문 8문장 · 키워드: sister city, built in 2006, traditional Ethiopian house, three round roofs

```
Photorealistic architectural photograph, wide banner composition. A modest memorial building with three distinct round domed roofs inspired by traditional Ethiopian house architecture, standing in a landscaped park with trimmed green lawn, a paved walking path leading toward the entrance, and young trees on both sides. Low rolling hills far in the background. Dignified, tidy, welcoming civic architecture. NO museum interior, NO framed photographs, NO display case, NO lake panorama, NO skateboard, NO skatepark. Shot on a wide-angle architectural lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus, straight verticals. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO people, NO readable text, NO signage, NO watermark --ar 16:5 --v 8.1
```

---

## Lesson 6 — My First Skateboarding Lesson

교과서 소재: 수업 신청 → 스케이트파크와 기원 → 안전장비·첫 기술 → 수업 후 깨달음.
네 장이 **새 보드 / 보울과 빈티지 보드 / 보호장비 / 사용감 있는 보드**로 갈리게 구성했다.

### Ch1 · My First Skateboarding Lesson — 도전의 시작

- 저장 경로: `dist/L6/assets/illust-1.png`
- 원문 4문장 · 키워드: try something new, first step, one-day class

```
Photorealistic lifestyle still-life photograph, wide banner composition. A brand-new skateboard resting flat on smooth pale concrete at the edge of an empty outdoor skatepark, a clean pair of canvas sneakers placed neatly beside it, gentle curved ramps softly out of focus in the background. Crisp, hopeful, fresh-start mood, plenty of empty space around the objects. NO lake, NO mountains, NO memorial building, NO museum, NO helmet, NO knee pads, NO scuff marks, NO dirt. Shot on a wide-angle lens at low height, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO people, NO faces, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch2 · Meeting Eric at the Skatepark — 보울과 서핑의 기원

- 저장 경로: `dist/L6/assets/illust-2.png`
- 원문 8문장 · 키워드: big bowl, surfer on a big wave, California, empty swimming pools

```
Photorealistic photograph, wide banner composition. A large curved concrete skate bowl seen from its rim, the smooth pale grey basin sweeping across the frame like an empty swimming pool, a vintage wooden skateboard with visible metal trucks and wheels resting on the coping in the foreground. Tall palm trees stand against a pale sky far in the background, suggesting coastal California. Retro-modern, spacious, sunny-day-without-harsh-sun feel. NO lake, NO mountains, NO memorial building, NO museum interior, NO helmet, NO knee pads, NO new unused board. Shot on a wide-angle lens, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO people, NO faces, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch3 · Safety First and the Push-off — 보호장비와 첫 기술

- 저장 경로: `dist/L6/assets/illust-3.png`
- 원문 11문장 · 키워드: warm-up, safety, helmet and pads, push-off, keep my balance

```
Photorealistic still-life photograph, wide banner composition. Skateboarding safety gear laid out in a neat row on smooth pale concrete: a rounded helmet, a pair of knee pads and a pair of elbow pads, with a skateboard positioned just behind them and one sneaker resting with its sole against the board deck as if about to push off. A gentle ramp softly out of focus in the background. Careful, reassuring, instructional feel. NO lake, NO mountains, NO memorial building, NO museum, NO palm trees, NO concrete bowl, NO vintage wooden board. Shot on a wide-angle lens at low height, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus, fine material detail. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO faces, NO full figures, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

### Ch4 · More Than Just a Cool Sport — 연습의 흔적

- 저장 경로: `dist/L6/assets/illust-4.png`
- 원문 8문장 · 키워드: more than a cool-looking sport, feel free, shoes and jeans got dirty

```
Photorealistic lifestyle photograph, wide banner composition. A well-used skateboard lying on smooth pale concrete, its deck scratched and its wheels dusty from practice, beside a pair of scuffed sneakers with dust-marked denim cuffs just visible above them. An open empty skatepark stretches into soft focus behind, wide and inviting. Quiet satisfaction after a long practice session, honest and unposed. NO lake, NO mountains, NO memorial building, NO museum, NO palm trees, NO helmet, NO knee pads, NO brand-new clean board. Shot on a wide-angle lens at low height, natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, airy and open feel, clean bright background, true-to-life color, sharp focus. NO dramatic lighting, NO golden hour, NO sunset, NO neon, NO night scene, NO heavy shadows, NO dark moody grading, NO faces, NO full figures, NO text overlay, NO watermark --ar 16:5 --v 8.1
```

---

## 검증 방법

프롬프트를 고쳤다면 **`_sync-prompts.mjs` 로 JSON 에 반영한 뒤** 검증한다.
빌드는 `data/{L}/{N}.json` 의 `illustration.prompt` 를 읽으므로,
**이 문서만 고치면 산출물에 반영되지 않는다.**

```bash
cd mock-exam-analysis/_oneoff-신서중2-미래엔

# 문서 → JSON 동기화 (규격·금지어 검사를 겸한다. 위반 시 exit 1)
node _sync-prompts.mjs
```

`_sync-prompts.mjs` 가 장마다 자동으로 확인하는 것:

1. `--ar 16:5` · `--v 8.1` 이 들어 있는가
2. **지시부**에 금지어(`golden hour` `dramatic lighting` `chiaroscuro` `moody`
   `neon` `night scene` `sunlit` `twilight`)가 없는가
   — `NO ~` 배제절을 먼저 지우고 검사하므로 배제절의 단어는 오탐하지 않는다
3. 저장 경로가 실재하는 챕터를 가리키는가

> ⚠️ 이 문서를 `grep` 으로 직접 세면 **위 규격 안내문과 이 검증 절의 예시 명령까지
> 함께 잡혀 숫자가 부풀려진다**(`--ar` 9건으로 보이지만 실제 프롬프트는 7장).
> 세려면 코드블록만 보거나 `_sync-prompts.mjs` 의 출력(`동기화 7장`)을 믿을 것.

산출물 전체 검수는 별도 스크립트로 한다.

```bash
node _audit.mjs      # dist 의 PDF 를 원문 정본과 대조 (차단 0 이 조건)
```
