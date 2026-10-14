// Side-view vehicles drawn as SVG in the game's blocky, thick-outline style.
export const INK = '#1a1030';
let uid = 0;

const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('');
};

// Body silhouettes: rear x0, front x1, belt line yb, roof height, rear window base xrb,
// roof start/end xr0/xr1, windshield foot xwf, hood height yh, wheel radius r.
const BODIES = {
  hatch:  { x0: 26, x1: 176, yb: 46, roof: 20, xrb: 30, xr0: 52, xr1: 112, xwf: 138, yh: 50, r: 14 },
  sedan:  { x0: 12, x1: 188, yb: 46, roof: 22, xrb: 44, xr0: 68, xr1: 122, xwf: 148, yh: 50, r: 14 },
  muscle: { x0: 10, x1: 190, yb: 44, roof: 25, xrb: 54, xr0: 78, xr1: 118, xwf: 144, yh: 46, r: 15 },
  sports: { x0: 12, x1: 190, yb: 48, roof: 29, xrb: 52, xr0: 78, xr1: 112, xwf: 150, yh: 55, r: 15 },
  suv:    { x0: 14, x1: 186, yb: 40, roof: 12, xrb: 18, xr0: 24, xr1: 126, xwf: 146, yh: 42, r: 17 },
  super:  { x0: 8,  x1: 194, yb: 51, roof: 33, xrb: 58, xr0: 84, xr1: 108, xwf: 160, yh: 59, r: 15 },
  limo:   { x0: 2,  x1: 198, yb: 46, roof: 22, xrb: 36, xr0: 54, xr1: 152, xwf: 172, yh: 50, r: 13 },
  hyper:  { x0: 6,  x1: 196, yb: 53, roof: 35, xrb: 62, xr0: 88, xr1: 106, xwf: 164, yh: 61, r: 15 },
};

function wheel(cx, cy, r, rim) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="${INK}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#2c2a3a" stroke="${INK}" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.58}" fill="${rim}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M${cx - r * 0.4} ${cy}h${r * 0.8}M${cx} ${cy - r * 0.4}v${r * 0.8}" stroke="${INK}" stroke-width="2" opacity=".55"/>
    <circle cx="${cx}" cy="${cy}" r="2.6" fill="${INK}"/>`;
}

export function carSVG({ type = 'sedan', color = '#e8345a', accent = '#ffc928', gold = false, flame = false } = {}) {
  if (type === 'bike') return bikeSVG(color);
  if (type === 'scooter') return scooterSVG(color);
  const b = BODIES[type] || BODIES.sedan;
  const id = 'c' + (++uid);
  const base = 68;
  const body = gold ? '#ffc928' : color;
  const dark = gold ? '#d18f00' : shade(color, 0.72);
  const light = gold ? '#fff0a8' : shade(color, 1.25);
  const { x0, x1, yb, roof, xrb, xr0, xr1, xwf, yh, r } = b;
  const d = `M${x0} ${base} L${x0} ${yb + 7} Q${x0} ${yb} ${x0 + 9} ${yb} L${xrb} ${yb} L${xr0} ${roof}
    Q${(xr0 + xr1) / 2} ${roof - 3} ${xr1} ${roof} L${xwf} ${yb} L${x1 - 14} ${yh} Q${x1} ${yh} ${x1} ${yh + 11}
    L${x1} ${base} Q${x1} ${base + 5} ${x1 - 6} ${base + 5} L${x0 + 6} ${base + 5} Q${x0} ${base + 5} ${x0} ${base} Z`;
  const win = `M${xrb + 6} ${yb - 1.5} L${xr0 + 3} ${roof + 5} L${xr1 - 2} ${roof + 5} L${xwf - 9} ${yb - 1.5} Z`;
  const midX = type === 'limo' ? [(xr0 + xr1) / 2 - 22, (xr0 + xr1) / 2 + 22] : [(xr0 + xr1) / 2 + 2];
  const wa = x0 + (type === 'limo' ? 30 : 32), wb = x1 - (type === 'limo' ? 30 : 32);
  const rim = gold ? '#fff0a8' : type === 'super' || type === 'hyper' ? '#ffc928' : '#d6d9e6';

  let extras = '';
  if (type === 'sports' || type === 'super') {
    extras += `<path d="M${x0 + 2} ${yb - 9} h30 l-3 6 h-24 z" fill="${dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M${x0 + 12} ${yb - 4} v5 M${x0 + 26} ${yb - 4} v5" stroke="${INK}" stroke-width="3"/>`;
  }
  if (type === 'muscle') {
    extras += `<rect x="${x0}" y="${yb + 9}" width="${x1 - x0}" height="5" fill="${accent}" clip-path="url(#${id})"/>
      <rect x="${x0}" y="${yb + 17}" width="${x1 - x0}" height="3" fill="${accent}" clip-path="url(#${id})"/>
      <rect x="${xwf - 6}" y="${yb - 7}" width="22" height="8" rx="2" fill="${dark}" stroke="${INK}" stroke-width="3"/>`;
  }
  if (type === 'hyper') {
    extras += `<path d="M${xr1 - 4} ${roof + 1} L${x0 + 18} ${yb - 14} L${x0 + 10} ${yb} L${xrb} ${yb}" fill="${dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="${x0 + 30}" y="${yb + 8}" width="24" height="7" rx="3" fill="${INK}" opacity=".8"/>`;
  }
  if (type === 'suv') {
    extras += `<path d="M${xr0 + 6} ${roof - 5} h${xr1 - xr0 - 12}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M${xr0 + 14} ${roof - 5} v5 M${xr1 - 14} ${roof - 5} v5" stroke="${INK}" stroke-width="3"/>`;
  }
  if (flame) {
    extras += `<path d="M${x0 + 2} ${yb + 6} Q${x0 - 34} ${yb + 2} ${x0 - 44} ${yb + 12} Q${x0 - 30} ${yb + 14} ${x0 - 40} ${yb + 24}
      Q${x0 - 18} ${yb + 20} ${x0 + 2} ${yb + 18} Z" fill="#ff8a1f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M${x0 + 2} ${yb + 9} Q${x0 - 18} ${yb + 9} ${x0 - 24} ${yb + 13} Q${x0 - 14} ${yb + 16} ${x0 + 2} ${yb + 15} Z" fill="#ffe14a"/>`;
  }

  return `<svg viewBox="-50 0 300 92" class="art car" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
    <ellipse cx="100" cy="${base + 18}" rx="96" ry="5" fill="${INK}" opacity=".25"/>
    ${extras.includes('#ff8a1f') ? extras : ''}
    <path d="${d}" fill="${body}"/>
    <rect x="${x0 - 2}" y="${base - 10}" width="${x1 - x0 + 4}" height="20" fill="${dark}" clip-path="url(#${id})"/>
    <path d="M${x0 + 8} ${yb + 5} H${x1 - 16}" stroke="${light}" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    <path d="${win}" fill="#9fe3ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M${xr0 + 10} ${roof + 7} l-9 ${yb - roof - 10} h6 l9 ${-(yb - roof - 10)} z" fill="#fff" opacity=".55"/>
    ${midX.map((mx) => `<path d="M${mx} ${roof + 4} V${yb}" stroke="${INK}" stroke-width="4"/>
      <path d="M${mx} ${yb + 2} V${base - 4}" stroke="${INK}" stroke-width="2.5" opacity=".45"/>
      <rect x="${mx + 5}" y="${yb + 8}" width="9" height="3" rx="1.5" fill="${INK}" opacity=".6"/>`).join('')}
    ${extras.includes('#ff8a1f') ? '' : extras}
    <path d="${d}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M${x1 - 9} ${yh + 3} q6 1 7 7 h-9 z" fill="#fff6b0" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="${x0 - 1}" y="${yb + 5}" width="6" height="9" rx="2" fill="#ff3b3b" stroke="${INK}" stroke-width="2.5"/>
    ${wheel(wa, base + 4, r, rim)}
    ${wheel(wb, base + 4, r, rim)}
  </svg>`;
}

