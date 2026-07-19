import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ================= CONFIG ================= */

// Sinkron dengan WARNA.md — daftar filament asli
const COLORS = [
  { id: 'bk', name: 'Black',           hex: '#000000' },
  { id: 'wh', name: 'White',           hex: '#FFFFFF' },
  { id: 'be', name: 'Beige',           hex: '#F0E0D6' },
  { id: 'gy', name: 'Grey',            hex: '#75787B' },
  { id: 'sv', name: 'Silver',          hex: '#C0C0C0' },
  { id: 'rd', name: 'Red',             hex: '#BC2726' },
  { id: 'or', name: 'Sunny Orange',    hex: '#ED7334' },
  { id: 'pk', name: 'Pink',            hex: '#F4A6C1' },
  { id: 'sk', name: 'Sakura Pink',     hex: '#F7C6D9' },
  { id: 'mg', name: 'Magenta',         hex: '#C52E79' },
  { id: 'lv', name: 'Lavender Purple', hex: '#685BC7' },
  { id: 'bl', name: 'Klein Blue',      hex: '#1729AB' },
  { id: 'cy', name: 'Cyan',            hex: '#00A3E0' },
  { id: 'yl', name: 'Yellow',          hex: '#FFF13F' },
  { id: 'vy', name: 'Vivid Yellow',    hex: '#EAC642' },
  { id: 'gr', name: 'Green',           hex: '#1DAA27' },
  { id: 'gg', name: 'Grass Green',     hex: '#4CAF50' },
  { id: 'ol', name: 'Olive Green',     hex: '#5A6D3D' },
  { id: 'ch', name: 'Chocolate',       hex: '#5C3A21' },
  { id: 'cf', name: 'Coffee',          hex: '#362111' },
];
const C = Object.fromEntries(COLORS.map(c => [c.id, c]));

const PRESETS = [
  { id: 'candy',    name: 'Candy Parade', base: ['rd','or','yl','gr','cy','lv'], cap: ['wh'], glyph: ['rd','or','vy','gr','cy','lv'] },
  // superhero
  { id: 'spidey',   name: 'Spidey',       base: ['rd'], cap: ['bl'], glyph: ['wh'] },
  { id: 'superman', name: 'Superman',     base: ['bl'], cap: ['rd'], glyph: ['yl'] },
  { id: 'batman',   name: 'Batman',       base: ['bk'], cap: ['gy'], glyph: ['yl'] },
  { id: 'hulk',     name: 'Hulk',         base: ['gr'], cap: ['lv'], glyph: ['wh'] },
  { id: 'ironman',  name: 'Iron Man',     base: ['rd'], cap: ['vy'], glyph: ['wh'] },
  // kartun
  { id: 'minion',   name: 'Minion',       base: ['bl'], cap: ['vy'], glyph: ['bk'] },
  { id: 'doraemon', name: 'Doraemon',     base: ['cy'], cap: ['wh'], glyph: ['rd'] },
  { id: 'pikachu',  name: 'Pikachu',      base: ['yl'], cap: ['rd'], glyph: ['wh'] },
  { id: 'kitty',    name: 'Kitty',        base: ['wh'], cap: ['pk'], glyph: ['rd'] },
];

const SYMBOLS = [
  { key: 'star',       emoji: '⭐', label: 'Bintang' },
  { key: 'heart',      emoji: '❤️', label: 'Hati' },
  { key: 'flower',     emoji: '🌸', label: 'Bunga' },
  { key: 'moon',       emoji: '🌙', label: 'Bulan' },
  { key: 'cloud',      emoji: '☁️', label: 'Awan' },
  { key: 'clover',     emoji: '🍀', label: 'Semanggi' },
  { key: 'ribbon',     emoji: '🎀', label: 'Pita' },
  { key: 'cat',        emoji: '🐱', label: 'Kucing' },
  { key: 'paw',        emoji: '🐾', label: 'Paw' },
  { key: 'duck',       emoji: '🦆', label: 'Bebek' },
  { key: 'fire',       emoji: '🔥', label: 'Api' },
  { key: 'lightning',  emoji: '⚡', label: 'Petir' },
  { key: 'music_note', emoji: '🎵', label: 'Nada' },
  { key: 'coffee',     emoji: '☕', label: 'Kopi' },
  { key: 'airplane',   emoji: '✈️', label: 'Pesawat' },
];
const SYM_BY_EMOJI = Object.fromEntries(SYMBOLS.map(s => [s.emoji, s]));
const SYM_BY_KEY = Object.fromEntries(SYMBOLS.map(s => [s.key, s]));

