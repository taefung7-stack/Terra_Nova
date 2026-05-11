# BigBang 인트로 백업

index.html 첫 화면의 BigBang 인트로 애니메이션(Three.js 크로스 파티클 수렴 + 플래시 + WebGL warp)이 페이지 무게/렉 때문에 **비활성화**되었습니다.

원본 코드는 이 디렉토리에 보관되어 있어 언제든 복구 가능합니다.

---

## 파일 구성

| 파일 | 설명 |
|---|---|
| `index-bigbang-script.html.txt` | index.html 4482~6137줄에 있던 원본 JS 블록 1656줄 (importmap, Three.js 모듈 import, bigbang IIFE 전체) |
| `../3d/cross-gltf-data.js` | 크로스 3D 모델 inline GLTF 데이터 (그대로 위치 유지) |

---

## 복구 방법

### 1) JS 블록 복구
index.html에서 다음 stub을 삭제하고 그 자리에 `index-bigbang-script.html.txt` 내용을 통째로 붙여넣기:

```html
<!-- =============== Three.js BigBang intro — DISABLED =============== -->
<!-- ... 주석 ... -->
<script>
  document.body.classList.add('bigbang-done');
  var __tnHero = document.getElementById('hero');
  if (__tnHero) { __tnHero.classList.remove('is-pre'); __tnHero.classList.add('is-post'); }
</script>
```

### 2) hero 섹션 HTML 복구
`<section id="hero">` 안에 다음 요소들을 다시 추가:

```html
<canvas id="hero-warp" aria-hidden="true"></canvas>
<canvas id="bg-canvas" aria-hidden="true"></canvas>
<div class="hero-rays" aria-hidden="true"></div>
<div id="mouse-halo" aria-hidden="true"></div>
<!-- hero-fallback은 그대로 유지 -->
<div class="hero-tagline" aria-hidden="true">영어로 전과목 학습</div>
<div class="hero-english" aria-hidden="true">ENGLISH</div>
<div class="terra-hint" id="terra-hint" aria-hidden="true">CLICK&nbsp;TERRA&nbsp;NOVA</div>
<div class="bigbang-flash" id="bigbang-flash" aria-hidden="true"></div>
```

그리고 `<section id="hero" class="hero is-post">`을 `class="hero is-pre"`로 되돌리기.

### 3) body 클래스 복구
`<body class="bigbang-done">`을 `<body>`로 되돌리기.

### 4) hero-fallback CSS 복구
shared CSS에서 `.hero-fallback { display:flex; ... }`을 `display:none;`으로 되돌리기 (모바일/reduced-motion에서만 표시되도록).

---

## 비활성화한 이유

- BigBang은 데스크탑에서도 Three.js + WebGL + GLTF + 파티클 시스템을 로드해서 첫 화면 진입 시 200~500ms 이상 지연 발생
- 모바일 저사양에서 frame drop 심함
- 시각 효과는 멋지지만 첫 인상 속도가 더 중요하다고 판단

향후 다시 켜고 싶을 때 복구가 빠르도록 통째로 백업해둔 것임. 부분 최적화(예: WebGL만 끄고 CSS 애니메이션만 살리기)도 가능하지만 그건 복구 후 별도 작업.

---

## 의존 자산

비활성화 후에도 다음 파일은 그대로 남아있음 (다른 페이지에서 쓸 수도 있고 복구 시 필요):
- `../3d/cross-gltf-data.js` (크로스 3D 데이터)
- `../3d/planets-normalized/*.png` (행성 이미지, hero와 무관하게 다른 섹션에서 사용)

CSS는 index.html 인라인이라 그대로 두었음. body가 항상 `bigbang-done` 상태라 빅뱅 관련 selector(`.is-pre .hero-warp`, `.bigbang-flash` 등)는 매칭되지 않아 무해함.