function bikeSVG(color) {
  return `<svg viewBox="-50 0 300 92" class="art car" aria-hidden="true">
    <ellipse cx="100" cy="86" rx="70" ry="4" fill="${INK}" opacity=".25"/>
    <circle cx="58" cy="62" r="22" fill="none" stroke="${INK}" stroke-width="6"/>
    <circle cx="58" cy="62" r="22" fill="none" stroke="#7d7a8a" stroke-width="2"/>
    <circle cx="142" cy="62" r="22" fill="none" stroke="${INK}" stroke-width="6"/>
    <circle cx="142" cy="62" r="22" fill="none" stroke="#7d7a8a" stroke-width="2"/>
    <path d="M58 62 L88 30 L130 30 L142 62 M88 30 L100 62 L58 62 M100 62 L130 30 M130 30 L126 18 h12" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M58 62 L88 30 L130 30 L142 62 M88 30 L100 62 L58 62 M100 62 L130 30 M130 30 L126 18 h12" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M78 24 h22" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="100" cy="62" r="5" fill="#7d7a8a" stroke="${INK}" stroke-width="3"/>
  </svg>`;
}

function scooterSVG(color) {
  const dark = shade(color, 0.72);
  return `<svg viewBox="-50 0 300 92" class="art car" aria-hidden="true">
    <ellipse cx="100" cy="86" rx="72" ry="4" fill="${INK}" opacity=".25"/>
    <path d="M40 66 Q36 40 70 40 L100 40 L104 56 L136 56 L140 20 L150 20 L156 60 Q160 70 146 72 L50 72 Q40 72 40 66 Z" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M56 40 Q60 30 92 32 L96 40 Z" fill="${INK}"/>
    <path d="M44 62 Q44 50 70 50" stroke="${dark}" stroke-width="5" fill="none"/>
    <path d="M134 18 h22" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="150" cy="30" r="5" fill="#fff6b0" stroke="${INK}" stroke-width="3"/>
    ${wheel(62, 74, 12, '#d6d9e6')}
    ${wheel(144, 74, 12, '#d6d9e6')}
  </svg>`;
}
