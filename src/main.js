import './style.css';
import {
  BUSINESSES, UPGRADES, UPG_MULT, TIERS, TAP_MAX, REBIRTH_AT, STAR_BONUS,
  costOf, bizIncome, nextMilestone, incomeBreakdown, incomePerSec, tapValue, tapUpgradeCost,
  tierIndex, netWorth, stockValue, starsForRebirth, fame, allMult, fmt, fmtTime, money, pct,
} from './economy.js';
import {
  PROPERTIES, LUXURY, LUX_KINDS, PROP_MAX, PROP_SELL, LUX_SELL, propCost, propArt, luxArt, homeOf, carOf, boatOf, airOf,
} from './assets.js';
import { bizIcon, tabIcon, stockLogo, coin } from './art/icons.js';
import { sceneSVG } from './art/scene.js';
import { createCasino } from './casino.js';
import { STOCKS, TICK_SEC, marketTick, changeOf, buyStock, sellStock, drawChart } from './market.js';
import { pickEvent, eventAmount, karmaTitle } from './events.js';
import { GOALS } from './goals.js';
import { S, loadInto, earn, save, rebirth } from './state.js';
import {
  initTelegram, inTelegram, playerName, haptic, loadSave, showRewardedAd, maybeShowInterstitial, tg,
} from './platform.js';
import { initCloud, submitScore, topPlayers, redeemCode, castVote, getVotes, track, countDailyPlayer } from './cloud.js';
import { OFFLINE_CAP_HOURS, BOOST_MINUTES, ADSGRAM_TASK_ID, YOUTUBE_URL } from './config.js';
import { EPISODES } from './episodes.js';
import { heroHTML, girlHTML, richGuyHTML } from './hero.js';
import { initFx, coinBurst, confetti, smoothCounter, pop } from './fx.js';
import { playIntro } from './intro.js';

// ---------------------------------------------------------------- helpers
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const boosted = () => Date.now() < S.boostUntil;
const ips = () => incomePerSec(S) * (boosted() ? 2 : 1);
const minutesOfIncome = (m, min) => Math.max(min, incomePerSec(S) * m * 60);
// Goal rewards keep up with your income, but early goals can't pay a fortune.
const goalReward = (g) => Math.min(minutesOfIncome(g.mins, g.min), g.min * 25);

let tab = 'biz';
let assetsSub = 'homes';
let sheetKind = '';        // 'goals' | 'gifts' | 'top' | 'life' | 'stock:ID'
let bizMode = 1;           // 1 | 10 | 'max'
let stockBuyMode = 1;      // 1 | 10 | 100 | 'max'
let modalKind = '';        // e.g. 'stock:BYTE', 'episode', 'event'
let lastNews = '';
const TABS = ['biz', 'market', 'assets', 'casino', 'story'];
const sessionStart = Date.now();
const LUCKY_CD = 4 * 60000;          // Lucky cash cooldown
const BAG_EVERY = 100000;            // a money bag drops every ~100 s
let bagUntil = 0, nextBag = Date.now() + 45000;
const adBtn = (label, attrs = '', extra = '') => `<button class="btn ad ${extra}" ${attrs}><span class="ad-play">▶</span><span class="ad-txt">${label}</span></button>`;
const tierBonus = (ti) => Math.min(minutesOfIncome(5, TIERS[ti].at * 0.1), TIERS[ti].at * 0.5);
const cashText = smoothCounter((v) => money(v));
const worthText = smoothCounter((v) => money(v));

// ---------------------------------------------------------------- boot
async function boot() {
  initTelegram();
  loadInto(await loadSave());
  if (S.introDone === undefined) S.introDone = S.lifetimeEarned > 0 || Object.keys(S.biz).length > 0;
  const firstVisit = !S.introDone && !S.lifetimeEarned;
  renderShell();
  showTab('biz');
  initCloud();
  countDailyPlayer(firstVisit);
  track('session_start_game', { tier: S.tier, lives: S.lives || 0 });
  if (!S.introDone) {
    track('intro_start');
    playIntro($('#intro'), () => { S.introDone = true; S.tut = 1; save(); coach(); track('intro_done'); });
  } else if (S.tut && S.tut < 9) coach();

  const away = Math.min((Date.now() - (S.lastSeen || Date.now())) / 1000, OFFLINE_CAP_HOURS * 3600);
  if (away > 60) {
    const ticks = Math.min(Math.floor(away / TICK_SEC), 400);
    for (let i = 0; i < ticks; i++) marketTick(S, false);
    const offline = incomePerSec(S) * away;
    if (offline >= 1) offlineModal(offline, away);
  }
  S.lastEvent = Math.max(S.lastEvent || 0, Date.now() - 120000);

  let last = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 1);
    last = now;
    earn(ips() * dt);
    frame();
  }, 100);
  setInterval(onMarketTick, TICK_SEC * 1000);
  setInterval(save, 10000);
  setInterval(() => submitScore(playerName(), netWorth(S)), 60000);
  setTimeout(() => submitScore(playerName(), netWorth(S)), 5000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
}

// ---------------------------------------------------------------- shell
function renderShell() {
  $('#app').innerHTML = `
  <section class="stage" id="stage">
    <div class="scene" id="sceneBg"></div>
    <div class="stage-plane" id="plane"></div>
    <div class="stage-boat" id="boat"></div>
    <div class="stage-home" id="home"></div>
    <div class="stage-car" id="car"></div>
    <div class="stage-shade"></div>

    <header class="hud">
      <div class="hud-top">
        <button class="lvl-chip" data-act="openSheet" data-id="life" aria-label="Your level">
          <span class="lvl-ring" id="lvlRing"><b id="lvlNum">1</b></span>
          <span class="lvl-text"><b id="tierName">Broke</b><small id="tierNext"></small></span>
        </button>
        <span class="karma-chip" id="karmaPill"></span>
      </div>
      <div class="cash" id="cashBox">
        <span class="cash-coin">${coin()}</span><span class="cash-num" id="money">$0</span>
      </div>
      <div class="cash-sub">
        <span class="ips-pill"><b id="ips">$0</b>/sec</span>
        <span class="boost-badge" id="boostBadge" hidden>×2 <b id="boostLeft"></b></span>
        <span class="nw-pill">Net worth <b id="nw">$0</b></span>
      </div>
    </header>

    <div class="quick">
      <button class="q-btn" data-act="openSheet" data-id="goals" aria-label="Goals"><span>🎯</span><i class="dot" id="goalDot" hidden></i></button>
      <button class="q-btn" data-act="openSheet" data-id="gifts" aria-label="Gifts"><span>🎁</span><i class="dot" id="giftDot" hidden></i></button>
      <button class="q-btn" data-act="openSheet" data-id="top" aria-label="Leaderboard"><span>🏆</span></button>
      <button class="q-btn" data-act="openSheet" data-id="life" aria-label="New Life"><span>⭐</span><i class="dot" id="lifeDot" hidden></i></button>
    </div>

    <button class="hero-btn" id="heroBtn" aria-label="Tap to earn money"></button>
    <div id="floaters"></div>
    <button class="bag" id="bag" data-act="bag" hidden aria-label="Free money bag"><span class="bag-ico">💰</span><span class="bag-tag">FREE</span></button>
    <button class="boost" data-act="boost"><span class="ad-play">▶</span><span><b id="boostTitle">×2 INCOME</b><small id="boostSub">${BOOST_MINUTES} min · watch ad</small></span></button>
  </section>

  <div class="sheet-wrap">
    <div class="ticker"><div class="ticker-in" id="ticker">📰 Welcome to Karmillion. Every choice has karma.</div></div>
    <main class="panel" id="panel"></main>
  </div>

  <nav class="tabbar" id="tabs">
    <i class="tab-ind" id="tabInd"></i>
    <button data-tab="biz">${tabIcon('biz')}<span>Business</span></button>
    <button data-tab="market">${tabIcon('market')}<span>Market</span></button>
    <button data-tab="assets">${tabIcon('assets')}<span>Assets</span></button>
    <button data-tab="casino">${tabIcon('casino')}<span>Casino</span></button>
    <button data-tab="story">${tabIcon('story')}<span>Story</span><i class="dot" id="storyDot" hidden></i></button>
  </nav>

  <div id="bsheet" class="bsheet"><div class="bs-back" data-act="closeSheet"></div><div class="bs-card" id="bsCard"></div></div>
  <div id="modal" class="modal"></div>
  <div id="coach" class="coach"></div>
  <div id="toasts"></div>
  <div id="fx" class="fx"></div>
  <div id="intro" class="intro"></div>`;

  initFx($('#fx'));
  drawStage();
  $('#heroBtn').addEventListener('pointerdown', onTap);
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (b && b.dataset.tab !== tab) { haptic('light'); showTab(b.dataset.tab, true); tabInterstitial(); }
  });
  $('#app').addEventListener('click', onAction);
}

