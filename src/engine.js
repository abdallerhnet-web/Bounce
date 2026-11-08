// Input, audio (Web Audio synth), settings. No dependencies.
export const keys = { left: false, right: false, jump: false, attack: false };
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'jump', KeyW: 'jump', ArrowUp: 'jump', KeyX: 'attack', KeyJ: 'attack',
};

export function initInput({ onPause, onDict }) {
  addEventListener('keydown', (e) => {
    const k = KEYMAP[e.code];
    if (k) { keys[k] = true; e.preventDefault(); }
    if (e.code === 'Escape' && !e.repeat) onPause();
    if (e.code === 'KeyB' && !e.repeat) onDict();
  });
  addEventListener('keyup', (e) => {
    const k = KEYMAP[e.code];
    if (k) keys[k] = false;
  });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  document.querySelectorAll('[data-k]').forEach((b) => {
    const k = b.dataset.k;
    const on = (e) => { e.preventDefault(); keys[k] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch {} };
    const off = (e) => { e.preventDefault(); keys[k] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('lostpointercapture', off);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

// ---------- audio ----------
export const audioSettings = { music: 0.5, sfx: 0.7, mute: false };
let ac = null, master = null, musicG = null, sfxG = null;

export function ensureAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.connect(ac.destination);
    musicG = ac.createGain(); musicG.connect(master);
    sfxG = ac.createGain(); sfxG.connect(master);
    applyAudio();
  }
  if (ac.state === 'suspended') ac.resume();
}

export function applyAudio() {
  if (!ac) return;
  master.gain.value = audioSettings.mute ? 0 : 1;
  musicG.gain.value = audioSettings.music * 0.25;
  sfxG.gain.value = audioSettings.sfx * 0.5;
}

function tone(f, dur, type = 'square', to = null, dest = null, vol = 0.5, when = 0) {
  if (!ac) return;
  const t = ac.currentTime + when;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(dest || sfxG);
  o.start(t); o.stop(t + dur + 0.02);
}

const SFX = {
  jump: [380, 0.14, 'square', 760], coin: [880, 0.09, 'square', 1320], frag: [500, 0.5, 'triangle', 1500],
  attack: [260, 0.18, 'sawtooth', 90], hit: [180, 0.25, 'square', 55], stomp: [320, 0.1, 'square', 140],
  check: [520, 0.25, 'triangle', 880], boss: [110, 0.7, 'sawtooth', 45], win: [523, 0.6, 'triangle', 1046],
  block: [660, 0.18, 'triangle', 990], spring: [300, 0.22, 'sine', 950], dj: [520, 0.14, 'square', 900],
  ui: [700, 0.05, 'square', 900],
};
export function sfx(name) {
  const s = SFX[name]; if (!s || !ac) return;
  tone(s[0], s[1], s[2], s[3]);
}

// one musical identity per world: root, scale, tempo, wave
const MUSIC = [
  { root: 196, sc: [0, 2, 4, 7, 9, 12], bpm: 96, w: 'triangle', pat: [0, 2, 4, 2, 5, 4, 2, 1] },
  { root: 174.6, sc: [0, 3, 5, 7, 10, 12], bpm: 84, w: 'sine', pat: [0, 3, 2, 4, 1, 3, 5, 2] },
  { root: 220, sc: [0, 3, 5, 6, 7, 10], bpm: 128, w: 'sawtooth', pat: [0, 0, 3, 0, 4, 0, 3, 5] },
  { root: 246.9, sc: [0, 2, 3, 7, 8, 12], bpm: 72, w: 'triangle', pat: [5, 3, 2, 0, 3, 2, 0, 1] },
  { root: 130.8, sc: [0, 1, 4, 5, 7, 8], bpm: 104, w: 'square', pat: [0, 2, 4, 5, 4, 2, 3, 1] },
];
let mTimer = null, mStep = 0;
export function playMusic(i) {
  stopMusic();
  if (!ac) return;
  const m = MUSIC[i % MUSIC.length];
  mStep = 0;
  mTimer = setInterval(() => {
    const d = m.sc[m.pat[mStep % m.pat.length] % m.sc.length];
    const f = m.root * Math.pow(2, d / 12);
    tone(f, 0.28, m.w, null, musicG, 0.6);
    if (mStep % 4 === 0) tone(m.root / 2, 0.5, 'sine', null, musicG, 0.7);
    mStep++;
  }, 60000 / m.bpm / 2);
}
export function stopMusic() { if (mTimer) { clearInterval(mTimer); mTimer = null; } }
