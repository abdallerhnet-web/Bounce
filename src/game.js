import { keys, sfx } from './engine.js';

export const TS = 32;
export const view = { w: 800, h: 448 };
const SOLID = new Set(['#', 'I', 'B', '?', 'U', 'V']);
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// ---------------------------------------------------------------- backdrop
function layer(c, cam, speed, period, seed, fn) {
  const off = cam * speed;
  const first = Math.floor(off / period) - 1;
  const n = Math.ceil(view.w / period) + 3;
  for (let i = 0; i < n; i++) {
    const k = first + i;
    fn(k * period - off, k, hash(k * 13.37 + seed));
  }
}

export function drawBackdrop(c, th, cam, t) {
  const W = view.w, H = view.h, GY = 384;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = th.sun; c.beginPath(); c.arc(W * 0.78, 90, 36, 0, 7); c.fill();
  c.globalAlpha = 0.25; c.beginPath(); c.arc(W * 0.78, 90, 56, 0, 7); c.fill(); c.globalAlpha = 1;

  if (th.kind === 'ruins') {
    c.fillStyle = th.far;
    layer(c, cam, 0.1, 220, 1, (x, k, r) => { c.beginPath(); c.moveTo(x, GY); c.lineTo(x + 110, GY - 110 - r * 80); c.lineTo(x + 220, GY); c.fill(); });
    c.fillStyle = th.mid;
    layer(c, cam, 0.3, 130, 2, (x, k, r) => {
      const h = 70 + r * 110; c.fillRect(x, GY - h, 28, h);
      c.fillRect(x - 4, GY - h - 8, 36, 8);
      if (r > 0.5) { c.fillStyle = th.sky[1]; c.beginPath(); c.moveTo(x + 14, GY - h - 8); c.lineTo(x + 40, GY - h - 8); c.lineTo(x + 20, GY - h + 14); c.fill(); c.fillStyle = th.mid; }
    });
    c.fillStyle = '#fff3b0';
    for (let i = 0; i < 5; i++) { // drifting golden fragments
      const x = (hash(i) * W + t * 8 * (1 + i * 0.2) - cam * 0.2) % W; const y = 60 + hash(i + 9) * 150 + Math.sin(t + i) * 8;
      c.save(); c.translate((x + W) % W, y); c.rotate(t + i); c.fillRect(-4, -4, 8, 8); c.restore();
    }
  } else if (th.kind === 'forest') {
    layer(c, cam, 0.12, 100, 3, (x, k, r) => { c.fillStyle = th.far; c.beginPath(); c.arc(x + 40, GY - 90 - r * 70, 60, 0, 7); c.fill(); c.fillRect(x + 34, GY - 100, 12, 100); });
    layer(c, cam, 0.32, 120, 4, (x, k, r) => {
      c.fillStyle = '#2d1d12'; c.fillRect(x + 20, GY - 150 - r * 60, 20, 150 + r * 60);
      c.fillStyle = th.mid; c.beginPath(); c.arc(x + 30, GY - 160 - r * 60, 50, 0, 7); c.fill();
    });
    c.strokeStyle = '#1f8a45'; c.lineWidth = 3;
    layer(c, cam, 0.6, 140, 5, (x, k, r) => { c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + 10, 60 + r * 60, x - 4, 110 + r * 90); c.stroke(); });
    c.fillStyle = '#eaff9a';
    for (let i = 0; i < 18; i++) { const x = (hash(i) * W + Math.sin(t * 0.7 + i) * 20); const y = 120 + hash(i + 3) * 240 + Math.cos(t + i) * 10; c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + i); c.fillRect(x, y, 3, 3); }
    c.globalAlpha = 1;
  } else if (th.kind === 'city') {
    c.fillStyle = th.far;
    layer(c, cam, 0.12, 70, 6, (x, k, r) => { const h = 120 + r * 150; c.fillRect(x, GY - h, 60, h); });
    layer(c, cam, 0.3, 90, 7, (x, k, r) => {
      const h = 100 + r * 170; c.fillStyle = th.mid; c.fillRect(x, GY - h, 74, h);
      for (let wy = GY - h + 10; wy < GY - 10; wy += 16) for (let wx = x + 8; wx < x + 66; wx += 14) {
        if (hash(k * 31 + wx + wy) > 0.55) { c.fillStyle = hash(k + wy) > 0.5 ? '#00e5ff' : '#ff4fd8'; c.fillRect(wx, wy, 6, 8); }
      }
    });
    layer(c, cam, 0.55, 220, 8, (x, k, r) => { c.fillStyle = '#ff4fd8'; c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3 + k); c.fillRect(x, 80, 3, GY - 80); c.globalAlpha = 1; });
  } else if (th.kind === 'ice') {
    for (let b = 0; b < 3; b++) { // aurora
      c.fillStyle = b % 2 ? 'rgba(160,120,255,.18)' : 'rgba(80,255,190,.18)';
      c.beginPath(); c.moveTo(0, 40 + b * 18);
      for (let x = 0; x <= W; x += 20) c.lineTo(x, 40 + b * 18 + Math.sin(x * 0.013 + t * 0.8 + b) * 22);
      c.lineTo(W, 120 + b * 18); c.lineTo(0, 120 + b * 18); c.fill();
    }
    layer(c, cam, 0.1, 220, 9, (x, k, r) => {
      const h = 150 + r * 100; c.fillStyle = th.far; c.beginPath(); c.moveTo(x, GY); c.lineTo(x + 110, GY - h); c.lineTo(x + 220, GY); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 110, GY - h); c.lineTo(x + 84, GY - h + 40); c.lineTo(x + 136, GY - h + 40); c.fill();
    });
    layer(c, cam, 0.28, 150, 10, (x, k, r) => {
      const h = 90 + r * 80; c.fillStyle = th.mid; c.beginPath(); c.moveTo(x, GY); c.lineTo(x + 70, GY - h); c.lineTo(x + 140, GY); c.fill();
    });
    c.fillStyle = '#fff';
    for (let i = 0; i < 40; i++) { const x = (hash(i) * W + t * 12 * (0.5 + hash(i + 1))) % W; const y = (hash(i + 7) * H + t * 40 * (0.5 + hash(i + 2))) % H; c.fillRect(x, y, 2, 2); }
  } else { // gate
    c.fillStyle = '#fff';
    for (let i = 0; i < 40; i++) { c.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t + i)); c.fillRect(hash(i) * W, hash(i + 5) * 250, 2, 2); }
    c.globalAlpha = 1;
    c.strokeStyle = th.far; c.lineWidth = 12;
    layer(c, cam, 0.1, 340, 11, (x) => { c.beginPath(); c.arc(x + 170, GY, 150, Math.PI, 0); c.stroke(); });
    layer(c, cam, 0.3, 150, 12, (x, k, r) => {
      const h = 120 + r * 120; c.fillStyle = th.mid; c.fillRect(x, GY - h, 36, h);
      c.fillStyle = th.top; c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 2 + k); c.fillRect(x + 15, GY - h + 10, 6, 40); c.globalAlpha = 1;
    });
    if (Math.floor(t * 6) % 7 === 0) { c.fillStyle = 'rgba(179,136,255,.25)'; c.fillRect(0, hash(Math.floor(t * 6)) * H, W, 6 + hash(Math.floor(t * 6) + 2) * 14); }
  }
}

