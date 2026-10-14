// The hero's world behind the stage: sky, sun, clouds, skyline, sea and road.
import { INK } from './cars.js';

// Sky palette by wealth tier: night slum → sunset → day → golden.
const SKIES = [
  ['#1f1150', '#4321a8'],
  ['#2a1470', '#7a3cff'],
  ['#4321a8', '#ff7eb6'],
  ['#5b3cd6', '#ffb36b'],
  ['#2f8ff0', '#bfe6ff'],
  ['#3a7bf0', '#d8f2ff'],
  ['#ff8a1f', '#ffe68a'],
];

function skyline(y, color, seed, count, minH, maxH, lit, maxX = 420) {
  let x = -10, out = '';
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < count && x < maxX; i++) {
    const w = 26 + rnd() * 30, h = minH + rnd() * (maxH - minH);
    out += `<rect x="${x.toFixed(0)}" y="${(y - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 4).toFixed(0)}" fill="${color}"/>`;
    if (lit) {
      for (let wy = y - h + 8; wy < y - 8; wy += 12) {
        for (let wx = x + 6; wx < x + w - 8; wx += 10) {
          if (rnd() < 0.35) out += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="4" height="5" fill="#ffe68a" opacity=".8"/>`;
        }
      }
    }
    x += w + 2;
  }
  return out;
}

export function sceneSVG({ tier = 0, sea = false } = {}) {
  const [top, bottom] = SKIES[Math.min(tier, SKIES.length - 1)];
  const night = tier <= 1;
  const day = tier >= 4 && tier <= 5;
  const stars = night ? Array.from({ length: 26 }, (_, i) =>
    `<circle cx="${(i * 73) % 400}" cy="${(i * 37) % 120 + 6}" r="${i % 3 ? 1.3 : 2}" fill="#fff" opacity=".8"/>`).join('') : '';
  const sun = night
    ? `<circle cx="326" cy="86" r="16" fill="#fff6d0" stroke="${INK}" stroke-width="3"/><circle cx="320" cy="82" r="3.5" fill="#e8dfb8"/><circle cx="331" cy="92" r="2.5" fill="#e8dfb8"/>`
    : `<circle cx="326" cy="${day ? 88 : 104}" r="${day ? 18 : 24}" fill="${day ? '#ffe14a' : '#ffd36b'}" stroke="${INK}" stroke-width="3"/>`;
  const cloud = (x, y, sc) => `<g class="cloud" style="--d:${30 + sc * 20}s"><g transform="translate(${x} ${y}) scale(${sc})">
    <path d="M0 20 Q0 6 14 8 Q18 -4 34 2 Q46 -6 56 6 Q72 6 70 20 Z" fill="#fff" opacity="${night ? 0.25 : 0.9}" stroke="${INK}" stroke-width="${night ? 0 : 3}"/></g></g>`;
  const far = skyline(196, night ? '#2a1a66' : day ? '#8fb3e8' : '#6a3fb0', 7, 16, 30, 90, false);
  const near = skyline(204, night ? '#1a1040' : day ? '#5a78b8' : '#3d2380', 3, 14, 20, 60, true, sea ? 200 : 420);
  const water = sea ? `<rect x="230" y="168" width="200" height="40" fill="#3fa9f5"/>
    <path d="M230 168 H430" stroke="${INK}" stroke-width="3"/>
    <path d="M250 182 q8 -4 16 0 M300 190 q8 -4 16 0 M350 180 q8 -4 16 0" stroke="#bfe6ff" stroke-width="3" fill="none" stroke-linecap="round"/>` : '';
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMax slice" class="scene-bg" aria-hidden="true">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
    <rect width="400" height="260" fill="url(#sky)"/>
    ${stars}${sun}
    ${cloud(20, 30, 0.8)}${cloud(180, 14, 0.6)}${cloud(300, 80, 0.7)}
    ${far}${near}
    ${water}
    <rect x="0" y="204" width="400" height="10" fill="#b8bccb" stroke="${INK}" stroke-width="3"/>
    <rect x="0" y="214" width="400" height="46" fill="#3a3550"/>
    <path d="M0 238 H400" stroke="#ffe14a" stroke-width="4" stroke-dasharray="22 18" class="road-dash"/>
  </svg>`;
}
