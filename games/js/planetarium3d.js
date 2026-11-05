/* Planetário Bhadock — Explore o Universo (3D). Three.js r187 (MIT) empacotado em js/vendor/three-planetario.min.js.
   Movimento ILUSTRATIVO (distâncias/velocidades comprimidas); dados educativos reais.
   Texturas: geradas por código (sem downloads). Para usar texturas reais, salve img/planetario/<id>.jpg
   e liste o id em data/games.json > planetTextures; elas substituem as geradas. */
import * as THREE from './vendor/three-planetario.min.js';
import { OrbitControls } from './vendor/three-planetario.min.js';

const B = window.Badot, t = (k, v) => B.t(k, v), esc = B.esc;
const mobile = matchMedia('(max-width: 900px)').matches || /Mobi|Android/i.test(navigator.userAgent);

/* d: diâmetro km · dist: milhões km · year · rot: rotação (dias terrestres; negativo = retrógrada) · g: gravidade m/s² · temp: °C médio · moons · tilt: inclinação do eixo (graus) */
const DATA = [
  { id: 'mercury', r: 1.6, a: 24, p: 88, rot: 58.6, tilt: 0.03, d: 4879, dist: 57.9, year: '88 d', g: 3.7, temp: 167, moons: '0', kind: 'rocky' },
  { id: 'venus', r: 2.6, a: 34, p: 225, rot: -243, tilt: 177, d: 12104, dist: 108.2, year: '225 d', g: 8.9, temp: 464, moons: '0', kind: 'rocky' },
  { id: 'earth', r: 2.7, a: 46, p: 365.25, rot: 1, tilt: 23.4, d: 12742, dist: 149.6, year: '365,25 d', g: 9.8, temp: 15, moons: '1', kind: 'rocky' },
  { id: 'mars', r: 2.1, a: 58, p: 687, rot: 1.03, tilt: 25.2, d: 6779, dist: 227.9, year: '687 d', g: 3.7, temp: -65, moons: '2', kind: 'rocky' },
  { id: 'jupiter', r: 6.4, a: 82, p: 4333, rot: 0.41, tilt: 3.1, d: 139820, dist: 778.5, year: '11,9 a', g: 24.8, temp: -110, moons: '90+', kind: 'giant' },
  { id: 'saturn', r: 5.4, a: 104, p: 10759, rot: 0.45, tilt: 26.7, d: 116460, dist: 1434, year: '29,5 a', g: 10.4, temp: -140, moons: '140+', kind: 'giant', ring: true },
  { id: 'uranus', r: 3.6, a: 124, p: 30687, rot: -0.72, tilt: 97.8, d: 50724, dist: 2871, year: '84 a', g: 8.9, temp: -195, moons: '28', kind: 'ice' },
  { id: 'neptune', r: 3.5, a: 142, p: 60190, rot: 0.67, tilt: 28.3, d: 49244, dist: 4495, year: '165 a', g: 11.2, temp: -200, moons: '16', kind: 'ice' }
];
const SUN_R = 9, ALL = ['sun'].concat(DATA.map(d => d.id));
let token = 0;

/* ---------- texturas procedurais (ruído 3D esférico, sem emendas) ---------- */
function hash(x, y, z, s) { let h = (x * 374761393 + y * 668265263 + z * 2147483647 + s * 1274126177) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const sm = v => v * v * (3 - 2 * v);
function vnoise(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi); let r = 0;
  for (let dz = 0; dz < 2; dz++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++)
    r += hash(xi + dx, yi + dy, zi + dz, s) * (dx ? xf : 1 - xf) * (dy ? yf : 1 - yf) * (dz ? zf : 1 - zf);
  return r;
}
function fbm(x, y, z, s, oct = 4) { let a = .5, f = 1, r = 0; for (let i = 0; i < oct; i++) { r += a * vnoise(x * f, y * f, z * f, s + i); f *= 2; a *= .5; } return r; }
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const clamp01 = v => Math.max(0, Math.min(1, v));
function ramp(stops, v) { v = clamp01(v); for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const k = (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]); return mix(stops[i - 1][1], stops[i][1], k); } return stops[stops.length - 1][1]; }

