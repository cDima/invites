// Ember: fire spreads through a gold-engraved card (scroll or rub), then it flips to the name. For games, secrets, surprises.
import { textLayer, clamp, smooth, lerp, E, mulberry, mk, DPR, TAU } from './kit.js';

const CSS = `
.em-card{position:absolute;left:50%;top:47%;width:min(70vw,calc(62svh * .714),360px);aspect-ratio:5/7;transform:translate(-50%,-50%);perspective:1600px;z-index:2;touch-action:pan-y}
.em-in{position:absolute;inset:0;transform-style:preserve-3d}
.em-side{position:absolute;inset:0;border-radius:4.5%/3.2%;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 30px 60px rgba(0,0,0,.6),0 0 0 1px rgba(214,171,95,.25)}
.em-side canvas{width:100%;height:100%;display:block}
.em-face{transform:rotateY(180deg);background:radial-gradient(120% 90% at 50% 35%,#fffaf1,#f4ede1 60%,#e6d8c0);display:grid;place-items:center}
.em-face::before{content:"";position:absolute;inset:5%;border:1px solid rgba(107,20,36,.35);border-radius:3%}
.em-face .op-text{position:relative;top:auto}
`;

function heartP(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * .42); g.bezierCurveTo(x - s * 1.15, y - s * .3, x - s * .5, y - s * 1.05, x, y - s * .42); g.bezierCurveTo(x + s * .5, y - s * 1.05, x + s * 1.15, y - s * .3, x, y + s * .42); g.closePath(); }
function pattern(b, w, h, style) {
  b.save();
  if (style === 'dark') { b.strokeStyle = 'rgba(176,132,70,.42)'; b.lineWidth = 1; }
  else if (style === 'lit') { const gr = b.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(.5, '#e7b866'); gr.addColorStop(1, '#fff0c0'); b.strokeStyle = gr; b.lineWidth = 1.5; b.shadowColor = 'rgba(255,190,100,.9)'; b.shadowBlur = 8; }
  else { b.strokeStyle = '#ffd9a0'; b.lineWidth = 2.6; b.shadowColor = 'rgba(255,120,40,1)'; b.shadowBlur = 16; }
  const m = w * .06, rr = w * .05, m2 = m + w * .025, rect = (x, y, ww, hh, rad) => { b.beginPath(); b.roundRect ? b.roundRect(x, y, ww, hh, rad) : b.rect(x, y, ww, hh); b.stroke(); };
  rect(m, m, w - 2 * m, h - 2 * m, rr); rect(m2, m2, w - 2 * m2, h - 2 * m2, rr * .7);
  b.save(); b.beginPath(); b.rect(m2 + 4, m2 + 4, w - 2 * m2 - 8, h - 2 * m2 - 8); b.clip(); const sp = w * .085; b.beginPath();
  for (let k = -h; k < w + h; k += sp) { b.moveTo(k, m2); b.lineTo(k + h, m2 + h); b.moveTo(k, m2 + h); b.lineTo(k + h, m2); } b.globalAlpha = style === 'dark' ? .45 : .55; b.lineWidth *= .6; b.stroke(); b.restore();
  const cx = w / 2, cy = h / 2;
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { b.save(); b.translate(cx, cy); b.scale(sx, sy); b.translate(-cx, -cy); const ox = m2 + w * .05, oy = m2 + w * .05;
    b.beginPath(); for (let a = 0; a < TAU * 2.2; a += .08) { const rad = w * .09 * (1 - a / (TAU * 2.6)); b.lineTo(ox + w * .09 + Math.cos(a + Math.PI) * rad, oy + w * .09 + Math.sin(a + Math.PI) * rad); } b.stroke();
    b.beginPath(); b.moveTo(ox, oy + w * .2); b.bezierCurveTo(ox + w * .08, oy + w * .32, ox + w * .2, oy + w * .24, ox + w * .26, oy + w * .34); b.moveTo(ox + w * .2, oy); b.bezierCurveTo(ox + w * .32, oy + w * .08, ox + w * .24, oy + w * .2, ox + w * .34, oy + w * .26); b.stroke(); b.restore(); }
  b.beginPath(); b.arc(cx, cy, w * .2, 0, TAU); b.stroke(); b.beginPath(); b.arc(cx, cy, w * .17, 0, TAU); b.stroke();
  b.beginPath(); for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; b.moveTo(cx + Math.cos(a) * w * .21, cy + Math.sin(a) * w * .21); b.lineTo(cx + Math.cos(a) * w * (i % 2 ? .25 : .28), cy + Math.sin(a) * w * (i % 2 ? .25 : .28)); } b.stroke();
  heartP(b, cx, cy + w * .02, w * .13); b.stroke(); heartP(b, cx, cy + w * .02, w * .09); b.stroke();
  b.restore();
}

