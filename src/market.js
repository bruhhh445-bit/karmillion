// Fictional stock market. Prices follow a noisy walk around a slowly growing "fair value";
// news shocks push prices away and they drift back, so buying the dip can pay off.

export const STOCKS = [
  { id: 'BLOOM', name: 'BloomCo',      icon: '🌸', price: 8,    vol: 0.012, drift: 0.0005, div: 0.00004, tier: 0 },
  { id: 'ZEST',  name: 'Zesty Drinks', icon: '🥤', price: 24,   vol: 0.018, drift: 0.0007, div: 0.00003, tier: 0 },
  { id: 'KRMA',  name: 'KarmaCoin',    icon: '🪙', price: 0.85, vol: 0.06,  drift: 0.0012, div: 0, tier: 0, crypto: true },
  { id: 'BUNS',  name: 'Bun Bros',     icon: '🍔', price: 65,   vol: 0.015, drift: 0.0006, div: 0.00005, tier: 1 },
  { id: 'DOGB',  name: 'DogeBrick',    icon: '🐶', price: 0.02, vol: 0.10,  drift: 0.0008, div: 0, tier: 1, crypto: true },
  { id: 'BYTE',  name: 'ByteNova',     icon: '💻', price: 310,  vol: 0.026, drift: 0.0011, div: 0.00001, tier: 2 },
  { id: 'VOLT',  name: 'Volt Motors',  icon: '⚡', price: 780,  vol: 0.032, drift: 0.0012, div: 0, tier: 3 },
  { id: 'ORBX',  name: 'Orbitex',      icon: '🛰️', price: 2400, vol: 0.038, drift: 0.0014, div: 0, tier: 4 },
];

export const TICK_SEC = 3;
export const HIST = 80;
const REVERT = 0.035;

const GOOD = [
  '{n} smashes earnings!', '{n} signs a mega deal', 'Influencer hypes {n}', '{n} launches a viral product',
  'Billionaire buys a huge stake in {n}', '{n} goes to the moon 🚀',
];
const BAD = [
  'Scandal at {n}!', 'Hackers hit {n}', '{n} CEO tweets something dumb', '{n} misses earnings',
  'Recall: {n} products explode', 'Regulators raid {n}',
];

function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function initMarket(s) {
  s.market ??= {};
  for (const st of STOCKS) {
    const m = s.market[st.id];
    if (!m || !(m.p > 0)) s.market[st.id] = { p: st.price, fair: st.price, hist: [st.price] };
    else if (!Array.isArray(m.hist) || !m.hist.length) m.hist = [m.p];
  }
}

// One market step. Returns a news item {text, id, up} or null.
export function marketTick(s, allowNews = true) {
  let news = null;
  let shockAll = 0;
  let shockId = null, shock = 0;

  if (allowNews && Math.random() < 1 / 22) {
    if (Math.random() < 0.12) {
      const up = Math.random() < 0.5;
      shockAll = up ? 0.12 + Math.random() * 0.1 : -(0.15 + Math.random() * 0.15);
      news = { text: up ? '📈 BULL RUN! Everything is pumping' : '📉 MARKET CRASH! Panic everywhere', up };
    } else {
      const st = STOCKS[Math.floor(Math.random() * STOCKS.length)];
      const up = Math.random() < 0.55;
      const size = (0.1 + Math.random() * 0.25) * (st.crypto ? 1.8 : 1);
      shockId = st.id;
      shock = up ? size : -size;
      const list = up ? GOOD : BAD;
      news = { text: (up ? '📰 ' : '🚨 ') + list[Math.floor(Math.random() * list.length)].replace('{n}', st.name), id: st.id, up };
    }
  }

  for (const st of STOCKS) {
    const m = s.market[st.id];
    m.fair *= Math.exp(st.drift);
    let lp = Math.log(m.p);
    lp += st.drift + REVERT * (Math.log(m.fair) - lp) + st.vol * gauss();
    let sh = shockAll * (st.crypto ? 1.5 : 1);
    if (st.id === shockId) sh += shock;
    if (sh) {
      lp += sh;
      m.fair *= Math.exp(sh * 0.4); // part of the news is permanent
    }
    m.p = Math.max(st.price * 0.02, Math.exp(lp));
    m.hist.push(m.p);
    if (m.hist.length > HIST) m.hist.shift();
  }
  return news;
}

export const changeOf = (m) => (m.hist.length > 1 ? m.p / m.hist[0] - 1 : 0);

export function buyStock(s, id, qty) {
  const m = s.market[id];
  const cost = qty * m.p;
  if (qty <= 0 || cost > s.money) return false;
  s.money -= cost;
  const pos = (s.stocks[id] ??= { sh: 0, cost: 0 });
  pos.sh += qty;
  pos.cost += cost;
  s.stats.trades = (s.stats.trades || 0) + 1;
  return true;
}

export function sellStock(s, id, qty) {
  const pos = s.stocks[id];
  if (!pos || qty <= 0 || qty > pos.sh) return null;
  const m = s.market[id];
  const gets = qty * m.p;
  const basis = pos.cost * (qty / pos.sh);
  pos.sh -= qty;
  pos.cost -= basis;
  if (pos.sh <= 1e-9) { pos.sh = 0; pos.cost = 0; }
  s.money += gets;
  const profit = gets - basis;
  s.stats.trades = (s.stats.trades || 0) + 1;
  s.stats.profit = (s.stats.profit || 0) + profit;
  if (profit > (s.stats.bestTrade || 0)) s.stats.bestTrade = profit;
  return profit;
}

// Draw a price line on a canvas.
export function drawChart(canvas, hist, opts = {}) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  c.clearRect(0, 0, w, h);
  if (hist.length < 2) return;
  const min = Math.min(...hist), max = Math.max(...hist);
  const pad = opts.pad ?? 3;
  const y = (v) => pad + (h - pad * 2) * (1 - (v - min) / (max - min || 1));
  const x = (i) => (w * i) / (hist.length - 1);
  const up = hist[hist.length - 1] >= hist[0];
  const col = up ? '#36c25a' : '#ff5470';
  if (opts.fill) {
    c.beginPath();
    c.moveTo(0, h);
    hist.forEach((v, i) => c.lineTo(x(i), y(v)));
    c.lineTo(w, h);
    c.closePath();
    c.fillStyle = up ? 'rgba(54,194,90,.18)' : 'rgba(255,84,112,.18)';
    c.fill();
  }
  c.beginPath();
  hist.forEach((v, i) => (i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v))));
  c.strokeStyle = col;
  c.lineWidth = opts.width ?? 2;
  c.lineJoin = 'round';
  c.stroke();
}