const CONFIG = {
  maxBlocks: 10,
  brightness: 0.44,               // <-- kenop terang-gelap render: 1.0 = terang penuh, coba 0.7–0.9
  priceFirstBlock: 23000,        // <-- harga blok/huruf pertama
  priceNextBlock: 6000,          // <-- tambahan harga per blok berikutnya
  shopeeUrl: 'https://shopee.co.id/GANTI_DENGAN_LINK_TOKO',   // <-- link listing Shopee
  waNumber: 'GANTI_NOMOR_WA',    // format 628xxxxxxxxxx tanpa +
  layout: {
    pitch: 27,          // jarak antar blok (mm) — silakan fine-tune
    capsOffset: { x: -4.08, y: 9.438 },  // posisi keycap di atas base (dari file Assembly)
    capYaw: 0,          // rotasi keycap: 0, 90, 180, 270 (derajat) kalau huruf kebalik
    connectorX: -21,    // posisi end connector
    pressDepth: 1.4,    // seberapa dalam keycap turun saat diklik (mm)
  },
};

const DEFAULTS = { base: 'pk', cap: 'mg', glyph: 'wh' };

/* ================= STATE ================= */

// each block: { t: 'A' (letter/digit) or '@star' (symbol), base, cap, glyph }
let blocks = [];
let selected = -1;
let activePreset = 'candy';
let orientation = 'd'; // default vertikal — 'r' lobang kanan | 'l' lobang kiri | 'd' vertikal, lobang atas

const rupiah = n => 'Rp ' + n.toLocaleString('id-ID');
const totalPrice = () => blocks.length
  ? CONFIG.priceFirstBlock + (blocks.length - 1) * CONFIG.priceNextBlock
  : 0;
const tokenLabel = t => t.startsWith('@') ? SYM_BY_KEY[t.slice(1)].emoji : t;
const tokenName = t => t.startsWith('@') ? SYM_BY_KEY[t.slice(1)].label : t;

function applyPreset(p) {
  blocks.forEach((b, i) => {
    b.base = p.base[i % p.base.length];
    b.cap = p.cap[i % p.cap.length];
    b.glyph = p.glyph[i % p.glyph.length];
  });
}

/* ================= THREE ================= */

const viewer = document.getElementById('viewer');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping; // warna tampil apa adanya sesuai hex palet
viewer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 1, 2000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;          // geser: 2 jari di HP, klik-kanan/tengah di desktop
controls.screenSpacePanning = true; // geser mengikuti arah layar, lebih natural
controls.minDistance = 40;
controls.maxDistance = 500;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ambient kuat + key light dari arah kamera: sisi yang dilihat user selalu terang
const BR = CONFIG.brightness;
scene.add(new THREE.AmbientLight(0xffffff, 0.85 * BR)); // kompensasi env yang dimatikan di material
const dir = new THREE.DirectionalLight(0xffffff, 0.65 * BR);
dir.position.set(30, 80, 120);
scene.add(dir);
const fill = new THREE.DirectionalLight(0xfff0f5, 0.2 * BR);
fill.position.set(-60, 30, -80);
scene.add(fill);

// soft contact shadow (radial gradient sprite)
function makeShadowTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(90,60,80,0.30)');
  grad.addColorStop(1, 'rgba(90,60,80,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(cv);
}
const shadowMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false })
);
shadowMesh.rotation.x = -Math.PI / 2;
shadowMesh.position.y = -9;
scene.add(shadowMesh);

const chainRoot = new THREE.Group();
scene.add(chainRoot);

/* ---- load parts ---- */

const parts = {}; // name -> BufferGeometry
let partsReady = false;

