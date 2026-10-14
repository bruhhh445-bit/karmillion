// Opening cutscene: the backstory before the first tap.
import { sceneSVG } from './art/scene.js';
import { carSVG } from './art/cars.js';
import { homeSVG } from './art/homes.js';
import { heroHTML, girlHTML, richGuyHTML } from './hero.js';

const FLOWER = `<svg viewBox="0 0 64 96" class="art" aria-hidden="true">
  <path d="M32 40 Q30 66 34 92" stroke="#1a1030" stroke-width="7" fill="none"/><path d="M32 40 Q30 66 34 92" stroke="#36c25a" stroke-width="3.5" fill="none"/>
  <path d="M33 70 Q46 58 54 66 Q44 76 33 72 Z" fill="#36c25a" stroke="#1a1030" stroke-width="3"/>
  <circle cx="32" cy="26" r="18" fill="#e8345a" stroke="#1a1030" stroke-width="4"/>
  <path d="M22 22 Q32 10 42 22 Q32 34 22 22 Z" fill="#ff7a98" stroke="#1a1030" stroke-width="2.5"/></svg>`;

const SCENES = [
  {
    tier: 0, caption: 'This is you.', sub: 'Broke. No job. A cardboard box for a home.',
    actors: [
      { html: `<div class="i-prop">${homeSVG('box')}</div>`, x: 14, w: 34, anim: 'fade' },
      { html: heroHTML(0, 'sad'), x: 58, anim: 'left', hero: true },
    ],
  },
  {
    tier: 2, caption: 'You had one thing that mattered.', sub: 'Her.',
    actors: [
      { html: heroHTML(0, 'happy'), x: 34, anim: 'left', hero: true },
      { html: `<div class="i-flower">${FLOWER}</div>`, x: 50, w: 12, anim: 'pop', y: 46 },
      { html: girlHTML('happy'), x: 66, anim: 'right', hero: true },
    ],
  },
  {
    tier: 2, caption: 'Then a rich guy pulled up…', sub: 'in a shiny red sports car.',
    actors: [
      { html: girlHTML('happy'), x: 20, anim: 'fade', hero: true },
      { html: richGuyHTML(false, 'smug'), x: 82, anim: 'fadeLate', hero: true, y: 4 },
      { html: `<div class="i-car" style="width:300px">${carSVG({ type: 'sports', color: '#e8345a' })}</div>`, x: 54, anim: 'drive', y: 1 },
    ],
  },
  {
    tier: 0, rain: true, caption: 'She left.', sub: 'All you have now is one flower.',
    actors: [
      { html: heroHTML(0, 'cry'), x: 50, anim: 'fade', hero: true },
      { html: `<div class="i-flower fallen">${FLOWER}</div>`, x: 70, w: 12, anim: 'drop', y: 2 },
    ],
  },
  {
    tier: 3, caption: 'But every choice has karma.', sub: 'Sell the flower. Build an empire. Show the world who you are.',
    actors: [
      { html: heroHTML(0, 'smug'), x: 50, anim: 'rise', hero: true },
    ],
  },
];

export function playIntro(root, onDone) {
  let i = -1, typing = null, timer = null, finished = false;
  root.className = 'intro on';
  root.innerHTML = `
    <div class="i-bg" id="iBg"></div>
    <div class="i-rain" id="iRain"></div>
    <div class="i-stage" id="iStage"></div>
    <div class="i-bars top"></div><div class="i-bars bottom"></div>
    <div class="i-text"><div class="i-caption" id="iCap"></div><div class="i-sub" id="iSub"></div></div>
    <div class="i-dots">${SCENES.map(() => '<i></i>').join('')}<i></i></div>
    <button class="i-skip" id="iSkip">Skip ›</button>`;

  const cap = root.querySelector('#iCap'), sub = root.querySelector('#iSub');

  const type = (el, text, done) => {
    let n = 0;
    el.textContent = '';
    clearInterval(typing);
    typing = setInterval(() => {
      n++;
      el.textContent = text.slice(0, n);
      if (n >= text.length) { clearInterval(typing); typing = null; done && done(); }
    }, 32);
  };

  const finishTyping = () => {
    if (!typing || i < 0 || i >= SCENES.length) return false;
    clearInterval(typing); typing = null;
    cap.textContent = SCENES[i].caption;
    sub.textContent = SCENES[i].sub;
    sub.classList.add('in');
    schedule();
    return true;
  };

  const schedule = () => { clearTimeout(timer); timer = setTimeout(next, 2600); };

  function next() {
    clearTimeout(timer);
    i++;
    root.querySelectorAll('.i-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
    if (i >= SCENES.length) return titleCard();
    const sc = SCENES[i];
    root.querySelector('#iBg').innerHTML = sceneSVG({ tier: sc.tier });
    root.querySelector('#iRain').classList.toggle('on', !!sc.rain);
    root.querySelector('#iStage').innerHTML = sc.actors.map((a, k) =>
      `<div class="i-actor ${a.hero ? 'is-hero' : ''} a-${a.anim}" style="left:${a.x}%;bottom:${12 + (a.y || 0)}%;animation-delay:${k * 0.18}s">${a.html}</div>`).join('');
    sub.classList.remove('in');
    sub.textContent = '';
    type(cap, sc.caption, () => { sub.classList.add('in'); type(sub, sc.sub, schedule); });
  }

  function titleCard() {
    root.querySelector('#iRain').classList.remove('on');
    root.querySelector('#iBg').innerHTML = sceneSVG({ tier: 6 });
    root.querySelector('#iStage').innerHTML = `<div class="i-actor is-hero a-rise" style="left:50%;bottom:12%">${heroHTML(6, 'smug')}</div>`;
    root.querySelector('.i-text').innerHTML = `
      <div class="i-logo">KARMILLION</div>
      <div class="i-tag">From broke to billionaire</div>
      <button class="i-start" id="iStart">Start your story</button>`;
    root.querySelector('#iSkip').remove();
    root.querySelector('#iStart').addEventListener('click', (e) => { e.stopPropagation(); end(); });
  }

  function end() {
    if (finished) return;
    finished = true;
    clearTimeout(timer); clearInterval(typing);
    root.classList.add('out');
    setTimeout(() => { root.className = 'intro'; root.innerHTML = ''; onDone && onDone(); }, 500);
  }

  root.onclick = (e) => {
    if (finished) return;
    if (e.target.closest('#iSkip')) { e.stopPropagation(); return end(); }
    if (i >= SCENES.length) return;
    if (!finishTyping()) next();
  };
  next();
}