const STYLE = {
  sun: (n, lat, f) => { const v = fbm(n.x * 3, n.y * 3, n.z * 3, 1, 5); return ramp([[0, [210, 70, 8]], [.45, [255, 150, 20]], [.75, [255, 210, 70]], [1, [255, 250, 200]]], v * 1.25); },
  mercury: (n) => { const v = fbm(n.x * 5, n.y * 5, n.z * 5, 7, 5); return mix([88, 84, 80], [190, 184, 174], v); },
  venus: (n, lat) => { const v = fbm(n.x * 2.2, n.y * 5 + fbm(n.x * 3, n.y * 3, n.z * 3, 3) * 1.4, n.z * 2.2, 11, 4); return mix([200, 150, 70], [250, 226, 160], v); },
  earth: (n, lat) => {
    const h = fbm(n.x * 2.4, n.y * 2.4, n.z * 2.4, 21, 5); const ice = Math.abs(lat) > .82 + (fbm(n.x * 6, n.y * 6, n.z * 6, 5) - .5) * .12;
    if (ice) return [238, 244, 250];
    if (h < .5) return mix([8, 28, 90], [22, 90, 160], clamp01((h - .3) / .2));
    if (h < .53) return [214, 196, 140];
    const m = fbm(n.x * 7, n.y * 7, n.z * 7, 9); return h < .66 ? mix([36, 112, 52], [96, 120, 56], m) : mix([120, 96, 62], [190, 180, 160], clamp01((h - .66) / .2));
  },
  mars: (n, lat) => { const v = fbm(n.x * 3.4, n.y * 3.4, n.z * 3.4, 31, 5); let c = mix([120, 52, 28], [214, 128, 80], v); if (Math.abs(lat) > .88) c = mix(c, [245, 245, 250], .85); return c; },
  jupiter: (n, lat) => { const w = fbm(n.x * 4, n.y * 2, n.z * 4, 41, 4); const b = Math.sin((lat + w * .18) * 22) * .5 + .5; return ramp([[0, [128, 84, 58]], [.35, [196, 150, 108]], [.65, [232, 208, 172]], [1, [250, 238, 214]]], b * .85 + w * .25); },
  saturn: (n, lat) => { const w = fbm(n.x * 3, n.y * 2, n.z * 3, 51, 3); const b = Math.sin((lat + w * .1) * 18) * .5 + .5; return mix([180, 150, 100], [240, 222, 170], b * .8 + w * .2); },
  uranus: (n, lat) => { const b = Math.sin(lat * 10) * .5 + .5; const w = fbm(n.x * 2, n.y * 2, n.z * 2, 61, 3); return mix([112, 200, 210], [190, 240, 244], b * .4 + w * .4); },
  neptune: (n, lat) => { const w = fbm(n.x * 3, n.y * 2.5, n.z * 3, 71, 4); const b = Math.sin(lat * 14 + w * 3) * .5 + .5; return mix([28, 52, 160], [90, 140, 240], b * .5 + w * .45); }
};
function makeTexture(id) {
  const W = mobile ? 256 : 512, H = W / 2, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) { const lat = 1 - 2 * (y + .5) / H, ph = Math.asin(lat), cy = Math.cos(ph);
    for (let x = 0; x < W; x++) { const th = (x + .5) / W * Math.PI * 2, n = { x: Math.cos(th) * cy, y: lat, z: Math.sin(th) * cy }; const c = STYLE[id](n, lat); const i = (y * W + x) * 4; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255; } }
  ctx.putImageData(img, 0, 0);
  if (id === 'mercury' || id === 'mars') { // crateras
    const cnt = id === 'mercury' ? 70 : 26; for (let k = 0; k < cnt; k++) { const x = Math.random() * W, y = H * .12 + Math.random() * H * .76, r = 1.5 + Math.random() * (id === 'mercury' ? 7 : 5); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fillStyle = 'rgba(30,25,22,.28)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,240,220,.22)'; ctx.stroke(); } }
  if (id === 'jupiter') { ctx.save(); ctx.translate(W * .62, H * .6); const g = ctx.createRadialGradient(0, 0, 1, 0, 0, H * .09); g.addColorStop(0, 'rgba(176,60,36,.95)'); g.addColorStop(1, 'rgba(176,60,36,0)'); ctx.scale(1.8, 1); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, H * .09, 0, 6.283); ctx.fill(); ctx.restore(); }
  if (id === 'neptune') { const g = ctx.createRadialGradient(W * .4, H * .55, 1, W * .4, H * .55, H * .07); g.addColorStop(0, 'rgba(10,20,80,.8)'); g.addColorStop(1, 'rgba(10,20,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W * .4, H * .55, H * .07, 0, 6.283); ctx.fill(); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.userData.canvas = cv; return tex;
}
function cloudTexture() {
  const W = mobile ? 256 : 512, H = W / 2, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) { const lat = 1 - 2 * (y + .5) / H, cy = Math.cos(Math.asin(lat)); for (let x = 0; x < W; x++) { const th = (x + .5) / W * 6.283, v = fbm(Math.cos(th) * cy * 3, lat * 3, Math.sin(th) * cy * 3, 91, 5); const a = clamp01((v - .5) * 3.2); const i = (y * W + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a * 190; } }
  ctx.putImageData(img, 0, 0); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
function ringTexture() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 4; const ctx = cv.getContext('2d'); const g = ctx.createLinearGradient(0, 0, 512, 0);
  [[0, 'rgba(180,160,120,0)'], [.08, 'rgba(190,170,130,.55)'], [.2, 'rgba(230,210,165,.85)'], [.36, 'rgba(150,130,100,.35)'], [.42, 'rgba(235,215,170,.9)'], [.7, 'rgba(220,200,155,.8)'], [.85, 'rgba(160,140,105,.4)'], [1, 'rgba(180,160,120,0)']].forEach(s => g.addColorStop(s[0], s[1]));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 4); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
function glowTexture() { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,230,160,1)'); g.addColorStop(.25, 'rgba(255,170,60,.55)'); g.addColorStop(.6, 'rgba(255,110,30,.16)'); g.addColorStop(1, 'rgba(255,100,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv); }

