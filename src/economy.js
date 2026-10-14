// All numbers of the game economy live here.

export const BUSINESSES = [
  { id: 'flowers',  name: 'Flower Stand',  icon: '🌹', cost: 15,     income: 0.5 },
  { id: 'lemonade', name: 'Lemonade Cart', icon: '🍋', cost: 120,    income: 3 },
  { id: 'carwash',  name: 'Car Wash',      icon: '🚿', cost: 1100,   income: 20 },
  { id: 'burger',   name: 'Burger Shop',   icon: '🍔', cost: 12000,  income: 150 },
  { id: 'startup',  name: 'Tech Startup',  icon: '💻', cost: 130000, income: 1200 },
  { id: 'rocket',   name: 'Rocket Co.',    icon: '🚀', cost: 1.5e6,  income: 10000 },
  { id: 'yacht',    name: 'Yacht Club',    icon: '🛥️', cost: 2e7,    income: 90000 },
  { id: 'island',   name: 'Private Island',icon: '🏝️', cost: 3e8,    income: 800000 },
];

export const COST_GROWTH = 1.15;
export const MILESTONES = [25, 50, 100, 200]; // each one doubles that business

// Wealth tiers by lifetime earnings. The hero's look changes with each tier.
export const TIERS = [
  { name: 'Broke',            at: 0 },
  { name: 'Worker',           at: 500 },
  { name: 'Hustler',          at: 2e4 },
  { name: 'Boss',             at: 3e5 },
  { name: 'Millionaire',      at: 1e6 },
  { name: 'Multi-Millionaire',at: 5e7 },
  { name: 'Billionaire',      at: 1e9 },
];

export function costOf(biz, level) {
  return Math.ceil(biz.cost * Math.pow(COST_GROWTH, level));
}

export function milestoneMult(level) {
  let m = 1;
  for (const ms of MILESTONES) if (level >= ms) m *= 2;
  return m;
}

export function bizIncome(biz, level) {
  return biz.income * level * milestoneMult(level);
}

export function nextMilestone(level) {
  return MILESTONES.find((m) => m > level) ?? null;
}

export function incomePerSec(state) {
  let total = 0;
  for (const b of BUSINESSES) total += bizIncome(b, state.biz[b.id] || 0);
  return total * karmaMult(state);
}

// Karma: every point (either way) is +1% income, so both paths are worth playing.
export function karmaMult(state) {
  return 1 + Math.abs(state.karma || 0) / 100;
}

export function tapValue(state) {
  return Math.max(1, Math.floor(1 + incomePerSec(state) * 0.05));
}

export function tierIndex(totalEarned) {
  let i = 0;
  TIERS.forEach((t, idx) => { if (totalEarned >= t.at) i = idx; });
  return i;
}

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n).toString();
  let i = 0;
  while (n >= 1000 && i < SUFFIXES.length - 1) { n /= 1000; i++; }
  return (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)) + SUFFIXES[i];
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}
