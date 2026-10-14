// Achievements with cash rewards. Reward = max(min, N minutes of income).
import { BUSINESSES } from './economy.js';
import { carOf } from './assets.js';

const anyBiz = (s) => BUSINESSES.some((b) => (s.biz[b.id] || 0) > 0);
const anyProp = (s) => Object.values(s.props || {}).some((n) => n > 0);
const epsDone = (s) => Object.values(s.episodes || {}).filter((e) => e.done).length;

export const GOALS = [
  { id: 'biz1',    icon: '🌹', text: 'Open your first business',        check: anyBiz, min: 30, mins: 1 },
  { id: 'taps100', icon: '👆', text: 'Tap 100 times',                    check: (s) => s.taps >= 100, min: 50, mins: 2 },
  { id: 'flw10',   icon: '🌹', text: 'Flower Stand level 10',            check: (s) => (s.biz.flowers || 0) >= 10, min: 100, mins: 2 },
  { id: 'upg1',    icon: '⬆️', text: 'Buy a business upgrade',           check: (s) => s.upg.length >= 1, min: 200, mins: 3 },
  { id: 'stock1',  icon: '📈', text: 'Buy your first stock',              check: (s) => (s.stats.trades || 0) >= 1, min: 100, mins: 2 },
  { id: 'ep1',     icon: '🎬', text: 'Finish an episode',                check: (s) => epsDone(s) >= 1, min: 200, mins: 3 },
  { id: 'car1',    icon: '🚲', text: 'Get your first ride',               check: (s) => !!carOf(s), min: 300, mins: 3 },
  { id: 'worker',  icon: '👷', text: 'Become a Worker',                  check: (s) => s.tier >= 1, min: 300, mins: 3 },
  { id: 'profit',  icon: '💹', text: 'Make $1K profit on stocks',         check: (s) => (s.stats.profit || 0) >= 1000, min: 1000, mins: 5 },
  { id: 'home1',   icon: '🛖', text: 'Buy your first property',           check: anyProp, min: 1500, mins: 5 },
  { id: 'karma50', icon: '☯️', text: 'Reach 50 karma (good or bad)',      check: (s) => Math.abs(s.karma) >= 50, min: 2000, mins: 5 },
  { id: 'hustler', icon: '🧢', text: 'Become a Hustler',                 check: (s) => s.tier >= 2, min: 3000, mins: 5 },
  { id: 'trade50', icon: '🔁', text: 'Make 50 trades',                   check: (s) => (s.stats.trades || 0) >= 50, min: 5000, mins: 8 },
  { id: 'eps2',    icon: '🎬', text: 'Finish 2 episodes',                 check: (s) => epsDone(s) >= 2, min: 5000, mins: 8 },
  { id: 'boss',    icon: '💼', text: 'Become a Boss',                    check: (s) => s.tier >= 3, min: 5e4, mins: 10 },
  { id: 'upg8',    icon: '⬆️', text: 'Own 8 upgrades',                   check: (s) => s.upg.length >= 8, min: 1e5, mins: 10 },
  { id: 'profit1m',icon: '🤑', text: 'Make $1M profit on stocks',         check: (s) => (s.stats.profit || 0) >= 1e6, min: 2e5, mins: 12 },
  { id: 'million', icon: '💰', text: 'Become a Millionaire',             check: (s) => s.tier >= 4, min: 2e5, mins: 15 },
  { id: 'tap10k',  icon: '👆', text: 'Tap 10,000 times',                 check: (s) => s.taps >= 10000, min: 1e5, mins: 15 },
  { id: 'multi',   icon: '💎', text: 'Become a Multi-Millionaire',       check: (s) => s.tier >= 5, min: 1e7, mins: 20 },
  { id: 'billion', icon: '👑', text: 'Become a Billionaire',             check: (s) => s.tier >= 6, min: 1e8, mins: 30 },
  { id: 'life2',   icon: '🔄', text: 'Start a New Life',                 check: (s) => (s.lives || 0) >= 1, min: 1000, mins: 30 },
];