new GLTFLoader().load('assets/parts.glb', (gltf) => {
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    let n = o.name || o.parent?.name || '';
    // trimesh may nest mesh under a named node
    if (!n || /^mesh/i.test(n)) n = o.parent?.name || n;
    parts[n] = o.geometry;
  });
  partsReady = true;
  rebuildChain();
}, undefined, (err) => {
  console.error(err);
  toast('Gagal memuat model 3D 😢 — cek assets/parts.glb');
});

function getGeom(name) {
  if (parts[name]) return parts[name];
  const k = Object.keys(parts).find(x => x === name || x.startsWith(name + '_') || x.endsWith(name));
  return k ? parts[k] : null;
}

/* ---- materials ---- */

const matCache = {};
function matFor(colorId) {
  if (!matCache[colorId]) {
    matCache[colorId] = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(C[colorId].hex),
      roughness: 0.7,           // matte penuh, ala PLA doff
      metalness: 0.0,
      specularIntensity: 0.2,   // sedikit kilap plastik; >0.3 mulai silau di sudut miring
      envMapIntensity: 0.0,     // tanpa cuci-putih dari environment; warna murni dari lampu diffuse
    });
  }
  return matCache[colorId];
}
const goldMat = new THREE.MeshStandardMaterial({ color: 0xD8A93A, roughness: 0.25, metalness: 0.9 });

/* ---- chain building ---- */

// Orientasi rangkaian. Basis memetakan sumbu 3MF (X, Y=arah hook, Z=atas base) ke dunia.
// Keycap punya rotasi sendiri supaya huruf SELALU tegak menghadap pemirsa.
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ORIENTS = {
  r: { // mendatar, lobang di ujung kanan (hook -> +X)
    label: 'kanan',
    basePos: (i, P) => V(i * P, 0, 0),
    baseBasis: new THREE.Matrix4().makeBasis(V(0, 0, 1), V(1, 0, 0), V(0, 1, 0)),
    capsRot: new THREE.Euler(-Math.PI / 2, 0, 0),
    capsOff: off => V(off.x, off.y, 0),
    pressDir: V(0, -1, 0),
  },
  l: { // mendatar, lobang di ujung kiri (hook -> -X)
    label: 'kiri',
    basePos: (i, P) => V(i * P, 0, 0),
    baseBasis: new THREE.Matrix4().makeBasis(V(0, 0, -1), V(-1, 0, 0), V(0, 1, 0)),
    capsRot: new THREE.Euler(-Math.PI / 2, 0, 0),
    capsOff: off => V(-off.x, off.y, 0),
    pressDir: V(0, -1, 0),
  },
  d: { // pilihan vertikal (lobang di atas saat dipakai) — preview rebah seperti Kiri,
    // tapi keycap+huruf dipasang berputar 90°: saat digantung, huruf jadi tegak
    label: 'atas (vertikal)',
    basePos: (i, P) => V(i * P, 0, 0),
    baseBasis: new THREE.Matrix4().makeBasis(V(0, 0, -1), V(-1, 0, 0), V(0, 1, 0)),
    capsRot: new THREE.Euler(-Math.PI / 2, 0, Math.PI / 2),
    capsOff: off => V(-off.x, off.y, 0),
    pressDir: V(0, -1, 0),
  },
};
const blockGroups = []; // { group, capsGroup, meshes: {base, lock, caps, glyph} }

