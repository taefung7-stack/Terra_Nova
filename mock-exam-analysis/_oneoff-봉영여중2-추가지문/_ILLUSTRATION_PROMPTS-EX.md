# 봉영여중2 영어B 기말 추가지문 — 삽화 미드저니 프롬프트 (7·8·9·10·영상 스크립트, 5장)

> 규격 **`--ar 16:5 --v 8.1`** 고정, 실사 포토리얼.
> 생성 후 원본을 `dist/EX/{N}.png` 로 받고, 가로 2000px 축소본을 `dist/EX/assets/illust-{N}.png` 로 넣은 뒤
> 분석지 재빌드(README 빌드 절). 이미지가 없으면 INTRO 면에 placeholder 가 찍힌다.
> ⚠️ 이 문서는 `_gen-prompts-doc-EX.mjs` 가 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로** — `natural soft diffused daylight, bright overcast sky, high-key exposure`.
2. **사람은 뺀다** — 공항·커피숍·경주도 사물·장소로 암시했다.
3. **배제는 `--no` 파라미터로** — 문장 속 `NO xxx` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 키오스크 화면·출발 안내판에 글자가 생기기 쉬워 `text, letters, words, numbers, signage` 를 늘 `--no` 에 넣었다.
5. **5장이 서로 닮지 않게** — 서로의 소재(나비·개미·수조·키오스크·비행기)를 `--no` 에 넣었다.

---

## 7. 7 · The Large Blue Butterfly

`dist/EX/assets/illust-7.png` — 여름 들판 — 보라색 백리향 꽃송이에 앉은 연푸른 점박이 나비(라지 블루), 아래 풀줄기를 따라 개미집으로 가는 붉은 개미 몇 마리

```
Photorealistic macro nature photograph, wide banner composition. A delicate pale blue butterfly with small black spots on its wings resting on a purple wild thyme flower head in a bright summer meadow; on a grass stem below, a few tiny red ants walk in a line toward a small soil mound. Gentle, curious mood of a clever trick in nature. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft sky blue, lavender and fresh meadow green. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, insects in close-up faces, deer, fish, water --ar 16:5 --v 8.1
```

## 8. 8 · Personal Space

`dist/EX/assets/illust-8.png` — 밝은 커피숍 — 나란히 선 셀프 주문 키오스크 두 대와 바닥에 일정 간격으로 붙은 원형 대기 스티커(개인 공간)

```
Photorealistic interior photograph, wide banner composition. A bright modern coffee shop with two sleek self-order kiosk screens standing side by side, and on the light wooden floor in front of them a neat row of round floor stickers spaced evenly apart, marking where to wait in line. Calm, orderly mood about personal space and keeping distance. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, warm white, light oak and soft mint green. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, screens with writing, menus, cups with logos, butterflies, fish, airplanes --ar 16:5 --v 8.1
```

## 9. 9 · The Barracuda Experiment

`dist/EX/assets/illust-9.png` — 수족관 수조 — 왼쪽의 창꼬치와 오른쪽 고등어 떼 사이 빈 공간, 희미한 세로 빛줄기로 이제는 없는 유리판 암시

```
Photorealistic underwater aquarium photograph, wide banner composition. A large clear public aquarium tank with pale sandy bottom and a few green plants; on the left a long silver barracuda hovers still, facing a small school of striped mackerel on the right, and between them an empty space where a faint vertical line of light hints at a glass panel that is no longer there. Calm, thoughtful mood of an invisible barrier. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, aqua blue, silver and soft sand beige. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, divers, coral reef, sharks, butterflies, ants, kiosks --ar 16:5 --v 8.1
```

## 10. 10 · Mr. A and Mr. B

`dist/EX/assets/illust-10.png` — 텅 빈 공항 탑승구 — 문 옆에 홀로 선 캐리어, 유리창 너머 막 활주로로 움직이는 비행기(아깝게 놓침)

```
Photorealistic interior photograph, wide banner composition. A bright, nearly empty airport departure gate: rows of light grey seats, a lone small carry-on suitcase standing by the boarding door, and through the tall glass wall an airplane slowly rolling away on the runway. Quiet, wistful mood of just barely missing something. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, soft white, pale sky blue and light grey. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, departure boards, clocks, screens with writing, cars, aquarium, fish, kiosks --ar 16:5 --v 8.1
```

## 11. 영상 스크립트 · Wenger Patagonian Expedition Race

`dist/EX/assets/illust-11.png` — 칠레 파타고니아 — 화강암 봉우리 사이 깊은 피오르, 물가로 흘러내린 거대한 빙하, 울창한 숲

```
Photorealistic landscape photograph, wide banner composition. A vast wild Patagonian landscape: a deep blue fjord winding between steep granite mountains, a huge pale blue glacier spilling down to the water, dense green forest on the slopes, and fast-moving clouds over the jagged peaks. Majestic, adventurous mood of an untouched wilderness. natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette, glacier blue, granite grey and deep forest green. --no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows, hikers, tents, flags, boats, buildings, roads, airplanes --ar 16:5 --v 8.1
```

