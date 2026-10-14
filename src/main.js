import './style.css';
import {
  BUSINESSES, TIERS, costOf, bizIncome, nextMilestone, incomePerSec, tapValue, tierIndex, fmt, fmtTime,
} from './economy.js';
import {
  initTelegram, inTelegram, playerName, haptic, loadSave, writeSave, showRewardedAd, maybeShowInterstitial, tg,
} from './platform.js';
import { initCloud, submitScore, topPlayers, redeemCode, castVote, getVotes } from './cloud.js';
import { OFFLINE_CAP_HOURS, BOOST_MINUTES, ADSGRAM_TASK_ID, YOUTUBE_URL } from './config.js';
import { EPISODES } from './episodes.js';
import { heroHTML, girlHTML, richGuyHTML } from './hero.js';

// ---------------------------------------------------------------- state
const DEFAULT = () => ({
  money: 0,
  totalEarned: 0,
  biz: {},
  karma: 0,
  boostUntil: 0,
  lastDaily: 0,
  lastSeen: Date.now(),
  savedAt: 0,
  episodes: {},   // id -> { choice, done }
  codes: [],      // redeemed codes
  taps: 0,
  tier: 0,
});

let S = DEFAULT();
let buyMode = 1;          // 1, 10 or 'max'
let tab = 'biz';
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + fmt(n);
const boosted = () => Date.now() < S.boostUntil;
const ips = () => incomePerSec(S) * (boosted() ? 2 : 1);

function earn(amount) {
  S.money += amount;
  S.totalEarned += amount;
}

function save() {
  S.lastSeen = Date.now();
  S.savedAt = Date.now();
  writeSave(JSON.stringify(S));
}

// ---------------------------------------------------------------- boot
async function boot() {
  initTelegram();
  const raw = await loadSave();
  if (raw) {
    try { S = { ...DEFAULT(), ...JSON.parse(raw) }; } catch (e) { S = DEFAULT(); }
  }
  // Starter cash so the first purchase happens in seconds.
  if (!S.totalEarned && !S.money) S.money = 15;

  renderShell();
  showTab('biz');
  initCloud();

  // Offline income (base income, no boost), capped.
  const away = Math.min((Date.now() - (S.lastSeen || Date.now())) / 1000, OFFLINE_CAP_HOURS * 3600);
  const offline = incomePerSec(S) * away;
  if (away > 60 && offline >= 1) offlineModal(offline, away);

  let last = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 1);
    last = now;
    earn(ips() * dt);
    tick();
  }, 100);
  setInterval(save, 10000);
  setInterval(() => submitScore(playerName(), S.totalEarned), 60000);
  setTimeout(() => submitScore(playerName(), S.totalEarned), 5000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
}

// ---------------------------------------------------------------- shell
function renderShell() {
  $('#app').innerHTML = `
  <header class="hud">
    <div class="money" id="money">$0</div>
    <div class="ips"><span id="ips">$0</span>/sec <span class="boost-badge" id="boostBadge" hidden>×2 <b id="boostLeft"></b></span></div>
  </header>
  <section class="stage" id="stage">
    <div class="rays"></div>
    <div class="tier">
      <div class="tier-name" id="tierName"></div>
      <div class="tier-bar"><i id="tierFill"></i></div>
      <div class="tier-next" id="tierNext"></div>
    </div>
    <button class="hero-btn" id="heroBtn" aria-label="Tap to earn money"></button>
    <div id="floaters"></div>
    <button class="btn boost" id="boostBtn">▶ ×2 income · ${BOOST_MINUTES} min</button>
  </section>
  <main class="panel" id="panel"></main>
  <nav class="tabs" id="tabs">
    <button data-tab="biz">💼<span>Business</span></button>
    <button data-tab="eps">🎬<span>Episodes</span></button>
    <button data-tab="top">🏆<span>Top</span></button>
    <button data-tab="bonus">🎁<span>Bonus</span></button>
  </nav>
  <div id="modal"></div>`;

  drawHero();
  $('#heroBtn').addEventListener('pointerdown', onTap);
  $('#boostBtn').addEventListener('click', onBoost);
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (b) { haptic('light'); showTab(b.dataset.tab); }
  });
  $('#panel').addEventListener('click', onPanelClick);
}

