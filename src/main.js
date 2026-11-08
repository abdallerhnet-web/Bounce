import { Game, view, drawBackdrop, drawHero } from './game.js';
import { WORLDS, ALL_TERMS } from './levels.js';
import { initInput, ensureAudio, sfx, playMusic, stopMusic, audioSettings, applyAudio, keys } from './engine.js';
import * as store from './save.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#game'), ctx = canvas.getContext('2d');
const ui = $('#ui'), toastEl = $('#toast'), pauseBtn = $('#pausebtn'), controls = $('#controls');
const NOTICE = 'Education, not financial advice.';

let game = null, mode = 'menu', worldIdx = 0, backTo = () => showMenu();
let last = 0, acc = 0, toastTimer = 0, introStep = 0;
Object.assign(audioSettings, store.S.settings);

// ---------------------------------------------------------------- layout
function resize() {
  const portrait = innerHeight > innerWidth;
  const stage = $('#stage');
  stage.style.height = portrait ? Math.round(innerHeight * 0.58) + 'px' : '100%';
  const r = stage.getBoundingClientRect();
  view.w = Math.max(300, Math.min(1000, Math.round(448 * (r.width / Math.max(1, r.height)))));
  canvas.width = view.w; canvas.height = view.h;
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 100));

// ---------------------------------------------------------------- ui helpers
function screen(html, cls = '') {
  ui.className = html ? cls : 'hidden';
  ui.innerHTML = html ? `<div class="card">${html}</div>` : '';
}
function toast(title, body) {
  toastEl.innerHTML = `<b>${title}</b><span>${body}</span><i>${NOTICE}</i>`;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4200);
}
function setPlayUI(on) {
  pauseBtn.classList.toggle('hidden', !on);
  controls.classList.toggle('hidden', !on);
}

// ---------------------------------------------------------------- screens
let menuAnim = 0;
function showMenu() {
  mode = 'menu'; game = null; setPlayUI(false); stopMusic();
  const cont = store.S.unlocked > 1 || store.S.seenIntro;
  screen(`
    <canvas id="menucoin" width="120" height="120"></canvas>
    <h1>BOUNCE</h1><p class="sub">A Coin Journey to Solana</p>
    <button data-act="play">Play</button>
    ${cont ? '<button data-act="continue">Continue</button>' : ''}
    <button data-act="worlds">World Select</button>
    <button data-act="dict">Degen Dictionary</button>
    <button data-act="settings">Settings</button>
    <button data-act="credits">Credits</button>
    <p class="note">${NOTICE}</p>`, 'menu');
}

const INTRO = [
  ['The Golden Age', 'Five SOL Fragments float above a bright digital universe. Every world is alive and connected.'],
  ['The Corruption', 'A purple glitch spreads. The Null King appears and steals the five fragments. The worlds start to fall apart.'],
  ['The Last Coin', 'BOUNCE wakes in the ruins of Origin. An ancient guardian whispers that he is the universe\'s last hope.'],
];
function showIntro() {
  mode = 'menu';
  const [t, b] = INTRO[introStep];
  screen(`<h2>${t}</h2><p class="story">${b}</p>
    <button data-act="intro-next">${introStep < INTRO.length - 1 ? 'Next' : 'Begin'}</button>
    <button class="ghost" data-act="intro-skip">Skip</button>`, 'story');
}

function showWorlds() {
  mode = 'menu'; setPlayUI(false);
  const cards = WORLDS.map((w, i) => {
    const open = i < store.S.unlocked, star = store.S.stars[i], frag = store.S.frags.includes(i), best = store.S.best[i];
    return `<button class="world ${open ? '' : 'locked'}" ${open ? `data-act="world" data-arg="${i}"` : 'disabled'}>
      <b>${i + 1}. ${w.name}</b><span>${open ? w.tag : 'Locked: finish the previous world'}</span>
      <em>${open ? `${star ? '★' : '☆'} ${frag ? '◆' : '◇'} ${best ? best.toFixed(1) + 's' : '--'}` : '🔒'}</em></button>`;
  }).join('');
  screen(`<h2>World Select</h2><div class="worlds">${cards}</div><p class="note">★ all 5 lessons · ◆ SOL Fragment · best time</p>
    <button class="ghost" data-act="menu">Back</button>`);
}