function rebuildChain() {
  if (!partsReady) return;
  while (chainRoot.children.length) chainRoot.remove(chainRoot.children[0]);
  blockGroups.length = 0;

  const L = CONFIG.layout;
  const n = blocks.length;

  const O = ORIENTS[orientation];

  blocks.forEach((b, i) => {
    const group = new THREE.Group();
    const homePos = O.basePos(i, L.pitch);
    group.position.copy(homePos);

    // base + lock (Z-up 3MF -> world basis sesuai orientasi)
    const baseHolder = new THREE.Group();
    baseHolder.quaternion.setFromRotationMatrix(O.baseBasis);
    const baseMesh = new THREE.Mesh(getGeom('base'), matFor(b.base).clone());
    const lockMesh = new THREE.Mesh(getGeom('lock'), matFor(b.base).clone());
    baseHolder.add(baseMesh, lockMesh);
    group.add(baseHolder);

    // keycap + glyph — holder terpisah supaya huruf selalu tegak & bisa animasi klik
    const capsGroup = new THREE.Group();
    const capsHome = O.capsOff(L.capsOffset);
    capsGroup.position.copy(capsHome);
    capsGroup.rotation.copy(O.capsRot);
    capsGroup.rotateZ(THREE.MathUtils.degToRad(L.capYaw));
    const capsMesh = new THREE.Mesh(getGeom('caps'), matFor(b.cap).clone());
    const glyphName = b.t.startsWith('@') ? 'sym_' + b.t.slice(1) : 'ch_' + b.t;
    const gg = getGeom(glyphName);
    const glyphMesh = gg ? new THREE.Mesh(gg, matFor(b.glyph).clone()) : null;
    capsGroup.add(capsMesh);
    if (glyphMesh) capsGroup.add(glyphMesh);
    group.add(capsGroup);

    group.userData.blockIndex = i;
    chainRoot.add(group);
    blockGroups.push({
      group, capsGroup, homePos, capsHome,
      pressDir: O.pressDir,
      meshes: { base: baseMesh, lock: lockMesh, caps: capsMesh, glyph: glyphMesh },
    });
  });

  // center rangkaian di origin
  const width = n > 0 ? (n - 1) * L.pitch : 0;
  chainRoot.position.set(-width / 2, 0, 0);
  shadowMesh.position.set(0, -9, 0);
  shadowMesh.scale.set(width + 90, 55, 1);

  fitCamera(width);
  applySelectionHighlight();
  refreshColors();
}

let userMovedCamera = false;
controls.addEventListener('start', () => { userMovedCamera = true; });

function fitCamera(width) {
  if (userMovedCamera && blocks.length) return; // don't fight the user
  const d = Math.max(110, width * 2.0 + 90);
  camera.position.set(0, d * 0.72, d * 0.82); // agak dari atas supaya huruf langsung terbaca
  controls.target.set(0, 2, 0);
  controls.update();
}

function refreshColors() {
  blockGroups.forEach((bg, i) => {
    const b = blocks[i];
    if (!b) return;
    bg.meshes.base.material.color.set(C[b.base].hex);
    bg.meshes.lock.material.color.set(C[b.base].hex);
    bg.meshes.caps.material.color.set(C[b.cap].hex);
    if (bg.meshes.glyph) bg.meshes.glyph.material.color.set(C[b.glyph].hex);
  });
}

// highlight seleksi: outline pink (inverted hull) — tidak mengubah warna material sama sekali
const outlineMat = new THREE.MeshBasicMaterial({ color: 0xE9578C, side: THREE.BackSide });

function applySelectionHighlight() {
  blockGroups.forEach((bg, i) => {
    const on = i === selected;
    // blok terpilih terangkat menjauhi arah tekan (ke atas / ke arah pemirsa)
    bg.group.position.copy(bg.homePos).addScaledVector(bg.pressDir, on ? -2.5 : 0);
    [bg.meshes.base, bg.meshes.caps].forEach(src => {
      [...src.parent.children].forEach(c => { if (c.userData.isOutline) src.parent.remove(c); });
      if (on) {
        const o = new THREE.Mesh(src.geometry, outlineMat);
        o.scale.setScalar(1.05);
        o.userData.isOutline = true;
        src.parent.add(o);
      }
    });
  });
}

/* ---- interaction: tap to select, tap keycap to click ---- */

const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let downAt = null;

renderer.domElement.addEventListener('pointerdown', e => { downAt = { x: e.clientX, y: e.clientY, t: Date.now() }; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  const dt = Date.now() - downAt.t;
  downAt = null;
  if (moved > 8 || dt > 400) return; // it was a drag

  const r = renderer.domElement.getBoundingClientRect();
  ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(chainRoot.children, true);
  if (!hits.length) return;

  let o = hits[0].object;
  let g = o;
  while (g && g.userData.blockIndex === undefined) g = g.parent;
  if (!g) return;
  const idx = g.userData.blockIndex;
  const bg = blockGroups[idx];

  // hit the keycap? play click. always select.
  const isCap = (o === bg.meshes.caps || o === bg.meshes.glyph);
  selectBlock(idx);
  if (isCap) pressAnim(bg);
});

