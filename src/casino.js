// Casino: Slots, Roulette, Crash. Play money only, max bet 25% of cash, house edge ~3-6%.
import { SLOT } from './art/icons.js';
import { INK } from './art/cars.js';

export const CASINO_TIER = 1;
const BETS = [0.01, 0.05, 0.1, 0.25];

// ---------- slots ----------
const SYMS = [
  { id: 'cherry', w: 30, pay: 6 },
  { id: 'lemon', w: 25, pay: 8 },
  { id: 'bell', w: 18, pay: 12 },
  { id: 'bar', w: 14, pay: 20 },
  { id: 'diamond', w: 8, pay: 50 },
  { id: 'seven', w: 5, pay: 100 },
];
const TWO_CHERRIES = 2.6;   // RTP ≈ 94%
const W_TOTAL = SYMS.reduce((t, x) => t + x.w, 0);
function roll() {
  let r = Math.random() * W_TOTAL;
  for (const x of SYMS) { if ((r -= x.w) < 0) return x; }
  return SYMS[0];
}
const randSym = () => SYMS[Math.floor(Math.random() * SYMS.length)];

// ---------- roulette ----------
const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const colorOf = (n) => (n === 0 ? 'green' : REDS.has(n) ? 'red' : 'black');

function wheelSVG() {
  const n = ORDER.length, R = 100, seg = (2 * Math.PI) / n;
  let out = '';
  ORDER.forEach((num, i) => {
    const a0 = i * seg - Math.PI / 2 - seg / 2, a1 = a0 + seg;
    const p = (a, r) => `${(110 + r * Math.cos(a)).toFixed(2)} ${(110 + r * Math.sin(a)).toFixed(2)}`;
    const fill = num === 0 ? '#36c25a' : REDS.has(num) ? '#e8345a' : '#22202e';
    out += `<path d="M110 110 L${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} Z" fill="${fill}" stroke="#ffc928" stroke-width="1"/>`;
    const am = a0 + seg / 2;
    out += `<text x="${(110 + 86 * Math.cos(am)).toFixed(1)}" y="${(110 + 86 * Math.sin(am)).toFixed(1)}" font-size="8" font-weight="900" font-family="Arial"
      fill="#fff" text-anchor="middle" dominant-baseline="middle" transform="rotate(${(am * 180) / Math.PI + 90} ${(110 + 86 * Math.cos(am)).toFixed(1)} ${(110 + 86 * Math.sin(am)).toFixed(1)})">${num}</text>`;
  });
  return `<svg viewBox="0 0 220 220" class="wheel-svg" aria-hidden="true">
    <circle cx="110" cy="110" r="106" fill="#7a3c2a" stroke="${INK}" stroke-width="5"/>
    <g id="wheelRot">${out}<circle cx="110" cy="110" r="64" fill="#a5652f" stroke="${INK}" stroke-width="4"/>
      <circle cx="110" cy="110" r="22" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
      ${[0, 90, 180, 270].map((a) => `<rect x="106" y="50" width="8" height="40" rx="4" fill="#ffc928" stroke="${INK}" stroke-width="3" transform="rotate(${a} 110 110)"/>`).join('')}</g>
  </svg>`;
}

// ---------- crash ----------
function crashPoint() {
  const u = Math.random();
  return Math.max(1, Math.floor((0.97 / (1 - u)) * 100) / 100);
}

