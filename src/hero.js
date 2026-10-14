// Blocky 2D hero drawn with plain HTML/CSS. The outfit changes with the wealth tier.

const LOOKS = [
  // 0 Broke: torn grey tee
  { shirt: '#8a8798', pants: '#4c4a5c', extras: ['patch'] },
  // 1 Worker: blue overalls
  { shirt: '#3d7be0', pants: '#2c4f99', extras: ['cap'] },
  // 2 Hustler: red hoodie
  { shirt: '#e8345a', pants: '#2a2840', extras: ['hood'] },
  // 3 Boss: black suit
  { shirt: '#22202e', pants: '#22202e', extras: ['tie'] },
  // 4 Millionaire: white suit + gold chain
  { shirt: '#f4f3fa', pants: '#e6e4ef', extras: ['vneck', 'chain'] },
  // 5 Multi-Millionaire: + shades
  { shirt: '#f4f3fa', pants: '#e6e4ef', extras: ['vneck', 'chain', 'shades'] },
  // 6 Billionaire: + crown
  { shirt: '#f4f3fa', pants: '#e6e4ef', extras: ['vneck', 'chain', 'shades', 'crown'] },
];

export function heroHTML(tier, mood = 'happy') {
  const look = LOOKS[Math.min(tier, LOOKS.length - 1)];
  const x = new Set(look.extras);
  const eyes = x.has('shades')
    ? '<div class="h-shades"><i></i><i></i></div>'
    : `<div class="h-eyes ${mood}"><i></i><i></i></div>`;
  const mouth = `<div class="h-mouth ${mood}"></div>`;
  return `
  <div class="hero" style="--shirt:${look.shirt};--pants:${look.pants}">
    ${x.has('crown') ? '<div class="h-crown"><i></i></div>' : ''}
    ${x.has('cap') ? '<div class="h-cap"></div>' : ''}
    ${x.has('hood') ? '<div class="h-hood"></div>' : ''}
    <div class="h-head">${eyes}${mouth}</div>
    <div class="h-arm l"></div>
    <div class="h-body">
      ${x.has('vneck') ? '<div class="h-vneck"></div>' : ''}
      ${x.has('tie') ? '<div class="h-tie"></div>' : ''}
      ${x.has('patch') ? '<div class="h-patch"></div>' : ''}
      ${x.has('chain') ? '<div class="h-chain"><b>$</b></div>' : ''}
    </div>
    <div class="h-arm r"></div>
    <div class="h-leg l"></div>
    <div class="h-leg r"></div>
  </div>`;
}

// Small side characters for episodes.
const INK = '#1a1030', SKIN = '#f5cd30', HAIR = '#ffad3b', HAIR_D = '#e8891a', DRESS = '#ff7eb6', DRESS_D = '#e8559a';

