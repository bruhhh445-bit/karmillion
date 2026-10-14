// Boats and aircraft, same style as the cars.
import { INK } from './cars.js';

const water = (w = 300) => `
  <path d="M-50 92 Q-25 86 0 92 T50 92 T100 92 T150 92 T200 92 T250 92 V110 H-50 Z" fill="#3fa9f5" stroke="${INK}" stroke-width="3"/>
  <path d="M-30 100 q10 -4 20 0 M60 102 q10 -4 20 0 M170 100 q10 -4 20 0" stroke="#bfe6ff" stroke-width="3" fill="none" stroke-linecap="round"/>`;

function hull(x0, x1, deck, keel, color, stripe) {
  const d = `M${x0} ${deck} L${x1 - 16} ${deck} Q${x1 + 6} ${deck} ${x1} ${deck + 6} L${x1 - 26} ${keel} L${x0 + 12} ${keel} Q${x0} ${keel} ${x0} ${keel - 10} Z`;
  return `<path d="${d}" fill="${color}"/>
    <path d="M${x0} ${deck + 9} L${x1 - 6} ${deck + 9}" stroke="${stripe}" stroke-width="6" clip-path="none"/>
    <path d="${d}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
}

function deck(x0, x1, y, h, color, slope = 14) {
  return `<path d="M${x0} ${y + h} L${x0} ${y + 4} Q${x0} ${y} ${x0 + 4} ${y} L${x1 - slope} ${y} L${x1} ${y + h} Z" fill="${color}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M${x0 + 6} ${y + h * 0.35} H${x1 - slope * 0.75 - 6} L${x1 - slope * 0.3 - 4} ${y + h * 0.72} H${x0 + 6} Z" fill="#2c3550"/>
    <path d="M${x0 + 14} ${y + h * 0.42} l6 0 l-4 ${h * 0.24} h-6 z" fill="#9fe3ff" opacity=".7"/>`;
}

export function boatSVG({ type = 'yacht', color = '#ffffff', stripe = '#3d7be0' } = {}, bare = false) {
  let body = '';
  if (type === 'jetski') {
    body = `<path d="M50 80 L150 80 Q170 80 162 70 L130 62 L110 50 L96 50 L92 62 L60 64 Q46 66 50 80 Z" fill="${stripe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M92 62 L130 62" stroke="#fff" stroke-width="4"/>
      <path d="M106 50 L118 36 h8" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  } else if (type === 'speedboat') {
    body = hull(20, 190, 60, 86, color, stripe) +
      `<path d="M96 60 L118 42 L140 42 L132 60 Z" fill="#9fe3ff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
       <path d="M30 60 L30 50 h18" stroke="${INK}" stroke-width="4" fill="none"/>`;
  } else if (type === 'sailboat') {
    body = hull(30, 186, 66, 88, color, stripe) +
      `<path d="M104 66 V6" stroke="${INK}" stroke-width="5"/>
       <path d="M108 10 Q150 36 158 62 L108 62 Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
       <path d="M100 14 Q70 40 60 62 L100 62 Z" fill="${stripe}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
       <path d="M104 6 l14 4 l-14 4" fill="#ff5470" stroke="${INK}" stroke-width="2"/>`;
  } else if (type === 'yacht') {
    body = hull(6, 200, 62, 88, color, stripe) + deck(40, 168, 44, 18, '#f4f3fa') + deck(70, 140, 30, 14, '#f4f3fa', 12) +
      `<path d="M96 30 V16 M88 18 h16" stroke="${INK}" stroke-width="3.5"/>`;
  } else if (type === 'mega') {
    body = hull(-20, 222, 64, 90, color, stripe) + deck(10, 192, 46, 18, '#f4f3fa', 18) + deck(36, 170, 30, 16, '#f4f3fa', 16) +
      deck(64, 142, 16, 14, '#f4f3fa', 12) + `<path d="M98 16 V2 M90 4 h16" stroke="${INK}" stroke-width="3.5"/>
      <rect x="-6" y="56" width="20" height="6" fill="#3fa9f5" stroke="${INK}" stroke-width="2.5"/>`;
  } else if (type === 'giga') {
    body = hull(-34, 236, 64, 90, '#1d1b2b', '#ffc928') + deck(-10, 210, 46, 18, '#f4f3fa', 20) + deck(14, 186, 30, 16, '#f4f3fa', 18) +
      deck(44, 160, 14, 16, '#f4f3fa', 14) +
      `<ellipse cx="-10" cy="44" rx="22" ry="4" fill="#ffc928" stroke="${INK}" stroke-width="3"/>
       <text x="-10" y="47" font-size="8" font-family="Arial" font-weight="900" text-anchor="middle" fill="${INK}">H</text>
       <path d="M102 14 V-2" stroke="${INK}" stroke-width="3.5"/><circle cx="102" cy="-2" r="4" fill="#ffc928" stroke="${INK}" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="-50 -10 300 120" class="art boat" aria-hidden="true">${bare ? '' : water()}${body}</svg>`;
}