// ---------- UI ----------
export function createCasino(ctx) {
  // ctx: { S, money, toast, haptic, save, minBet }
  let game = 'slots';
  let betFrac = 0.05;
  let busy = false;
  let crash = null; // { bet, start, point, raf, out }
  let wheelAngle = 0;

  const bet = () => Math.max(10, Math.floor(ctx.S.money * betFrac));
  const canBet = () => ctx.S.money >= 10 && !busy;

  function take(amount) {
    ctx.S.money -= amount;
    ctx.S.casino.lost += amount;
  }
  function pay(amount, betAmt) {
    ctx.S.money += amount;
    ctx.S.casino.won += amount;
    const profit = amount - betAmt;
    if (profit > (ctx.S.casino.best || 0)) ctx.S.casino.best = profit;
  }

  function html() {
    if ((ctx.S.bestTier || 0) < CASINO_TIER) {
      return `<div class="card center-card"><div class="casino-sign">CASINO</div>
        <p class="muted">The doors open when you become a <b>Worker</b>.</p></div>`;
    }
    const tabs = [['slots', 'Slots'], ['roulette', 'Roulette'], ['crash', 'Crash']].map(([id, l]) =>
      `<button class="${game === id ? 'on' : ''}" data-cas="${id}">${l}</button>`).join('');
    const bets = BETS.map((f) => `<button class="chip ${betFrac === f ? 'on' : ''}" data-bet="${f}">${f * 100}%</button>`).join('');
    return `
      <div class="casino-sign">KARMA CASINO</div>
      <div class="seg three">${tabs}</div>
      <div class="bet-row"><span class="muted">Bet</span><b id="betAmt">${ctx.money(bet())}</b><div class="chips">${bets}</div></div>
      <div id="game">${gameHTML()}</div>
      <div class="hint center">Play money only. Biggest win: <b>${ctx.money(ctx.S.casino.best || 0)}</b></div>`;
  }

  function gameHTML() {
    if (game === 'slots') {
      return `<div class="slot-machine">
        <div class="slot-top">★ LUCKY 7 ★</div>
        <div class="reels">${[0, 1, 2].map((i) => `<div class="reel" id="reel${i}">${SLOT.seven}</div>`).join('')}</div>
        <div class="slot-msg" id="slotMsg">3 of a kind wins. 🍒🍒 pays ×${TWO_CHERRIES}</div>
        <button class="btn gold big wide" id="spinBtn" ${canBet() ? '' : 'disabled'}>SPIN</button>
        <div class="paytable">${SYMS.slice().reverse().map((x) => `<span>${SLOT[x.id]}×${x.pay}</span>`).join('')}</div>
      </div>`;
    }
    if (game === 'roulette') {
      return `<div class="roulette">
        <div class="wheel-wrap"><div class="pointer"></div><div class="wheel" id="wheel" style="transform:rotate(${wheelAngle}deg)">${wheelSVG()}</div></div>
        <div class="slot-msg" id="rouMsg">Pick a color</div>
        <div class="rou-bets">
          <button class="btn big rb red" data-rou="red" ${canBet() ? '' : 'disabled'}>RED ×2</button>
          <button class="btn big rb green" data-rou="green" ${canBet() ? '' : 'disabled'}>0 ×36</button>
          <button class="btn big rb black" data-rou="black" ${canBet() ? '' : 'disabled'}>BLACK ×2</button>
        </div></div>`;
    }
    return `<div class="crash">
      <div class="crash-sky" id="crashSky">
        <div class="crash-mult" id="crashMult">1.00×</div>
        <div class="crash-rocket" id="crashRocket">${rocketSVG}</div>
      </div>
      <div class="slot-msg" id="crashMsg">Cash out before the rocket explodes!</div>
      <button class="btn gold big wide" id="crashBtn" ${canBet() ? '' : 'disabled'}>LAUNCH</button></div>`;
  }

  const rocketSVG = `<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(45 32 32)">
    <path d="M32 4 Q48 16 46 40 H18 Q16 16 32 4 Z" fill="#f4f3fa" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="32" cy="22" r="6" fill="#9fe3ff" stroke="${INK}" stroke-width="3"/>
    <path d="M18 34 L8 46 L18 44 Z M46 34 L56 46 L46 44 Z" fill="#e8345a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M22 42 Q32 66 42 42 Z" fill="#ff8a1f" stroke="${INK}" stroke-width="3" class="flame"/></g></svg>`;

  // ----- actions -----
  function spinSlots(root) {
    const b = bet();
    if (!canBet() || b > ctx.S.money) return;
    busy = true;
    take(b);
    ctx.haptic('medium');
    const result = [roll(), roll(), roll()];
    const reels = [0, 1, 2].map((i) => root.querySelector('#reel' + i));
    root.querySelector('#spinBtn').disabled = true;
    root.querySelector('#slotMsg').textContent = 'Spinning…';
    reels.forEach((r) => r.classList.add('spin'));
    const timers = reels.map((r) => setInterval(() => { r.innerHTML = SLOT[randSym().id]; }, 70));
    reels.forEach((r, i) => setTimeout(() => {
      clearInterval(timers[i]);
      r.classList.remove('spin');
      r.innerHTML = SLOT[result[i].id];
      ctx.haptic('light');
      if (i === 2) finish();
    }, 700 + i * 350));
    function finish() {
      let mult = 0;
      if (result[0].id === result[1].id && result[1].id === result[2].id) mult = result[0].pay;
      else if (result.filter((x) => x.id === 'cherry').length === 2) mult = TWO_CHERRIES;
      const msg = root.querySelector('#slotMsg');
      if (mult) {
        const win = Math.floor(b * mult);
        pay(win, b);
        msg.innerHTML = `<b class="up">WIN ${ctx.money(win)}!</b>`;
        if (mult >= 20) ctx.toast(`JACKPOT! +${ctx.money(win)} 🎰`, 'good');
        ctx.haptic('heavy');
        reels.forEach((r) => r.classList.add('win'));
        setTimeout(() => reels.forEach((r) => r.classList.remove('win')), 900);
      } else msg.textContent = 'No luck. Try again!';
      busy = false;
      ctx.save();
      refreshBet(root);
    }
  }

  function spinRoulette(root, pick) {
    const b = bet();
    if (!canBet() || b > ctx.S.money) return;
    busy = true;
    take(b);
    ctx.haptic('medium');
    const idx = Math.floor(Math.random() * ORDER.length);
    const num = ORDER[idx];
    const segDeg = 360 / ORDER.length;
    // bring segment idx under the top pointer
    const target = 360 * 5 + (360 - idx * segDeg);
    wheelAngle = Math.ceil(wheelAngle / 360) * 360 + target;
    const w = root.querySelector('#wheel');
    w.style.transition = 'transform 3.2s cubic-bezier(.12,.7,.12,1)';
    w.style.transform = `rotate(${wheelAngle}deg)`;
    root.querySelectorAll('[data-rou]').forEach((x) => (x.disabled = true));
    root.querySelector('#rouMsg').textContent = 'No more bets…';
    setTimeout(() => {
      wheelAngle %= 360;
      w.style.transition = 'none';
      w.style.transform = `rotate(${wheelAngle}deg)`;
      const col = colorOf(num);
      const msg = root.querySelector('#rouMsg');
      if (col === pick) {
        const win = b * (pick === 'green' ? 36 : 2);
        pay(win, b);
        msg.innerHTML = `<b class="up">${num} ${col.toUpperCase()} — WIN ${ctx.money(win)}!</b>`;
        ctx.haptic('heavy');
        if (pick === 'green') ctx.toast(`ZERO! +${ctx.money(win)} 🎯`, 'good');
      } else msg.innerHTML = `<b class="down">${num} ${col.toUpperCase()}</b> — you lose`;
      busy = false;
      ctx.save();
      refreshBet(root);
    }, 3300);
  }

  function crashClick(root) {
    const btn = root.querySelector('#crashBtn');
    if (crash && !crash.out) { // cash out
      const m = crashMult();
      crash.out = true;
      const win = Math.floor(crash.bet * m);
      pay(win, crash.bet);
      btn.disabled = true;
      root.querySelector('#crashMsg').innerHTML = `<b class="up">Cashed out at ${m.toFixed(2)}× — ${ctx.money(win)}!</b>`;
      ctx.haptic('heavy');
      ctx.save();
      return;
    }
    const b = bet();
    if (!canBet() || b > ctx.S.money) return;
    busy = true;
    take(b);
    crash = { bet: b, start: performance.now(), point: crashPoint(), out: false };
    root.querySelector('#crashMsg').textContent = 'Flying…';
    root.querySelector('#crashSky').classList.remove('boom');
    const tick = () => {
      if (!document.body.contains(btn)) { crash = null; busy = false; return; }
      const m = crashMult();
      const shown = Math.min(m, crash.point);
      root.querySelector('#crashMult').textContent = shown.toFixed(2) + '×';
      const prog = Math.min(1, Math.log(shown) / Math.log(10));
      const rk = root.querySelector('#crashRocket');
      rk.style.left = (8 + prog * 70) + '%';
      rk.style.bottom = (6 + prog * 62) + '%';
      if (!crash.out) btn.innerHTML = `CASH OUT ${ctx.money(Math.floor(crash.bet * shown))}`;
      if (m >= crash.point) {
        root.querySelector('#crashSky').classList.add('boom');
        root.querySelector('#crashMult').textContent = `💥 ${crash.point.toFixed(2)}×`;
        if (!crash.out) root.querySelector('#crashMsg').innerHTML = '<b class="down">Crashed! You lost the bet.</b>';
        crash = null;
        busy = false;
        btn.innerHTML = 'LAUNCH';
        btn.disabled = false;
        ctx.save();
        refreshBet(root);
        return;
      }
      requestAnimationFrame(tick);
    };
    btn.innerHTML = 'CASH OUT';
    requestAnimationFrame(tick);
  }
  const crashMult = () => Math.exp(0.11 * ((performance.now() - crash.start) / 1000));

  function refreshBet(root) {
    const el = root.querySelector('#betAmt');
    if (el) el.textContent = ctx.money(bet());
    root.querySelectorAll('#spinBtn, [data-rou]').forEach((x) => (x.disabled = !canBet()));
    const cb = root.querySelector('#crashBtn');
    if (cb && !crash) cb.disabled = !canBet();
  }

  function onClick(e, root) {
    const t = e.target.closest('button');
    if (!t || t.disabled) return false;
    if (t.dataset.cas) { if (busy) return true; game = t.dataset.cas; root.innerHTML = html(); return true; }
    if (t.dataset.bet) { if (busy) return true; betFrac = Number(t.dataset.bet); root.innerHTML = html(); return true; }
    if (t.id === 'spinBtn') { spinSlots(root); return true; }
    if (t.dataset.rou) { spinRoulette(root, t.dataset.rou); return true; }
    if (t.id === 'crashBtn') { crashClick(root); return true; }
    return false;
  }

  return { html, onClick, refreshBet, isBusy: () => busy };
}