function drawHero(mood = 'happy') {
  $('#heroBtn').innerHTML = heroHTML(S.tier, mood);
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
}

async function onBoost() {
  const ok = await showRewardedAd();
  if (!ok) return;
  S.boostUntil = Math.max(Date.now(), S.boostUntil) + BOOST_MINUTES * 60000;
  haptic('heavy');
  save();
}

// ---------------------------------------------------------------- per-frame updates
let lastPanelSync = 0;
function tick() {
  $('#money').textContent = money(S.money);
  $('#ips').textContent = money(ips());
  const b = boosted();
  $('#boostBadge').hidden = !b;
  if (b) $('#boostLeft').textContent = fmtTime((S.boostUntil - Date.now()) / 1000);

  const ti = tierIndex(S.totalEarned);
  if (ti > S.tier) { S.tier = ti; drawHero('smug'); tierModal(ti); save(); }
  const cur = TIERS[S.tier], nxt = TIERS[S.tier + 1];
  $('#tierName').textContent = cur.name;
  if (nxt) {
    const p = (S.totalEarned - cur.at) / (nxt.at - cur.at);
    $('#tierFill').style.width = Math.min(100, p * 100) + '%';
    $('#tierNext').textContent = `Next: ${nxt.name} at ${money(nxt.at)} earned`;
  } else {
    $('#tierFill').style.width = '100%';
    $('#tierNext').textContent = 'Top of the world. Rebirth coming soon 👑';
  }

  const now = performance.now();
  if (now - lastPanelSync > 250) { lastPanelSync = now; syncPanel(); }
}

// ---------------------------------------------------------------- tabs
function showTab(name) {
  tab = name;
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
  const p = $('#panel');
  p.scrollTop = 0;
  if (name === 'biz') p.innerHTML = bizHTML();
  if (name === 'eps') p.innerHTML = episodesHTML();
  if (name === 'top') { p.innerHTML = '<h2>Richest players</h2><div class="muted">Loading…</div>'; loadTop(); }
  if (name === 'bonus') { p.innerHTML = bonusHTML(); mountTask(); }
  syncPanel();
}

function syncPanel() {
  if (tab === 'biz') {
    for (const b of BUSINESSES) {
      const row = document.getElementById('biz-' + b.id);
      if (!row) continue;
      const { n, cost } = buyInfo(b);
      const btn = row.querySelector('.buy');
      btn.disabled = n === 0 || S.money < cost;
      btn.querySelector('.cost').textContent = money(cost);
      btn.querySelector('.qty').textContent = '×' + Math.max(n, 1);
      row.classList.toggle('hidden-biz', !isVisible(b));
    }
  }
  if (tab === 'bonus') {
    const d = document.getElementById('dailyBtn');
    if (d) {
      const left = S.lastDaily + 86400000 - Date.now();
      d.disabled = left > 0;
      d.textContent = left > 0 ? `Come back in ${fmtTime(left / 1000)}` : `Claim ${money(dailyReward())}`;
    }
  }
}

// ---------------------------------------------------------------- business
function isVisible(b) {
  const i = BUSINESSES.indexOf(b);
  if (i === 0 || (S.biz[b.id] || 0) > 0) return true;
  const prev = BUSINESSES[i - 1];
  return (S.biz[prev.id] || 0) > 0;
}

function buyInfo(b) {
  const lvl = S.biz[b.id] || 0;
  if (buyMode === 'max') {
    let n = 0, cost = 0;
    while (n < 1000) {
      const c = costOf(b, lvl + n);
      if (cost + c > S.money) break;
      cost += c; n++;
    }
    return { n, cost: n ? cost : costOf(b, lvl) };
  }
  let cost = 0;
  for (let i = 0; i < buyMode; i++) cost += costOf(b, lvl + i);
  return { n: buyMode, cost };
}