function showDict(back) {
  const prev = mode;
  backTo = back || (() => showMenu());
  mode = prev === 'play' ? 'pause' : prev;
  if (game && prev === 'play') game.paused = true;
  const found = new Set(store.S.terms);
  const rows = ALL_TERMS.map((t) => found.has(t.id)
    ? `<div class="term"><b>${t.name}</b><span>${t.def}</span></div>`
    : `<div class="term dim"><b>???</b><span>Find the "?" blocks in World ${t.world + 1}.</span></div>`).join('');
  screen(`<h2>Degen Dictionary</h2><p class="note">${found.size}/${ALL_TERMS.length} found · ${NOTICE}</p>
    <div class="terms">${rows}</div><button data-act="back">Back</button>`);
}

function showSettings(back) {
  backTo = back || (() => showMenu());
  const s = audioSettings;
  screen(`<h2>Settings</h2>
    <label>Music <input type="range" id="vm" min="0" max="1" step="0.05" value="${s.music}"></label>
    <label>Effects <input type="range" id="vs" min="0" max="1" step="0.05" value="${s.sfx}"></label>
    <label class="chk"><input type="checkbox" id="mute" ${s.mute ? 'checked' : ''}> Mute all</label>
    <p class="note">Keyboard: Arrows/A/D move · Space/W jump · X spin attack · Esc pause · B dictionary.<br>Touch: on-screen buttons.</p>
    <button class="danger" data-act="reset">Reset save</button>
    <button data-act="back">Back</button>`);
  const apply = () => {
    s.music = +$('#vm').value; s.sfx = +$('#vs').value; s.mute = $('#mute').checked;
    store.S.settings = { ...s }; store.persist(); applyAudio();
  };
  ['#vm', '#vs', '#mute'].forEach((q) => $(q).addEventListener('input', apply));
}

function showCredits() {
  screen(`<h2>Credits</h2><p class="story">BOUNCE: A Coin Journey to Solana.<br>All art, music and sound are original and generated in code.<br>${NOTICE}</p>
    <button data-act="menu">Back</button>`);
}

function showPause() {
  mode = 'pause'; game.paused = true; keys.left = keys.right = keys.jump = keys.attack = false;
  screen(`<h2>Paused</h2>
    <button data-act="resume">Resume</button>
    <button data-act="restart">Restart from checkpoint</button>
    <button data-act="pause-settings">Settings</button>
    <button data-act="pause-dict">Dictionary</button>
    <button data-act="exit">Exit to menu</button>`);
}

function showGameOver() {
  mode = 'over'; stopMusic(); setPlayUI(false);
  screen(`<h2>Game Over</h2><p class="story">The coin ran out of lives. Every lesson you found is still saved.</p>
    <button data-act="retry">Try again</button><button data-act="worlds">World Select</button><button class="ghost" data-act="menu">Menu</button>`);
}

function showComplete(r) {
  mode = 'done'; stopMusic(); setPlayUI(false);
  const i = worldIdx, w = WORLDS[i];
  const star = r.terms === 5;
  store.S.unlocked = Math.max(store.S.unlocked, Math.min(WORLDS.length, i + 2));
  store.S.coins += r.coins;
  if (star) store.S.stars[i] = true;
  if (r.fragment && !store.S.frags.includes(i)) store.S.frags.push(i);
  if (!store.S.best[i] || r.time < store.S.best[i]) store.S.best[i] = r.time;
  store.persist();
  const last = i === WORLDS.length - 1;
  const ending = last && store.S.frags.length === WORLDS.length
    ? '<p class="story">The five fragments reconnect the worlds. The Solana Gate opens, and BOUNCE steps through as the camera pulls back to reveal another mysterious world beyond…<br><i>To be continued.</i></p>' : '';
  screen(`<h2>${w.name} complete!</h2>
    <p class="story">Time ${r.time.toFixed(1)}s · Coins ${r.coins} · Lessons ${r.terms}/5 ${star ? '★' : '(find all 5 for a star)'} · ◆ SOL Fragment</p>${ending}
    ${last ? '' : '<button data-act="next">Next world</button>'}
    <button data-act="retry">Replay</button><button data-act="worlds">World Select</button><button class="ghost" data-act="menu">Menu</button>`);
}