let sceneKey = '';
function drawStage(mood = 'happy') {
  $('#heroBtn').innerHTML = heroHTML(S.tier, mood);
  const home = homeOf(S), car = carOf(S), boat = boatOf(S), air = airOf(S);
  const key = `${S.tier}|${!!boat}`;
  if (key !== sceneKey) { sceneKey = key; $('#sceneBg').innerHTML = sceneSVG({ tier: S.tier, sea: !!boat }); }
  $('#home').innerHTML = propArt(home ? home.id : 'box');
  if (($('#car').dataset.id || '') !== (car?.id || '')) {
    $('#car').dataset.id = car?.id || '';
    $('#car').innerHTML = car ? luxArt(car) : '';
    const c = $('#car'); c.classList.remove('drive-in'); void c.offsetWidth; if (car) c.classList.add('drive-in');
  }
  $('#boat').innerHTML = boat ? luxArt(boat, true) : '';
  $('#plane').innerHTML = air ? luxArt(air) : '';
}

function onTap(e) {
  const v = tapValue(S) * (boosted() ? 2 : 1);
  earn(v);
  S.taps++;
  haptic('light');
  const rect = $('#stage').getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'floater';
  f.textContent = '+' + money(v);
  f.style.left = (e.clientX - rect.left) + 'px';
  f.style.top = (e.clientY - rect.top) + 'px';
  $('#floaters').appendChild(f);
  setTimeout(() => f.remove(), 900);
  const h = $('#heroBtn .hero');
  h?.classList.remove('bump'); void h?.offsetWidth; h?.classList.add('bump');
  if (S.tut === 1 && S.taps >= 5) { S.tut = 2; coach(); }
}

function toast(text, kind = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = text;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3100);
}

// ---------------------------------------------------------------- frame (10 fps)
let lastSync = 0;
function frame() {
  $('#money').textContent = cashText(S.money);
  $('#ips').textContent = money(ips());
  const nw = netWorth(S);
  $('#nw').textContent = worthText(nw);
  const b = boosted();
  $('#boostBadge').hidden = !b;
  if (b) $('#boostLeft').textContent = fmtTime((S.boostUntil - Date.now()) / 1000);
  $('#boostTitle').textContent = b ? `×2 ON · ${fmtTime((S.boostUntil - Date.now()) / 1000)}` : '×2 INCOME';
  $('#boostSub').textContent = b ? `+${BOOST_MINUTES} min more` : `${BOOST_MINUTES} min · watch ad`;
  const bagEl = $('#bag');
  const nowMs = Date.now();
  if (bagEl.hidden && nowMs > nextBag && S.introDone && !(S.tut && S.tut < 9)) {
    bagUntil = nowMs + 30000; nextBag = nowMs + BAG_EVERY; bagEl.hidden = false;
  }
  if (!bagEl.hidden && nowMs > bagUntil) bagEl.hidden = true;

  const ti = tierIndex(nw);
  if (ti > S.tier) {
    S.tier = ti;
    S.bestTier = Math.max(S.bestTier, ti);
    drawStage('smug');
    tierModal(ti);
    save();
  }
  const cur = TIERS[S.tier], nxt = TIERS[S.tier + 1];
  $('#tierName').textContent = cur.name;
  $('#lvlNum').textContent = S.tier + 1;
  const prog = nxt ? Math.max(0, Math.min(1, (nw - cur.at) / (nxt.at - cur.at))) : 1;
  $('#lvlRing').style.setProperty('--p', (prog * 100).toFixed(1));
  $('#tierNext').textContent = nxt ? `${Math.floor(prog * 100)}% to ${nxt.name}` : 'Start a New Life ⭐';
  $('#karmaPill').textContent = `${karmaTitle(S.karma)} ${S.karma > 0 ? '+' : ''}${Math.round(S.karma)}${S.stars ? ` · ⭐${S.stars}` : ''}`;

  // friends paying back, etc.
  if (S.pending.length) {
    const now = Date.now();
    for (const p of S.pending.filter((x) => x.at <= now)) { earn(p.amount); toast(`${p.text} +${money(p.amount)}`, 'good'); }
    S.pending = S.pending.filter((x) => x.at > now);
  }

  const now = performance.now();
  if (now - lastSync > 250) { lastSync = now; sync(); }

  // random life event (not during the tutorial or while a panel is open)
  if (!modalKind && !sheetKind && S.introDone && !(S.tut && S.tut < 9) && Date.now() - S.lastEvent > 180000) openEvent();
}

// enable/disable every price button by data-cost, refresh live labels
function sync() {
  document.querySelectorAll('[data-cost]').forEach((btn) => {
    const c = Number(btn.dataset.cost);
    btn.disabled = !(c <= S.money) || btn.dataset.lock === '1';
  });
  if (tab === 'biz') {
    for (const b of BUSINESSES) {
      const btn = document.getElementById('buy-' + b.id);
      if (!btn) continue;
      const { n, cost } = bizBuyInfo(b);
      btn.dataset.cost = n ? cost : Infinity;
      btn.disabled = !n || S.money < cost;
      btn.querySelector('.cost').textContent = money(cost);
      btn.querySelector('.qty').textContent = '×' + Math.max(n, 1);
    }
  }
  const lucky = document.getElementById('luckyBtn');
  if (lucky) {
    const left = (S.lastLucky || 0) + LUCKY_CD - Date.now();
    lucky.disabled = left > 0;
    lucky.querySelector('.ad-txt').textContent = left > 0 ? `Ready in ${fmtTime(left / 1000)}` : `Get ${money(minutesOfIncome(5, 300))}`;
  }
  const banner = document.getElementById('boostBanner');
  if (banner) {
    const bb = boosted();
    banner.classList.toggle('active', bb);
    banner.querySelector('.ab-title').textContent = bb ? `×2 income active · ${fmtTime((S.boostUntil - Date.now()) / 1000)}` : 'Double your income!';
    banner.querySelector('.ab-sub').textContent = bb ? `Watch another ad for +${BOOST_MINUTES} min` : `Watch a short ad: ×2 income for ${BOOST_MINUTES} minutes`;
  }
  if (sheetKind === 'gifts') {
    const d = document.getElementById('dailyBtn');
    if (d) {
      const left = S.lastDaily + 86400000 - Date.now();
      d.disabled = left > 0;
      d.textContent = left > 0 ? `Come back in ${fmtTime(left / 1000)}` : `Claim ${money(minutesOfIncome(20, 200))}`;
    }
  }
  $('#goalDot').hidden = !GOALS.some((g) => !S.goals[g.id] && g.check(S));
  $('#giftDot').hidden = Date.now() < S.lastDaily + 86400000;
  $('#lifeDot').hidden = netWorth(S) < REBIRTH_AT;
  $('#storyDot').hidden = !EPISODES.some((ep) => ep.kind !== 'soon' && (S.bestTier || 0) >= ep.unlockTier && !S.episodes[ep.id]?.done);
  if (tab === 'casino' && !casino.isBusy()) { const r = $('#casinoRoot'); if (r) casino.refreshBet(r); }
}