export function airSVG({ type = 'jet', color = '#ffffff', stripe = '#4321a8' } = {}) {
  let body = '';
  if (type === 'heli') {
    body = `<path d="M30 16 H190" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M110 16 V30" stroke="${INK}" stroke-width="6"/>
      <path d="M60 50 Q60 30 92 30 L130 30 Q158 32 160 56 Q160 70 140 70 L80 70 Q60 70 60 50 Z" fill="${color}" stroke="${INK}" stroke-width="4"/>
      <path d="M128 34 Q150 38 152 54 L128 54 Z" fill="#9fe3ff" stroke="${INK}" stroke-width="3"/>
      <path d="M60 50 L10 44 L4 30 L14 30 L24 42" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="8" cy="34" r="9" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/>
      <path d="M80 78 H150 M92 70 V78 M138 70 V78" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 58 H150" stroke="${stripe}" stroke-width="5"/>`;
  } else if (type === 'jet') {
    body = `<path d="M10 54 Q14 40 40 40 L170 40 Q206 42 214 56 Q206 66 170 66 L40 66 Q20 66 10 54 Z" fill="${color}" stroke="${INK}" stroke-width="4"/>
      <path d="M26 42 L12 12 L32 12 L56 40 Z" fill="${stripe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M90 60 L60 90 L84 90 L130 62 Z" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M186 44 Q202 46 206 54 L184 54 Z" fill="#9fe3ff" stroke="${INK}" stroke-width="3"/>
      ${[70, 88, 106, 124, 142, 160].map((x) => `<circle cx="${x}" cy="50" r="4" fill="#9fe3ff" stroke="${INK}" stroke-width="2"/>`).join('')}
      <path d="M30 60 H190" stroke="${stripe}" stroke-width="4"/>
      <rect x="40" y="30" width="30" height="12" rx="6" fill="#d6d9e6" stroke="${INK}" stroke-width="3"/>`;
  } else if (type === 'jumbo') {
    body = `<path d="M0 56 Q4 34 40 34 L176 34 Q214 36 220 56 Q210 72 176 72 L40 72 Q8 72 0 56 Z" fill="${color}" stroke="${INK}" stroke-width="4"/>
      <path d="M150 34 Q160 20 186 26 Q206 32 210 46" fill="${color}" stroke="${INK}" stroke-width="4"/>
      <path d="M18 36 L0 0 L28 0 L54 34 Z" fill="${stripe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M100 66 L60 104 L92 104 L148 66 Z" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="84" y="80" width="28" height="12" rx="6" fill="#d6d9e6" stroke="${INK}" stroke-width="3"/>
      ${[46, 62, 78, 94, 110, 126, 142, 158, 174].map((x) => `<rect x="${x}" y="44" width="7" height="9" rx="3" fill="#9fe3ff" stroke="${INK}" stroke-width="2"/>`).join('')}
      <path d="M10 62 H206" stroke="#ffc928" stroke-width="5"/>`;
  } else if (type === 'ship') {
    body = `<path d="M40 56 Q60 24 140 26 Q196 30 214 56 Q196 82 140 86 Q60 88 40 56 Z" fill="#d6d9e6" stroke="${INK}" stroke-width="4"/>
      <path d="M150 36 Q190 40 198 56 L150 56 Z" fill="#9fe3ff" stroke="${INK}" stroke-width="3"/>
      <path d="M60 30 L30 6 L54 6 L90 28 M60 82 L30 106 L54 106 L90 84" fill="${stripe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M40 46 Q0 50 -30 56 Q0 62 40 66 Z" fill="#ff8a1f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 50 Q16 53 0 56 Q16 59 40 62 Z" fill="#ffe14a"/>
      <circle cx="110" cy="56" r="8" fill="#ffc928" stroke="${INK}" stroke-width="3"/>`;
  }
  return `<svg viewBox="-50 -10 300 120" class="art air" aria-hidden="true">${body}</svg>`;
}

export function blingSVG(type) {
  if (type === 'watch') return `<svg viewBox="0 0 100 100" class="art bling" aria-hidden="true">
    <rect x="36" y="4" width="28" height="92" rx="8" fill="#2c2a3a" stroke="${INK}" stroke-width="4"/>
    <circle cx="50" cy="50" r="26" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
    <circle cx="50" cy="50" r="18" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <path d="M50 50 V38 M50 50 L58 54" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></svg>`;
  if (type === 'chain') return `<svg viewBox="0 0 100 100" class="art bling" aria-hidden="true">
    <path d="M14 12 Q10 70 50 76 Q90 70 86 12" fill="none" stroke="${INK}" stroke-width="13"/>
    <path d="M14 12 Q10 70 50 76 Q90 70 86 12" fill="none" stroke="#ffc928" stroke-width="7" stroke-dasharray="7 4"/>
    <circle cx="50" cy="80" r="15" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
    <text x="50" y="87" font-size="20" font-family="Arial" font-weight="900" text-anchor="middle" fill="${INK}">$</text></svg>`;
  if (type === 'ring') return `<svg viewBox="0 0 100 100" class="art bling" aria-hidden="true">
    <circle cx="50" cy="64" r="26" fill="none" stroke="${INK}" stroke-width="13"/>
    <circle cx="50" cy="64" r="26" fill="none" stroke="#ffc928" stroke-width="6"/>
    <path d="M32 26 L42 12 H58 L68 26 L50 44 Z" fill="#9fe3ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M32 26 H68 M42 12 L50 26 L58 12" stroke="${INK}" stroke-width="2.5" fill="none"/></svg>`;
  if (type === 'statue') return `<svg viewBox="0 0 100 100" class="art bling" aria-hidden="true">
    <rect x="26" y="78" width="48" height="16" rx="3" fill="#7d7a8a" stroke="${INK}" stroke-width="4"/>
    <rect x="34" y="30" width="32" height="48" rx="6" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
    <rect x="36" y="4" width="28" height="28" rx="6" fill="#ffc928" stroke="${INK}" stroke-width="4"/>
    <path d="M42 18 h6 M54 18 h6 M44 25 q6 4 12 0" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M66 40 L84 20" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M66 40 L84 20" stroke="#ffc928" stroke-width="5" stroke-linecap="round"/></svg>`;
  return '';
}