function pressAnim(bg) {
  playClick();
  const g = bg.capsGroup;
  const t0 = performance.now();
  function step(t) {
    const e = (t - t0) / 150;
    if (e >= 1) { g.position.copy(bg.capsHome); return; }
    const k = e < 0.4 ? e / 0.4 : 1 - (e - 0.4) / 0.6;
    g.position.copy(bg.capsHome).addScaledVector(bg.pressDir, CONFIG.layout.pressDepth * k);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

let audioCtx = null;
function playClick() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2600, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.03);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.06);
  } catch { /* no audio, no problem */ }
}

/* ---- render loop ---- */

function resize() {
  const w = viewer.clientWidth, h = viewer.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewer);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

/* ================= UI ================= */

const $ = s => document.querySelector(s);
const nameInput = $('#name-input');
const blocksRow = $('#blocks-row');
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

/* theme toggle */
const themeBtn = $('#btn-theme');
function setTheme(t) {
  document.body.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('fc_theme', t); } catch { /* private mode */ }
}
themeBtn.addEventListener('click', () =>
  setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));
let savedTheme = 'dark';
try { savedTheme = localStorage.getItem('fc_theme') || 'dark'; } catch { /* private mode */ }
setTheme(savedTheme);

/* orientasi rangkaian */
document.querySelectorAll('#orient-row button').forEach(btn => {
  btn.addEventListener('click', () => setOrientation(btn.dataset.orient, true));
});
function setOrientation(o, announce) {
  orientation = ORIENTS[o] ? o : 'r';
  document.querySelectorAll('#orient-row button').forEach(b =>
    b.className = 'btn ' + (b.dataset.orient === orientation ? 'primary' : 'ghost'));
  userMovedCamera = false; // pasang ulang kamera sesuai orientasi baru
  onStateChanged();
  if (announce) toast(`Lobang gantungan: ${ORIENTS[orientation].label} ✔`);
}

/* steps nav */
document.querySelectorAll('#steps button').forEach(btn => {
  btn.addEventListener('click', () => showStep(btn.dataset.step));
});
function showStep(step) {
  document.querySelectorAll('#steps button').forEach(b => b.classList.toggle('active', b.dataset.step === step));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + step));
  if (step === 'pesan') renderOrder();
}

/* name input -> blocks */
const SYM_EMOJIS = SYMBOLS.map(s => s.emoji).sort((a, b) => b.length - a.length);
function parseInput(str) {
  const tokens = [];
  let s = str.toUpperCase();
  outer:
  while (s.length && tokens.length < CONFIG.maxBlocks) {
    for (const em of SYM_EMOJIS) {
      if (s.startsWith(em)) { tokens.push('@' + SYM_BY_EMOJI[em].key); s = s.slice(em.length); continue outer; }
    }
    const ch = s[0];
    if (/[A-Z0-9]/.test(ch)) tokens.push(ch);
    s = s.slice(1);
  }
  return tokens;
}
function tokensToString(tokens) {
  return tokens.map(tokenLabel).join('');
}

nameInput.addEventListener('input', () => {
  const tokens = parseInput(nameInput.value);
  const preset = PRESETS.find(p => p.id === activePreset) || PRESETS[0];
  blocks = tokens.map((t, i) => {
    const old = blocks[i];
    return {
      t,
      base: old ? old.base : preset.base[i % preset.base.length],
      cap: old ? old.cap : preset.cap[i % preset.cap.length],
      glyph: old ? old.glyph : preset.glyph[i % preset.glyph.length],
    };
  });
  const clean = tokensToString(tokens);
  if (nameInput.value.toUpperCase() !== clean) nameInput.value = clean;
  if (selected >= blocks.length) selectBlock(-1);
  onStateChanged();
});

function setBlocksFromState() {
  nameInput.value = tokensToString(blocks.map(b => b.t));
}