// ---------------------------------------------------------------- market tick
function onMarketTick() {
  const news = marketTick(S, true);
  if (news) {
    lastNews = news.text;
    const tk = $('#ticker');
    tk.textContent = news.text;
    tk.className = 'ticker-in ' + (news.up ? 'up' : 'down');
    tk.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'ease-out' });
    if (news.id && (S.stocks[news.id]?.sh || 0) > 0) toast(news.text, news.up ? 'good' : 'bad');
  }
  if (tab === 'market') renderMarket(true);
  if (sheetKind.startsWith('stock:')) stockSheet(sheetKind.slice(6), true);
}

// ---------------------------------------------------------------- tabs
function showTab(name, animate = false) {
  tab = name;
  const idx = TABS.indexOf(name);
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
  $('#app').classList.toggle('compact', name !== 'biz');
  $('#tabInd').style.transform = `translateX(${idx * 100}%)`;
  const p = $('#panel');
  p.scrollTop = 0;
  if (name === 'biz') p.innerHTML = bizHTML();
  if (name === 'market') renderMarket();
  if (name === 'assets') p.innerHTML = assetsHTML();
  if (name === 'casino') p.innerHTML = `<div id="casinoRoot">${casino.html()}</div>`;
  if (name === 'story') p.innerHTML = storyHTML();
  if (animate) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
  sync();
}

function rerender() {
  const p = $('#panel');
  const y = p.scrollTop;
  showTab(tab);
  p.scrollTop = y;
}

// ---------------------------------------------------------------- BUSINESS tab
function bizBuyInfo(b) {
  const lvl = S.biz[b.id] || 0;
  if (bizMode === 'max') {
    let n = 0, cost = 0;
    while (n < 1000) {
      const c = costOf(b, lvl + n);
      if (cost + c > S.money) break;
      cost += c; n++;
    }
    return { n, cost: n ? cost : costOf(b, lvl) };
  }
  let cost = 0;
  for (let i = 0; i < bizMode; i++) cost += costOf(b, lvl + i);
  return { n: bizMode, cost };
}

const bizVisible = (b, i) => i === 0 || (S.biz[b.id] || 0) > 0 || (S.biz[BUSINESSES[i - 1].id] || 0) > 0;

function bizHTML() {
  const br = incomeBreakdown(S);
  const modes = [1, 10, 'max'].map((m) =>
    `<button class="chip ${bizMode === m ? 'on' : ''}" data-act="bizMode" data-id="${m}">${m === 'max' ? 'MAX' : '×' + m}</button>`).join('');

  const rows = BUSINESSES.map((b, i) => {
    if (!bizVisible(b, i)) return '';
    const lvl = S.biz[b.id] || 0;
    const ms = nextMilestone(lvl);
    const inc = bizIncome(S, b) * br.mult;
    return `
    <div class="row">
      <div class="row-icon">${bizIcon(b.id)}</div>
      <div class="row-info">
        <div class="row-name">${b.name} <span class="lvl">Lv ${lvl}</span></div>
        <div class="row-sub">${lvl ? money(inc) + '/s' : money(b.income * br.mult) + '/s per level'}</div>
        <div class="row-tiny">${ms ? `Lv ${ms}: income ×2` : 'All milestones done'}</div>
      </div>
      <button class="buy" id="buy-${b.id}" data-act="buyBiz" data-id="${b.id}"><span class="qty">×1</span><span class="cost"></span></button>
    </div>`;
  }).join('');

  const avail = UPGRADES.filter((u) => !S.upg.includes(u.id) && (S.biz[u.biz] || 0) >= u.at).sort((a, b) => a.cost - b.cost);
  const next = UPGRADES.filter((u) => !S.upg.includes(u.id) && (S.biz[u.biz] || 0) < u.at && (S.biz[u.biz] || 0) > 0)
    .sort((a, b) => a.cost - b.cost)[0];
  const upgRows = avail.slice(0, 6).map((u) => `
    <div class="row small">
      <div class="row-icon">${bizIcon(u.biz)}</div>
      <div class="row-info"><div class="row-name">${u.name}</div>
        <div class="row-sub">${BUSINESSES.find((b) => b.id === u.biz).name} income ×${UPG_MULT}</div></div>
      <button class="buy" data-act="buyUpg" data-id="${u.id}" data-cost="${u.cost}"><span class="cost">${money(u.cost)}</span></button>
    </div>`).join('');

  const tl = S.tapLvl || 0;
  const tapRow = tl < TAP_MAX ? `
    <div class="row small">
      <div class="row-icon tap-ico">👆</div>
      <div class="row-info"><div class="row-name">Hustle Power <span class="lvl">Lv ${tl}</span></div>
        <div class="row-sub">Tap = ${money(tapValue(S))} → ×2</div></div>
      <button class="buy" data-act="tapUp" data-cost="${tapUpgradeCost(tl)}"><span class="cost">${money(tapUpgradeCost(tl))}</span></button>
    </div>` : '';

  return `
    <button class="ad-banner" id="boostBanner" data-act="boost">
      <span class="ab-icon">🚀</span>
      <span class="ab-text"><b class="ab-title">Double your income!</b><small class="ab-sub"></small></span>
      <span class="ad-play big">▶</span>
    </button>
    <div class="row-head"><h2>Businesses</h2><div class="chips">${modes}</div></div>
    ${rows}
    <h2>Upgrades</h2>
    ${tapRow}
    ${upgRows || ''}
    ${next ? `<div class="hint">🔒 Next: <b>${next.name}</b> at ${BUSINESSES.find((b) => b.id === next.biz).name} Lv ${next.at}</div>` : ''}
    ${!upgRows && !next ? '<div class="hint">Level up businesses to unlock upgrades.</div>' : ''}
    <div class="breakdown">
      <div>Business <b>${money(br.biz)}/s</b></div>
      <div>Rent <b>${money(br.rent)}/s</b></div>
      <div>Dividends <b>${money(br.div)}/s</b></div>
      <div>Bonus <b>×${br.mult.toFixed(2)}</b></div>
    </div>
    <div class="hint">Bonus = karma × fame × stars. Fame comes from luxury in Assets.</div>`;
}

