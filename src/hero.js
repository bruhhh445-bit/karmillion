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
export function girlHTML(mood = 'happy') {
  return `
  <div class="hero girl" style="--shirt:#ff7eb6;--pants:#ff7eb6">
    <div class="g-hair"></div>
    <div class="h-head"><div class="h-eyes ${mood}"><i></i><i></i></div><div class="h-mouth ${mood}"></div></div>
    <div class="h-arm l"></div><div class="h-body dress"></div><div class="h-arm r"></div>
    <div class="h-leg l"></div><div class="h-leg r"></div>
  </div>`;
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
