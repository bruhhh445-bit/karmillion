// Firebase (free Spark plan): anonymous auth, leaderboard, promo codes, episode votes.
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs,
  runTransaction, serverTimestamp,
} from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config.js';

let db = null, auth = null, uid = null;
let readyPromise = null;

export function initCloud() {
  if (readyPromise) return readyPromise;
  readyPromise = new Promise((resolve) => {
    try {
      const app = initializeApp(FIREBASE_CONFIG);
      db = getFirestore(app);
      auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        if (user) { uid = user.uid; resolve(true); }
      });
      signInAnonymously(auth).catch(() => resolve(false));
      setTimeout(() => resolve(!!uid), 8000);
    } catch (e) {
      resolve(false);
    }
  });
  return readyPromise;
}

export async function submitScore(name, score) {
  if (!(await initCloud()) || !uid) return;
  try {
    await setDoc(doc(db, 'leaderboard', uid), {
      name: String(name).slice(0, 32),
      score: Math.floor(score),
      updatedAt: serverTimestamp(),
    });
  } catch (e) { /* offline or rules not set yet */ }
}

export async function topPlayers(n = 20) {
  if (!(await initCloud())) return null;
  try {
    const snap = await getDocs(query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(n)));
    return snap.docs.map((d) => ({ id: d.id, me: d.id === uid, ...d.data() }));
  } catch (e) { return null; }
}

// Codes are documents in the "codes" collection, added by hand in the Firebase console:
//   codes/KARMA14  ->  { reward: 5000, minutes: 30 (optional), expires: <timestamp, optional>, label: "..." }
// "minutes" = pay that many minutes of the player's income if it is bigger than "reward".
export async function redeemCode(code) {
  if (!(await initCloud())) return { ok: false, msg: 'No connection. Try again.' };
  try {
    const snap = await getDoc(doc(db, 'codes', code));
    if (!snap.exists()) return { ok: false, msg: 'Invalid code.' };
    const d = snap.data();
    if (d.expires && d.expires.toMillis && d.expires.toMillis() < Date.now()) {
      return { ok: false, msg: 'This code has expired.' };
    }
    return { ok: true, reward: Number(d.reward) || 0, minutes: Number(d.minutes) || 0, label: d.label || '' };
  } catch (e) {
    return { ok: false, msg: 'Invalid code.' };
  }
}

// votes/{episodeId} -> { a: count, b: count }
export async function castVote(episodeId, option) {
  if (!(await initCloud())) return null;
  const ref = doc(db, 'votes', episodeId);
  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const cur = snap.exists() ? snap.data() : { a: 0, b: 0 };
      const next = { a: cur.a || 0, b: cur.b || 0 };
      next[option] += 1;
      tx.set(ref, next);
      return next;
    });
  } catch (e) {
    return getVotes(episodeId);
  }
}

export async function getVotes(episodeId) {
  if (!(await initCloud())) return null;
  try {
    const snap = await getDoc(doc(db, 'votes', episodeId));
    return snap.exists() ? snap.data() : null;
  } catch (e) { return null; }
}
