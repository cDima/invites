// Pop-up: a paper storybook opens and its scene stands up layer by layer. For kids, family, holidays.
import { textLayer, smooth, E, lerp, mulberry, canvasIn, TAU } from './kit.js';

const CSS = `
.pu-scene{position:absolute;left:50%;bottom:16%;width:min(96vw,680px);aspect-ratio:1.25/1;transform:translateX(-50%);perspective:1100px;perspective-origin:50% 0%;z-index:2}
.pu-floor{position:absolute;inset:0;transform-style:preserve-3d;transform-origin:50% 100%}
.pu-page{position:absolute;top:0;bottom:0;width:50%;background:linear-gradient(90deg,#efe4d2,#fbf6ee 30%,#fffaf3);box-shadow:inset 0 0 0 1px rgba(150,120,90,.15);transform-origin:0 50%}
.pu-page.l{left:0;background:linear-gradient(270deg,#e6d8c2,#fbf6ee 25%,#fffaf3);border-radius:6px 0 0 6px}
.pu-page.r{left:50%;border-radius:0 6px 6px 0}
.pu-layer{position:absolute;transform-origin:50% 100%;transform-style:preserve-3d}
.pu-layer svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 0 rgba(255,255,255,.9)) drop-shadow(0 6px 6px rgba(70,40,90,.18))}
.pu-banner .op-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;top:0!important}
@keyframes pu-bob{50%{transform:translateY(-3%)}}
@keyframes pu-tw{50%{opacity:.25}}
@keyframes pu-glow{50%{opacity:.6}}
`;

const LAYERS = [
  { at: 16, left: 5, w: 90, ar: '100/58', svg: `<svg viewBox="0 0 100 58"><path d="M0 58 V30 A50 30 0 0 1 100 30 V58Z" fill="#c9bdf5"/><path d="M8 58 V32 A42 26 0 0 1 92 32 V58Z" fill="#b3a5ee"/>
      <g style="animation:pu-glow 3s ease-in-out infinite"><circle cx="70" cy="22" r="8" fill="#fff4c9"/></g><circle cx="73" cy="20" r="7" fill="#b3a5ee"/>
      <g fill="#fff"><circle cx="22" cy="18" r="1" style="animation:pu-tw 2s infinite"/><circle cx="35" cy="10" r=".8" style="animation:pu-tw 2.6s infinite"/><circle cx="50" cy="16" r="1.1" style="animation:pu-tw 1.8s infinite"/><circle cx="85" cy="35" r=".8" style="animation:pu-tw 2.2s infinite"/><circle cx="15" cy="34" r=".9" style="animation:pu-tw 3s infinite"/></g>
      <g style="animation:pu-bob 5s ease-in-out infinite"><path d="M20 40 a6 5 0 0 1 10 -3 a5 4 0 0 1 9 2 a4 3 0 0 1 0 6 h-19 a3 3 0 0 1 0 -5z" fill="#fff" opacity=".9"/></g></svg>` },
  { at: 34, left: 0, w: 100, ar: '100/34', svg: `<svg viewBox="0 0 100 34"><path d="M0 34 L0 20 L14 6 L24 16 L38 2 L52 18 L64 8 L78 20 L90 10 L100 18 L100 34Z" fill="#8e98e0"/><path d="M38 2 L44 9 L40 8 L36 10 L33 7Z M14 6 L19 11 L15 10 L11 12Z M64 8 L69 13 L65 12 L61 14Z M90 10 L94 14 L90 13 L87 15Z" fill="#fff"/><path d="M0 34 L0 26 L20 18 L36 26 L56 20 L76 28 L100 22 L100 34Z" fill="#7a85d4"/></svg>` },
  { at: 54, left: 27, w: 46, ar: '100/86', svg: `<svg viewBox="0 0 100 86"><rect x="12" y="38" width="76" height="48" fill="#ffd1e3"/><rect x="0" y="30" width="20" height="56" fill="#ffc0d8"/><rect x="80" y="30" width="20" height="56" fill="#ffc0d8"/>
      <path d="M-3 30 L10 6 L23 30Z M77 30 L90 6 L103 30Z" fill="#ff6fae"/><path d="M30 38 L50 8 L70 38Z" fill="#ff86bb"/><path d="M50 8 V0 L58 3 L50 6" fill="#ffd27a"/>
      <g style="animation:pu-glow 2.4s ease-in-out infinite"><rect x="43" y="56" width="14" height="30" rx="7" fill="#ffd27a"/><rect x="24" y="48" width="8" height="10" rx="4" fill="#ffe7a0"/><rect x="68" y="48" width="8" height="10" rx="4" fill="#ffe7a0"/><rect x="6" y="44" width="8" height="10" rx="4" fill="#ffe7a0"/><rect x="86" y="44" width="8" height="10" rx="4" fill="#ffe7a0"/></g></svg>` },
  { at: 70, left: 1, w: 30, ar: '100/96', svg: `<svg viewBox="0 0 100 96"><rect x="46" y="60" width="8" height="36" fill="#a0715a"/><circle cx="50" cy="38" r="30" fill="#7fd59c"/><circle cx="30" cy="52" r="18" fill="#6cc78c"/><circle cx="70" cy="50" r="20" fill="#6cc78c"/><circle cx="40" cy="30" r="5" fill="#ff8fb8"/><circle cx="64" cy="40" r="4" fill="#ff8fb8"/></svg>` },
  { at: 72, left: 69, w: 30, ar: '100/110', svg: `<svg viewBox="0 0 100 110"><rect x="46" y="80" width="8" height="30" fill="#a0715a"/><path d="M50 4 L82 50 L66 50 L90 84 L10 84 L34 50 L18 50Z" fill="#5fbf86"/><circle cx="40" cy="60" r="3.5" fill="#ffd27a"/><circle cx="60" cy="40" r="3" fill="#fff"/><circle cx="58" cy="70" r="3.5" fill="#ff8fb8"/></svg>` },
  { at: 90, left: 0, w: 100, ar: '100/16', svg: `<svg viewBox="0 0 100 16"><path d="M0 16 V8 Q5 2 10 8 Q15 3 20 8 Q25 1 30 8 Q35 3 40 8 Q45 2 50 8 Q55 3 60 8 Q65 1 70 8 Q75 3 80 8 Q85 2 90 8 Q95 3 100 8 V16Z" fill="#9be3a8"/>
      <g><circle cx="8" cy="6" r="2" fill="#ff6fae"/><circle cx="27" cy="5" r="2" fill="#ffd27a"/><circle cx="46" cy="6" r="2" fill="#9b7bff"/><circle cx="66" cy="5" r="2" fill="#ff6fae"/><circle cx="86" cy="6" r="2" fill="#ffd27a"/></g></svg>` },
];

