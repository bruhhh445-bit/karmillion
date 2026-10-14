// Visual effects: flying coins, confetti, smooth counters, ripples.
import { coin } from './art/icons.js';

let layer = null;
export function initFx(el) { layer = el; }

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// Coins fly from an element (or point) into the wallet.
export function coinBurst(from, to, count = 8) {
  if (!layer || !from || !to) return;
  const a = from.getBoundingClientRect ? center(from) : from;
  const b = center(to);
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'fx-coin';
    c.innerHTML = coin();
    const spreadX = (Math.random() - 0.5) * 90, spreadY = -30 - Math.random() * 60;
    c.style.left = a.x + 'px';
    c.style.top = a.y + 'px';
    layer.appendChild(c);
    const delay = i * 35;
    c.animate([
      { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
      { transform: `translate(calc(-50% + ${spreadX}px), calc(-50% + ${spreadY}px)) scale(1)`, opacity: 1, offset: 0.35 },
      { transform: `translate(calc(-50% + ${b.x - a.x}px), calc(-50% + ${b.y - a.y}px)) scale(.55)`, opacity: 0.9 },
    ], { duration: 750 + Math.random() * 200, delay, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' })
      .finished.then(() => c.remove()).catch(() => c.remove());
  }
  setTimeout(() => { to.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 260 }); }, 800);
}

const CONFETTI = ['#ffc928', '#ff4f7b', '#3ee07f', '#5ec8ff', '#b28cff', '#ffffff'];
export function confetti(count = 70) {
  if (!layer) return;
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.className = 'fx-confetti';
    p.style.background = CONFETTI[i % CONFETTI.length];
    p.style.left = Math.random() * w + 'px';
    p.style.width = 6 + Math.random() * 6 + 'px';
    p.style.height = 10 + Math.random() * 8 + 'px';
    layer.appendChild(p);
    const drift = (Math.random() - 0.5) * 160;
    p.animate([
      { transform: `translate(0,-20px) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${drift}px, ${window.innerHeight + 40}px) rotate(${Math.random() * 900 - 450}deg)`, opacity: 1 },
    ], { duration: 1800 + Math.random() * 1400, delay: Math.random() * 300, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' })
      .finished.then(() => p.remove()).catch(() => p.remove());
  }
}

// Number that glides toward its target instead of jumping.
export function smoothCounter(fmt) {
  let shown = 0, first = true;
  return (target) => {
    if (first || !isFinite(shown)) { shown = target; first = false; }
    const diff = target - shown;
    if (Math.abs(diff) < Math.max(0.5, Math.abs(target) * 0.0005)) shown = target;
    else shown += diff * 0.22;
    return fmt(shown);
  };
}

export function pop(el) {
  el?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 240, easing: 'ease-out' });
}