// ---------------------------------------------------------------- hero
export function drawHero(c, x, y, rot, face, sq, t, vx, opt = {}) {
  const R = 14, run = Math.min(1, Math.abs(vx) / 120);
  c.save(); c.translate(x, y);
  if (opt.flash && Math.floor(t * 20) % 2) c.globalAlpha = 0.35;
  // cape
  const sway = Math.sin(t * 9) * 3, tail = Math.min(Math.abs(vx) / 10, 16);
  c.fillStyle = '#7a3cff'; c.strokeStyle = '#3d1a8a'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-face * 7, -8);
  c.quadraticCurveTo(-face * (16 + tail), -2 + sway, -face * (22 + tail), 12 + sway);
  c.lineTo(-face * 9, 10); c.closePath(); c.fill(); c.stroke();
  // legs
  const swing = Math.sin(t * 16) * 5 * run;
  c.fillStyle = '#8a5a00'; c.fillRect(-6 + swing, R - 3, 5, 6); c.fillRect(2 - swing, R - 3, 5, 6);
  c.save(); c.scale(1 + sq, 1 - sq);
  // body (rim rotates with momentum)
  c.save(); c.rotate(rot);
  const gr = c.createRadialGradient(-4, -5, 2, 0, 0, R);
  gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.6, '#ffc926'); gr.addColorStop(1, '#d98e00');
  c.fillStyle = gr; c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill();
  c.strokeStyle = '#7a4a00'; c.lineWidth = 2.5; c.stroke();
  c.strokeStyle = '#b87400'; c.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; c.beginPath(); c.moveTo(Math.cos(a) * (R - 4), Math.sin(a) * (R - 4)); c.lineTo(Math.cos(a) * (R - 1), Math.sin(a) * (R - 1)); c.stroke(); }
  c.restore();
  // face (upright)
  c.fillStyle = '#a86a00'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('B', 0, 10);
  c.fillStyle = '#fff'; c.fillRect(-6 + face, -6, 5, 6); c.fillRect(2 + face, -6, 5, 6);
  c.fillStyle = '#222'; c.fillRect(-4 + face * 2, -5, 2, 4); c.fillRect(4 + face * 2, -5, 2, 4);
  c.restore();
  if (opt.spin) {
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3;
    c.beginPath(); c.arc(0, 0, R + 6, t * 20, t * 20 + 4); c.stroke();
    c.beginPath(); c.arc(0, 0, R + 10, -t * 20, -t * 20 + 2.5); c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------- game
export class Game {
  constructor(world, idx, hooks, opts = {}) {
    this.world = world; this.idx = idx; this.hooks = hooks;
    this.doubleJump = !!opts.doubleJump;
    this.rows = world.map.length; this.cols = world.map[0].length;
    this.g = world.map.map((r) => r.split(''));
    this.coins = []; this.enemies = []; this.cps = []; this.parts = [];
    this.goal = null; this.boss = null; this.vs = {}; this.qmap = {}; this.found = new Set();
    this.fragment = false; this.coinCount = 0; this.time = 0; this.t = 0; this.done = false;
    this.paused = false; this.lives = 3; this.cam = 0; this.shake = 0; this.banner = 3; this.warnT = 0;
    let qi = 0;
    const spawn = { x: 2 * TS + 4, y: 11 * TS + 7 };
    for (let x = 0; x < this.cols; x++) for (let y = 0; y < this.rows; y++) {
      const ch = this.g[y][x];
      if (ch === '?') this.qmap[x + ',' + y] = qi++;
      else if (ch === 'c') { this.coins.push({ x: x * TS + 16, y: y * TS + 16, got: false }); this.g[y][x] = '.'; }
      else if (ch === 'e') { this.enemies.push({ x: x * TS + 3, y: (y + 1) * TS - 24, w: 26, h: 24, vx: -50, alive: true, dead: 0 }); this.g[y][x] = '.'; }
      else if (ch === 'K') { this.cps.push({ x: x * TS, y: (y - 1) * TS, w: TS, h: TS * 2, on: false, sx: x * TS + 4, sy: (y + 1) * TS - 25 }); this.g[y][x] = '.'; }
      else if (ch === 'G') { this.goal = { x: x * TS - 8, y: (y - 2) * TS, w: TS + 16, h: TS * 3 }; this.g[y][x] = '.'; }
      else if (ch === 'X') {
        const b = world.boss;
        this.boss = { x: x * TS - 12, y: (y + 1) * TS - 56, w: 56, h: 56, hp: b.hp, max: b.hp, state: 'sleep', t: 0, inv: 0, face: -1, dash: -1, x0: x * TS - 5 * TS, x1: x * TS + 5 * TS, name: b.name, col: b.col };
        this.g[y][x] = '.';
      }
      else if (ch === 'P') { spawn.x = x * TS + 4; spawn.y = (y + 1) * TS - 25; this.g[y][x] = '.'; }
    }
    this.spawn = spawn;
    this.p = { x: spawn.x, y: spawn.y, w: 24, h: 24, vx: 0, vy: 0, face: 1, hp: 3, inv: 0, onGround: false, onIce: false, coyote: 0, jbuf: 0, jprev: false, aprev: false, spinT: 0, cd: 0, rot: 0, squash: 0, boostT: 0, dead: false, dt: 0, noCut: false, usedDouble: false };
  }

  // -------- tiles
  tile(tx, ty) { if (tx < 0 || tx >= this.cols) return '#'; if (ty < 0 || ty >= this.rows) return '.'; return this.g[ty][tx]; }
  solid(tx, ty) {
    const c = this.tile(tx, ty);
    if (c === 'V') { const v = this.vs[tx + ',' + ty]; if (v && v.gone > 0) return false; }
    return SOLID.has(c);
  }
  breakTile(tx, ty) { this.g[ty][tx] = '.'; sfx('block'); this.burst(tx * TS + 16, ty * TS + 16, '#c9a063', 10); }
  reveal(tx, ty) {
    if (this.g[ty][tx] !== '?') return;
    this.g[ty][tx] = 'U';
    const i = this.qmap[tx + ',' + ty];
    this.found.add(i); sfx('block');
    this.burst(tx * TS + 16, ty * TS, '#ffd54a', 8);
    const t = this.world.terms[i];
    this.hooks.term(i, t[0], t[1], this.found.size);
  }
  burst(x, y, col, n) { for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - 0.5) * 240, vy: -Math.random() * 260, l: 0.6 + Math.random() * 0.4, c: col }); }

  moveX(dx) {
    const p = this.p; p.x += dx; if (!dx) return;
    const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w - 0.001) / TS);
    const y0 = Math.floor(p.y / TS), y1 = Math.floor((p.y + p.h - 0.001) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (!this.solid(tx, ty)) continue;
      if (this.tile(tx, ty) === 'B' && p.spinT > 0) { this.breakTile(tx, ty); continue; }
      p.x = dx > 0 ? tx * TS - p.w : (tx + 1) * TS; p.vx = 0; return;
    }
  }
  moveY(dy) {
    const p = this.p; p.y += dy; if (!dy) return;
    const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w - 0.001) / TS);
    const y0 = Math.floor(p.y / TS), y1 = Math.floor((p.y + p.h - 0.001) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (!this.solid(tx, ty)) continue;
      const ch = this.tile(tx, ty);
      if (dy > 0) {
        if (p.vy > 320) p.squash = 0.25;
        p.y = ty * TS - p.h; p.vy = 0; p.onGround = true; p.noCut = false; p.usedDouble = false; p.onIce = ch === 'I';
        if (ch === 'V') { const k = tx + ',' + ty; if (!this.vs[k]) this.vs[k] = { t: 0.6, gone: 0, armed: true }; }
      } else {
        p.y = (ty + 1) * TS; p.vy = 0;
        if (ch === '?') this.reveal(tx, ty);
        else if (ch === 'B' && p.spinT > 0) this.breakTile(tx, ty);
      }
      return;
    }
  }

  // -------- damage
  hurt(from) {
    const p = this.p; if (p.inv > 0 || p.dead || this.done) return;
    p.hp--; p.inv = 1.3; p.vy = -320; p.vx = -(from || p.face) * 220; sfx('hit'); this.shake = 0.2;
    if (p.hp <= 0) this.die();
  }
  die() {
    const p = this.p; if (p.dead) return;
    p.dead = true; p.dt = 0.9; p.vy = -420; p.vx = 0; this.lives--; sfx('hit');
  }
  respawn() {
    const p = this.p, s = this.spawn;
    Object.assign(p, { x: s.x, y: s.y, vx: 0, vy: 0, hp: 3, inv: 1.5, dead: false, spinT: 0, boostT: 0, squash: 0 });
    this.vs = {};
    if (this.boss && this.boss.state !== 'dead' && this.boss.state !== 'sleep') { this.boss.state = 'patrol'; this.boss.t = 2; }
  }
  restartFromCheckpoint() { this.paused = false; this.respawn(); }

  // -------- update
  update(dt) {
    if (this.paused || this.done) return;
    const p = this.p;
    this.t += dt; this.banner -= dt; this.warnT -= dt; this.shake = Math.max(0, this.shake - dt);
    for (const k in this.vs) {
      const v = this.vs[k];
      if (v.armed) { v.t -= dt; if (v.t <= 0) { v.armed = false; v.gone = 2.5; } }
      else { v.gone -= dt; if (v.gone <= 0) delete this.vs[k]; }
    }
    this.parts = this.parts.filter((q) => (q.l -= dt) > 0);
    for (const q of this.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 700 * dt; }

    if (p.dead) {
      p.dt -= dt; p.vy += 1500 * dt; p.y += p.vy * dt;
      if (p.dt <= 0) { if (this.lives <= 0) { this.done = true; this.hooks.gameover(); } else this.respawn(); }
      return;
    }
    this.time += dt;

    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const maxv = p.boostT > 0 ? 380 : 190;
    const acc = p.onIce ? 420 : 1500, fr = p.onIce ? 160 : 1300;
    if (p.spinT <= 0) {
      if (dir) {
        p.face = dir;
        if (dir * p.vx < maxv) { p.vx += dir * acc * dt * (dir * p.vx < 0 ? 1.6 : 1); if (dir * p.vx > maxv) p.vx = dir * maxv; }
        else p.vx -= dir * fr * dt * 0.5;
      } else { const d = fr * dt; p.vx = Math.abs(p.vx) <= d ? 0 : p.vx - Math.sign(p.vx) * d; }
    }
    // jump
    if (keys.jump && !p.jprev) p.jbuf = 0.12;
    p.jprev = keys.jump; p.jbuf -= dt;
    p.coyote = p.onGround ? 0.1 : p.coyote - dt;
    if (p.jbuf > 0 && p.coyote > 0) { p.vy = -520; p.jbuf = 0; p.coyote = 0; p.onGround = false; p.noCut = false; p.squash = -0.2; sfx('jump'); }
    else if (p.jbuf > 0 && this.doubleJump && !p.onGround && !p.usedDouble && p.coyote <= 0) { p.vy = -470; p.jbuf = 0; p.usedDouble = true; p.noCut = false; sfx('dj'); this.burst(p.x + 12, p.y + 24, '#fff', 6); }
    if (!keys.jump && !p.noCut && p.vy < -220) p.vy = -220;
    // attack
    if (keys.attack && !p.aprev && p.cd <= 0) { p.spinT = 0.35; p.cd = 0.7; p.vx = p.face * 380; sfx('attack'); }
    p.aprev = keys.attack; p.spinT -= dt; p.cd -= dt; p.inv -= dt; p.boostT -= dt;
    p.squash *= Math.max(0, 1 - 10 * dt);

    p.vy = Math.min(900, p.vy + 1500 * dt * (p.spinT > 0 ? 0.5 : 1));
    p.rot += (p.vx / 12) * dt + (p.spinT > 0 ? 25 * dt * p.face : 0);
    p.onGround = false; p.onIce = false;
    this.moveX(p.vx * dt); this.moveY(p.vy * dt);

    // special tiles
    const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w) / TS), y0 = Math.floor(p.y / TS), y1 = Math.floor((p.y + p.h) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const ch = this.tile(tx, ty);
      if (ch === 'S' && p.vy >= 0 && ov(p, { x: tx * TS, y: ty * TS + 12, w: TS, h: 20 })) { p.vy = -830; p.noCut = true; p.squash = -0.3; sfx('spring'); }
      else if (ch === 's' && p.spinT <= 0 && ov(p, { x: tx * TS + 4, y: ty * TS + 14, w: TS - 8, h: 18 })) this.hurt(p.vx >= 0 ? 1 : -1);
      else if (ch === '>' && p.onGround && ov(p, { x: tx * TS, y: ty * TS + 20, w: TS, h: 12 })) { if (p.boostT <= 0) sfx('spring'); p.boostT = 0.9; p.vx = p.face * 380; }
    }
    // coins
    for (const c of this.coins) if (!c.got && Math.abs(c.x - (p.x + 12)) < 20 && Math.abs(c.y - (p.y + 12)) < 22) { c.got = true; this.coinCount++; sfx('coin'); this.burst(c.x, c.y, '#ffd54a', 4); }
    // checkpoints
    for (const k of this.cps) if (!k.on && ov(p, k)) { k.on = true; this.spawn = { x: k.sx, y: k.sy }; sfx('check'); this.hooks.toast('Checkpoint', 'Progress saved for this run.'); }
    // enemies
    for (const e of this.enemies) {
      if (!e.alive) { e.dead += dt; continue; }
      e.x += e.vx * dt;
      const fx = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
      const wall = this.solid(Math.floor(fx / TS), Math.floor((e.y + e.h / 2) / TS));
      const floor = this.solid(Math.floor(fx / TS), Math.floor((e.y + e.h + 2) / TS));
      if (wall || !floor) e.vx = -e.vx;
      if (ov(p, e)) {
        if (p.spinT > 0) { e.alive = false; sfx('stomp'); this.burst(e.x + 13, e.y + 12, this.world.theme.enemy, 10); }
        else if (p.vy > 0 && p.y + p.h - e.y < 18) { e.alive = false; p.vy = -380; p.noCut = true; sfx('stomp'); this.burst(e.x + 13, e.y + 12, this.world.theme.enemy, 10); }
        else this.hurt(e.x > p.x ? -1 : 1);
      }
    }
    this.updBoss(dt);
    // goal
    if (this.goal && ov(p, this.goal)) {
      if (this.boss && this.boss.state !== 'dead') { if (this.warnT <= 0) { this.hooks.toast('The gate is sealed', 'Defeat ' + this.boss.name + ' first.'); this.warnT = 3; } }
      else { this.done = true; sfx('win'); this.hooks.complete({ time: this.time, coins: this.coinCount, terms: this.found.size, fragment: this.fragment }); }
    }
    if (p.y > this.rows * TS + 60) this.die();
    // camera
    const target = Math.max(0, Math.min(this.cols * TS - view.w, p.x + 12 - view.w * 0.42 + p.face * 40));
    this.cam += (target - this.cam) * Math.min(1, 6 * dt);
  }

  updBoss(dt) {
    const b = this.boss, p = this.p; if (!b) return;
    if (b.state === 'dead') { b.t += dt; return; }
    if (b.state === 'sleep') {
      if (Math.abs(p.x - b.x) < 460) { b.state = 'intro'; b.t = 1.4; this.hooks.toast(b.name, 'Boss! Dodge the red-flash charge, strike while it is dazed.'); sfx('boss'); }
      return;
    }
    b.t -= dt; b.inv -= dt;
    const sp = 1 + (b.hp <= b.max / 2 ? 0.35 : 0) + this.idx * 0.06;
    const toP = Math.sign(p.x - b.x) || 1;
    if (b.state === 'intro') { if (b.t <= 0) { b.state = 'patrol'; b.t = 2.2 / sp; } }
    else if (b.state === 'patrol') {
      b.face = toP; b.x = Math.max(b.x0, Math.min(b.x1, b.x + toP * 70 * sp * dt));
      if (b.t <= 0) { b.state = 'tele'; b.t = 0.8; }
    } else if (b.state === 'tele') { if (b.t <= 0) { b.state = 'dash'; b.t = 0.9; b.dash = b.face; } }
    else if (b.state === 'dash') {
      b.x += b.dash * 380 * sp * dt;
      if (b.x <= b.x0 || b.x >= b.x1 || b.t <= 0) { b.x = Math.max(b.x0, Math.min(b.x1, b.x)); b.state = 'stun'; b.t = 1.8; this.shake = 0.3; sfx('stomp'); }
    } else if (b.state === 'stun') { if (b.t <= 0) { b.state = 'patrol'; b.t = 2.2 / sp; } }

    if (ov(p, b)) {
      const above = p.vy > 0 && p.y + p.h - b.y < 24;
      if (b.state === 'stun') {
        if (b.inv <= 0 && (p.spinT > 0 || above)) {
          b.hp--; b.inv = 0.9; sfx('stomp'); this.shake = 0.2; this.burst(b.x + 28, b.y + 20, b.col, 14);
          if (above) { p.vy = -420; p.noCut = true; }
          if (b.hp <= 0) {
            b.state = 'dead'; b.t = 0; this.fragment = true; sfx('frag'); this.burst(b.x + 28, b.y + 28, '#ffd54a', 40);
            this.hooks.toast('SOL Fragment recovered', b.name + ' is defeated. The gate opens.');
          }
        }
      } else if (above && p.spinT <= 0) { p.vy = -420; p.noCut = true; sfx('stomp'); }
      else if (p.spinT > 0) { p.vx = -toP * 300; p.spinT = 0; }
      else this.hurt(toP);
    }
  }

  // -------- render
  drawTile(c, ch, x, y, tx, ty) {
    const th = this.world.theme;
    if (ch === '#' || ch === 'I') {
      const open = !SOLID.has(this.tile(tx, ty - 1));
      c.fillStyle = ch === 'I' ? '#7fd8ff' : th.ground; c.fillRect(x, y, TS, TS);
      if (ch === 'I') { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x + 4, y + 4, 10, 3); c.fillRect(x + 18, y + 12, 8, 3); }
      else { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + ((tx * 7 + ty * 3) % 5) * 5, y + 12 + (tx % 3) * 6, 6, 3); }
      if (open) { c.fillStyle = ch === 'I' ? '#d4f5ff' : th.top; c.fillRect(x, y, TS, 6); c.fillStyle = th.topLight; c.globalAlpha = 0.6; c.fillRect(x, y, TS, 2); c.globalAlpha = 1; }
    } else if (ch === 'B') {
      c.fillStyle = '#b5834a'; c.fillRect(x, y, TS, TS); c.strokeStyle = '#6b4620'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, TS - 2, TS - 2);
      c.beginPath(); c.moveTo(x + 6, y + 8); c.lineTo(x + 16, y + 18); c.lineTo(x + 12, y + 28); c.stroke();
    } else if (ch === '?' || ch === 'U') {
      const bob = ch === '?' ? Math.sin(this.t * 4 + tx) * 1.5 : 0;
      c.fillStyle = ch === '?' ? '#ffc926' : '#8a6a30'; c.fillRect(x, y + bob, TS, TS);
      c.strokeStyle = ch === '?' ? '#8a5a00' : '#4a3815'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1 + bob, TS - 2, TS - 2);
      c.fillStyle = ch === '?' ? '#5a3a00' : '#3a2a10'; c.font = 'bold 20px monospace'; c.textAlign = 'center'; c.fillText(ch === '?' ? '?' : '·', x + 16, y + 24 + bob);
    } else if (ch === 'V') {
      const v = this.vs[tx + ',' + ty];
      if (v && v.gone > 0) { c.strokeStyle = 'rgba(255,255,255,.18)'; c.setLineDash([4, 4]); c.strokeRect(x + 1, y + 1, TS - 2, TS - 2); c.setLineDash([]); return; }
      c.globalAlpha = v && v.armed ? (Math.floor(this.t * 16) % 2 ? 0.4 : 0.9) : 0.9;
      c.fillStyle = '#4fd1c5'; c.fillRect(x, y, TS, TS / 2 + 4);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, TS, 3); c.globalAlpha = 1;
    } else if (ch === 'S') {
      c.fillStyle = '#e53935'; c.fillRect(x + 4, y + 22, 24, 10);
      c.strokeStyle = '#ddd'; c.lineWidth = 3; c.beginPath();
      for (let i = 0; i < 4; i++) { c.moveTo(x + 8, y + 22 - i * 4); c.lineTo(x + 24, y + 20 - i * 4); }
      c.stroke();
    } else if (ch === 's') {
      c.fillStyle = '#cfd8dc'; c.strokeStyle = '#455a64'; c.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + i * 10 + 1, y + 32); c.lineTo(x + i * 10 + 6, y + 14); c.lineTo(x + i * 10 + 11, y + 32); c.fill(); c.stroke(); }
    } else if (ch === '>') {
      c.fillStyle = '#00e5ff'; c.globalAlpha = 0.4 + 0.4 * Math.sin(this.t * 8); c.fillRect(x, y + 24, TS, 8); c.globalAlpha = 1;
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 8, y + 26); c.lineTo(x + 20, y + 28); c.lineTo(x + 8, y + 30); c.fill();
    }
  }

  drawEnemy(c, e) {
    const th = this.world.theme, x = e.x, y = e.y, k = this.world.theme.kind;
    if (!e.alive) { if (e.dead > 0.3) return; c.globalAlpha = 1 - e.dead / 0.3; c.fillStyle = th.enemy; c.fillRect(x, y + 18, 26, 6); c.globalAlpha = 1; return; }
    const f = Math.sin(this.t * 8 + x) * 2;
    c.fillStyle = th.enemy; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2;
    if (k === 'ice') { c.beginPath(); c.moveTo(x + 13, y - 2); c.lineTo(x + 26, y + 14); c.lineTo(x + 13, y + 24); c.lineTo(x, y + 14); c.closePath(); c.fill(); c.stroke(); }
    else if (k === 'city') { c.beginPath(); c.ellipse(x + 13, y + 11 + f, 13, 9, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillRect(x + 11, y + 20 + f, 4, 4); }
    else if (k === 'forest') { c.beginPath(); c.arc(x + 13, y + 24, 13, Math.PI, 0); c.fill(); c.stroke(); c.fillStyle = '#2d5a1a'; for (let i = 0; i < 3; i++) c.fillRect(x + 4 + i * 8, y + 1, 3, 6); }
    else { c.fillRect(x, y + 4, 26, 20); c.strokeRect(x, y + 4, 26, 20); if (k === 'gate') { c.fillStyle = '#fff'; c.globalAlpha = 0.5; c.fillRect(x + 4, y + 8 + (Math.floor(this.t * 10) % 3) * 4, 18, 3); c.globalAlpha = 1; } }
    c.fillStyle = '#fff'; c.fillRect(x + 5, y + 8, 6, 6); c.fillRect(x + 15, y + 8, 6, 6);
    c.fillStyle = '#c00'; c.fillRect(x + 7 + (e.vx > 0 ? 2 : 0), y + 10, 3, 4); c.fillRect(x + 17 + (e.vx > 0 ? 2 : 0), y + 10, 3, 4);
  }

  drawBoss(c) {
    const b = this.boss; if (!b) return;
    if (b.state === 'dead') { if (b.t > 1) return; c.globalAlpha = 1 - b.t; }
    const shake = b.state === 'tele' ? Math.sin(this.t * 60) * 3 : 0;
    const x = b.x + shake, y = b.y;
    c.save();
    if (b.state === 'tele') { c.fillStyle = Math.floor(this.t * 14) % 2 ? '#ff2d2d' : b.col; } else c.fillStyle = b.col;
    c.strokeStyle = '#000'; c.lineWidth = 3;
    c.fillRect(x, y + 10, 56, 46); c.strokeRect(x, y + 10, 56, 46);
    c.beginPath(); c.moveTo(x - 4, y + 12); c.lineTo(x + 8, y - 6); c.lineTo(x + 28, y + 8); c.lineTo(x + 48, y - 6); c.lineTo(x + 60, y + 12); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = b.state === 'stun' ? '#888' : '#ff2d2d';
    const ex = b.face > 0 ? 4 : 0;
    c.fillRect(x + 10 + ex, y + 22, 10, 10); c.fillRect(x + 34 + ex, y + 22, 10, 10);
    if (b.state === 'stun') { c.fillStyle = '#ffd54a'; c.font = 'bold 16px monospace'; c.textAlign = 'center'; for (let i = 0; i < 3; i++) c.fillText('*', x + 28 + Math.cos(this.t * 5 + i * 2.1) * 24, y - 6 + Math.sin(this.t * 5 + i * 2.1) * 6); }
    if (b.inv > 0 && Math.floor(this.t * 20) % 2) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x, y + 10, 56, 46); }
    c.restore(); c.globalAlpha = 1;
  }

  render(c) {
    const W = view.w, H = view.h, p = this.p, th = this.world.theme;
    c.clearRect(0, 0, W, H);
    drawBackdrop(c, th, this.cam, this.t);
    c.save();
    const sx = this.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
    c.translate(-Math.round(this.cam) + sx, 0);
    const x0 = Math.floor(this.cam / TS), x1 = Math.min(this.cols - 1, Math.floor((this.cam + W) / TS));
    for (let ty = 0; ty < this.rows; ty++) for (let tx = x0; tx <= x1; tx++) { const ch = this.g[ty][tx]; if (ch !== '.') this.drawTile(c, ch, tx * TS, ty * TS, tx, ty); }
    for (const k of this.cps) { c.fillStyle = '#ddd'; c.fillRect(k.x + 14, k.y + 6, 3, 58); c.fillStyle = k.on ? '#4cff7a' : '#ff5a5a'; c.fillRect(k.x + 17, k.y + 8, 16, 11); }
    if (this.goal) {
      const g = this.goal, open = !this.boss || this.boss.state === 'dead';
      c.strokeStyle = open ? '#ffd54a' : '#666'; c.lineWidth = 6; c.beginPath(); c.ellipse(g.x + g.w / 2, g.y + 48, 22, 44, 0, 0, 7); c.stroke();
      if (open) { c.fillStyle = 'rgba(255,213,74,' + (0.25 + 0.15 * Math.sin(this.t * 4)) + ')'; c.beginPath(); c.ellipse(g.x + g.w / 2, g.y + 48, 20, 40, 0, 0, 7); c.fill(); }
    }
    for (const co of this.coins) if (!co.got) {
      const w = Math.abs(Math.cos(this.t * 4 + co.x * 0.05)) * 7 + 2;
      c.fillStyle = '#ffd54a'; c.strokeStyle = '#a06800'; c.lineWidth = 2; c.beginPath(); c.ellipse(co.x, co.y + Math.sin(this.t * 3 + co.x) * 2, w, 8, 0, 0, 7); c.fill(); c.stroke();
    }
    for (const e of this.enemies) this.drawEnemy(c, e);
    this.drawBoss(c);
    if (!(p.dead && p.dt < 0.2)) drawHero(c, p.x + 12, p.y + 12, p.rot, p.face, p.squash, this.t, p.vx, { spin: p.spinT > 0, flash: p.inv > 0 });
    for (const q of this.parts) { c.globalAlpha = Math.min(1, q.l * 2); c.fillStyle = q.c; c.fillRect(q.x, q.y, 4, 4); }
    c.globalAlpha = 1;
    c.restore();
    this.drawHUD(c);
  }

  drawHUD(c) {
    const W = view.w, p = this.p;
    c.font = 'bold 15px monospace'; c.textAlign = 'left';
    const txt = (s, x, y, col = '#fff') => { c.fillStyle = 'rgba(0,0,0,.7)'; c.fillText(s, x + 1, y + 1); c.fillStyle = col; c.fillText(s, x, y); };
    for (let i = 0; i < 3; i++) txt('♥', 10 + i * 18, 22, i < p.hp ? '#ff4d6d' : '#553');
    txt('x' + this.lives, 10, 42, '#ffd54a');
    txt('● ' + this.coinCount, 70, 42, '#ffd54a');
    txt('◆ ' + (this.fragment ? 1 : 0) + '/1', 10, 62, this.fragment ? '#7af' : '#aaa');
    txt('? ' + this.found.size + '/5', 100, 62, '#ffd54a');
    if (p.boostT > 0) txt('SPEED', 150, 22, '#00e5ff');
    c.textAlign = 'right'; txt(this.time.toFixed(1) + 's', W - 70, 22); c.textAlign = 'left';
    const b = this.boss;
    if (b && b.state !== 'sleep' && b.state !== 'dead') {
      const bw = Math.min(260, W - 40), bx = (W - bw) / 2;
      c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(bx - 2, 48, bw + 4, 16);
      c.fillStyle = '#ff2d2d'; c.fillRect(bx, 50, bw * Math.max(0, b.hp / b.max), 12);
      c.textAlign = 'center'; txt(b.name, W / 2, 44); c.textAlign = 'left';
    }
    if (this.banner > 0) {
      c.globalAlpha = Math.min(1, this.banner);
      c.textAlign = 'center'; c.font = 'bold 28px monospace'; txt(this.world.name, W / 2, 130, '#ffd54a');
      c.font = '14px monospace'; txt(this.world.tag, W / 2, 154); c.globalAlpha = 1; c.textAlign = 'left';
    }
  }
}