/* ---------- view ---------- */
B.views.planetario = () => `
  <section class="pl-wrap pl3" id="plWrap" aria-labelledby="plTitle">
    <canvas id="plCanvas" tabindex="0" role="img" aria-label="${esc(t('pl.canvasAlt'))}"></canvas>
    <div class="pl-load" id="plLoad"><div class="spinner" role="status"></div><span>${esc(t('pl.loading'))}</span></div>
    <div class="pl-top"><div><p class="kicker mb-1">Planetário Bhadock</p><h1 id="plTitle">${esc(t('pl.title'))}</h1></div><span class="chip warn pl-ill"><i class="bi bi-info-circle"></i> ${esc(t('pl.illustrative'))}</span></div>
    <div class="pl-labels" id="plLabels" aria-hidden="true"></div>
    <nav class="pl-list" aria-label="${esc(t('pl.bodies'))}">${ALL.map(id => `<button type="button" data-body="${id}">${esc(t('pl.' + id))}</button>`).join('')}</nav>
    <aside class="pl-info" id="plInfo" aria-live="polite"></aside>
    <div class="pl-ctrl" role="group" aria-label="${esc(t('pl.controls'))}">
      <button class="icon-btn" id="plPlay" aria-label="${esc(t('pl.pause'))}"><i class="bi bi-pause-fill"></i></button>
      <label class="pl-range"><span>${esc(t('pl.speed'))}</span><input type="range" id="plSpeed" min="0" max="100" value="40"><output id="plSpeedO"></output></label>
      <button class="icon-btn" id="plZm" aria-label="${esc(t('pl.zoomOut'))}"><i class="bi bi-zoom-out"></i></button>
      <button class="icon-btn" id="plZp" aria-label="${esc(t('pl.zoomIn'))}"><i class="bi bi-zoom-in"></i></button>
      <button class="icon-btn" id="plOrb" aria-pressed="true" aria-label="${esc(t('pl.orbits'))}" title="${esc(t('pl.orbits'))}"><i class="bi bi-bullseye"></i></button>
      <button class="icon-btn" id="plLab" aria-pressed="true" aria-label="${esc(t('pl.labels'))}" title="${esc(t('pl.labels'))}"><i class="bi bi-tag"></i></button>
      <button class="icon-btn" id="plReset" aria-label="${esc(t('pl.reset'))}" title="${esc(t('pl.reset'))}"><i class="bi bi-arrow-counterclockwise"></i></button>
    </div>
    <p class="pl-hint">${esc(t('pl.hint3d'))}</p>
  </section>`;

