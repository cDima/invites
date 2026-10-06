// Curtain: velvet curtains part, a spotlight falls on the name. For concerts, shows, premieres.
import { canvasIn, textLayer, clamp, smooth, lerp, E, mulberry, TAU } from './kit.js';

export function mount(stage, o) {
  stage.style.background = '#060306';
  const st = canvasIn(stage), tx = textLayer(stage, o, 'op-curtain');
  Object.assign(tx.el.style, { top: '36%', color: '#fff3dc' });
  Object.assign(tx.h.style, { font: `600 clamp(54px,16vw,128px)/1 ${o.font || '"Bodoni Moda", Didot, Georgia, serif'}`, letterSpacing: '.04em', textShadow: '0 0 30px rgba(255,220,160,.55), 0 6px 18px rgba(0,0,0,.6)' });
  Object.assign(tx.p.style, { font: '500 13px/1.6 "Jost", "Avenir Next", system-ui, sans-serif', letterSpacing: '.34em', textTransform: 'uppercase', color: '#e9c98a' });
  const r = mulberry(7);
  const dust = Array.from({ length: 120 }, () => ({ x: r(), y: r(), s: .4 + r() * 1.6, v: .1 + r() * .5, p: r() * TAU }));
  const bulbs = Array.from({ length: 40 }, () => ({ x: r(), y: .55 + r() * .25, s: 1 + r() * 2.5, p: r() * TAU }));
  const hue = o.color || '160,20,40';

  function curtain(g, W, H, side, open, t) {
    const outer = side < 0 ? 0 : W, full = W / 2 + 24, cw = full * (1 - .84 * open), folds = 10, tieY = H * .64;
    const sway = Math.sin(t * .0011 + side) * 5 * (1 - open * .7);
    for (let i = 0; i < folds; i++) {
      const u0 = i / folds, u1 = (i + 1) / folds;
      const xAt = (u, y) => { const base = outer - side * u * cw; const k = y < tieY ? lerp(1, 1 - .55 * open, y / tieY) : lerp(1 - .55 * open, 1 - .25 * open, (y - tieY) / (H - tieY)); return outer + (base - outer) * k + sway * u * (y / H); };
      const gr = g.createLinearGradient(xAt(u0, 0), 0, xAt(u1, 0), 0);
      gr.addColorStop(0, `rgba(${hue},1)`); gr.addColorStop(0, '#1d0206'); gr.addColorStop(.45, `rgb(${hue})`); gr.addColorStop(.62, '#d4404f'); gr.addColorStop(1, '#2a0309');
      g.fillStyle = gr; g.beginPath(); g.moveTo(xAt(u0, 0), 0);
      for (let y = 0; y <= H; y += H / 24) g.lineTo(xAt(u0, y) + Math.sin(y * .02 + t * .002 + i) * 1.5, y);
      for (let y = H; y >= 0; y -= H / 24) g.lineTo(xAt(u1, y) + Math.sin(y * .02 + t * .002 + i + 1) * 1.5, y);
      g.closePath(); g.fill();
    }
    // gold fringe along the hem
    g.strokeStyle = 'rgba(232,190,110,.9)'; g.lineWidth = 1.2;
    for (let u = 0; u <= 1; u += .012) { const x = outer + (outer - side * u * cw - outer) * (1 - .25 * open); g.beginPath(); g.moveTo(x, H - 16); g.lineTo(x + Math.sin(t * .003 + u * 40) * 1.5, H - 2); g.stroke(); }
    // tie-back cord
    if (open > .05) { const x = outer - side * cw * (1 - .55 * open); g.fillStyle = '#e8be6e'; g.beginPath(); g.ellipse(x, tieY, 9, 6, 0, 0, TAU); g.fill(); g.fillRect(x - 2, tieY, 4, 34); }
  }

  return {
    frame(p, t) {
      const { W, H } = st, g = st.begin();
      const open = E.inOut(smooth(.04, .5, p)), light = smooth(.3, .62, p), glow = smooth(.8, 1, p);
      // the hall behind
      let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d0710'); gr.addColorStop(.7, '#140a12'); gr.addColorStop(1, '#2a1610'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      for (const b of bulbs) { const a = open * .5 * (.6 + .4 * Math.sin(t * .002 + b.p)); const x = b.x * W, y = b.y * H; const rg = g.createRadialGradient(x, y, 0, x, y, b.s * 6); rg.addColorStop(0, `rgba(255,190,120,${a})`); rg.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = rg; g.fillRect(x - b.s * 6, y - b.s * 6, b.s * 12, b.s * 12); }
      // spotlight cone + pool
      const sx = W / 2 + Math.sin(t * .0007) * W * .03 * (1 - glow), fy = H * .82, fr = Math.min(W * .42, H * .3);
      if (light > 0) {
        gr = g.createLinearGradient(0, 0, 0, fy); gr.addColorStop(0, `rgba(255,244,220,${.05 * light})`); gr.addColorStop(1, `rgba(255,236,200,${(.22 + .12 * glow) * light})`);
        g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 14, 0); g.lineTo(sx + 14, 0); g.lineTo(sx + fr, fy); g.lineTo(sx - fr, fy); g.closePath(); g.fill();
        gr = g.createRadialGradient(sx, fy, 0, sx, fy, fr); gr.addColorStop(0, `rgba(255,240,210,${.55 * light})`); gr.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(sx, fy, fr, fr * .22, 0, 0, TAU); g.fill();
        for (const d of dust) { d.y -= d.v * .0006; if (d.y < 0) d.y = 1; const y = d.y * fy, half = 14 + (fr - 14) * (y / fy), x = sx + (d.x - .5) * 2 * half; const a = light * (.35 + .35 * Math.sin(t * .003 + d.p)); g.fillStyle = `rgba(255,240,215,${a})`; g.beginPath(); g.arc(x + Math.sin(t * .001 + d.p) * 6, y, d.s, 0, TAU); g.fill(); }
      }
      g.globalCompositeOperation = 'source-over';
      // stage floor edge
      gr = g.createLinearGradient(0, H * .84, 0, H); gr.addColorStop(0, '#2b1a12'); gr.addColorStop(1, '#0c0705'); g.fillStyle = gr; g.fillRect(0, H * .84, W, H * .16);
      g.fillStyle = 'rgba(232,190,110,.35)'; g.fillRect(0, H * .84, W, 1.5);
      curtain(g, W, H, -1, open, t); curtain(g, W, H, 1, open, t);
      // valance with swags
      const vh = H * .1; gr = g.createLinearGradient(0, 0, 0, vh); gr.addColorStop(0, '#3a050c'); gr.addColorStop(1, `rgb(${hue})`); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); const sw = 5; for (let k = sw; k >= 0; k--) { const x = W * k / sw; g.lineTo(x, vh * .6); if (k) g.quadraticCurveTo(x - W / sw / 2, vh * 1.25, x - W / sw, vh * .6); } g.closePath(); g.fill();
      g.strokeStyle = '#e8be6e'; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < sw; k++) { const x = W * k / sw; g.moveTo(x, vh * .6); g.quadraticCurveTo(x + W / sw / 2, vh * 1.25, x + W / sw, vh * .6); } g.stroke();
      for (let k = 1; k < sw; k++) { const x = W * k / sw; g.fillStyle = '#e8be6e'; g.beginPath(); g.ellipse(x, vh * .62, 5, 7, 0, 0, TAU); g.fill(); g.fillRect(x - 1, vh * .62, 2, 18 + Math.sin(t * .002 + k) * 2); }
      tx.reveal(p, .5, .78, .8, .92);
      tx.h.style.textShadow = `0 0 ${30 + glow * 40}px rgba(255,220,160,${.5 + glow * .4}), 0 6px 18px rgba(0,0,0,.6)`;
    },
  };
}
