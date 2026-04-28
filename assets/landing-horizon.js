/* =============================================================
   Horizon Hero Section — vanilla port of the React component.
   Three.js scene (stars + nebula + mountains + atmosphere) +
   GSAP intro + scroll-driven camera. Lives below #hero on
   landing.html and spans 3 viewport-heights of scroll.
   ============================================================= */
import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

(function () {
  const section  = document.getElementById('horizon-hero');
  const canvas   = document.getElementById('horizon-canvas');
  if (!section || !canvas) return;

  const titleEl    = section.querySelector('[data-horizon-title]');
  const subtitleEl = section.querySelector('[data-horizon-subtitle]');
  const menuEl     = section.querySelector('.horizon-side-menu');
  const progressEl = section.querySelector('.horizon-progress');
  const fillEl     = section.querySelector('.horizon-progress__fill');
  const counterEl  = section.querySelector('.horizon-progress__counter');

  // 3 vertical scroll panels → 3 camera keyframes (HORIZON / COSMOS / INFINITY)
  const TITLES = ['HORIZON', 'COSMOS', 'INFINITY'];
  const SUBS = [
    ['Where vision meets reality,', 'we shape the future of tomorrow'],
    ['Beyond the boundaries of imagination,', 'lies the universe of possibilities'],
    ['In the space between thought and creation,', 'we find the essence of true innovation']
  ];
  const CAMERA_KEYS = [
    { x: 0, y: 30, z:  300 },
    { x: 0, y: 40, z:  -50 },
    { x: 0, y: 50, z: -700 }
  ];
  const TOTAL_PANELS = TITLES.length;       // 3
  const PROGRESS_DIVISOR = TOTAL_PANELS - 1; // map 0..1 → keyframe index 0..2

  /* ---------- Three.js scene ---------- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);

  const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 2000
  );
  camera.position.set(0, 20, 100);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.4, 0.85
  ));

  const stars = [];
  let nebula = null;
  const mountains = [];
  let mountainBaseZ = [];

  /* ---------- builders ---------- */
  function buildStars() {
    const starCount = 5000;
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors    = new Float32Array(starCount * 3);
      const sizes     = new Float32Array(starCount);

      for (let j = 0; j < starCount; j++) {
        const radius = 200 + Math.random() * 800;
        const theta  = Math.random() * Math.PI * 2;
        const phi    = Math.acos(Math.random() * 2 - 1);
        positions[j*3]   = radius * Math.sin(phi) * Math.cos(theta);
        positions[j*3+1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[j*3+2] = radius * Math.cos(phi);

        const c = new THREE.Color();
        const r = Math.random();
        if      (r < 0.7) c.setHSL(0,    0,   0.8 + Math.random()*0.2);
        else if (r < 0.9) c.setHSL(0.08, 0.5, 0.8);
        else              c.setHSL(0.6,  0.5, 0.8);
        colors[j*3]   = c.r;
        colors[j*3+1] = c.g;
        colors[j*3+2] = c.b;
        sizes[j] = Math.random() * 2 + 0.5;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
      geometry.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

      const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, depth: { value: i } },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;
          uniform float depth;
          void main() {
            vColor = color;
            vec3 pos = position;
            float angle = time * 0.05 * (1.0 - depth * 0.3);
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            pos.xy = rot * pos.xy;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float o = 1.0 - smoothstep(0.0, 0.5, d);
            gl_FragColor = vec4(vColor, o);
          }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      stars.push(points);
    }
  }

  function buildNebula() {
    const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time:    { value: 0 },
        color1:  { value: new THREE.Color(0x0033ff) },
        color2:  { value: new THREE.Color(0xff0066) },
        opacity: { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform float time;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float e = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
          pos.z += e;
          vElevation = e;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
          float m = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
          vec3 c = mix(color1, color2, m * 0.5 + 0.5);
          float a = opacity * (1.0 - length(vUv - 0.5) * 2.0);
          a *= 1.0 + vElevation * 0.01;
          gl_FragColor = vec4(c, a);
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    nebula = new THREE.Mesh(geometry, material);
    nebula.position.z = -1050;
    scene.add(nebula);
  }

  function buildMountains() {
    const layers = [
      { distance:  -50, height:  60, color: 0x1a1a2e, opacity: 1.0 },
      { distance: -100, height:  80, color: 0x16213e, opacity: 0.8 },
      { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
      { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 }
    ];
    layers.forEach((layer, idx) => {
      const points = [];
      const segs = 50;
      for (let i = 0; i <= segs; i++) {
        const x = (i / segs - 0.5) * 1000;
        const y = Math.sin(i * 0.10) * layer.height +
                  Math.sin(i * 0.05) * layer.height * 0.5 +
                  Math.random() * layer.height * 0.2 - 100;
        points.push(new THREE.Vector2(x, y));
      }
      points.push(new THREE.Vector2( 5000, -300));
      points.push(new THREE.Vector2(-5000, -300));
      const shape    = new THREE.Shape(points);
      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshBasicMaterial({
        color: layer.color, transparent: true,
        opacity: layer.opacity, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = layer.distance;
      mesh.position.y = layer.distance;
      mesh.userData = { baseZ: layer.distance, idx };
      scene.add(mesh);
      mountains.push(mesh);
    });
    mountainBaseZ = mountains.map(m => m.position.z);
  }

  function buildAtmosphere() {
    const geometry = new THREE.SphereGeometry(600, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float time;
        void main() {
          float i = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atm = vec3(0.3, 0.6, 1.0) * i;
          atm *= sin(time * 2.0) * 0.1 + 0.9;
          gl_FragColor = vec4(atm, i * 0.25);
        }`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    scene.add(new THREE.Mesh(geometry, material));
  }

  buildStars();
  buildNebula();
  buildMountains();
  buildAtmosphere();

  /* ---------- camera smoothing ---------- */
  const target = { x: 0, y: 30, z: 300 };
  const smooth = { x: 0, y: 30, z: 300 };
  const SMOOTHING = 0.05;

  /* ---------- animation loop with intersection-based pause ---------- */
  let running = false;
  let rafId   = 0;

  function frame() {
    if (!running) return;
    const t = performance.now() * 0.001;

    stars.forEach(s => { if (s.material.uniforms) s.material.uniforms.time.value = t; });
    if (nebula?.material?.uniforms) nebula.material.uniforms.time.value = t * 0.5;

    smooth.x += (target.x - smooth.x) * SMOOTHING;
    smooth.y += (target.y - smooth.y) * SMOOTHING;
    smooth.z += (target.z - smooth.z) * SMOOTHING;
    const floatX = Math.sin(t * 0.10) * 2;
    const floatY = Math.cos(t * 0.15) * 1;
    camera.position.set(smooth.x + floatX, smooth.y + floatY, smooth.z);
    camera.lookAt(0, 10, -600);

    mountains.forEach((m, i) => {
      const factor = 1 + i * 0.5;
      m.position.x = Math.sin(t * 0.10) * 2 * factor;
      m.position.y = 50 + Math.cos(t * 0.15) * 1 * factor;
    });

    composer.render();
    rafId = requestAnimationFrame(frame);
  }
  function play()  { if (running) return; running = true;  rafId = requestAnimationFrame(frame); }
  function pause() { running = false; cancelAnimationFrame(rafId); }

  /* ---------- safe DOM helpers (no innerHTML) ---------- */
  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
  function renderTitle(el, text) {
    clearChildren(el);
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'horizon-title__char';
      span.textContent = ch;
      el.appendChild(span);
    }
  }
  function renderSubtitle(el, lines) {
    clearChildren(el);
    for (const line of lines) {
      const p = document.createElement('p');
      p.className = 'horizon-subtitle__line';
      p.textContent = line;
      el.appendChild(p);
    }
  }

  /* ---------- scroll handler scoped to section ---------- */
  let currentPanel = -1;

  function applyPanel(idx) {
    if (idx === currentPanel) return;
    currentPanel = idx;
    if (titleEl)    renderTitle(titleEl, TITLES[idx]);
    if (subtitleEl) renderSubtitle(subtitleEl, SUBS[idx]);
    if (counterEl)  counterEl.textContent =
      String(idx).padStart(2, '0') + ' / ' + String(TOTAL_PANELS - 1).padStart(2, '0');
  }
  applyPanel(0);

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrolled   = -rect.top;
    const scrollable = section.offsetHeight - window.innerHeight;
    const progress   = Math.max(0, Math.min(1, scrolled / Math.max(1, scrollable)));

    if (fillEl) fillEl.style.width = (progress * 100).toFixed(2) + '%';

    const slot = progress * PROGRESS_DIVISOR;            // 0..2
    const idx  = Math.min(TOTAL_PANELS - 1, Math.floor(slot));
    const t    = slot - idx;                              // 0..1 within slot
    applyPanel(idx);

    const a = CAMERA_KEYS[idx];
    const b = CAMERA_KEYS[Math.min(idx + 1, CAMERA_KEYS.length - 1)];
    target.x = a.x + (b.x - a.x) * t;
    target.y = a.y + (b.y - a.y) * t;
    target.z = a.z + (b.z - a.z) * t;

    // Mountain parallax — recede aggressively in the final third
    mountains.forEach((m, i) => {
      const speed = 1 + i * 0.9;
      const base  = mountainBaseZ[i];
      m.position.z = progress > 0.7 ? 600000 : base + window.scrollY * speed * 0.05;
    });
    if (nebula && mountains[3]) nebula.position.z = mountains[3].position.z - 100;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- resize ---------- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- pause when offscreen ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? play() : pause());
    }, { threshold: 0.01 });
    io.observe(section);
  } else {
    play();
  }

  /* ---------- GSAP intro on first reveal ---------- */
  function runIntro() {
    if (!window.gsap) return;
    const gsap = window.gsap;
    [menuEl, titleEl, subtitleEl, progressEl].forEach(el => {
      if (el) el.style.visibility = 'visible';
    });
    const tl = gsap.timeline();
    if (menuEl) tl.from(menuEl, { x: -100, opacity: 0, duration: 1, ease: 'power3.out' });
    if (titleEl) {
      const chars = titleEl.querySelectorAll('.horizon-title__char');
      tl.from(chars, { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power4.out' }, '-=0.5');
    }
    if (subtitleEl) {
      const lines = subtitleEl.querySelectorAll('.horizon-subtitle__line');
      tl.from(lines, { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8');
    }
    if (progressEl) tl.from(progressEl, { opacity: 0, y: 50, duration: 1, ease: 'power2.out' }, '-=0.5');
  }
  if ('IntersectionObserver' in window) {
    const ioIntro = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { runIntro(); obs.disconnect(); }
      });
    }, { threshold: 0.1 });
    ioIntro.observe(section);
  } else {
    runIntro();
  }
})();
