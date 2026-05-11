# BigBang 크로스 인트로 백업

index.html 첫 화면의 **3D 크로스 파티클 BigBang 인트로**에서 **크로스 51개와 '펑' 클라이맥스만** 외과 수술로 제거되었습니다.

홈의 다른 모든 요소(TERRA NOVA 워드마크, 별 쏟아지는 효과, hero-rays 빛줄기, mouse-halo, hero-tagline + ENGLISH, 모든 스크롤 reveal 애니메이션)는 **원본 그대로** 살아 있습니다.

원본 통째 백업은 이 디렉토리에 보관되어 있어 언제든 전체 복구 가능합니다.

---

## 현재 상태 (외과 수술 결과)

| 요소 | 상태 |
| --- | --- |
| 3D 크로스 51개 + GLTF 메시 + 충돌 물리 | 제거됨 |
| 클릭 의식 (수렴 → 홀드 → 플래시 → dissolve) | 제거됨 |
| PointLight 펑 백광 + 오브 + 트레일 burst | 제거됨 |
| TERRA NOVA Sprite (워드마크) | 유지 — z=0, hover 시 밝아짐 |
| Camera mouse parallax + tagline/ENGLISH lockstep | 유지 |
| `#hero-warp` 2D 별 쏟아짐 (warp starfield) | 유지 — 항상 ambient 흐름 |
| `.hero-rays` 빛줄기 + `#mouse-halo` 마우스 글로우 | 유지 |
| `.hero-tagline` / `.hero-english` 오버레이 | 유지 |
| 모든 `.reveal` / `.statement` / `.exam-match` / `.proof-headline` 의식 | 유지 |
| Three.js core (Sprite + Camera + Renderer) | 유지 — GLTFLoader는 import 안 함 |
| `bigbang-flash`, `terra-hint` 마크업 + 관련 JS | 제거됨 (CSS는 dead code로 남음, 무해) |

---

## 파일 구성

| 파일 | 설명 |
| --- | --- |
| `index-bigbang-script.html.txt` | 원본 BigBang IIFE 1656줄 통째 백업 (importmap + GLTFLoader + cross-gltf-data.js 로더 + 크로스 spawn + 펑 의식 전체) |
| `../3d/cross-gltf-data.js` | 크로스 3D 모델 inline GLTF — 현재 사용 안 함, 복구 시 필요 |

---

## 전체 인트로(크로스 + 펑) 복구 방법

### 1) IIFE 본문 교체

`index.html`의 현재 `<!-- =============== Three.js mouse-reactive hero ===============` 주석부터 그 IIFE 닫는 `})();</script>`까지 통째로 삭제하고, 그 자리에 `index-bigbang-script.html.txt` 내용을 붙여넣기. 추가로 `<script src="assets/3d/cross-gltf-data.js" defer></script>` 한 줄도 importmap 옆에 다시 추가.

### 2) hero 섹션 HTML 복구

`<section id="hero" class="hero is-post">`를 `class="hero is-pre"`로 되돌리고, 아래 두 요소를 `</section>` 직전에 다시 추가:

```html
<div class="terra-hint" id="terra-hint" aria-hidden="true">CLICK&nbsp;TERRA&nbsp;NOVA</div>
<div class="bigbang-flash" id="bigbang-flash" aria-hidden="true"></div>
```

### 3) body 클래스

`<body class="bigbang-done">`을 `<body>`로 되돌리기.

### 4) hero-fallback CSS

`.hero-fallback { display:flex; ... }`를 `display:none;`으로 되돌리기 (모바일/reduced-motion에서만 표시되도록).

---

## 별 효과만 다시 끄려면

`<canvas id="hero-warp">` 요소를 삭제하거나, IIFE 안의 `warpField = initWarpField();` 호출을 제거. TERRA NOVA Sprite와 hero-rays 등 나머지 효과는 그대로 유지됨.

---

## 외과 수술 이력 / 결정 배경

- BigBang 3D 크로스 인트로(Three.js + GLTF 51개 메시 + 펑 의식)는 데스크탑에서도 첫 화면 진입 시 200~500ms 지연 발생, 모바일 저사양에서 frame drop 심각
- 1차 시도(`23b1d88`)는 stub script로 통째 비활성화 → 사용자 피드백: "홈 내용까지 사라짐. 크로스만 빼고 다 살려라"
- 2차 시도(`f8593e3`)는 별 효과만 살리고 나머지(TERRA NOVA, rays, halo, tagline)를 그대로 제거 상태로 둠 → 사용자 피드백: "홈 내용을 다 없애버리면 어떡해"
- 본 외과 수술: **크로스 spawn / 펑 의식 코드만** 정확히 잘라내고, 나머지 모든 시각 요소 + 애니메이션 + Three.js Sprite는 원본 그대로 유지