// ---------------------------------------------------------------- flow
function startWorld(i) {
  ensureAudio();
  worldIdx = i; mode = 'play'; screen(''); setPlayUI(true);
  const hooks = {
    toast,
    term: (idx, name, def, n) => {
      const id = `${i}.${idx}`;
      if (!store.S.terms.includes(id)) { store.S.terms.push(id); store.persist(); }
      toast(`${name}  (${n}/5)`, def);
    },
    complete: (r) => showComplete(r),
    gameover: () => showGameOver(),
  };
  game = new Game(WORLDS[i], i, hooks, { doubleJump: store.S.frags.length >= 2 });
  acc = 0; playMusic(i);
  window.__bounce = { get game() { return game; }, store };
}

const acts = {
  play() { ensureAudio(); sfx('ui'); if (!store.S.seenIntro) { introStep = 0; showIntro(); } else startWorld(0); },
  continue() { ensureAudio(); startWorld(Math.min(store.S.unlocked, WORLDS.length) - 1); },
  worlds() { ensureAudio(); showWorlds(); },
  world(a) { startWorld(+a); },
  menu() { showMenu(); },
  dict() { showDict(() => showMenu()); },
  settings() { showSettings(() => showMenu()); },
  credits() { showCredits(); },
  back() { const f = backTo; backTo = () => showMenu(); f(); },
  'intro-next'() { introStep++; if (introStep >= INTRO.length) { store.S.seenIntro = true; store.persist(); startWorld(0); } else showIntro(); },
  'intro-skip'() { store.S.seenIntro = true; store.persist(); startWorld(0); },
  resume() { screen(''); mode = 'play'; game.paused = false; },
  restart() { screen(''); mode = 'play'; game.restartFromCheckpoint(); },
  exit() { showMenu(); },
  'pause-settings'() { showSettings(() => showPause()); },
  'pause-dict'() { showDict(() => showPause()); },
  retry() { startWorld(worldIdx); },
  next() { startWorld(Math.min(WORLDS.length - 1, worldIdx + 1)); },
  reset() {
    if (confirm('Reset all progress, lessons and settings? This cannot be undone.')) {
      store.resetSave(); Object.assign(audioSettings, store.S.settings); applyAudio(); showMenu();
    }
  },
};
ui.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  ensureAudio(); acts[b.dataset.act]?.(b.dataset.arg);
});
pauseBtn.addEventListener('click', () => { if (mode === 'play') showPause(); });

initInput({
  onPause() {
    if (mode === 'play') showPause();
    else if (mode === 'pause') acts.resume();
  },
  onDict() {
    if (mode === 'play') showDict(() => showPause());
    else if (mode === 'menu' && !ui.classList.contains('hidden') && !ui.classList.contains('story')) showDict(() => showMenu());
  },
});

// ---------------------------------------------------------------- loop
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
  if ((mode === 'play') && game && !game.paused) {
    acc += dt;
    while (acc >= 1 / 60) { game.update(1 / 60); acc -= 1 / 60; }
  }
  if (game && mode !== 'menu') game.render(ctx);
  else {
    const t = ts / 1000, th = WORLDS[Math.min(store.S.unlocked, 5) - 1 || 0].theme;
    drawBackdrop(ctx, th, t * 40, t);
  }
  const mc = $('#menucoin');
  if (mc) {
    const c = mc.getContext('2d'); menuAnim += dt; c.clearRect(0, 0, 120, 120);
    const y = 80 - Math.abs(Math.sin(menuAnim * 3)) * 50;
    c.save(); c.scale(2.4, 2.4); drawHero(c, 25, y / 2.4 + 6, menuAnim * 4, 1, 0, menuAnim, 120); c.restore();
  }
  requestAnimationFrame(frame);
}

resize();
showMenu();
requestAnimationFrame(frame);