// ---------------------------------------------------------------- MARKET tab
const stockLocked = (st) => (S.bestTier || 0) < st.tier;

function renderMarket(live = false) {
  const p = $('#panel');
  let invested = 0, value = 0;
  for (const st of STOCKS) {
    const pos = S.stocks[st.id];
    if (pos?.sh) { invested += pos.cost; value += pos.sh * S.market[st.id].p; }
  }
  const pl = value - invested;
  const html = `
    <div class="card portfolio">
      <div><div class="muted">Portfolio</div><div class="big-num">${money(value)}</div></div>
      <div class="right"><div class="muted">Profit / loss</div>
        <div class="big-num ${pl >= 0 ? 'up' : 'down'}">${pl >= 0 ? '+' : ''}${money(pl)}</div></div>
    </div>
    <div class="hint">News moves prices. Buy the dip, sell the hype. Realized profit: <b>${money(S.stats.profit || 0)}</b></div>
    ${STOCKS.map((st) => {
      const m = S.market[st.id];
      const ch = changeOf(m);
      const pos = S.stocks[st.id];
      const lock = stockLocked(st);
      return `
      <button class="row stock ${lock ? 'locked' : ''}" data-act="stock" data-id="${st.id}" ${lock ? 'disabled' : ''}>
        <div class="row-icon logo">${stockLogo(st.id)}</div>
        <div class="row-info">
          <div class="row-name">${st.id} <span class="muted">${st.name}</span></div>
          <div class="row-sub">${lock ? `🔒 ${TIERS[st.tier].name}` : pos?.sh ? `You own ${fmt(pos.sh)} · ${money(pos.sh * m.p)}` : st.crypto ? 'Crypto · wild swings' : st.div ? 'Pays dividends' : 'Growth stock'}</div>
        </div>
        <canvas class="spark" data-spark="${st.id}"></canvas>
        <div class="quote"><b>${money(m.p)}</b><span class="${ch >= 0 ? 'up' : 'down'}">${pct(ch)}</span></div>
      </button>`;
    }).join('')}`;
  const y = p.scrollTop;
  p.innerHTML = '<h2>Stock market</h2>' + html;
  if (live) p.scrollTop = y;
  p.querySelectorAll('[data-spark]').forEach((c) => drawChart(c, S.market[c.dataset.spark].hist, { width: 1.6 }));
}

function stockQty(id, mode) {
  const p = S.market[id].p;
  if (mode === 'max') return Math.floor(S.money / p);
  return mode;
}

function stockSheet(id, live = false) {
  const st = STOCKS.find((x) => x.id === id);
  const m = S.market[id];
  const pos = S.stocks[id] || { sh: 0, cost: 0 };
  const ch = changeOf(m);
  const val = pos.sh * m.p;
  const pl = val - pos.cost;
  const q = stockQty(id, stockBuyMode);
  const modes = [1, 10, 100, 'max'].map((x) =>
    `<button class="chip ${stockBuyMode === x ? 'on' : ''}" data-act="sMode" data-id="${x}">${x === 'max' ? 'MAX' : '×' + x}</button>`).join('');
  const half = Math.floor(pos.sh / 2);
  const html = `
    <div class="stock-head"><span class="row-icon logo">${stockLogo(st.id)}</span>
      <div><div class="sheet-title">${st.name}</div><div class="muted">${st.id}${st.crypto ? ' · crypto' : ''}${st.div ? ` · dividend ${(st.div * 3600 * 100).toFixed(0)}%/h` : ''}</div></div></div>
    <div class="stock-price"><b>${money(m.p)}</b> <span class="${ch >= 0 ? 'up' : 'down'}">${pct(ch)}</span></div>
    <canvas class="chart" id="bigChart"></canvas>
    <div class="pos">
      <div><span class="muted">You own</span><b>${fmt(pos.sh)}</b></div>
      <div><span class="muted">Value</span><b>${money(val)}</b></div>
      <div><span class="muted">P/L</span><b class="${pl >= 0 ? 'up' : 'down'}">${pos.sh ? (pl >= 0 ? '+' : '') + money(pl) : '—'}</b></div>
    </div>
    <div class="chips center-chips">${modes}</div>
    <div class="trade">
      <button class="btn green big" data-act="sBuy" data-id="${id}" data-cost="${q > 0 ? q * m.p : Infinity}">Buy ${fmt(q)}<small>${money(q * m.p)}</small></button>
      <button class="btn red big" data-act="sSell" data-id="${id}" data-q="${half}" ${half > 0 ? '' : 'disabled'}>Sell half<small>${money(half * m.p)}</small></button>
      <button class="btn red big" data-act="sSell" data-id="${id}" data-q="${pos.sh}" ${pos.sh > 0 ? '' : 'disabled'}>Sell all<small>${money(val)}</small></button>
    </div>`;
  if (live) { const box = $('#bsBody'); if (box) box.innerHTML = html; } else openSheet('stock:' + id, '', html);
  const c = $('#bigChart');
  if (c) drawChart(c, m.hist, { fill: true, width: 2.5, pad: 6 });
  sync();
}

// ---------------------------------------------------------------- ASSETS tab
function assetsHTML() {
  const subs = [['homes', 'Homes'], ...LUX_KINDS];
  const seg = '<div class="seg five">' + subs.map(([id, l]) =>
    `<button class="${assetsSub === id ? 'on' : ''}" data-act="assetsSub" data-id="${id}">${l}</button>`).join('') + '</div>';
  const mult = allMult(S);
  if (assetsSub === 'homes') {
    return seg + '<div class="hint">Homes pay rent forever. Your best one is where you live.</div>' + PROPERTIES.map((p, i) => {
      const n = S.props[p.id] || 0;
      const open = i === 0 || (S.props[PROPERTIES[i - 1].id] || 0) > 0;
      const cost = propCost(p, n);
      const sellFor = n ? propCost(p, n - 1) * PROP_SELL : 0;
      return `
      <div class="prop ${open ? '' : 'locked'}">
        <div class="prop-art">${propArt(p.id)}</div>
        <div class="row-info">
          <div class="row-name">${p.name} <span class="lvl">${n}/${PROP_MAX}</span></div>
          <div class="row-sub">Rent ${money(p.rent * mult)}/s each</div>
          ${n ? `<button class="link" data-act="propSell" data-id="${p.id}">Sell one · ${money(sellFor)}</button>` : ''}
        </div>
        ${n >= PROP_MAX ? '<span class="tag">MAX</span>' : open
          ? `<button class="buy" data-act="propBuy" data-id="${p.id}" data-cost="${cost}"><span class="cost">${money(cost)}</span></button>`
          : '<span class="tag">🔒</span>'}
      </div>`;
    }).join('');
  }
  const items = LUXURY.filter((l) => l.kind === assetsSub);
  const ride = carOf(S);
  const owned = items.filter((l) => S.lux.includes(l.id)).length;
  return seg + `<div class="hint">Every fame point = +1% income. Fame: <b>${fame(S)}</b> · owned ${owned}/${items.length}</div>` +
    '<div class="showroom">' + items.map((l) => {
      const own = S.lux.includes(l.id);
      const driving = l.kind === 'car' && ride?.id === l.id;
      return `
      <div class="show ${own ? 'own' : ''} ${l.kind}">
        <div class="show-art">${luxArt(l)}</div>
        <div class="show-info">
          <div class="show-name">${l.name}</div>
          <div class="show-fame">+${l.fame} fame</div>
        </div>
        <div class="show-act">
          ${own
            ? `${l.kind === 'car' ? `<button class="btn small ${driving ? 'gold' : ''}" data-act="ride" data-id="${l.id}" ${driving ? 'disabled' : ''}>${driving ? 'Driving' : 'Drive'}</button>` : '<span class="tag">Owned</span>'}
               <button class="link" data-act="luxSell" data-id="${l.id}">Sell ${money(l.cost * LUX_SELL)}</button>`
            : `<button class="buy" data-act="luxBuy" data-id="${l.id}" data-cost="${l.cost}"><span class="cost">${money(l.cost)}</span></button>`}
        </div>
      </div>`;
    }).join('') + '</div>';
}

