# BigBang 크로스 인트로 백업

index.html 첫 화면의 **3D 크로스 파티클 BigBang 인트로**(Three.js + GLTF 크로스 51개 수렴 → "펑" → 별 폭발)에서 **크로스 부분만** 제거되었습니다.

별이 쏟아지는 효과(2D Canvas warp starfield)는 **그대로 살아 있습니다** — 인트로 폭발은 없고 잔잔한 흐름 모드로 hero 뒤에서 계속 흐릅니다.

원본 코드는 이 디렉토리에 보관되어 있어 언제든 복구 가능합니다.

---

## 현재 상태

| 요소 | 상태 |
| --- | --- |
| 3D 크로스 51개 + Three.js + GLTF | ❌ 제거됨 (백업: `index-bigbang-script.html.txt`) |
| BigBang "펑" 폭발 + 플래시 | ❌ 제거됨 |
| 2D warp starfield (별 쏟아짐) | ✅ **유지** — `index.html` 인라인, ambient 모드 |
| `hero-rays` 빛줄기 | ❌ 마크업 제거됨 (CSS는 남아있어 무해) |
| `mouse-halo` 마우스 글로우 | ❌ 마크업 제거됨 |
| `bigbang-flash` 플래시 | ❌ 마크업 제거됨 |
| 헤드라인 `.hero-fallback` | ✅ 정적, 항상 표시 (z-index:4) |

---

## 파일 구성

| 파일 | 설명 |
| --- | --- |
| `index-bigbang-script.html.txt` | index.html에 있던 원본 JS 블록 1656줄 (importmap, Three.js 모듈 import, bigbang IIFE 전체) — 크로스 인트로 복구용 |
| `../3d/cross-gltf-data.js` | 크로스 3D 모델 inline GLTF 데이터 |

---

## 크로스 인트로 전체 복구 방법

### 1) JS 블록 교체

`index.html`의 현재 starfield IIFE 블록(`<!-- =============== Hero starfield ... -->` 부터 다음 `</script>` 까지)을 삭제하고 그 자리에 `index-bigbang-script.html.txt` 내용을 통째로 붙여넣기.

### 2) hero 섹션 HTML 복구

`<section id="hero">` 안에 다음 요소를 다시 추가 (`#hero-warp`는 이미 있으므로 나머지만):

```html
<canvas id="bg-canvas" aria-hidden="true"></canvas>
<div class="hero-rays" aria-hidden="true"></div>
<div id="mouse-halo" aria-hidden="true"></div>
<div class="hero-tagline" aria-hidden="true">영어로 전과목 학습</div>
<div class="hero-english" aria-hidden="true">ENGLISH</div>
<div class="terra-hint" id="terra-hint" aria-hidden="true">CLICK&nbsp;TERRA&nbsp;NOVA</div>
<div class="bigbang-flash" id="bigbang-flash" aria-hidden="true"></div>
```

그리고 `<section id="hero" class="hero is-post">`를 `class="hero is-pre"`로 되돌리기.

### 3) body 클래스

`<body class="bigbang-done">`을 `<body>`로 되돌리기.

### 4) hero-fallback CSS

`.hero-fallback { display:flex; ... }`을 `display:none;`으로 되돌리기 (모바일/reduced-motion에서만 표시되도록).

---

## 별 효과만 다시 끄려면

`index.html`에서 `<canvas id="hero-warp">` 요소를 삭제하거나, starfield IIFE 안의 `ready(...)` 콜백을 비우면 별 캔버스가 부팅되지 않습니다. `.hero-fallback`만 남아 완전 정적 hero가 됩니다.

---

## 비활성화 이력 / 결정 배경

- BigBang 3D 크로스 인트로는 데스크탑에서도 Three.js + WebGL + GLTF + 파티클로 첫 화면 진입 시 200~500ms 지연 발생
- 모바일 저사양에서 frame drop 심각
- → 3D 부분(무거운 곳)만 제거하고, 2D Canvas starfield는 살림 (모바일/reduced-motion 자동 스킵, hero 뷰포트 벗어나면 rAF 자동 정지)

향후 크로스 인트로를 다시 켜고 싶으면 위 4단계로 즉시 복구 가능.

---

## 의존 자산

- `../3d/cross-gltf-data.js` (크로스 3D 데이터) — 복구 시 필요
- `../3d/planets-normalized/*.png` (행성 이미지) — hero와 무관하게 다른 섹션에서 사용
