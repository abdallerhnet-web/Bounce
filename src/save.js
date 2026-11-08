const KEY = 'bounce.save.v1';
const defaults = () => ({
  unlocked: 1,
  stars: {},
  best: {},
  coins: 0,
  terms: [],
  frags: [],
  seenIntro: false,
  settings: { music: 0.5, sfx: 0.7, mute: false },
});

export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const d = defaults();
    return { ...d, ...raw, settings: { ...d.settings, ...(raw.settings || {}) } };
  } catch {
    return defaults();
  }
}

export let S = load();

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage blocked */ }
}

export function resetSave() {
  S = defaults();
  persist();
}
