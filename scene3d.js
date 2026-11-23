import * as THREE from './vendor/three.module.js';

const root = document.getElementById('canvas-root');
const stageFrame = document.getElementById('stage-frame');
const parallaxLayers = Array.from(document.querySelectorAll('.p-layer'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================================
// TRANSPARENT THREE.JS WEBGL OVERLAY LOCKED TO 16:9 STAGE FRAME
// ============================================================================
const scene = new THREE.Scene();

const getFrameSize = () => ({
  w: Math.max(1, stageFrame.clientWidth),
  h: Math.max(1, stageFrame.clientHeight),
});

const initSize = getFrameSize();
const camera = new THREE.PerspectiveCamera(36, initSize.w / initSize.h, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(initSize.w, initSize.h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
root.appendChild(renderer.domElement);

function createGlowSpriteTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 32);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.28, 'rgba(125, 211, 252, 0.9)');
  g.addColorStop(0.62, 'rgba(14, 165, 233, 0.25)');
  g.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================================
// LIVE 3D SCULPTED ARCHITECTURAL HOLOGRAM GROUNDED DIRECTLY ON THE TABLETOP
// ============================================================================
const holoRoot = new THREE.Group();
// Grounded firmly on the glossy conference tabletop surface (no levitation!)
holoRoot.position.set(-0.08, -1.18, 0.1);

// Animated rotating golden & cyan radar rings on the tabletop plane
const radarRings = [];
[
  { r: 1.55, color: 0x7dd3fc, opacity: 0.72, speed: 0.22 },
  { r: 2.05, color: 0x38bdf8, opacity: 0.48, speed: -0.16 },
  { r: 2.48, color: 0xfbbf24, opacity: 0.62, speed: 0.11 },
].forEach((cfg) => {
  const ringGeo = new THREE.RingGeometry(cfg.r - 0.025, cfg.r, 96, 1, 0, Math.PI * 1.45);
  const ringMat = new THREE.MeshBasicMaterial({
    color: cfg.color,
    transparent: true,
    opacity: cfg.opacity,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(ringGeo, ringMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  holoRoot.add(mesh);
  radarRings.push({ mesh, speed: cfg.speed });
});

// Subtle vertical holographic laser scan plane sweeping smoothly up the skyline
const scanRing = new THREE.Mesh(
  new THREE.RingGeometry(0.15, 1.85, 64),
  new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
scanRing.rotation.x = -Math.PI / 2;
holoRoot.add(scanRing);

// Sculpted 3D wireframe hologram accents (interactive drag rotation)
const holoWireMat = new THREE.MeshBasicMaterial({
  color: 0x7dd3fc,
  wireframe: true,
  transparent: true,
  opacity: 0.34,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const holoEdgeMat = new THREE.LineBasicMaterial({
  color: 0xbae6fd,
  transparent: true,
  opacity: 0.68,
  blending: THREE.AdditiveBlending,
});

const skylineGroup = new THREE.Group();

// 6 sculpted towers aligned diagonally along the conference table podium
const addEdgeMesh = (geo, x, y, z) => {
  const m = new THREE.Mesh(geo, holoWireMat);
  m.position.set(x, y, z);
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), holoEdgeMat));
  skylineGroup.add(m);
};

// Stepped monolith (left)
addEdgeMesh(new THREE.BoxGeometry(0.32, 1.95, 0.32), -1.25, 0.98, 0.14);
// Terraced tower (left-mid)
addEdgeMesh(new THREE.BoxGeometry(0.36, 1.75, 0.36), -0.78, 0.88, -0.04);
// Hero slanted crown tower (center)
const heroGeo = new THREE.BoxGeometry(0.42, 2.38, 0.38);
const hp = heroGeo.attributes.position;
for (let i = 0; i < hp.count; i++) {
  if (hp.getY(i) > 0 && hp.getX(i) > 0) hp.setY(i, hp.getY(i) - 0.3);
}
heroGeo.computeVertexNormals();
addEdgeMesh(heroGeo, -0.22, 1.19, 0.12);
// Cylindrical diagrid lattice tower
addEdgeMesh(new THREE.CylinderGeometry(0.2, 0.22, 1.95, 12, 8), 0.32, 0.98, -0.06);
// Tapered sail spire
const sailGeo = new THREE.CylinderGeometry(0.06, 0.26, 2.25, 8, 10);
sailGeo.scale(1.2, 1, 0.55);
addEdgeMesh(sailGeo, 0.82, 1.12, 0.08);
// Twisted helix tower (right)
const twistGeo = new THREE.BoxGeometry(0.28, 1.88, 0.28, 2, 12, 2);
const tp = twistGeo.attributes.position;
for (let i = 0; i < tp.count; i++) {
  const y = tp.getY(i);
  const a = ((y + 0.94) / 1.88) * 0.85;
  const x = tp.getX(i);
  const z = tp.getZ(i);
  tp.setX(i, x * Math.cos(a) - z * Math.sin(a));
  tp.setZ(i, x * Math.sin(a) + z * Math.cos(a));
}
twistGeo.computeVertexNormals();
addEdgeMesh(twistGeo, 1.28, 0.94, -0.08);

holoRoot.add(skylineGroup);

// Rising soft circular glow particles around the hologram
const pCount = 130;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 0.2 + Math.random() * 2.1;
  pPos[i * 3] = Math.cos(a) * r;
  pPos[i * 3 + 1] = Math.random() * 2.8;
  pPos[i * 3 + 2] = Math.sin(a) * r;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({
  map: createGlowSpriteTexture(),
  size: 0.11,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
holoRoot.add(new THREE.Points(pGeo, pMat));
scene.add(holoRoot);

// ============================================================================
// DIAGONAL CAMERA PRESETS (PHOTO ZOOM/PAN + MATCHED 3D CAMERA)
// ============================================================================
const VIEW_PRESETS = {
  boardroom: {
    scale: 1.0,
    panX: 0,
    panY: 0,
    camPos: [-1.45, 1.85, 8.6],
    camLook: [-0.08, 0.05, 0],
    holoOpacity: 0.72,
  },
  hologram: {
    scale: 1.32,
    panX: 1,
    panY: -4,
    camPos: [-1.05, 1.45, 5.8],
    camLook: [-0.08, 0.05, 0],
    holoOpacity: 1.0,
  },
  table: {
    scale: 1.28,
    panX: 12,
    panY: -10,
    camPos: [-2.4, 2.25, 6.8],
    camLook: [-0.3, -0.45, 0.2],
    holoOpacity: 0.8,
  },
  windows: {
    scale: 1.22,
    panX: -12,
    panY: 5,
    camPos: [-0.4, 1.95, 7.9],
    camLook: [0.6, 0.45, -0.5],
    holoOpacity: 0.45,
  },
};

const PANEL_INFO = {
  hologram: {
    cam: 'hologram',
    badge: 'CENTRALNY HOLOGRAM 3D',
    title: 'Holograficzny Wykres Przestrzenny „Skyline Core”',
    desc: 'Interaktywny model 3D Three.js osadzony w ukośnej perspektywie wzdłuż lustrzanego stołu — z rzeźbionymi wieżami, skanerem laserowym, pierścieniami radaru i żywą paralaksą 6DoF.',
    metrics: [['Aktywa', '$12.4B'], ['Projekty', '247'], ['Skuteczność', '93%']],
  },
  network: {
    cam: 'table',
    badge: 'GLOBAL NETWORK · MAPA STOŁU',
    title: 'Lustrzany Stół Zarządczy i Sieć Globalna',
    desc: 'Ukośny kadr wzdłuż całego stołu prezentuje lewy panel GLOBAL NETWORK (72% / 46% / 93%), węzły międzynarodowe oraz lustrzane odbicie błękitnego hologramu.',
    metrics: [['Biura', '36'], ['Zespół', '1,284'], ['Uptime', '99.98%']],
  },
  risk: {
    cam: 'boardroom',
    badge: 'RISK ANALYSIS & ANOMALIE',
    title: 'Monitoring Ryzyka i Anomalii 2026',
    desc: 'Lewy górny panel holograficzny analizuje odchylenia predykcyjne, bezpieczeństwo E2EE (AES-256-GCM) oraz stabilność operacyjną w czasie rzeczywistym.',
    metrics: [['Pasma', '5'], ['Indeks', '96/100'], ['Szyfr', 'AES-256']],
  },
  horizon: {
    cam: 'boardroom',
    badge: 'PROJECT HORIZON · 2026',
    title: 'Harmonogram Wdrożeń i Portfel Projektów',
    desc: 'Centralny szklany ekran zawieszony nad wieżami 3D przed oknami prezentuje wskaźniki realizacji kamieni milowych oraz obciążenie zespołów.',
    metrics: [['Sprinty', '247'], ['Ukończono', '93%'], ['Horyzont', '2026']],
  },
  insights: {
    cam: 'windows',
    badge: 'AI INSIGHTS & SUSTAINABLE FUTURE',
    title: 'Predykcje AI na Tle Panoramy Zachodu Słońca',
    desc: 'Prawe szklane panele HUD przy panoramicznych oknach łączą prognozy AI (+34%) z celami ESG: redukcją CO₂ (−42%) i zużycia energii (−38%).',
    metrics: [['Prognoza', '+34%'], ['Energia', '-38%'], ['CO₂', '-42%']],
  },
};

const state = {
  scale: 1.0,
  targetScale: 1.0,
  panX: 0,
  targetPanX: 0,
  panY: 0,
  targetPanY: 0,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  camPos: new THREE.Vector3(...VIEW_PRESETS.boardroom.camPos),
  targetCamPos: new THREE.Vector3(...VIEW_PRESETS.boardroom.camPos),
  camLook: new THREE.Vector3(...VIEW_PRESETS.boardroom.camLook),
  targetCamLook: new THREE.Vector3(...VIEW_PRESETS.boardroom.camLook),
  userYaw: 0,
  dragging: false,
  lastX: 0,
};

function setPreset(key) {
  const p = VIEW_PRESETS[key];
  if (!p) return;
  state.targetScale = p.scale;
  state.targetPanX = p.panX;
  state.targetPanY = p.panY;
  state.targetCamPos.set(...p.camPos);
  state.targetCamLook.set(...p.camLook);
  document.querySelectorAll('.cam-btn[data-cam]').forEach((b) => {
    b.classList.toggle('active', b.dataset.cam === key);
  });
}

function selectPanel(key) {
  const info = PANEL_INFO[key];
  if (!info) return;
  setPreset(info.cam);
  document.getElementById('insp-badge').textContent = info.badge;
  document.getElementById('insp-title').textContent = info.title;
  document.getElementById('insp-desc').textContent = info.desc;
  document.getElementById('insp-metrics').innerHTML = info.metrics
    .map(([k, v]) => `<div class="metric"><span>${k}</span><strong>${v}</strong></div>`)
    .join('');
  document.querySelectorAll('.hotspot').forEach((h) => {
    h.classList.toggle('active', h.dataset.panel === key);
  });
}

document.querySelectorAll('.cam-btn[data-cam]').forEach((btn) => {
  btn.addEventListener('click', () => setPreset(btn.dataset.cam));
});

document.querySelectorAll('.hotspot').forEach((btn) => {
  btn.addEventListener('click', () => selectPanel(btn.dataset.panel));
});

document.getElementById('btn-toggle-hud').addEventListener('click', (e) => {
  const hidden = document.body.classList.toggle('hud-hidden');
  e.currentTarget.textContent = hidden ? 'Pokaż HUD' : 'Ukryj HUD';
});

const screensOverlay = document.getElementById('screens-overlay');
const btnToggleScreens = document.getElementById('btn-toggle-screens');
if (btnToggleScreens && screensOverlay) {
  btnToggleScreens.addEventListener('click', () => {
    const isHidden = screensOverlay.classList.toggle('hidden');
    btnToggleScreens.classList.toggle('active', !isHidden);
  });
}

function setScreenActive(code, active) {
  const plane = document.querySelector(`.screen-plane[data-screen="${code}"]`);
  if (plane) plane.classList.toggle('selected', active);
  const imgEl = document.querySelector(`[data-screen-img="${code}"]`);
  if (imgEl) imgEl.classList.toggle('dimmed', !active);
  const sbBtn = document.querySelector(`[data-sb-screen="${code}"]`);
  if (sbBtn) sbBtn.classList.toggle('active', active);
}

document.querySelectorAll('.screen-plane').forEach((plane) => {
  plane.addEventListener('click', () => {
    const code = plane.dataset.screen;
    const title = plane.dataset.title || code;
    const nextActive = !plane.classList.contains('selected');
    setScreenActive(code, nextActive);
    document.getElementById('insp-badge').textContent = `WARSTWA ${code} · ${nextActive ? 'AKTYWNA W PARALAKSIE' : 'WYŁĄCZONA'}`;
    document.getElementById('insp-title').textContent = title;
    document.getElementById('insp-desc').textContent = nextActive
      ? 'Osobna warstwa graficzna ekranu w wielowarstwowej paralaksie 3D. Kliknij ponownie, aby przygasić.'
      : 'Warstwa ekranu przygaszona. Kliknij ponownie lub użyj „Przywróć wszystkie” w pasku bocznym.';
  });
});

document.querySelectorAll('[data-sb-screen]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const code = btn.dataset.sbScreen;
    const nextActive = !btn.classList.contains('active');
    setScreenActive(code, nextActive);
  });
});

const btnRestoreScreens = document.getElementById('btn-restore-screens');
if (btnRestoreScreens) {
  btnRestoreScreens.addEventListener('click', () => {
    ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'H0'].forEach((c) => setScreenActive(c, true));
    document.getElementById('insp-badge').textContent = 'WSZYSTKIE EKRANY PRZYWRÓCONE';
    document.getElementById('insp-title').textContent = 'E1–E9 + H0 aktywne';
    document.getElementById('insp-desc').textContent = 'Wszystkie 9 wyodrębnionych ekranów oraz centralny hologram 3D zostały przywrócone.';
  });
}

window.addEventListener('mousemove', (e) => {
  state.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  state.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  if (state.dragging) {
    const dx = e.clientX - state.lastX;
    state.lastX = e.clientX;
    state.userYaw += dx * 0.01;
  }
});

stageFrame.addEventListener('mousedown', (e) => {
  if (e.target.closest('.screen-plane')) return;
  state.dragging = true;
  state.lastX = e.clientX;
});
window.addEventListener('mouseup', () => { state.dragging = false; });

window.addEventListener('resize', () => {
  const { w, h } = getFrameSize();
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ============================================================================
// 60FPS ANIMATION LOOP
// ============================================================================
const startTime = performance.now();

function animate(now) {
  const t = (now - startTime) / 1000;

  // Smooth damping for 6DoF parallax & preset camera transitions
  state.scale += (state.targetScale - state.scale) * 0.06;
  state.panX += (state.targetPanX - state.panX) * 0.06;
  state.panY += (state.targetPanY - state.panY) * 0.06;
  state.mouseX += (state.targetMouseX - state.mouseX) * 0.06;
  state.mouseY += (state.targetMouseY - state.mouseY) * 0.06;
  state.camPos.lerp(state.targetCamPos, 0.06);
  state.camLook.lerp(state.targetCamLook, 0.06);

  // Pronounced multi-depth parallax + gentle ambient breathing drift so 3D layer separation is unmistakable
  const idleDriftX = reducedMotion ? 0 : Math.sin(t * 0.45) * 0.25;
  const idleDriftY = reducedMotion ? 0 : Math.cos(t * 0.35) * 0.14;
  const effX = state.mouseX + idleDriftX;
  const effY = state.mouseY + idleDriftY;

  parallaxLayers.forEach((layer) => {
    const depth = parseFloat(layer.dataset.depth || '1');
    const lx = state.panX - effX * 2.4 * depth;
    const ly = state.panY - effY * 1.5 * depth;
    const lScale = state.scale + (depth - 0.9) * 0.02;
    layer.style.transform = `translate3d(${lx.toFixed(2)}%, ${ly.toFixed(2)}%, 0) scale(${lScale.toFixed(4)})`;
  });

  // Matched diagonal Three.js camera synchronized with the exact same parallax vector
  camera.position.set(
    state.camPos.x + effX * 0.48,
    state.camPos.y - effY * 0.24,
    state.camPos.z
  );
  camera.lookAt(state.camLook);

  if (!reducedMotion) {
    skylineGroup.rotation.y = state.userYaw + Math.sin(t * 0.35) * 0.18;
    radarRings.forEach((r) => {
      r.mesh.rotation.z += r.speed * 0.016;
    });
    scanRing.position.y = 0.15 + ((t * 0.65) % 2.35);

    const posAttr = pGeo.getAttribute('position');
    for (let i = 0; i < pCount; i++) {
      let y = posAttr.getY(i) + 0.007;
      if (y > 2.8) y = 0.04;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  }

  renderer.render(scene, camera);
  if (!reducedMotion) requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