/* block chips */
function renderChips() {
  blocksRow.innerHTML = '';
  blocks.forEach((b, i) => {
    const chip = document.createElement('span');
    chip.className = 'block-chip' + (i === selected ? ' selected' : '');
    chip.innerHTML = `<span>${tokenLabel(b.t)}</span><span class="x">✕</span>`;
    chip.querySelector('.x').addEventListener('click', ev => {
      ev.stopPropagation();
      blocks.splice(i, 1);
      if (selected === i) selected = -1;
      else if (selected > i) selected--;
      setBlocksFromState();
      onStateChanged();
    });
    chip.addEventListener('click', () => { selectBlock(i); showStep('warna'); });
    blocksRow.appendChild(chip);
  });
}

/* symbols */
const symRow = $('#symbols-row');
SYMBOLS.forEach(s => {
  const b = document.createElement('button');
  b.textContent = s.emoji;
  b.title = s.label;
  b.addEventListener('click', () => {
    if (blocks.length >= CONFIG.maxBlocks) { toast(`Maksimal ${CONFIG.maxBlocks} blok ya!`); return; }
    nameInput.value = tokensToString(blocks.map(x => x.t)) + s.emoji;
    nameInput.dispatchEvent(new Event('input'));
  });
  symRow.appendChild(b);
});

/* presets */
const presetGrid = $('#preset-grid');
PRESETS.forEach(p => {
  const card = document.createElement('div');
  card.className = 'preset-card' + (p.id === activePreset ? ' active' : '');
  card.dataset.preset = p.id;
  const uniq = a => [...new Set(a)];
  const dots =
    uniq(p.base).slice(0, 6).map(cid => `<i style="background:${C[cid].hex}" title="base"></i>`).join('') +
    uniq(p.cap).slice(0, 3).map(cid => `<i style="background:${C[cid].hex};border-radius:50%" title="keycap"></i>`).join('') +
    uniq(p.glyph).slice(0, 3).map(cid => `<b style="color:${C[cid].hex}" title="huruf">A</b>`).join('');
  card.innerHTML = `<span class="pname">${p.name}</span><div class="dots">${dots}</div>`;
  card.addEventListener('click', () => {
    activePreset = p.id;
    document.querySelectorAll('.preset-card').forEach(c => c.classList.toggle('active', c.dataset.preset === p.id));
    applyPreset(p);
    onStateChanged();
    toast(`Palet ${p.name} diterapkan ✨`);
  });
  presetGrid.appendChild(card);
});

$('#btn-random').addEventListener('click', () => {
  const pick = () => COLORS[Math.floor(Math.random() * COLORS.length)].id;
  blocks.forEach(b => { b.base = pick(); b.cap = pick(); b.glyph = pick(); });
  onStateChanged();
  toast('Warna diacak! 🎲');
});

/* per-block editor */
function selectBlock(i) {
  selected = i;
  renderChips();
  renderEditor();
  applySelectionHighlight();
}

function renderEditor() {
  const body = $('#editor-body');
  const hint = $('#empty-hint');
  const title = $('#editor-title');
  if (selected < 0 || !blocks[selected]) {
    body.style.display = 'none'; hint.style.display = 'block';
    title.textContent = 'Pilih blok dulu';
    return;
  }
  const b = blocks[selected];
  body.style.display = 'block'; hint.style.display = 'none';
  title.textContent = `Blok ${selected + 1} — ${tokenName(b.t)}`;
  document.querySelectorAll('.swatch-row').forEach(row => {
    const layer = row.dataset.layer;
    const wrap = row.querySelector('.swatches');
    wrap.innerHTML = '';
    COLORS.forEach(c => {
      const i = document.createElement('i');
      i.style.background = c.hex;
      i.title = c.name;
      if (b[layer] === c.id) i.classList.add('on');
      i.addEventListener('click', () => { b[layer] = c.id; onStateChanged(); renderEditor(); });
      wrap.appendChild(i);
    });
  });
}