export function mount(stage, o) {
  if (!document.getElementById('pu-css')) { const s = document.createElement('style'); s.id = 'pu-css'; s.textContent = CSS; document.head.appendChild(s); }
  stage.style.background = 'linear-gradient(180deg,#5b4aa8 0%,#a68ae0 55%,#f4c6dd 100%)';
  // drifting bokeh behind the book
  const st = canvasIn(stage, 0), r = mulberry(4), bokeh = Array.from({ length: 30 }, () => ({ x: r(), y: r(), s: 4 + r() * 20, v: .00005 + r() * .0001, p: r() * TAU }));
  const scene = document.createElement('div'); scene.className = 'pu-scene';
  const floor = document.createElement('div'); floor.className = 'pu-floor'; scene.appendChild(floor); stage.appendChild(scene);
  const pl = document.createElement('div'); pl.className = 'pu-page l'; const pr = document.createElement('div'); pr.className = 'pu-page r'; floor.append(pl, pr);
  const layers = LAYERS.map(L => { const el = document.createElement('div'); el.className = 'pu-layer'; el.innerHTML = L.svg;
    Object.assign(el.style, { left: L.left + '%', width: L.w + '%', aspectRatio: L.ar, bottom: (100 - L.at) + '%' }); floor.appendChild(el); return el; });
  // the title banner stands up last, at the front edge
  const banner = document.createElement('div'); banner.className = 'pu-layer pu-banner';
  Object.assign(banner.style, { left: '6%', width: '88%', aspectRatio: '100/30', bottom: '-2%' });
  banner.innerHTML = `<svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 8 L8 4 L8 26 L0 22 L4 15Z M100 8 L92 4 L92 26 L100 22 L96 15Z" fill="#e0559a"/><path d="M8 2 Q50 -2 92 2 L92 26 Q50 22 8 26Z" fill="#ff7cb8"/><path d="M8 2 Q50 -2 92 2" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/></svg>`;
  floor.appendChild(banner);
  const tx = textLayer(banner, o, 'op-popup');
  Object.assign(tx.h.style, { font: `700 clamp(30px,8vw,56px)/1 ${o.font || '"Fredoka", "Avenir Next Rounded", system-ui, sans-serif'}`, color: '#fff', textShadow: '0 2px 0 rgba(150,30,90,.4)' });
  Object.assign(tx.p.style, { font: '600 clamp(13px,3.4vw,17px)/1.2 "Fredoka", system-ui, sans-serif', color: '#fff3fa', margin: '.3em 0 0' });

  return {
    frame(p, t) {
      const { W, H } = st, g = st.begin(); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const b of bokeh) { b.y -= b.v * 16; if (b.y < -.1) b.y = 1.1; const x = b.x * W + Math.sin(t * .0005 + b.p) * 20, y = b.y * H, a = .12 + .08 * Math.sin(t * .002 + b.p); const rg = g.createRadialGradient(x, y, 0, x, y, b.s); rg.addColorStop(0, `rgba(255,240,255,${a})`); rg.addColorStop(1, 'rgba(255,240,255,0)'); g.fillStyle = rg; g.fillRect(x - b.s, y - b.s, b.s * 2, b.s * 2); }
      g.globalCompositeOperation = 'source-over';
      const open = E.inOut(smooth(0, .2, p));
      floor.style.transform = `translateY(${(1 - open) * 30}%) rotateX(${lerp(76, 50, open)}deg) scale(${lerp(.85, 1.04, open)})`;
      scene.style.opacity = smooth(0, .06, p) * .9 + .1;
      pr.style.transform = `rotateY(${-180 * (1 - open)}deg)`;
      layers.forEach((el, i) => { const k = E.back(smooth(.2 + i * .085, .38 + i * .085, p)); el.style.transform = `rotateX(${-90 * k}deg)`; el.style.opacity = k > .01 ? 1 : 0; });
      const kb = E.back(smooth(.78, .94, p)); banner.style.transform = `rotateX(${-90 * kb}deg)`; banner.style.opacity = kb > .01 ? 1 : 0;
      tx.reveal(p, .84, .96, .9, 1);
    },
  };
}