function bizHTML() {
  const modes = [1, 10, 'max'].map((m) =>
    `<button class="chip ${buyMode === m ? 'on' : ''}" data-mode="${m}">${m === 'max' ? 'MAX' : '×' + m}</button>`).join('');
  const rows = BUSINESSES.map((b) => {
    const lvl = S.biz[b.id] || 0;
    const ms = nextMilestone(lvl);
    return `
    <div class="biz" id="biz-${b.id}">
      <div class="biz-icon">${b.icon}</div>
      <div class="biz-info">
        <div class="biz-name">${b.name} <span class="lvl">Lv ${lvl}</span></div>
        <div class="biz-inc">${lvl ? money(bizIncome(b, lvl)) + '/s' : money(b.income) + '/s per level'}</div>
        ${ms ? `<div class="biz-ms">Lv ${ms}: income ×2</div>` : '<div class="biz-ms">Maxed bonus</div>'}
      </div>
      <button class="buy" data-buy="${b.id}"><span class="qty">×1</span><span class="cost"></span></button>
    </div>`;
  }).join('');
  return `<div class="row-head"><h2>Your empire</h2><div class="chips">${modes}</div></div>${rows}
    <div class="muted center">New businesses unlock as you grow.</div>`;
}

function buy(id) {
  const b = BUSINESSES.find((x) => x.id === id);
  const { n, cost } = buyInfo(b);
  if (!n || S.money < cost) { haptic('rigid'); return; }
  S.money -= cost;
  S.biz[id] = (S.biz[id] || 0) + n;
  haptic('medium');
  showTab('biz');
}

// ---------------------------------------------------------------- panel clicks
async function onPanelClick(e) {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.buy) return buy(t.dataset.buy);
  if (t.dataset.mode) { buyMode = t.dataset.mode === 'max' ? 'max' : Number(t.dataset.mode); return showTab('biz'); }
  if (t.dataset.ep) return playEpisode(t.dataset.ep);
  if (t.id === 'dailyBtn') return claimDaily();
  if (t.id === 'codeBtn') return onCode();
  if (t.id === 'ytBtn') return openLink(YOUTUBE_URL);
}

function openLink(url) {
  if (!url) return;
  if (tg?.openLink) tg.openLink(url); else window.open(url, '_blank');
}

// ---------------------------------------------------------------- bonus
const dailyReward = () => Math.max(200, incomePerSec(S) * 30 * 60);

function bonusHTML() {
  return `
  <h2>Daily gift</h2>
  <div class="card"><p>Free cash every 24 hours.</p><button class="btn gold" id="dailyBtn">Claim</button></div>
  <h2>Promo code</h2>
  <div class="card">
    <p>Codes are hidden in the last second of every new Trinoko short.</p>
    <div class="code-row">
      <input id="codeInput" maxlength="24" placeholder="ENTER CODE" autocomplete="off" autocapitalize="characters" spellcheck="false">
      <button class="btn" id="codeBtn">Redeem</button>
    </div>
    <div class="code-msg" id="codeMsg"></div>
  </div>
  <h2>Quick task</h2>
  <div class="card" id="taskCard"><p class="muted" id="taskEmpty">Complete a task for a big cash reward.</p><div id="taskSlot"></div></div>
  ${YOUTUBE_URL ? '<button class="btn wide" id="ytBtn">▶ Watch new episodes on YouTube</button>' : ''}`;
}

function claimDaily() {
  if (Date.now() < S.lastDaily + 86400000) return;
  const r = dailyReward();
  earn(r);
  S.lastDaily = Date.now();
  haptic('heavy');
  save();
  rewardModal('Daily gift', r);
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
  earn(r);
  S.codes.push(code);
  save();
  input.value = '';
  msg.textContent = '';
  rewardModal(res.label || `Code ${code}`, r);
}