export function mount(stage, o) {
  if (!document.getElementById('em-css')) { const s = document.createElement('style'); s.id = 'em-css'; s.textContent = CSS; document.head.appendChild(s); }
  stage.style.background = 'radial-gradient(80% 60% at 50% 45%,#1f1a26 0%,#0e0c13 60%,#060509 100%)';
  const card = document.createElement('div'); card.className = 'em-card';
  card.innerHTML = '<div class="em-in"><div class="em-side em-back"><canvas></canvas></div><div class="em-side em-face"></div></div>';
  stage.appendChild(card);
  const inner = card.querySelector('.em-in'), cv = card.querySelector('canvas'), g = cv.getContext('2d'), face = card.querySelector('.em-face');
  const tx = textLayer(face, o, 'op-ember');
  Object.assign(tx.h.style, { font: `italic 400 clamp(40px,12vw,68px)/1 ${o.font || '"Bodoni Moda", Didot, Georgia, serif'}`, color: '#6b1424' });
  Object.assign(tx.p.style, { font: '500 11px/1.6 "Jost", system-ui, sans-serif', letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a4a3a' });
  let W = 0, H = 0, d = 1, dark, lit, hot, mask, mg, ring, rg;
  const r = mulberry(9);
  // fire starts at a corner and spreads; each seed lights at its own scroll moment
  const seeds = Array.from({ length: 14 }, (_, i) => ({ u: .12 + r() * .76, v: .14 + r() * .72, at: .04 + i * .028 }));
  seeds[0] = { u: .1, v: .9, at: .03 };
  const rubs = [];
  function size() { const w = card.clientWidth, h = card.clientHeight; if (!w || (w === W && h === H)) return; W = w; H = h; d = DPR(); cv.width = W * d; cv.height = H * d;
    const L = s => { const c = mk(W * d, H * d), b = c.getContext('2d'); b.scale(d, d); pattern(b, W, H, s); return c; };
    dark = mk(W * d, H * d); const db = dark.getContext('2d'); db.scale(d, d); const bg = db.createRadialGradient(W / 2, H * .4, 0, W / 2, H / 2, H * .8); bg.addColorStop(0, '#1a1620'); bg.addColorStop(1, '#060508'); db.fillStyle = bg; db.fillRect(0, 0, W, H); pattern(db, W, H, 'dark');
    lit = L('lit'); hot = L('hot'); mask = mk(W * d, H * d); mg = mask.getContext('2d'); ring = mk(W * d, H * d); rg = ring.getContext('2d'); }
  new ResizeObserver(size).observe(card); size();
  let last = null; const loc = e => { const b = card.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  card.addEventListener('pointerdown', e => { last = loc(e); rubs.push({ x: last[0], y: last[1], r: 2 }); });
  card.addEventListener('pointermove', e => { if (!(e.pointerType === 'mouse' || e.buttons)) return; const [x, y] = loc(e); if (!last || Math.hypot(x - last[0], y - last[1]) > W * .08) { rubs.push({ x, y, r: 2 }); last = [x, y]; } });

  return {
    frame(p, t, dt) {
      if (!dark) return;
      for (const s of rubs) s.r += W * .00011 * dt;
      const circles = seeds.map(s => ({ x: s.u * W, y: s.v * H, r: Math.max(0, p - s.at) * Math.hypot(W, H) * 1.6 })).concat(rubs);
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(dark, 0, 0);
      mg.setTransform(d, 0, 0, d, 0, 0); mg.clearRect(0, 0, W, H); mg.fillStyle = '#000'; for (const c of circles) if (c.r > 0) { mg.beginPath(); mg.arc(c.x, c.y, c.r, 0, TAU); mg.fill(); }
      rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'source-over'; rg.clearRect(0, 0, ring.width, ring.height); rg.drawImage(lit, 0, 0); rg.globalCompositeOperation = 'destination-in'; rg.drawImage(mask, 0, 0); g.drawImage(ring, 0, 0);
      rg.globalCompositeOperation = 'source-over'; rg.clearRect(0, 0, ring.width, ring.height); rg.setTransform(d, 0, 0, d, 0, 0);
      const band = W * .07, far = Math.hypot(W, H);
      for (const c of circles) { if (c.r <= 0 || c.r > far * 1.1) continue; const gr = rg.createRadialGradient(c.x, c.y, Math.max(0, c.r - band), c.x, c.y, c.r); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.7, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); rg.fillStyle = gr; rg.beginPath(); rg.arc(c.x, c.y, c.r, 0, TAU); rg.fill(); }
      rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.drawImage(hot, 0, 0); g.globalCompositeOperation = 'lighter'; g.drawImage(ring, 0, 0);
      g.setTransform(d, 0, 0, d, 0, 0); for (const c of circles) { if (c.r <= 0 || c.r > far) continue; const gr = g.createRadialGradient(c.x, c.y, Math.max(0, c.r - W * .05), c.x, c.y, c.r + W * .02); gr.addColorStop(0, 'rgba(255,120,40,0)'); gr.addColorStop(.8, 'rgba(255,120,40,.1)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
      g.globalCompositeOperation = 'source-over';
      const flip = E.inOut(smooth(.72, .88, p)), lift = Math.sin(flip * Math.PI);
      inner.style.transform = `translateZ(${lift * 120}px) rotateY(${180 * flip}deg) rotateZ(${lift * -4}deg)`;
      tx.reveal(p, .86, .96, .92, 1);
    },
  };
}