function girlFace(mood) {
  const lash = (x, dir) => `<path d="M${x} 43 l${dir * 5} -5 M${x + dir * 3} 45 l${dir * 6} -3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
  let eyes, mouth, extra = '';
  if (mood === 'shock') {
    eyes = [44, 76].map((x) => `<circle cx="${x}" cy="50" r="8.5" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="51" r="5" fill="${INK}"/><circle cx="${x + 1.8}" cy="48.5" r="1.8" fill="#fff"/>`).join('');
    mouth = `<ellipse cx="60" cy="68" rx="5" ry="6" fill="#c2185b" stroke="${INK}" stroke-width="3"/>`;
  } else if (mood === 'sad' || mood === 'cry') {
    eyes = [44, 76].map((x) => `<path d="M${x - 7} 49 Q${x} 55 ${x + 7} 49" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
    mouth = `<path d="M53 70 Q60 64 67 70" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    if (mood === 'cry') extra = `<path d="M40 56 q-3 7 0 10 q3 -3 0 -10 Z" fill="#5ec8ff" stroke="${INK}" stroke-width="1.5"/>`;
  } else {
    eyes = [44, 76].map((x) => `<ellipse cx="${x}" cy="50" rx="6.5" ry="8.5" fill="${INK}"/><circle cx="${x + 2}" cy="46.5" r="2.6" fill="#fff"/><circle cx="${x - 2}" cy="53" r="1.2" fill="#fff"/>`).join('');
    mouth = mood === 'smug'
      ? `<path d="M52 66 Q61 70 68 63" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
      : `<path d="M50 63 Q60 75 70 63 Z" fill="#e8345a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M55 68 Q60 71 65 68" stroke="#ff9fbf" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  }
  return `${eyes}${mood === 'sad' || mood === 'cry' ? '' : lash(37, -1) + lash(83, 1)}
    <ellipse cx="32" cy="62" rx="7" ry="4" fill="#ff6f9c" opacity=".55"/><ellipse cx="88" cy="62" rx="7" ry="4" fill="#ff6f9c" opacity=".55"/>
    ${mouth}${extra}`;
}

export function girlHTML(mood = 'happy') {
  const st = `stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"`;
  return `
  <div class="hero girl"><svg viewBox="0 0 120 180" aria-hidden="true">
    <path d="M17 42 Q15 2 60 2 Q105 2 103 42 L106 116 Q101 130 91 122 Q85 132 76 124 L76 84 L44 84 L44 124 Q35 132 29 122 Q19 130 14 116 Z" fill="${HAIR}" ${st}/>
    <path d="M24 70 Q22 96 26 112 M96 70 Q98 96 94 112" stroke="${HAIR_D}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="43" y="140" width="13" height="28" rx="5" fill="${SKIN}" ${st}/>
    <rect x="64" y="140" width="13" height="28" rx="5" fill="${SKIN}" ${st}/>
    <path d="M38 168 h20 q2 9 -8 9 h-12 q-4 0 0 -9 Z M62 168 h20 q4 9 0 9 h-12 q-10 0 -8 -9 Z" fill="#ff4f7b" ${st} stroke-width="3.5"/>
    <rect x="14" y="88" width="15" height="46" rx="7" fill="${SKIN}" ${st} transform="rotate(10 21 88)"/>
    <rect x="91" y="88" width="15" height="46" rx="7" fill="${SKIN}" ${st} transform="rotate(-10 99 88)"/>
    <path d="M38 84 Q60 78 82 84 L84 110 L104 150 Q60 162 16 150 L36 110 Z" fill="${DRESS}" ${st}/>
    <path d="M22 146 Q32 152 42 147 Q52 154 60 148 Q68 154 78 147 Q88 152 98 146" stroke="${DRESS_D}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M30 128 Q34 118 40 113" stroke="#ffc2dc" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect x="35" y="106" width="50" height="8" rx="3" fill="#e8345a" ${st} stroke-width="3.5"/>
    <path d="M60 110 l-4 -3 a2.4 2.4 0 0 1 4 -2 a2.4 2.4 0 0 1 4 2 Z" fill="#fff"/>
    <path d="M28 86 q-6 -2 -10 6 q8 6 16 0 Z M92 86 q6 -2 10 6 q-8 6 -16 0 Z" fill="${DRESS}" ${st} stroke-width="3.5"/>
    <rect x="20" y="8" width="80" height="76" rx="18" fill="${SKIN}" ${st}/>
    ${girlFace(mood)}
    <path d="M18 36 Q16 4 60 6 Q102 6 102 34 Q94 22 80 22 Q70 34 54 28 Q42 40 18 36 Z" fill="${HAIR}" ${st}/>
    <path d="M40 16 Q52 12 64 14" stroke="#ffd58a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="20" cy="70" r="4" fill="#ffc928" stroke="${INK}" stroke-width="2.5"/><circle cx="100" cy="70" r="4" fill="#ffc928" stroke="${INK}" stroke-width="2.5"/>
    <path d="M90 12 L76 0 L74 22 Z M90 12 L106 2 L106 24 Z" fill="#ff4f7b" ${st} stroke-width="3.5"/>
    <circle cx="90" cy="12" r="5.5" fill="#e8345a" ${st} stroke-width="3"/>
  </svg></div>`;
}

export function richGuyHTML(broke = false, mood = 'smug') {
  const c = broke ? '#7d7a8a' : '#151320';
  return `
  <div class="hero" style="--shirt:${c};--pants:${c}">
    <div class="h-head"><div class="h-shades"><i></i><i></i></div><div class="h-mouth ${mood}"></div></div>
    <div class="h-arm l"></div><div class="h-body"><div class="h-tie"></div></div><div class="h-arm r"></div>
    <div class="h-leg l"></div><div class="h-leg r"></div>
  </div>`;
}