function mountTask() {
  const slot = $('#taskSlot');
  if (!slot || !ADSGRAM_TASK_ID || !inTelegram || !window.Adsgram) return;
  slot.innerHTML = `
    <adsgram-task data-block-id="${ADSGRAM_TASK_ID}" class="task">
      <span slot="reward" class="task-reward">💰 ${money(taskReward())}</span>
      <div slot="button" class="task-btn">GO</div>
      <div slot="claim" class="task-btn claim">CLAIM</div>
      <div slot="done" class="task-btn done">DONE</div>
    </adsgram-task>`;
  const el = slot.querySelector('adsgram-task');
  el.addEventListener('reward', () => {
    const r = taskReward();
    earn(r); save();
    rewardModal('Task complete', r);
  });
  const hide = () => { slot.innerHTML = ''; $('#taskEmpty').textContent = 'No tasks right now. Check back later!'; };
  el.addEventListener('onBannerNotFound', hide);
  el.addEventListener('onError', hide);
  el.addEventListener('onTooLongSession', hide);
  $('#taskEmpty').textContent = '';
}
const taskReward = () => Math.max(1000, incomePerSec(S) * 20 * 60);

// ---------------------------------------------------------------- leaderboard
async function loadTop() {
  const list = await topPlayers(30);
  if (tab !== 'top') return;
  const p = $('#panel');
  if (!list) { p.innerHTML = '<h2>Richest players</h2><div class="card muted">Leaderboard is offline. Try later.</div>'; return; }
  if (!list.length) { p.innerHTML = '<h2>Richest players</h2><div class="card muted">Be the first one here!</div>'; return; }
  p.innerHTML = '<h2>Richest players</h2>' + list.map((r, i) => `
    <div class="lb ${r.me ? 'me' : ''}">
      <span class="rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
      <span class="lb-name">${esc(r.name || 'Player')}${r.me ? ' (you)' : ''}</span>
      <span class="lb-score">${money(r.score || 0)}</span>
    </div>`).join('') + '<div class="muted center">Top players of the week appear in our next short!</div>';
}

// ---------------------------------------------------------------- episodes
function episodesHTML() {
  return '<h2>Episodes</h2><p class="muted">Every new short = a new episode. You decide how it ends.</p>' +
    EPISODES.map((ep) => {
      const locked = S.tier < ep.unlockTier;
      const done = S.episodes[ep.id]?.done;
      let action;
      if (ep.kind === 'soon') action = '<span class="tag">Coming soon</span>';
      else if (locked) action = `<span class="tag">🔒 ${TIERS[ep.unlockTier].name}</span>`;
      else action = `<button class="btn ${done ? '' : 'gold'}" data-ep="${ep.id}">${done ? 'Replay' : '▶ Play'}</button>`;
      return `
      <div class="ep ${locked || ep.kind === 'soon' ? 'locked' : ''}">
        <div class="ep-info">
          <div class="ep-title">${ep.title}</div>
          <div class="ep-hook">${ep.hook}</div>
          ${done ? `<div class="ep-done">✔ ${esc(done)}</div>` : ''}
        </div>
        ${action}
      </div>`;
    }).join('');
}

function actorHTML([who, mood]) {
  if (who === 'hero') return heroHTML(S.tier, mood);
  if (who === 'heroRich') return heroHTML(Math.max(S.tier, 4), mood);
  if (who === 'girl') return girlHTML(mood);
  if (who === 'rich') return richGuyHTML(false, mood);
  if (who === 'richBroke') return richGuyHTML(true, mood);
  return '';
}