// ---------------------------------------------------------------- STORY tab
function storyHTML() {
  const card = (title, hook, action, cls = '', done = '') => `
    <div class="ep-card ${cls}">
      <div class="ep-info">
        <div class="ep-title">${title}</div>
        <div class="row-sub">${hook}</div>
        ${done ? `<div class="ep-done">✔ ${esc(done)}</div>` : ''}
      </div>
      ${action}
    </div>`;
  return `<div class="sec-head"><h2>Story</h2><span class="muted">One episode per Trinoko short</span></div>` +
    card('Prologue', 'How it all began: a box, a girl and one flower.', '<button class="btn" data-act="prologue">Watch</button>', 'prologue') +
    EPISODES.map((ep, i) => {
      const locked = (S.bestTier || 0) < ep.unlockTier;
      const done = S.episodes[ep.id]?.done;
      let action;
      if (ep.kind === 'soon') action = '<span class="tag">Soon</span>';
      else if (locked) action = `<span class="tag">🔒 ${TIERS[ep.unlockTier].name}</span>`;
      else action = `<button class="btn ${done ? '' : 'gold'}" data-act="ep" data-id="${ep.id}">${done ? 'Replay' : '▶ Play'}</button>`;
      return card(`<span class="ep-num">EP ${i + 1}</span> ${ep.title}`, ep.hook, action, locked || ep.kind === 'soon' ? 'locked' : '', done);
    }).join('');
}

// ---------------------------------------------------------------- bottom sheets
function openSheet(kind, title, body) {
  sheetKind = kind;
  const card = $('#bsCard');
  card.innerHTML = `<div class="bs-grab"></div>
    <div class="bs-head">${title ? `<h2>${title}</h2>` : '<span></span>'}<button class="x" data-act="closeSheet" aria-label="Close">✕</button></div>
    <div class="bs-body" id="bsBody">${body}</div>`;
  $('#bsheet').classList.add('on');
  sync();
}
function closeSheet() {
  sheetKind = '';
  $('#bsheet').classList.remove('on');
}
function renderSheet(kind) {
  if (kind === 'goals') return openSheet('goals', '🎯 Goals', goalsHTML());
  if (kind === 'gifts') { openSheet('gifts', '🎁 Gifts', bonusHTML()); return mountTask(); }
  if (kind === 'life') return openSheet('life', '⭐ New Life', lifeHTML());
  if (kind === 'top') { openSheet('top', '🏆 Richest players', '<div class="muted center">Loading…</div>'); return loadTop(); }
}

function goalsHTML() {
  const ready = [], open = [], done = [];
  for (const g of GOALS) {
    if (S.goals[g.id]) done.push(g);
    else if (g.check(S)) ready.push(g);
    else open.push(g);
  }
  const row = (g, state) => `
    <div class="row small ${state === 'done' ? 'locked' : ''}">
      <div class="row-icon">${g.icon}</div>
      <div class="row-info"><div class="row-name">${g.text}</div>
        <div class="row-sub">Reward ${money(goalReward(g))}</div></div>
      ${state === 'ready' ? `<div class="claim-pair">${adBtn('×2', `data-act="claim2" data-id="${g.id}"`, 'small-ad')}<button class="btn gold" data-act="claim" data-id="${g.id}">Claim</button></div>`
        : state === 'done' ? '<span class="tag">✔</span>' : '<span class="tag">…</span>'}
    </div>`;
  return `<div class="hint">${done.length}/${GOALS.length} done</div>` +
    ready.map((g) => row(g, 'ready')).join('') + open.slice(0, 5).map((g) => row(g, 'open')).join('') +
    done.map((g) => row(g, 'done')).join('');
}

function bonusHTML() {
  return `
  <div class="card lucky-card"><h3>💸 Lucky cash</h3><p class="muted">Watch a short ad and grab free money. Every 4 minutes.</p>
    ${adBtn('Get cash', 'id="luckyBtn" data-act="lucky"', 'big wide')}</div>
  <div class="card"><h3>Daily gift</h3><p class="muted">Free cash every 24 hours.</p>
    <button class="btn gold wide" id="dailyBtn" data-act="daily">Claim</button></div>
  <div class="card"><h3>Promo code</h3>
    <p class="muted">Codes hide in the last second of every new Trinoko short.</p>
    <div class="code-row">
      <input id="codeInput" maxlength="24" placeholder="ENTER CODE" autocomplete="off" autocapitalize="characters" spellcheck="false">
      <button class="btn" data-act="code">Redeem</button>
    </div>
    <div class="code-msg" id="codeMsg"></div></div>
  <div class="card"><h3>Quick task</h3><p class="muted" id="taskEmpty">Complete a task for a big cash reward.</p><div id="taskSlot"></div></div>
  ${YOUTUBE_URL ? '<button class="btn wide" data-act="yt">▶ Watch new episodes on YouTube</button>' : ''}
  <div class="card stats">
    <h3>Your stats</h3>
    <div>Lifetime earned <b>${money(S.lifetimeEarned)}</b></div>
    <div>Trades <b>${S.stats.trades || 0}</b> · best trade <b>${money(S.stats.bestTrade || 0)}</b></div>
    <div>Taps <b>${fmt(S.taps)}</b> · lives <b>${(S.lives || 0) + 1}</b></div>
  </div>`;
}

function lifeHTML() {
  const nw = netWorth(S);
  const stars = starsForRebirth(nw);
  const ok = nw >= REBIRTH_AT;
  return `
  <div class="card center-card">
    <div class="life-icon">🔄</div>
    <h3>Start a New Life</h3>
    <p class="muted">Become a billionaire, then start again from zero with ⭐ stars. Each star = +${STAR_BONUS * 100}% income forever.
    You keep karma, story, goals and stars.</p>
    <div class="pos">
      <div><span class="muted">Stars now</span><b>⭐ ${S.stars || 0}</b></div>
      <div><span class="muted">Bonus</span><b>+${Math.round((S.stars || 0) * STAR_BONUS * 100)}%</b></div>
      <div><span class="muted">You'd get</span><b>⭐ ${stars}</b></div>
    </div>
    <button class="btn gold big wide" data-act="rebirth" ${ok ? '' : 'disabled'}>${ok ? `New Life (+${stars} ⭐)` : `Need ${money(REBIRTH_AT)} net worth`}</button>
  </div>`;
}

