// Homes and properties, drawn front-on. Ground line at y=160.
import { INK } from './cars.js';

const s = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
const win = (x, y, w = 18, h = 20, lit = true) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${lit ? '#ffe68a' : '#9fe3ff'}" ${s} stroke-width="3"/>
   <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${INK}" stroke-width="2"/>`;
const door = (x, y, w = 22, h = 34, c = '#c0563b') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}" ${s} stroke-width="3"/><circle cx="${x + w - 6}" cy="${y + h / 2}" r="2" fill="${INK}"/>`;
const palm = (x) => `<path d="M${x} 160 Q${x - 4} 120 ${x + 4} 92" stroke="${INK}" stroke-width="9" fill="none"/>
  <path d="M${x} 160 Q${x - 4} 120 ${x + 4} 92" stroke="#a5652f" stroke-width="5" fill="none"/>
  <path d="M${x + 4} 92 q-30 -6 -36 12 q16 -14 36 -12 q-14 -26 -34 -20 q22 0 34 20 q4 -26 26 -30 q-18 12 -26 30 q26 -12 38 6 q-24 -10 -38 -6" fill="#36c25a" ${s} stroke-width="3"/>`;

export const HOMES = {
  box: () => `<path d="M40 160 L40 100 L150 100 L150 160 Z" fill="#c8915a" ${s}/>
    <path d="M40 100 L62 78 L172 78 L150 100 Z" fill="#dba86f" ${s}/><path d="M150 160 L172 138 L172 78 L150 100 Z" fill="#a8743f" ${s}/>
    <path d="M70 100 L92 78" stroke="${INK}" stroke-width="3"/><rect x="80" y="112" width="34" height="10" fill="#e8d2a8" stroke="${INK}" stroke-width="2"/>`,
  garage: () => `<path d="M30 160 V84 L100 50 L170 84 V160 Z" fill="#8a8798" ${s}/>
    <rect x="52" y="96" width="96" height="64" fill="#5b5870" ${s}/>
    ${[108, 122, 136, 150].map((y) => `<path d="M52 ${y} H148" stroke="${INK}" stroke-width="2.5"/>`).join('')}
    <path d="M22 88 L100 46 L178 88" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`,
  studio: () => `<rect x="44" y="30" width="112" height="130" fill="#e08a5f" ${s}/>
    <rect x="38" y="22" width="124" height="12" fill="#b9663f" ${s}/>
    ${[44, 80, 116].map((y) => [58, 91, 124].map((x) => win(x, y, 20, 22, (x + y) % 3 === 0)).join('')).join('')}
    ${door(88, 126, 24, 34, '#4321a8')}`,
  house: () => `<rect x="36" y="86" width="128" height="74" fill="#f4e3c3" ${s}/>
    <path d="M24 92 L100 32 L176 92 Z" fill="#e8345a" ${s}/>
    <rect x="130" y="38" width="16" height="32" fill="#a35a3f" ${s}/>
    ${win(52, 102, 26, 24)}${win(122, 102, 26, 24, false)}${door(88, 120, 24, 40)}
    <circle cx="100" cy="70" r="9" fill="#9fe3ff" ${s} stroke-width="3"/>`,
  villa: () => `<rect x="20" y="70" width="96" height="90" fill="#ffffff" ${s}/>
    <rect x="90" y="100" width="96" height="60" fill="#f1eee6" ${s}/>
    <rect x="12" y="62" width="112" height="10" fill="#3a3550" ${s}/><rect x="84" y="92" width="110" height="10" fill="#3a3550" ${s}/>
    <rect x="30" y="80" width="76" height="34" fill="#9fe3ff" ${s} stroke-width="3"/>
    <path d="M56 80 V114 M80 80 V114" stroke="${INK}" stroke-width="2.5"/>
    <rect x="104" y="112" width="68" height="30" fill="#9fe3ff" ${s} stroke-width="3"/>
    <rect x="28" y="146" width="70" height="14" rx="3" fill="#3fa9f5" ${s} stroke-width="3"/>
    ${palm(184)}`,
  penthouse: () => `<rect x="58" y="16" width="84" height="144" fill="#4a5f8f" ${s}/>
    <path d="M58 16 L100 -4 L142 16" fill="#ffc928" ${s}/>
    ${Array.from({ length: 7 }, (_, r) => [66, 92, 118].map((x) => `<rect x="${x}" y="${26 + r * 18}" width="16" height="12" fill="${(r + x) % 4 ? '#9fe3ff' : '#ffe68a'}" stroke="${INK}" stroke-width="2.5"/>`).join('')).join('')}
    <rect x="20" y="96" width="38" height="64" fill="#6a7fb0" ${s}/><rect x="142" y="80" width="40" height="80" fill="#5a6fa0" ${s}/>
    ${[104, 124, 144].map((y) => win(29, y, 18, 12, y === 124)).join('')}${[90, 110, 130].map((y) => win(152, y, 20, 12, y !== 110)).join('')}`,
  mansion: () => `<rect x="14" y="76" width="172" height="84" fill="#f6efe0" ${s}/>
    <path d="M6 80 L100 30 L194 80 Z" fill="#7a3c2a" ${s}/>
    <path d="M70 76 L100 52 L130 76 Z" fill="#f6efe0" ${s}/>
    ${[78, 92, 108, 122].map((x) => `<rect x="${x - 4}" y="80" width="8" height="80" fill="#fff" stroke="${INK}" stroke-width="3"/>`).join('')}
    ${[24, 48, 146, 170].map((x) => win(x - 7, 92, 18, 22)).join('')}${[24, 48, 146, 170].map((x) => win(x - 7, 126, 18, 22, false)).join('')}
    ${door(88, 124, 24, 36, '#4321a8')}<rect x="8" y="154" width="184" height="8" fill="#d8cfb8" ${s} stroke-width="3"/>`,
  palace: () => `<rect x="20" y="74" width="160" height="86" fill="#fff4d6" ${s}/>
    <ellipse cx="100" cy="74" rx="40" ry="44" fill="#ffc928" ${s}/><path d="M100 30 V8" stroke="${INK}" stroke-width="4"/><circle cx="100" cy="8" r="6" fill="#ffc928" ${s} stroke-width="3"/>
    <rect x="58" y="72" width="84" height="10" fill="#fff4d6" ${s} stroke-width="3"/>
    ${[10, 170].map((x) => `<rect x="${x}" y="50" width="20" height="110" fill="#fff4d6" ${s}/><ellipse cx="${x + 10}" cy="50" rx="14" ry="16" fill="#ffc928" ${s}/>`).join('')}
    ${[44, 72, 128, 156].map((x) => `<path d="M${x - 8} 128 V100 Q${x} 88 ${x + 8} 100 V128 Z" fill="#9fe3ff" ${s} stroke-width="3"/>`).join('')}
    <path d="M86 160 V122 Q100 104 114 122 V160 Z" fill="#4321a8" ${s} stroke-width="3"/>`,
};

export function homeSVG(id) {
  const f = HOMES[id] || HOMES.box;
  return `<svg viewBox="-10 -12 228 177" class="art home" aria-hidden="true">${f()}</svg>`;
}