function sceneHTML(sc) {
  const actors = sc.actors.map(([w, m]) =>
    `<div class="actor">${actorHTML([w === 'hero' && sc.tierBoost ? 'heroRich' : w, m])}</div>`).join('');
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

function epReward(ep) {
  return Math.max(ep.minReward, incomePerSec(S) * ep.rewardMinutes * 60);
}

function showChoice(ep, m) {
  const c = ep.choice;
  m.innerHTML = `<div class="ep-player">
    <div class="question">${c.question}</div>
    <div class="choices">
      <button class="btn big" data-c="a">${c.a.label}</button>
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
    m.innerHTML = `<div class="ep-player"><div class="question">${opt.outcome}</div><div class="muted center" id="votes">Counting votes…</div></div>`;
    const votes = first ? await castVote(ep.id, key) : await getVotes(ep.id);
    const a = votes?.a || 0, bb = votes?.b || 0, tot = a + bb;
    const pct = tot ? Math.round(((key === 'a' ? a : bb) / tot) * 100) : 100;
    finishEpisode(ep, m, `${opt.outcome}`, tot ? `${pct}% of players chose the same.` : '', first);
  });
}

function showButtons(ep, m) {
  const prizes = [...ep.prizes].sort(() => Math.random() - 0.5);
  let extraUsed = false;
  let best = null;
  const draw = (revealed = []) => {
    m.innerHTML = `<div class="ep-player">
      <div class="question">${best ? 'You got: ' + best.label : 'PICK ONE BUTTON'}</div>
      <div class="wish-buttons">
        ${prizes.map((p, i) => `<button class="wish w${i}" data-w="${i}" ${revealed.includes(i) ? 'disabled' : ''}>
          ${revealed.includes(i) ? `<span>${p.label}</span>` : ''}</button>`).join('')}
      </div>
      ${best && !extraUsed ? '<button class="btn" id="again">▶ Press one more (ad)</button>' : ''}
      ${best ? '<button class="btn gold" id="take">Take it</button>' : ''}
      <button class="x" aria-label="Close">✕</button></div>`;
    m.querySelector('.x').onclick = closeModal;
    if (!best || extraUsed === 'pending') {
      m.querySelectorAll('[data-w]').forEach((b) => b.onclick = () => {
        if (b.disabled) return;
        const p = prizes[b.dataset.w];
        haptic('heavy');
        if (!best || p.mult > best.mult) best = p;
        if (extraUsed === 'pending') extraUsed = true;
        draw([...revealed, Number(b.dataset.w)]);
      });
    }
    m.querySelector('#again')?.addEventListener('click', async () => {
      if (await showRewardedAd()) { extraUsed = 'pending'; draw(revealed); }
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
      <button class="btn gold big" id="x2">▶ ×2 reward</button>
      <button class="btn big alt" id="take1">Take ${money(r)}</button>
    </div>
    <div class="muted center">Next episode drops with the next Trinoko short.</div></div>`;
  const done = (k) => {
    earn(r * k); haptic('heavy'); save(); closeModal();
    if (tab === 'eps') showTab('eps');
    maybeShowInterstitial();
  };
  m.querySelector('#take1').onclick = () => done(1);
  m.querySelector('#x2').onclick = async () => { if (await showRewardedAd()) done(2); };
}

// ---------------------------------------------------------------- modals
function openModal(kind = '') {
  const m = $('#modal');
  m.className = 'modal on ' + kind;
  m.innerHTML = '';
  return m;
}
function closeModal() {
  const m = $('#modal');
  m.className = 'modal';
  m.innerHTML = '';
}

function rewardModal(title, amount) {
  const m = openModal();
  m.innerHTML = `<div class="sheet"><div class="sheet-title">${esc(title)}</div>
    <div class="reward">+${money(amount)}</div><button class="btn gold big" id="ok">Nice!</button></div>`;
  m.querySelector('#ok').onclick = closeModal;
}

function offlineModal(amount, secs) {
  const m = openModal();
  m.innerHTML = `<div class="sheet"><div class="sheet-title">While you were away (${fmtTime(secs)})</div>
    <div class="reward">+${money(amount)}</div>
    <div class="choices">
      <button class="btn gold big" id="x2">▶ Collect ×2</button>
      <button class="btn big alt" id="take">Collect</button>
    </div></div>`;
  m.querySelector('#take').onclick = () => { earn(amount); save(); closeModal(); };
  m.querySelector('#x2').onclick = async () => { if (await showRewardedAd()) { earn(amount * 2); save(); closeModal(); } };
}

function tierModal(ti) {
  if ($('#modal').classList.contains('on')) return; // don't interrupt another popup
  const m = openModal('tierup');
  m.innerHTML = `<div class="sheet"><div class="sheet-kicker">NEW LEVEL</div>
    <div class="sheet-title big">${TIERS[ti].name.toUpperCase()}</div>
    <div class="tier-hero">${heroHTML(ti, 'smug')}</div>
    <button class="btn gold big" id="ok">Let's go</button></div>`;
  m.querySelector('#ok').onclick = closeModal;
  haptic('heavy');
}

boot();