B.views['planetario:after'] = app => {
  const my = ++token, wrap = app.querySelector('#plWrap'), cv = app.querySelector('#plCanvas'), $ = s => app.querySelector(s);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !mobile, powerPreference: 'high-performance' }); } catch (e) { $('#plLoad').innerHTML = '<span>' + esc(t('pl.noWebgl')) + '</span>'; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x02030a);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000), HOME = new THREE.Vector3(0, 95, 190);
  camera.position.copy(HOME);
  const controls = new OrbitControls(camera, cv); controls.enableDamping = true; controls.dampingFactor = .07; controls.minDistance = 4; controls.maxDistance = 520; controls.rotateSpeed = .7; controls.zoomSpeed = .9; controls.screenSpacePanning = true;
  scene.add(new THREE.AmbientLight(0x6b7aa8, 0.28));
  const sunLight = new THREE.PointLight(0xfff0d0, 5200, 0, 2); scene.add(sunLight);

  // estrelas
  { const N = mobile ? 1800 : 4500, pos = new Float32Array(N * 3), col = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const r = 700 + Math.random() * 500, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3); const k = .6 + Math.random() * .4, w = Math.random(); col.set([k * (w > .8 ? 1 : .85), k * .9, k * (w < .3 ? 1 : .8)], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: mobile ? 2.2 : 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .9 }))); }

  const seg = mobile ? 40 : 64, bodies = {}, clickable = [], thumbs = {};
  const sunTex = makeTexture('sun'); thumbs.sun = sunTex.userData.canvas.toDataURL('image/jpeg', .8);
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(SUN_R, seg, seg), new THREE.MeshBasicMaterial({ map: sunTex })); scene.add(sunMesh);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); glow.scale.setScalar(SUN_R * 6.5); scene.add(glow);
  sunMesh.userData.id = 'sun'; clickable.push(sunMesh); bodies.sun = { id: 'sun', mesh: sunMesh, r: SUN_R, anchor: sunMesh };

  const orbitGroup = new THREE.Group(); scene.add(orbitGroup);
  DATA.forEach((d, i) => {
    const pivot = new THREE.Group(); scene.add(pivot);               // posição orbital
    const tilt = new THREE.Group(); tilt.rotation.z = THREE.MathUtils.degToRad(d.tilt > 90 ? 180 - d.tilt : d.tilt); pivot.add(tilt);
    const tex = makeTexture(d.id); thumbs[d.id] = tex.userData.canvas.toDataURL('image/jpeg', .8);
    const mat = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: d.kind === 'rocky' ? 1.2 : .3, roughness: .95, metalness: 0 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(d.r, seg, seg), mat); mesh.userData.id = d.id; tilt.add(mesh); clickable.push(mesh);
    const b = bodies[d.id] = { id: d.id, d, pivot, mesh, tilt, r: d.r, phase: i * 1.9 + .6, anchor: pivot, tex };
    if (d.id === 'earth') { b.clouds = new THREE.Mesh(new THREE.SphereGeometry(d.r * 1.018, seg, seg), new THREE.MeshStandardMaterial({ map: cloudTexture(), transparent: true, depthWrite: false, roughness: 1 })); tilt.add(b.clouds);
      b.atm = new THREE.Mesh(new THREE.SphereGeometry(d.r * 1.07, 32, 32), new THREE.MeshBasicMaterial({ color: 0x4f9cff, transparent: true, opacity: .1, depthWrite: false })); tilt.add(b.atm);
      b.moonPivot = new THREE.Group(); pivot.add(b.moonPivot); b.moon = new THREE.Mesh(new THREE.SphereGeometry(.75, 24, 24), new THREE.MeshStandardMaterial({ color: 0xbdbdc4, roughness: 1 })); b.moon.position.x = d.r * 3.4; b.moonPivot.add(b.moon); }
    if (d.ring) { const rg = new THREE.RingGeometry(d.r * 1.35, d.r * 2.5, 128), p = rg.attributes.position, uv = rg.attributes.uv, v = new THREE.Vector3(); for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); uv.setXY(k, (v.length() - d.r * 1.35) / (d.r * 1.15), .5); }
      const ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ map: ringTexture(), side: THREE.DoubleSide, transparent: true, depthWrite: false })); ring.rotation.x = Math.PI / 2; tilt.add(ring); }
    // órbita
    const pts = []; for (let k = 0; k <= 160; k++) { const a = k / 160 * 6.283; pts.push(Math.cos(a) * d.a, 0, Math.sin(a) * d.a); }
    const og = new THREE.BufferGeometry(); og.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const line = new THREE.LineLoop(og, new THREE.LineBasicMaterial({ color: 0x5f8cff, transparent: true, opacity: .28 })); orbitGroup.add(line); b.line = line;
    // textura real opcional
    if ((B.data.planetTextures || []).indexOf(d.id) >= 0) { const im = new Image(); im.onload = () => { const tx = new THREE.Texture(im); tx.colorSpace = THREE.SRGBColorSpace; tx.needsUpdate = true; mat.map = tx; mat.bumpMap = tx; mat.needsUpdate = true; thumbs[d.id] = im.src; if (sel === d.id) info(); }; im.src = B.url('img/planetario/' + d.id + '.jpg'); }
  });
  // cinturão de asteroides
  { const N = mobile ? 500 : 1400, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const a = Math.random() * 6.283, r = 66 + Math.random() * 10; pos.set([Math.cos(a) * r, (Math.random() - .5) * 1.6, Math.sin(a) * r], i * 3); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xb9ada0, size: .5, sizeAttenuation: true }))); }

  /* ---------- estado ---------- */
  let sel = 'sun', paused = B.reduced, speed = 40, simDays = 0, following = true, showLab = true, anim = null;
  const daysPerSec = () => speed === 0 ? 0 : Math.pow(1.065, speed) * 1.2;
  const eff = p => 365 * Math.pow(p / 365, 0.62);
  const tmpV = new THREE.Vector3(), fmt = n => B.lang === 'en-US' ? String(n) : String(n).replace('.', ',');
  const worldPos = id => { const b = bodies[id]; return b.anchor.getWorldPosition(new THREE.Vector3()); };

  function info() {
    const box = $('#plInfo'), b = bodies[sel], d = b.d;
    const facts = [1, 2, 3].map(n => `<li>${esc(t('pl.' + sel + '.f' + n))}</li>`).join('');
    const head = `<div class="pl-ihead"><img class="pl-thumb" src="${thumbs[sel]}" alt="${esc(t('pl.thumbAlt', [t('pl.' + sel)]))}" width="72" height="72"><div><h2>${esc(t('pl.' + sel))}</h2><p class="chip">${esc(t('pl.type.' + (sel === 'sun' ? 'star' : d.kind)))}</p></div></div>`;
    box.innerHTML = sel === 'sun' ? `${head}<dl class="spec"><dt>${esc(t('pl.diameter'))}</dt><dd>1.391.000 km</dd><dt>${esc(t('pl.share'))}</dt><dd>99,8%</dd><dt>${esc(t('pl.temp'))}</dt><dd>5.500 °C (${esc(t('pl.surface'))})</dd></dl><ul class="check">${facts}</ul>`
      : `${head}<dl class="spec"><dt>${esc(t('pl.diameter'))}</dt><dd>${d.d.toLocaleString(B.lang)} km</dd><dt>${esc(t('pl.distance'))}</dt><dd>${d.dist.toLocaleString(B.lang)} ${esc(t('pl.millionKm'))}</dd><dt>${esc(t('pl.year'))}</dt><dd>${esc(d.year)}</dd><dt>${esc(t('pl.rotation'))}</dt><dd>${Math.abs(d.rot) < 2 ? fmt((Math.abs(d.rot) * 24).toFixed(1)) + ' h' : fmt(Math.abs(d.rot)) + ' ' + esc(t('pl.days'))}${d.rot < 0 ? ' (' + esc(t('pl.retro')) + ')' : ''}</dd><dt>${esc(t('pl.gravity'))}</dt><dd>${fmt(d.g)} m/s²</dd><dt>${esc(t('pl.temp'))}</dt><dd>${d.temp} °C</dd><dt>${esc(t('pl.moons'))}</dt><dd>${d.moons}</dd></dl><ul class="check">${facts}</ul>`;
    app.querySelectorAll('.pl-list button').forEach(x => { const on = x.getAttribute('data-body') === sel; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  }
  function flyTo(targetPos, dist) {   // câmera suave até o astro
    const dir = camera.position.clone().sub(controls.target).normalize(), from = { p: camera.position.clone(), t: controls.target.clone() }, to = { t: targetPos.clone(), p: targetPos.clone().add(dir.multiplyScalar(dist)) };
    anim = { t0: performance.now(), dur: 1100, from, to };
  }
  function select(id) { sel = id; following = true; info(); const b = bodies[id]; flyTo(worldPos(id), Math.max(b.r * (mobile ? 11 : 6), mobile ? 24 : 15)); }
  function reset() { sel = 'sun'; following = false; info(); anim = { t0: performance.now(), dur: 1300, from: { p: camera.position.clone(), t: controls.target.clone() }, to: { p: HOME.clone(), t: new THREE.Vector3() } }; }
  function dolly(f) { const off = camera.position.clone().sub(controls.target); off.multiplyScalar(f); const len = off.length(); if (len < controls.minDistance || len > controls.maxDistance) return; camera.position.copy(controls.target).add(off); }
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;

  /* ---------- rótulos HTML ---------- */
  const labBox = $('#plLabels'), labels = {}; ALL.forEach(id => { const e = document.createElement('span'); e.textContent = t('pl.' + id); labBox.appendChild(e); labels[id] = e; });
  function updateLabels() { const w = wrap.clientWidth, h = wrap.clientHeight; ALL.forEach(id => { const e = labels[id]; if (!showLab) { e.style.display = 'none'; return; } const p = worldPos(id); const off = bodies[id].r; tmpV.copy(p); tmpV.y -= off * 1.4; tmpV.project(camera); const vis = tmpV.z < 1 && Math.abs(tmpV.x) < 1.05 && Math.abs(tmpV.y) < 1.05; e.style.display = vis ? '' : 'none'; if (vis) { e.style.transform = `translate(-50%,0) translate(${(tmpV.x * .5 + .5) * w}px,${(-tmpV.y * .5 + .5) * h}px)`; e.classList.toggle('on', id === sel); } }); }

  /* ---------- UI ---------- */
  function setSpeed(v) { speed = v; const d = daysPerSec(); $('#plSpeedO').textContent = v === 0 ? '0' : (d >= 100 ? Math.round(d) : d.toFixed(1)) + ' ' + t('pl.daysPerSec'); }
  function setPlayIcon() { const b = $('#plPlay'); b.innerHTML = `<i class="bi ${paused ? 'bi-play-fill' : 'bi-pause-fill'}"></i>`; b.setAttribute('aria-label', t(paused ? 'pl.play' : 'pl.pause')); }
  $('#plPlay').onclick = () => { paused = !paused; setPlayIcon(); };
  $('#plSpeed').oninput = e => setSpeed(+e.target.value);
  $('#plZm').onclick = () => dolly(1.3); $('#plZp').onclick = () => dolly(1 / 1.3);
  $('#plReset').onclick = reset;
  const tog = (id, fn) => { const b = $(id); b.onclick = () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); fn(on); }; };
  tog('#plOrb', on => orbitGroup.visible = on); tog('#plLab', on => { showLab = on; });
  app.querySelectorAll('.pl-list button').forEach(b => b.onclick = () => select(b.getAttribute('data-body')));
  // clique no astro (sem arrastar)
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener('pointermove', e => { if (down && (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y)) > 6) { anim = null; } });
  cv.addEventListener('pointerup', e => {
    if (!down) return; const moved = Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y); down = null; if (moved > 6) return;
    const r = cv.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(clickable, false)[0]; if (hit) select(hit.object.userData.id);
  });
  cv.addEventListener('wheel', () => { anim = null; }, { passive: true });
  cv.addEventListener('keydown', e => { const i = ALL.indexOf(sel);
    if (e.key === ' ') { e.preventDefault(); $('#plPlay').click(); } else if (e.key === '+' || e.key === '=') dolly(1 / 1.2); else if (e.key === '-') dolly(1.2);
    else if (e.key === 'ArrowRight') { e.preventDefault(); select(ALL[(i + 1) % ALL.length]); } else if (e.key === 'ArrowLeft') { e.preventDefault(); select(ALL[(i + ALL.length - 1) % ALL.length]); } else if (e.key === 'Home') reset(); });

  function resize() { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; if (mobile && h > w) camera.setViewOffset(w, h, 0, h * 0.16, w, h); else camera.clearViewOffset(); camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(wrap); resize();
  setSpeed(speed); setPlayIcon(); info(); updateLabels();
  const lastCam = new THREE.Vector3();

  /* ---------- loop ---------- */
  let last = performance.now(), raf = 0;
  function frame(now) {
    if (my !== token || !document.body.contains(cv)) { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); return; }
    raf = requestAnimationFrame(frame); const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!paused) { const dd = daysPerSec() * dt; simDays += dd;
      sunMesh.rotation.y += dt * .05 * (speed ? 1 : 0);
      DATA.forEach(d => { const b = bodies[d.id], ang = b.phase + simDays / eff(d.p) * 6.283; b.pivot.position.set(Math.cos(ang) * d.a, 0, Math.sin(ang) * d.a);
        b.mesh.rotation.y += Math.sign(d.rot) * dt * Math.min(3, .5 + speed / 40) * (.9 / Math.sqrt(Math.abs(d.rot) + .5));
        if (b.clouds) b.clouds.rotation.y += dt * .25; if (b.moonPivot) b.moonPivot.rotation.y += dd / 27.3 * 6.283 * .35; }); }
    if (anim) { const k = Math.min(1, (now - anim.t0) / anim.dur), e = ease(k); const tgt = anim.to.t.clone(); if (sel !== 'sun' && following) tgt.copy(worldPos(sel)); controls.target.lerpVectors(anim.from.t, tgt, e); camera.position.lerpVectors(anim.from.p, anim.to.p.clone().add(tgt.clone().sub(anim.to.t)), e); if (k >= 1) anim = null; }
    else if (following && sel !== 'sun') { const p = worldPos(sel), delta = p.clone().sub(controls.target); controls.target.add(delta); camera.position.add(delta); }
    controls.update(); updateLabels(); renderer.render(scene, camera);
    const ld = $('#plLoad'); if (ld) ld.remove();
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { last = performance.now(); });
};
if (B.data) B.render();
