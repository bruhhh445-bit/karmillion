// Core numbers of the game: businesses, upgrades, tiers, multipliers, formatting.
import { PROPERTIES, LUXURY } from './assets.js';
import { STOCKS } from './market.js';

export const BUSINESSES = [
  { id: 'flowers',  name: 'Flower Stand',   cost: 15,     income: 0.5,    upg: ['Fresh Roses', 'Bouquet Delivery', 'Flower Empire'] },
  { id: 'lemonade', name: 'Lemonade Cart',  cost: 120,    income: 3,      upg: ['Ice Cubes', 'Secret Recipe', 'Lemonade Franchise'] },
  { id: 'carwash',  name: 'Car Wash',       cost: 1100,   income: 20,     upg: ['Foam Cannon', 'VIP Wax', 'Robot Washers'] },
  { id: 'burger',   name: 'Burger Shop',    cost: 12000,  income: 150,    upg: ['Double Patty', 'Drive-Thru', 'Burger Chain'] },
  { id: 'startup',  name: 'Tech Startup',   cost: 130000, income: 1200,   upg: ['Free Pizza Fridays', 'AI Assistant', 'Unicorn Status'] },
  { id: 'club',     name: 'Night Club',     cost: 5e5,    income: 3800,   upg: ['Laser Show', 'Celebrity DJ', 'Club Chain'] },
  { id: 'rocket',   name: 'Rocket Co.',     cost: 1.5e6,  income: 10000,  upg: ['Reusable Boosters', 'Moon Tourism', 'Mars Colony'] },
  { id: 'yacht',    name: 'Yacht Club',     cost: 2e7,    income: 90000,  upg: ['Champagne Bar', 'Celebrity Members', 'Floating City'] },
  { id: 'casino',   name: 'Casino Royale',  cost: 8e7,    income: 3e5,    upg: ['High Roller Room', 'Golden Slots', 'Casino Strip'] },
  { id: 'island',   name: 'Island Resort',  cost: 3e8,    income: 8e5,    upg: ['Infinity Pool', 'Private Airport', 'Island Nation'] },
];

export const COST_GROWTH = 1.15;
export const MILESTONES = [25, 50, 100, 200, 400]; // each one doubles that business
const UPG_AT = [10, 25, 75];         // business level needed for each upgrade
const UPG_PRICE = [40, 500, 9000];   // × business base cost
export const UPG_MULT = 3;

// Flat list of one-time upgrades, generated from the businesses above.
export const UPGRADES = BUSINESSES.flatMap((b) => b.upg.map((name, i) => ({
  id: `${b.id}_${i}`, biz: b.id, name, at: UPG_AT[i], cost: b.cost * UPG_PRICE[i],
})));

// Wealth tiers by net worth. The hero's look changes with each tier.
export const TIERS = [
  { name: 'Broke',             at: 0 },
  { name: 'Worker',            at: 500 },
  { name: 'Hustler',           at: 2e4 },
  { name: 'Boss',              at: 3e5 },
  { name: 'Millionaire',       at: 1e6 },
  { name: 'Multi-Millionaire', at: 5e7 },
  { name: 'Billionaire',       at: 1e9 },
];

export const REBIRTH_AT = 1e9;
export const STAR_BONUS = 0.25;   // +25% income per star

export function costOf(biz, level) {
  return Math.ceil(biz.cost * Math.pow(COST_GROWTH, level));
}

export function milestoneMult(level) {
  let m = 1;
  for (const ms of MILESTONES) if (level >= ms) m *= 2;
  return m;
}

export function upgradeMult(state, bizId) {
  let m = 1;
  for (const u of UPGRADES) if (u.biz === bizId && state.upg?.includes(u.id)) m *= UPG_MULT;
  return m;
}

export function bizIncome(state, biz) {
  const level = state.biz[biz.id] || 0;
  return biz.income * level * milestoneMult(level) * upgradeMult(state, biz.id);
}

export function nextMilestone(level) {
  return MILESTONES.find((m) => m > level) ?? null;
}

// ---------- multipliers ----------
// Karma: every point (either way) is +1% income, so both paths are worth playing.
export const karmaMult = (s) => 1 + Math.min(Math.abs(s.karma || 0), 300) / 100;
export const fame = (s) => LUXURY.reduce((t, l) => t + (s.lux?.includes(l.id) ? l.fame : 0), 0);
export const fameMult = (s) => 1 + fame(s) / 100;
export const starMult = (s) => 1 + (s.stars || 0) * STAR_BONUS;
export const allMult = (s) => karmaMult(s) * fameMult(s) * starMult(s);

export function rentPerSec(s) {
  return PROPERTIES.reduce((t, p) => t + (s.props?.[p.id] || 0) * p.rent, 0);
}

export function dividendsPerSec(s) {
  return STOCKS.reduce((t, st) => {
    const sh = s.stocks?.[st.id]?.sh || 0;
    const p = s.market?.[st.id]?.p || st.price;
    return t + sh * p * st.div;
  }, 0);
}

export function incomeBreakdown(s) {
  const biz = BUSINESSES.reduce((t, b) => t + bizIncome(s, b), 0);
  const rent = rentPerSec(s);
  const div = dividendsPerSec(s);
  const mult = allMult(s);
  return { biz: biz * mult, rent: rent * mult, div, mult, total: (biz + rent) * mult + div };
}

export const incomePerSec = (s) => incomeBreakdown(s).total;

// ---------- tap ----------
export const TAP_MAX = 12;
export const tapUpgradeCost = (lvl) => Math.ceil(50 * Math.pow(6, lvl));
export function tapValue(s) {
  return Math.max(1, (1 + incomePerSec(s) * 0.04) * Math.pow(2, s.tapLvl || 0));
}

// ---------- net worth ----------
export function stockValue(s) {
  return STOCKS.reduce((t, st) => t + (s.stocks?.[st.id]?.sh || 0) * (s.market?.[st.id]?.p || st.price), 0);
}
export function propertyValue(s) {
  return PROPERTIES.reduce((t, p) => t + (s.props?.[p.id] || 0) * p.cost * 0.7, 0);
}
export function luxuryValue(s) {
  return LUXURY.reduce((t, l) => t + (s.lux?.includes(l.id) ? l.cost * 0.5 : 0), 0);
}
export function netWorth(s) {
  return s.money + stockValue(s) + propertyValue(s) + luxuryValue(s);
}

export function tierIndex(worth) {
  let i = 0;
  TIERS.forEach((t, idx) => { if (worth >= t.at) i = idx; });
  return i;
}

export function starsForRebirth(worth) {
  if (worth < REBIRTH_AT) return 0;
  return Math.floor(Math.sqrt(worth / REBIRTH_AT) * 2);
}

// ---------- formatting ----------
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  const neg = n < 0;
  n = Math.abs(n);
  let out;
  if (n < 1000) out = n < 10 && n % 1 ? n.toFixed(n < 1 ? 2 : 1) : Math.floor(n).toString();
  else {
    let i = 0;
    while (n >= 1000 && i < SUFFIXES.length - 1) { n /= 1000; i++; }
    out = (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)) + SUFFIXES[i];
  }
  return (neg ? '-' : '') + out;
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

export const money = (n) => (n < 0 ? '-$' : '$') + fmt(Math.abs(n));
export const pct = (x) => (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '%';