async function loadTop() {
  const list = await topPlayers(30);
  const box = $('#bsBody');
  if (sheetKind !== 'top' || !box) return;
  if (!list) { box.innerHTML = '<div class="card muted">Leaderboard is offline. Try later.</div>'; return; }
  if (!list.length) { box.innerHTML = '<div class="card muted">Be the first one here!</div>'; return; }
  box.innerHTML = '<div class="hint">Ranked by net worth</div>' + list.map((r, i) => `
    <div class="lb ${r.me ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}">
      <span class="rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
      <span class="lb-name">${esc(r.name || 'Player')}${r.me ? ' (you)' : ''}</span>
      <span class="lb-score">${money(r.score || 0)}</span>
    </div>`).join('') + '<div class="hint center">Top players appear in our next short!</div>';
}

function mountTask() {
  const slot = $('#taskSlot');
  if (!slot || !ADSGRAM_TASK_ID || !inTelegram || !window.Adsgram) return;
  const reward = () => minutesOfIncome(20, 1000);
  slot.innerHTML = `
    <adsgram-task data-block-id="${ADSGRAM_TASK_ID}" class="task">
      <span slot="reward" class="task-reward">💰 ${money(reward())}</span>
      <div slot="button" class="task-btn">GO</div>
      <div slot="claim" class="task-btn claim">CLAIM</div>
      <div slot="done" class="task-btn done">DONE</div>
    </adsgram-task>`;
  const el = slot.querySelector('adsgram-task');
  el.addEventListener('reward', () => { const r = reward(); earn(r); save(); rewardModal('Task complete', r); });
  const hide = () => { slot.innerHTML = ''; const e = $('#taskEmpty'); if (e) e.textContent = 'No tasks right now. Check back later!'; };
  el.addEventListener('onBannerNotFound', hide);
  el.addEventListener('onError', hide);
  el.addEventListener('onTooLongSession', hide);
  $('#taskEmpty').textContent = '';
}

// ---------------------------------------------------------------- actions
const casino = createCasino({ S, money, toast: (...a) => toast(...a), haptic: (k) => haptic(k), save: () => save() });

async function onAction(e) {
  if (tab === 'casino' && e.target.closest('#casinoRoot')) {
    if (casino.onClick(e, $('#casinoRoot'))) return;
  }
  const t = e.target.closest('[data-act]');
  if (!t || t.disabled) return;
  const id = t.dataset.id;
  switch (t.dataset.act) {
    case 'boost': {
      if (await showRewardedAd()) {
        S.boostUntil = Math.max(Date.now(), S.boostUntil) + BOOST_MINUTES * 60000;
        haptic('heavy'); save(); toast(`×2 income for ${BOOST_MINUTES} min!`, 'good');
      }
      return;
    }
    case 'close': return closeModal();
    case 'closeSheet': return closeSheet();
    case 'openSheet': haptic('light'); return renderSheet(id);
    case 'prologue': return playIntro($('#intro'), () => {});
    case 'bizMode': bizMode = id === 'max' ? 'max' : Number(id); return rerender();
    case 'buyBiz': {
      const b = BUSINESSES.find((x) => x.id === id);
      const { n, cost } = bizBuyInfo(b);
      if (!n || S.money < cost) return haptic('rigid');
      S.money -= cost;
      S.biz[id] = (S.biz[id] || 0) + n;
      haptic('medium');
      coinBurst(t, $('#heroBtn'), 5);
      if (S.tut === 2) { S.tut = 9; coach(); toast('Businesses earn money even when you are offline!', 'good'); save(); track('tutorial_complete'); }
      return rerender();
    }
    case 'buyUpg': {
      const u = UPGRADES.find((x) => x.id === id);
      if (S.upg.includes(id) || S.money < u.cost) return;
      S.money -= u.cost; S.upg.push(id);
      haptic('heavy'); toast(`${u.name}! ${BUSINESSES.find((b) => b.id === u.biz).name} ×${UPG_MULT}`, 'good');
      return rerender();
    }
    case 'tapUp': {
      const c = tapUpgradeCost(S.tapLvl || 0);
      if (S.money < c) return;
      S.money -= c; S.tapLvl = (S.tapLvl || 0) + 1; haptic('heavy');
      return rerender();
    }
    case 'stock': return stockSheet(id);
    case 'sMode': stockBuyMode = id === 'max' ? 'max' : Number(id); return stockSheet(sheetKind.slice(6), true);
    case 'sBuy': {
      const q = stockQty(id, stockBuyMode);
      if (buyStock(S, id, q)) { haptic('medium'); stockSheet(id, true); if (tab === 'market') renderMarket(true); }
      return;
    }
    case 'sSell': {
      const profit = sellStock(S, id, Number(t.dataset.q));
      if (profit !== null) {
        haptic('medium');
        toast(profit >= 0 ? `Profit ${money(profit)} 🤑` : `Loss ${money(-profit)} 😬`, profit >= 0 ? 'good' : 'bad');
        stockSheet(id, true);
        if (tab === 'market') renderMarket(true);
      }
      return;
    }
    case 'assetsSub': assetsSub = id; return rerender();
    case 'propBuy': {
      const p = PROPERTIES.find((x) => x.id === id);
      const n = S.props[id] || 0;
      const c = propCost(p, n);
      if (n >= PROP_MAX || S.money < c) return;
      S.money -= c; S.props[id] = n + 1;
      haptic('heavy'); drawStage(); toast(`You bought a ${p.name}!`, 'good');
      return rerender();
    }
    case 'propSell': {
      const p = PROPERTIES.find((x) => x.id === id);
      const n = S.props[id] || 0;
      if (!n) return;
      S.money += propCost(p, n - 1) * PROP_SELL; S.props[id] = n - 1;
      drawStage(); return rerender();
    }
    case 'luxBuy': {
      const l = LUXURY.find((x) => x.id === id);
      if (S.lux.includes(id) || S.money < l.cost) return;
      S.money -= l.cost; S.lux.push(id);
      if (l.kind === 'car') S.ride = id;
      haptic('heavy'); drawStage(); toast(`${l.name}! +${l.fame} fame`, 'good');
      return rerender();
    }
    case 'ride': {
      if (!S.lux.includes(id)) return;
      S.ride = id; haptic('medium'); drawStage();
      return rerender();
    }
    case 'luxSell': {
      const l = LUXURY.find((x) => x.id === id);
      if (!S.lux.includes(id)) return;
      S.money += l.cost * LUX_SELL; S.lux = S.lux.filter((x) => x !== id);
      if (S.ride === id) S.ride = null;
      drawStage(); return rerender();
    }
    case 'ep': return playEpisode(id);
    case 'claim2': {
      const g = GOALS.find((x) => x.id === id);
      if (S.goals[id] || !g.check(S)) return;
      if (!(await showRewardedAd())) return;
      if (S.goals[id]) return;
      const r = goalReward(g) * 2;
      S.goals[id] = 1; earn(r); save(); haptic('heavy');
      coinBurst(t, $('#cashBox'), 14);
      toast(`${g.text}: +${money(r)}`, 'good');
      return renderSheet('goals');
    }
    case 'lucky': {
      if (Date.now() < (S.lastLucky || 0) + LUCKY_CD) return;
      if (!(await showRewardedAd())) return;
      const r = minutesOfIncome(5, 300);
      S.lastLucky = Date.now(); earn(r); save(); haptic('heavy');
      coinBurst(t, $('#cashBox'), 14);
      return toast(`Lucky cash +${money(r)} 💸`, 'good');
    }
    case 'bag': {
      $('#bag').hidden = true;
      if (!(await showRewardedAd())) return;
      const r = minutesOfIncome(3, 200);
      earn(r); save(); haptic('heavy');
      coinBurst($('#heroBtn'), $('#cashBox'), 16);
      return toast(`Money bag +${money(r)} 💰`, 'good');
    }
    case 'claim': {
      const g = GOALS.find((x) => x.id === id);
      if (S.goals[id] || !g.check(S)) return;
      const r = goalReward(g);
      S.goals[id] = 1; earn(r); save(); haptic('heavy');
      coinBurst(t, $('#cashBox'), 10);
      return renderSheet('goals');
    }
    case 'daily': {
      if (Date.now() < S.lastDaily + 86400000) return;
      const r = minutesOfIncome(20, 200);
      earn(r); S.lastDaily = Date.now(); save(); haptic('heavy');
      coinBurst(t, $('#cashBox'), 12);
      return toast(`Daily gift +${money(r)}`, 'good');
    }
    case 'code': return onCode();
    case 'yt': return openLink(YOUTUBE_URL);
    case 'rebirth': closeSheet(); return rebirthModal();
  }
}

