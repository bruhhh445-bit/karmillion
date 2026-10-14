// Random life situations with a karma choice. Each pick returns a short result line.
import { carOf } from './assets.js';
import { incomePerSec, money } from './economy.js';

const rnd = Math.random;
const pay = (s, amt) => { const p = Math.min(amt, s.money); s.money -= p; return p; };
const gain = (s, amt) => { s.money += amt; s.totalEarned += amt; };

export function eventAmount(s, minutes = 1.5) {
  const base = Math.max(25, incomePerSec(s) * 60 * minutes);
  return Math.floor(Math.min(base, Math.max(25, s.money * 0.3)));
}

export const EVENTS = [
  {
    id: 'beggar', icon: '🥺', title: 'Help a stranger?',
    text: (a) => `A homeless man asks you for ${money(a)}.`,
    a: { label: 'Give 💛', run: (s, a) => { pay(s, a); s.karma += 6; return 'He smiles at you. +6 karma'; } },
    b: { label: 'Ignore', run: (s) => { s.karma -= 4; return 'You walk past. −4 karma'; } },
  },
  {
    id: 'wallet', icon: '👛', title: 'Lost wallet',
    text: (a) => `You find a wallet with ${money(a)} inside.`,
    a: { label: 'Return it 😇', run: (s, a) => {
      s.karma += 8;
      if (rnd() < 0.35) { gain(s, a * 3); return `The owner was a millionaire! Reward ${money(a * 3)}. +8 karma`; }
      return 'The owner hugs you. +8 karma';
    } },
    b: { label: 'Keep it 😈', run: (s, a) => { gain(s, a); s.karma -= 8; return `+${money(a)}, −8 karma`; } },
  },
  {
    id: 'loan', icon: '🤝', title: 'Old friend',
    text: (a) => `Your old friend asks to borrow ${money(a)}.`,
    a: { label: 'Lend it', run: (s, a) => {
      const p = pay(s, a);
      s.karma += 4;
      if (rnd() < 0.6) {
        s.pending.push({ at: Date.now() + 120000, amount: p * 2, text: 'Your friend paid you back double!' });
        return 'He promises to pay back soon. +4 karma';
      }
      return 'He disappears with your money… +4 karma';
    } },
    b: { label: 'Refuse', run: (s) => { s.karma -= 3; return 'He leaves sad. −3 karma'; } },
  },
  {
    id: 'gamble', icon: '🎲', title: 'Double or nothing',
    text: (a) => `A shady guy offers a coin flip for ${money(a)}.`,
    a: { label: 'Flip it', run: (s, a) => {
      s.karma -= 2;
      if (rnd() < 0.47) { gain(s, a); return `You win ${money(a)}! −2 karma`; }
      pay(s, a); return `You lose ${money(a)}. −2 karma`;
    } },
    b: { label: 'Walk away', run: (s) => { s.karma += 1; return 'Smart move. +1 karma'; } },
  },
  {
    id: 'charity', icon: '🏠', title: 'Orphanage roof',
    text: (a) => `The local orphanage needs ${money(a * 2)} for a new roof.`,
    a: { label: 'Donate 💛', run: (s, a) => { pay(s, a * 2); s.karma += 12; return 'Kids made you a thank-you card. +12 karma'; } },
    b: { label: 'Not my problem', run: (s) => { s.karma -= 6; return '−6 karma'; } },
  },
  {
    id: 'taxes', icon: '🧾', title: 'Tax season',
    text: (a) => `Your taxes are ${money(a)}. Your accountant whispers: "We could hide it…"`,
    a: { label: 'Pay honestly', run: (s, a) => { pay(s, a); s.karma += 5; return 'Clean record. +5 karma'; } },
    b: { label: 'Hide it 🤫', run: (s, a) => {
      s.karma -= 6;
      if (rnd() < 0.4) { pay(s, a * 3); return `Caught! Fine ${money(a * 3)}. −6 karma`; }
      return 'Nobody noticed… −6 karma';
    } },
  },
  {
    id: 'race', icon: '🏁', title: 'Street race',
    need: (s) => !!carOf(s),
    text: (a) => `A rich kid challenges your ride to a race for ${money(a)}.`,
    a: { label: 'Race!', run: (s, a) => {
      const car = carOf(s);
      const chance = Math.min(0.8, 0.35 + car.fame / 100);
      s.karma -= 1;
      if (rnd() < chance) { gain(s, a); return `Your ${car.name} wins! +${money(a)}`; }
      pay(s, a); return `He was faster. −${money(a)}`;
    } },
    b: { label: 'Decline', run: () => 'You drive home safely.' },
  },
  {
    id: 'ex', icon: '💔', title: 'She is back',
    need: (s) => s.tier >= 3,
    text: (a) => `Your ex saw your new car… she wants to come back. And ${money(a)} for "a dress".`,
    a: { label: 'Take her back', run: (s, a) => { pay(s, a); s.karma += 5; return 'Love is blind. +5 karma'; } },
    b: { label: 'Bye 😎', run: (s) => { s.karma -= 5; return 'You drive away. −5 karma'; } },
  },
  {
    id: 'puppy', icon: '🐶', title: 'Puppy in the rain',
    text: () => 'A wet puppy follows you home.',
    a: { label: 'Adopt him', run: (s, a) => {
      s.karma += 7;
      if (rnd() < 0.3) { gain(s, a * 4); return `He dug up a chest of gold! +${money(a * 4)}`; }
      return 'Best friend forever. +7 karma';
    } },
    b: { label: 'Shoo', run: (s) => { s.karma -= 7; return '−7 karma'; } },
  },
];

export function pickEvent(s) {
  const list = EVENTS.filter((e) => !e.need || e.need(s));
  return list[Math.floor(Math.random() * list.length)];
}

export function karmaTitle(k) {
  if (k >= 150) return '😇 Saint';
  if (k >= 60) return '👼 Angel';
  if (k >= 15) return '🙂 Good soul';
  if (k > -15) return '😐 Neutral';
  if (k > -60) return '😏 Shark';
  if (k > -150) return '😈 Devil';
  return '👹 Villain';
}
