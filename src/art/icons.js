// Small icons: businesses, tabs, coins, stock logos, slot symbols.
import { INK } from './cars.js';

const s = (w = 3.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (body, vb = '0 0 64 64', cls = 'ico') => `<svg viewBox="${vb}" class="art ${cls}" aria-hidden="true">${body}</svg>`;

const BIZ = {
  flowers: `<rect x="10" y="30" width="44" height="26" rx="3" fill="#c8915a" ${s()}/>
    <path d="M6 30 L12 14 H52 L58 30 Z" fill="#fff" ${s()}/><path d="M18 14 L16 30 M30 14 V30 M42 14 L44 30" ${s(3)} fill="none"/>
    <path d="M12 14 L6 30 H18 L18 14 M30 14 V30 H42 L42 14" fill="#e8345a"/><path d="M6 30 L12 14 H52 L58 30 Z" fill="none" ${s()}/>
    ${[20, 32, 44].map((x) => `<circle cx="${x}" cy="40" r="6" fill="#ff5470" ${s(3)}/>`).join('')}`,
  lemonade: `<rect x="8" y="24" width="40" height="22" rx="3" fill="#ffe14a" ${s()}/><path d="M48 30 H58" ${s(4)}/>
    <circle cx="18" cy="50" r="6" fill="#2c2a3a" ${s(3)}/><circle cx="40" cy="50" r="6" fill="#2c2a3a" ${s(3)}/>
    <ellipse cx="28" cy="14" rx="12" ry="9" fill="#ffd400" ${s()}/><path d="M22 12 q6 -4 12 0" stroke="#fff" stroke-width="3" fill="none"/>
    <rect x="14" y="30" width="28" height="8" rx="2" fill="#36c25a" ${s(2.5)}/>`,
  carwash: `<path d="M8 46 L8 38 L16 30 H44 L54 38 V46 Z" fill="#3d7be0" ${s()}/>
    <path d="M18 31 L22 25 H40 L46 31 Z" fill="#9fe3ff" ${s(3)}/>
    <circle cx="18" cy="48" r="6" fill="#2c2a3a" ${s(3)}/><circle cx="44" cy="48" r="6" fill="#2c2a3a" ${s(3)}/>
    ${[[12, 14, 6], [26, 8, 5], [40, 14, 7], [52, 22, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#dff4ff" ${s(2.5)}/>`).join('')}`,
  burger: `<path d="M8 30 Q8 10 32 10 Q56 10 56 30 Z" fill="#f2a541" ${s()}/>
    <path d="M6 34 H58 L54 40 H10 Z" fill="#36c25a" ${s(3)}/><rect x="8" y="40" width="48" height="8" rx="3" fill="#7a3c2a" ${s(3)}/>
    <path d="M8 48 H56 Q56 56 48 56 H16 Q8 56 8 48 Z" fill="#f2a541" ${s()}/>
    ${[22, 32, 42].map((x) => `<ellipse cx="${x}" cy="20" rx="2" ry="1.4" fill="#fff"/>`).join('')}`,
  startup: `<rect x="12" y="12" width="40" height="28" rx="3" fill="#2c3550" ${s()}/>
    <path d="M18 22 l6 4 l-6 4 M28 30 h10" stroke="#36c25a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M4 46 H60 L56 52 H8 Z" fill="#d6d9e6" ${s()}/><path d="M12 40 H52 L58 46 H6 Z" fill="#b8bccb" ${s(3)}/>`,
  club: `<path d="M32 4 V14" ${s(3)}/><circle cx="32" cy="30" r="16" fill="#c9cfe0" ${s()}/>
    <path d="M16 30 H48 M32 14 V46 M20 20 L44 40 M44 20 L20 40" stroke="${INK}" stroke-width="1.6" opacity=".5"/>
    ${[[24, 24], [38, 34], [30, 38], [40, 22]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="5" fill="#fff"/>`).join('')}
    <path d="M8 58 L20 46 M56 58 L44 46 M32 60 V50" stroke="#ff5470" stroke-width="4" stroke-linecap="round"/>`,
  rocket: `<path d="M32 4 Q48 16 46 40 H18 Q16 16 32 4 Z" fill="#f4f3fa" ${s()}/>
    <circle cx="32" cy="22" r="6" fill="#9fe3ff" ${s(3)}/>
    <path d="M18 34 L8 46 L18 44 Z M46 34 L56 46 L46 44 Z" fill="#e8345a" ${s(3)}/>
    <path d="M22 42 Q32 66 42 42 Z" fill="#ff8a1f" ${s(3)}/><path d="M27 42 Q32 56 37 42 Z" fill="#ffe14a"/>`,
  yacht: `<path d="M4 40 H58 L50 52 H12 Z" fill="#fff" ${s()}/><path d="M6 46 H56" stroke="#3d7be0" stroke-width="4"/>
    <path d="M16 40 V30 H44 L50 40 Z" fill="#f4f3fa" ${s(3)}/><path d="M20 34 H44" stroke="#2c3550" stroke-width="4"/>
    <path d="M30 30 V8" ${s(3)}/><path d="M30 8 L44 12 L30 16 Z" fill="#ffc928" ${s(2.5)}/>
    <path d="M2 58 q8 -5 15 0 t15 0 t15 0 t15 0" stroke="#3fa9f5" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  casino: `<circle cx="22" cy="40" r="16" fill="#e8345a" ${s()}/><circle cx="22" cy="40" r="9" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 3"/>
    <rect x="30" y="6" width="28" height="28" rx="6" fill="#fff" ${s()} transform="rotate(14 44 20)"/>
    ${[[38, 14], [50, 26], [44, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${INK}"/>`).join('')}`,
  island: `<path d="M2 50 q8 -5 15 0 t15 0 t15 0 t15 0 V62 H2 Z" fill="#3fa9f5" ${s(3)}/>
    <ellipse cx="32" cy="50" rx="22" ry="7" fill="#ffd98a" ${s(3)}/>
    <path d="M32 48 Q30 30 36 18" stroke="${INK}" stroke-width="7" fill="none"/><path d="M32 48 Q30 30 36 18" stroke="#a5652f" stroke-width="3.5" fill="none"/>
    <path d="M36 18 q-18 -4 -22 8 q10 -10 22 -8 q-8 -16 -20 -12 q14 0 20 12 q4 -16 18 -18 q-12 8 -18 18 q16 -6 22 6 q-14 -8 -22 -6" fill="#36c25a" ${s(2.5)}/>`,
};
export const bizIcon = (id) => svg(BIZ[id] || BIZ.flowers);

const TABS = {
  biz: `<rect x="8" y="20" width="48" height="34" rx="6" fill="#ffc928" ${s()}/><path d="M22 20 V12 H42 V20" fill="none" ${s()}/><path d="M8 34 H56" ${s(3)}/>`,
  market: `<rect x="6" y="8" width="52" height="48" rx="8" fill="#2c3550" ${s()}/><path d="M14 44 L26 32 L34 38 L50 18" stroke="#36c25a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 18 H50 V26" stroke="#36c25a" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  assets: `<path d="M8 30 L32 10 L56 30 V56 H8 Z" fill="#e8345a" ${s()}/><rect x="26" y="36" width="12" height="20" fill="#ffc928" ${s(3)}/>`,
  casino: `<rect x="10" y="10" width="44" height="44" rx="9" fill="#fff" ${s()}/>${[[22, 22], [42, 22], [32, 32], [22, 42], [42, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#e8345a"/>`).join('')}`,
  more: `<path d="M32 6 L39 24 L58 24 L43 36 L49 56 L32 44 L15 56 L21 36 L6 24 L25 24 Z" fill="#ffc928" ${s()}/>`,
};
export const tabIcon = (id) => svg(TABS[id]);

export const coin = (size = 1) => svg(`<circle cx="32" cy="32" r="26" fill="#ffc928" ${s(4)}/><circle cx="32" cy="32" r="18" fill="none" stroke="#e8a400" stroke-width="4"/>
  <text x="32" y="42" font-size="28" font-family="Arial" font-weight="900" text-anchor="middle" fill="${INK}">$</text>`, '0 0 64 64', 'coin');

// Stock logos: colored rounded square with a simple mark.
const LOGO = {
  BLOOM: ['#ff7eb6', `<circle cx="32" cy="32" r="7" fill="#ffe14a" ${s(3)}/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="32" cy="18" rx="7" ry="9" fill="#fff" ${s(3)} transform="rotate(${a} 32 32)"/>`).join('')}<circle cx="32" cy="32" r="7" fill="#ffe14a" ${s(3)}/>`],
  ZEST: ['#ffd400', `<circle cx="32" cy="32" r="16" fill="#fff6b0" ${s(3)}/><path d="M32 16 V48 M16 32 H48 M21 21 L43 43 M43 21 L21 43" stroke="#e8a400" stroke-width="3"/>`],
  KRMA: ['#ffc928', `<circle cx="32" cy="32" r="18" fill="#fff0a8" ${s(3)}/><text x="32" y="41" font-size="24" font-family="Arial" font-weight="900" text-anchor="middle" fill="${INK}">K</text>`],
  BUNS: ['#f2a541', `<path d="M14 30 Q14 16 32 16 Q50 16 50 30 Z" fill="#ffd98a" ${s(3)}/><rect x="14" y="32" width="36" height="6" fill="#7a3c2a" ${s(2.5)}/><path d="M14 40 H50 Q50 48 42 48 H22 Q14 48 14 40 Z" fill="#ffd98a" ${s(3)}/>`],
  DOGB: ['#c8915a', `<rect x="16" y="18" width="32" height="30" rx="7" fill="#ffd98a" ${s(3)}/><path d="M16 22 L12 10 L24 18 M48 22 L52 10 L40 18" fill="#a5652f" ${s(3)}/><circle cx="26" cy="30" r="3" fill="${INK}"/><circle cx="38" cy="30" r="3" fill="${INK}"/><ellipse cx="32" cy="38" rx="4" ry="3" fill="${INK}"/>`],
  BYTE: ['#3d7be0', `<path d="M24 22 L14 32 L24 42 M40 22 L50 32 L40 42 M35 18 L29 46" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
  VOLT: ['#36c25a', `<path d="M36 10 L18 36 H30 L26 54 L46 26 H34 Z" fill="#ffe14a" ${s(3)}/>`],
  ORBX: ['#2c3550', `<circle cx="32" cy="32" r="10" fill="#ff8a1f" ${s(3)}/><ellipse cx="32" cy="32" rx="22" ry="8" fill="none" stroke="#9fe3ff" stroke-width="4" transform="rotate(-20 32 32)"/>`],
};
export function stockLogo(id) {
  const [bg, mark] = LOGO[id] || ['#7d7a8a', ''];
  return svg(`<rect x="4" y="4" width="56" height="56" rx="14" fill="${bg}" ${s(4)}/>${mark}`);
}

// Slot machine symbols
export const SLOT = {
  cherry: svg(`<path d="M30 14 Q40 10 48 6 M30 14 Q24 26 20 38 M30 14 Q38 26 42 40" ${s(4)} fill="none"/><path d="M30 14 Q44 2 52 12 Q42 20 30 14 Z" fill="#36c25a" ${s(3)}/><circle cx="20" cy="44" r="11" fill="#e8345a" ${s()}/><circle cx="42" cy="46" r="11" fill="#e8345a" ${s()}/><circle cx="17" cy="40" r="3" fill="#fff" opacity=".7"/>`),
  lemon: svg(`<ellipse cx="32" cy="34" rx="22" ry="17" fill="#ffd400" ${s()}/><path d="M22 28 q8 -6 18 -2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  bell: svg(`<path d="M32 8 Q48 10 48 34 L54 46 H10 L16 34 Q16 10 32 8 Z" fill="#ffc928" ${s()}/><circle cx="32" cy="52" r="6" fill="#ffc928" ${s(3)}/><path d="M24 20 Q22 28 22 36" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  bar: svg(`<rect x="6" y="20" width="52" height="24" rx="5" fill="${INK}"/><text x="32" y="39" font-size="18" font-family="Arial Black,Arial" font-weight="900" text-anchor="middle" fill="#ffc928">BAR</text>`),
  diamond: svg(`<path d="M14 22 L24 10 H40 L50 22 L32 54 Z" fill="#7fe0ff" ${s()}/><path d="M14 22 H50 M24 10 L28 22 L32 54 L36 22 L40 10" stroke="${INK}" stroke-width="2.5" fill="none"/><path d="M20 22 L26 14" stroke="#fff" stroke-width="3"/>`),
  seven: svg(`<path d="M12 12 H52 L30 56 H16 L34 24 H12 Z" fill="#ff3b3b" ${s()}/><path d="M18 16 H44" stroke="#ffb0b0" stroke-width="3"/>`),
};