function openLink(url) {
  if (!url) return;
  if (tg?.openLink) tg.openLink(url); else window.open(url, '_blank');
}

async function onCode() {
  const input = $('#codeInput');
  const msg = $('#codeMsg');
  const code = input.value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!code) return;
  if (S.codes.includes(code)) { msg.textContent = 'You already used this code.'; return; }
  msg.textContent = 'Checking…';
  const res = await redeemCode(code);
  if (!res.ok) { msg.textContent = res.msg; haptic('rigid'); return; }
  const r = Math.max(res.reward, incomePerSec(S) * res.minutes * 60);
  earn(r); S.codes.push(code); save();
  input.value = ''; msg.textContent = '';
  rewardModal(res.label || `Code ${code}`, r);
}

// ---------------------------------------------------------------- events
function openEvent() {
  S.lastEvent = Date.now();
  const ev = pickEvent(S);
  const amt = eventAmount(S);
  const m = openModal('event');
  m.innerHTML = `<div class="sheet">
    <div class="ev-icon">${ev.icon}</div>
    <div class="sheet-title">${ev.title}</div>
    <p>${ev.text(amt)}</p>
    <div class="choices">
      <button class="btn gold big" id="evA">${ev.a.label}</button>
      <button class="btn alt big" id="evB">${ev.b.label}</button>
    </div></div>`;
  const pick = (opt) => {
    const result = opt.run(S, amt);
    S.stats.events = (S.stats.events || 0) + 1;
    haptic('heavy'); save();
    m.innerHTML = `<div class="sheet"><div class="ev-icon">${ev.icon}</div>
      <p class="ev-result">${esc(result)}</p>
      <div class="muted">${karmaTitle(S.karma)} · karma ${Math.round(S.karma)}</div>
      <button class="btn gold big wide" id="ok">OK</button></div>`;
    m.querySelector('#ok').onclick = () => { closeModal(); if (tab !== 'market') rerender(); };
  };
  m.querySelector('#evA').onclick = () => pick(ev.a);
  m.querySelector('#evB').onclick = () => pick(ev.b);
}

// ---------------------------------------------------------------- episodes
function actorHTML(who, mood, rich) {
  if (who === 'hero') return heroHTML(rich ? Math.max(S.tier, 4) : S.tier, mood);
  if (who === 'girl') return girlHTML(mood);
  if (who === 'rich') return richGuyHTML(false, mood);
  if (who === 'richBroke') return richGuyHTML(true, mood);
  return '';
}

function sceneHTML(sc) {
  const actors = sc.actors.map(([w, mo]) => `<div class="actor">${actorHTML(w, mo, sc.tierBoost)}</div>`).join('');
  return `
    <div class="scene ${sc.rain ? 'rain' : ''}">
      <div class="scene-props">${sc.props || ''}</div>
      <div class="scene-actors">${actors}</div>
      <div class="caption">${sc.caption}</div>
    </div>`;
}

function playEpisode(id) {
  const ep = EPISODES.find((e) => e.id === id);
  if (!ep) return;
  let i = 0;
  const m = openModal('episode');
  const show = () => {
    if (i < ep.scenes.length) {
      m.innerHTML = `<div class="ep-player">${sceneHTML(ep.scenes[i])}
        <div class="tap-hint">Tap to continue ▸</div><button class="x" aria-label="Close">✕</button></div>`;
      m.querySelector('.x').onclick = (e) => { e.stopPropagation(); closeModal(); };
      m.querySelector('.ep-player').onclick = () => { i++; haptic('light'); show(); };
      return;
    }
    if (ep.kind === 'choice') showChoice(ep, m);
    if (ep.kind === 'buttons') showButtons(ep, m);
  };
  show();
}

const epReward = (ep) => minutesOfIncome(ep.rewardMinutes, ep.minReward);

function showChoice(ep, m) {
  const c = ep.choice;
  m.innerHTML = `<div class="ep-player">
    <div class="question">${c.question}</div>
    <div class="choices">
      <button class="btn big gold" data-c="a">${c.a.label}</button>
      <button class="btn big alt" data-c="b">${c.b.label}</button>
    </div><button class="x" aria-label="Close">✕</button></div>`;
  m.querySelector('.x').onclick = closeModal;
  m.querySelectorAll('[data-c]').forEach((b) => b.onclick = async () => {
    const key = b.dataset.c;
    const opt = c[key];
    haptic('heavy');
    const first = !S.episodes[ep.id]?.done;
    if (first) S.karma += opt.karma;
    S.episodes[ep.id] = { choice: key, done: opt.label.replace(/[^\w\s]/g, '').trim() };
    m.innerHTML = `<div class="ep-player"><div class="question">${opt.outcome}</div><div class="muted center">Counting votes…</div></div>`;
    const votes = first ? await castVote(ep.id, key) : await getVotes(ep.id);
    const a = votes?.a || 0, bb = votes?.b || 0, tot = a + bb;
    const share = tot ? Math.round(((key === 'a' ? a : bb) / tot) * 100) : 0;
    finishEpisode(ep, m, opt.outcome, tot ? `${share}% of players chose the same.` : '', first);
  });
}

function showButtons(ep, m) {
  const prizes = [...ep.prizes].sort(() => Math.random() - 0.5);
  let extra = false;       // false | 'pending' | true
  let best = null;
  const revealed = [];
  const draw = () => {
    m.innerHTML = `<div class="ep-player">
      <div class="question">${best ? 'You got: ' + best.label : 'PICK ONE BUTTON'}</div>
      <div class="wish-buttons">
        ${prizes.map((p, i) => `<button class="wish w${i}" data-w="${i}" ${revealed.includes(i) ? 'disabled' : ''}>
          ${revealed.includes(i) ? `<span>${p.label}</span>` : ''}</button>`).join('')}
      </div>
      ${best && !extra ? adBtn('Press one more', 'id="again"') : ''}
      ${best && extra !== 'pending' ? '<button class="btn gold" id="take">Take it</button>' : ''}
      <button class="x" aria-label="Close">✕</button></div>`;
    m.querySelector('.x').onclick = closeModal;
    if (!best || extra === 'pending') {
      m.querySelectorAll('[data-w]').forEach((b) => b.onclick = () => {
        if (b.disabled) return;
        const p = prizes[b.dataset.w];
        haptic('heavy');
        if (!best || p.mult > best.mult) best = p;
        if (extra === 'pending') extra = true;
        revealed.push(Number(b.dataset.w));
        draw();
      });
    }
    m.querySelector('#again')?.addEventListener('click', async () => {
      if (await showRewardedAd()) { extra = 'pending'; draw(); }
    });
    m.querySelector('#take')?.addEventListener('click', () => {
      const first = !S.episodes[ep.id]?.done;
      if (first) S.karma += best.karma;
      S.episodes[ep.id] = { choice: best.label, done: best.label.replace(/[^\w\s]/g, '').trim() };
      finishEpisode(ep, m, `You got ${best.label}`, '', first, best.mult);
    });
  };
  draw();
}