document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (selected < 0) return;
    const layer = btn.dataset.copy;
    blocks.forEach(b => { b[layer] = blocks[selected][layer]; });
    onStateChanged();
    toast('Diterapkan ke semua blok ✔');
  });
});
$('#btn-copy-block').addEventListener('click', () => {
  if (selected < 0) return;
  const src = blocks[selected];
  blocks.forEach(b => { b.base = src.base; b.cap = src.cap; b.glyph = src.glyph; });
  onStateChanged();
  toast('Kombinasi disalin ke semua blok ✔');
});

/* order */
function orderText() {
  if (!blocks.length) return '—';
  const name = tokensToString(blocks.map(b => b.t));
  const lines = blocks.map((b, i) =>
    `${i + 1}. ${tokenName(b.t)} — base ${C[b.base].name} · keycap ${C[b.cap].name} · huruf ${C[b.glyph].name}`);
  return [
    `🧩 FIDGET CLICKER CUSTOM — ${name} (${blocks.length} blok)`,
    `Lobang gantungan: ${ORIENTS[orientation].label}`,
    ...lines,
    `Estimasi: ${rupiah(totalPrice())}`,
    `Link desain: ${shareUrl()}`,
  ].join('\n');
}
function renderOrder() { $('#order-code').textContent = orderText(); }

$('#btn-copy-code').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(orderText());
    toast('Kode pesanan tersalin! 📋 Paste di catatan checkout Shopee ya');
  } catch { toast('Gagal menyalin — salin manual ya'); }
});
$('#btn-shopee').addEventListener('click', () => window.open(CONFIG.shopeeUrl, '_blank'));
$('#btn-wa').addEventListener('click', () => {
  window.open(`https://wa.me/${CONFIG.waNumber}?text=${encodeURIComponent('Halo kak! Mau pesan:\n\n' + orderText())}`, '_blank');
});

/* reset kamera */
$('#btn-resetcam').addEventListener('click', () => {
  userMovedCamera = false;
  rebuildChain(); // memanggil fitCamera sesuai orientasi aktif
});

/* screenshot */
$('#btn-shot').addEventListener('click', () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.href = renderer.domElement.toDataURL('image/png');
  a.download = `fidget-${tokensToString(blocks.map(b => b.t)) || 'custom'}.png`;
  a.click();
  toast('Gambar tersimpan 📷');
});

/* URL state */
function shareUrl() {
  const d = blocks.map(b => `${b.t}.${b.base}.${b.cap}.${b.glyph}`).join('-');
  const u = new URL(location.href);
  u.search = d ? '?d=' + encodeURIComponent(d) + '&o=' + orientation : '';
  return u.toString();
}
let urlTimer;
function syncUrl() {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => history.replaceState(null, '', shareUrl()), 300);
}
function loadFromUrl() {
  const q = new URLSearchParams(location.search);
  const o = q.get('o');
  if (o && ORIENTS[o]) orientation = o;
  const d = q.get('d');
  if (!d) return false;
  try {
    blocks = d.split('-').map(seg => {
      const [t, base, cap, glyph] = seg.split('.');
      if (!t || (!t.startsWith('@') && !/^[A-Z0-9]$/.test(t))) throw 0;
      if (t.startsWith('@') && !SYM_BY_KEY[t.slice(1)]) throw 0;
      return { t, base: C[base] ? base : DEFAULTS.base, cap: C[cap] ? cap : DEFAULTS.cap, glyph: C[glyph] ? glyph : DEFAULTS.glyph };
    }).slice(0, CONFIG.maxBlocks);
    return blocks.length > 0;
  } catch { blocks = []; return false; }
}

/* central refresh */
function onStateChanged() {
  renderChips();
  renderEditor();
  rebuildChain();
  $('#price').textContent = rupiah(totalPrice());
  renderOrder();
  syncUrl();
}

/* init */
if (!loadFromUrl()) {
  blocks = parseInput('FAE⭐').map((t, i) => {
    const p = PRESETS[0];
    return { t, base: p.base[i % p.base.length], cap: p.cap[i % p.cap.length], glyph: p.glyph[i % p.glyph.length] };
  });
}
setBlocksFromState();
setOrientation(orientation); // sekaligus memanggil onStateChanged()

/* debug hook (aman dibiarkan) */
window.__three = { scene, renderer, camera, parts, matCache, blockGroups, THREE };
