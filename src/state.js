// The single game state object, shared by every module.
import { writeSave } from './platform.js';
import { initMarket } from './market.js';
import { LUXURY } from './assets.js';

export const DEFAULT = () => ({
  v: 2,
  money: 15,
  totalEarned: 0,       // this life
  lifetimeEarned: 0,    // across lives
  biz: {},
  upg: [],
  tapLvl: 0,
  stocks: {},
  market: {},
  props: {},
  lux: [],
  ride: null,
  casino: { won: 0, lost: 0, best: 0 },
  karma: 0,
  stars: 0,
  lives: 0,
  tier: 0,
  bestTier: 0,
  boostUntil: 0,
  lastDaily: 0,
  lastSeen: Date.now(),
  savedAt: 0,
  lastEvent: Date.now(),
  pending: [],
  episodes: {},
  codes: [],
  goals: {},
  taps: 0,
  stats: { trades: 0, profit: 0, bestTrade: 0, events: 0 },
});

export const S = DEFAULT();

export function loadInto(raw) {
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = null; }
  Object.assign(S, DEFAULT(), data || {});
  S.stats = { ...DEFAULT().stats, ...(S.stats || {}) };
  S.casino = { ...DEFAULT().casino, ...(S.casino || {}) };
  if (!Array.isArray(S.upg)) S.upg = [];
  if (!Array.isArray(S.lux)) S.lux = [];
  // v1 → v2 item ids
  S.lux = [...new Set(S.lux.map((id) => (id === 'supercar' ? 'gold' : id)))].filter((id) => LUXURY.some((l) => l.id === id));
  if (!Array.isArray(S.pending)) S.pending = [];
  S.bestTier = Math.max(S.bestTier || 0, S.tier || 0);
  initMarket(S);
}

export function earn(amount) {
  S.money += amount;
  S.totalEarned += amount;
  S.lifetimeEarned += amount;
}

export function save() {
  S.lastSeen = Date.now();
  S.savedAt = Date.now();
  const round = (k, v) => (typeof v === 'number' && !Number.isInteger(v) ? +v.toPrecision(7) : v);
  const full = JSON.stringify(S, round);
  const slim = JSON.stringify({ ...S, market: Object.fromEntries(
    Object.entries(S.market).map(([id, m]) => [id, { p: m.p, fair: m.fair }])) }, round);
  writeSave(full, slim);
}

// New Life: keep stars, karma, story, codes, goals, stats, market prices.
export function rebirth(stars) {
  const keep = {
    stars: (S.stars || 0) + stars,
    lives: (S.lives || 0) + 1,
    karma: S.karma,
    lifetimeEarned: S.lifetimeEarned,
    bestTier: S.bestTier,
    episodes: S.episodes,
    codes: S.codes,
    goals: S.goals,
    stats: S.stats,
    taps: S.taps,
    market: S.market,
    lastDaily: S.lastDaily,
    casino: S.casino,
  };
  Object.assign(S, DEFAULT(), keep);
  S.money = 15 * (1 + S.stars);
  initMarket(S);
  save();
}
