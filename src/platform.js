// Telegram Mini App + Adsgram wrappers. Everything degrades gracefully in a normal browser.
import { ADSGRAM_REWARDED_ID, ADSGRAM_INTERSTITIAL_ID, INTERSTITIAL_GAP_MIN } from './config.js';

export const tg = window.Telegram?.WebApp ?? null;
export const inTelegram = !!(tg && tg.initData);

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#2a1470');
    tg.setBackgroundColor?.('#1a1030');
    tg.disableVerticalSwipes?.();
  } catch (e) { /* older clients */ }
}

export function playerName() {
  const u = tg?.initDataUnsafe?.user;
  if (!u) return 'Player';
  return (u.first_name || u.username || 'Player').slice(0, 24);
}

export function haptic(kind = 'light') {
  try { tg?.HapticFeedback?.impactOccurred(kind); } catch (e) {}
}

// ---------- Save storage: Telegram CloudStorage, fallback localStorage ----------
const KEY = 'save_v1';
const hasCloud = () => !!(tg?.CloudStorage && tg.isVersionAtLeast?.('6.9') && inTelegram);

export function loadSave() {
  return new Promise((resolve) => {
    let local = null;
    try { local = localStorage.getItem(KEY); } catch (e) {}
    if (!hasCloud()) return resolve(local);
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; resolve(local); } }, 2500);
    tg.CloudStorage.getItem(KEY, (err, val) => {
      if (done) return;
      done = true; clearTimeout(timer);
      resolve(!err && val ? pickNewest(val, local) : local);
    });
  });
}

function pickNewest(a, b) {
  try {
    if (!b) return a;
    return (JSON.parse(a).savedAt || 0) >= (JSON.parse(b).savedAt || 0) ? a : b;
  } catch (e) { return a || b; }
}

export function writeSave(json) {
  try { localStorage.setItem(KEY, json); } catch (e) {}
  if (hasCloud()) {
    try { tg.CloudStorage.setItem(KEY, json, () => {}); } catch (e) {}
  }
}

// ---------- Adsgram ----------
let rewardedCtl = null, interCtl = null, lastInter = 0;
const hasAdsgram = () => !!window.Adsgram;

export function adsAvailable() {
  return !!(ADSGRAM_REWARDED_ID && hasAdsgram() && inTelegram);
}

// Resolves true only if the user watched the ad to the end.
export async function showRewardedAd() {
  if (!adsAvailable()) {
    // Outside Telegram: let us test the reward flow in a normal browser.
    if (!inTelegram) return confirm('[Test mode] Ads only run inside Telegram. Grant the reward?');
    return false;
  }
  try {
    rewardedCtl ??= window.Adsgram.init({ blockId: ADSGRAM_REWARDED_ID });
    const res = await rewardedCtl.show();
    return res?.done !== false; // show() resolves only when the ad was watched
  } catch (e) {
    return false;
  }
}

// Fire-and-forget interstitial, at most once per INTERSTITIAL_GAP_MIN minutes.
export function maybeShowInterstitial() {
  if (!ADSGRAM_INTERSTITIAL_ID || !hasAdsgram() || !inTelegram) return;
  if (Date.now() - lastInter < INTERSTITIAL_GAP_MIN * 60000) return;
  lastInter = Date.now();
  try {
    interCtl ??= window.Adsgram.init({ blockId: ADSGRAM_INTERSTITIAL_ID });
    interCtl.show().catch(() => {});
  } catch (e) {}
}