function finishEpisode(ep, m, title, sub, first, mult = 1) {
  const r = first ? epReward(ep) * mult : Math.floor(epReward(ep) * 0.1);
  m.innerHTML = `<div class="ep-player end">
    <div class="question">${title}</div>
    ${sub ? `<div class="votes">${sub}</div>` : ''}
    <div class="reward">+${money(r)}</div>
    <div class="choices">
      ${adBtn(`×2 reward · ${money(r * 2)}`, 'id="x2"', 'big')}
      <button class="btn big alt" id="take1">Take ${money(r)}</button>
    </div>
    <div class="muted center">Next episode drops with the next Trinoko short.</div></div>`;
  const done = (k) => {
    earn(r * k); haptic('heavy'); save(); closeModal();
    if (tab === 'story') rerender();
    coinBurst($('#heroBtn'), $('#cashBox'), 12);
    maybeShowInterstitial();
  };
  m.querySelector('#take1').onclick = () => done(1);
  m.querySelector('#x2').onclick = async () => { if (await showRewardedAd()) done(2); };
}

// ---------------------------------------------------------------- modals
function openModal(kind = 'sheet') {
  const m = $('#modal');
  modalKind = kind;
  m.className = 'modal on ' + kind.split(':')[0];
  m.innerHTML = '';
  return m;
}
function closeModal() {
  const m = $('#modal');
  modalKind = '';
  m.className = 'modal';
  m.innerHTML = '';
}

function rewardModal(title, amount) {
  const m = openModal('reward');
  m.innerHTML = `<div class="sheet"><div class="burst"></div><div class="sheet-title">${esc(title)}</div>
    <div class="reward">+${money(amount)}</div><button class="btn gold big wide" id="okR">Nice!</button></div>`;
  m.querySelector('#okR').onclick = (e) => { coinBurst(e.target, $('#cashBox'), 10); closeModal(); };
}

function offlineModal(amount, secs) {
  const m = openModal('offline');
  m.innerHTML = `<div class="sheet"><div class="sheet-title">While you were away (${fmtTime(secs)})</div>
    <div class="reward">+${money(amount)}</div>
    <div class="choices">
      ${adBtn(`Collect ×2 · ${money(amount * 2)}`, 'id="x2"', 'big')}
      <button class="btn big alt" id="take">Collect</button>
    </div></div>`;
  m.querySelector('#take').onclick = (e) => { earn(amount); save(); coinBurst(e.target, $('#cashBox'), 10); closeModal(); };
  m.querySelector('#x2').onclick = async (e) => { if (await showRewardedAd()) { earn(amount * 2); save(); coinBurst(e.target, $('#cashBox'), 14); closeModal(); } };
}

function tierModal(ti) {
  track('level_up', { level: ti + 1, tier: TIERS[ti].name });
  const bonus = tierBonus(ti);
  if (modalKind) { earn(bonus); toast(`NEW LEVEL: ${TIERS[ti].name}! +${money(bonus)}`, 'good'); return; }
  const m = openModal('tierup');
  confetti();
  m.innerHTML = `<div class="sheet"><div class="burst"></div><div class="sheet-kicker">NEW LEVEL</div>
    <div class="sheet-title big">${TIERS[ti].name.toUpperCase()}</div>
    <div class="tier-hero">${heroHTML(ti, 'smug')}</div>
    <div class="muted">Level bonus</div>
    <div class="reward">+${money(bonus)}</div>
    <div class="choices">
      ${adBtn(`Collect ×2 · ${money(bonus * 2)}`, 'id="tx2"', 'big')}
      <button class="btn alt big" id="tx1">Collect</button>
    </div></div>`;
  m.querySelector('#tx1').onclick = (e) => { earn(bonus); save(); coinBurst(e.target, $('#cashBox'), 10); closeModal(); };
  m.querySelector('#tx2').onclick = async (e) => {
    if (await showRewardedAd()) { earn(bonus * 2); save(); coinBurst(e.target, $('#cashBox'), 16); closeModal(); }
  };
  haptic('heavy');
  if (tab === 'market' || tab === 'story') rerender();
}

function tabInterstitial() {
  if (Date.now() - sessionStart < 180000) return;
  if ((S.tut && S.tut < 9) || modalKind || casino.isBusy()) return;
  maybeShowInterstitial();
}

function rebirthModal() {
  const stars = starsForRebirth(netWorth(S));
  if (!stars) return;
  const m = openModal('rebirth');
  m.innerHTML = `<div class="sheet"><div class="ev-icon">🔄</div>
    <div class="sheet-title">Start a New Life?</div>
    <p>You lose money, businesses, stocks and assets. You get <b>⭐ ${stars}</b> stars: +${Math.round(stars * STAR_BONUS * 100)}% income forever.</p>
    <div class="choices"><button class="btn gold big" id="yes">Yes, new life</button>
    <button class="btn alt big" data-act="close">Not yet</button></div></div>`;
  m.querySelector('#yes').onclick = () => {
    rebirth(stars);
    closeModal(); drawStage(); showTab('biz');
    confetti(120);
    toast(`New life! ⭐ ${S.stars} stars`, 'good');
  };
}

// ---------------------------------------------------------------- tutorial
function coach() {
  const el = $('#coach');
  const steps = {
    1: { target: '#heroBtn', text: 'Tap yourself to hustle for cash!', pos: 'above' },
    2: { target: '#buy-flowers', text: 'Buy your first business. It earns money for you!', pos: 'above' },
  };
  const st = steps[S.tut];
  document.querySelectorAll('.coach-target').forEach((x) => x.classList.remove('coach-target'));
  if (!st) { el.className = 'coach'; el.innerHTML = ''; return; }
  if (S.tut === 2 && tab !== 'biz') showTab('biz');
  const place = () => {
    const t = $(st.target);
    if (!t || !S.tut || S.tut >= 9 || !steps[S.tut]) return;
    t.classList.add('coach-target');
    const r = t.getBoundingClientRect(), app = $('#app').getBoundingClientRect();
    el.className = 'coach on';
    el.innerHTML = `<div class="coach-bubble">${st.text}</div><div class="coach-hand">👆</div>`;
    const bubble = el.querySelector('.coach-bubble'), hand = el.querySelector('.coach-hand');
    hand.style.left = (r.left - app.left + r.width / 2) + 'px';
    hand.style.top = (r.top - app.top + r.height * 0.55) + 'px';
    bubble.style.top = (S.tut === 1 ? Math.max(8, r.top - app.top - 10) : Math.max(8, r.top - app.top - 62)) + 'px';
  };
  requestAnimationFrame(place);
  setTimeout(place, 400);
}
window.addEventListener('resize', () => { if (S.tut && S.tut < 9) coach(); });
window.addEventListener('km:ad', (e) => track('ad_watched', { type: e.detail }));

boot();
