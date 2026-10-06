// Bloom: a peony opens layer by layer, petals drift. For anniversaries, Mother's Day, weddings.
import { canvasIn, textLayer, clamp, smooth, lerp, E, mulberry, TAU } from './kit.js';

const PALETTES = {
  peony: { bg: ['#2a0f1f', '#5a1d3a', '#a8476a'], base: '#b0305e', mid: '#f08fb0', tip: '#fff0f3', vein: 'rgba(150,30,70,.25)', text: '#fff1f4' },
  rose: { bg: ['#14060a', '#3a0b16', '#7a1a2a'], base: '#5a0614', mid: '#b3203a', tip: '#ff8a9a', vein: 'rgba(40,0,10,.35)', text: '#ffe9ec' },
  ivory: { bg: ['#1a1712', '#3a3224', '#8a7558'], base: '#c9a777', mid: '#f3e6cf', tip: '#fffdf8', vein: 'rgba(120,90,50,.2)', text: '#fff8ea' },
};

export function mount(stage, o) {
  const P = PALETTES[o.palette] || PALETTES.peony;
  const st = canvasIn(stage), tx = textLayer(stage, o, 'op-bloom');
  Object.assign(tx.el.style, { top: '76%', color: P.text });
  Object.assign(tx.h.style, { font: `400 clamp(48px,14vw,104px)/1 ${o.font || '"Pinyon Script", "Snell Roundhand", cursive'}`, textShadow: '0 4px 24px rgba(0,0,0,.45)' });
  Object.assign(tx.p.style, { font: '500 13px/1.6 "Jost", system-ui, sans-serif', letterSpacing: '.32em', textTransform: 'uppercase', opacity: 0 });
  const r = mulberry(11);
  const COUNTS = [14, 12, 11, 9, 8, 7, 6, 5], LENS = [1, .9, .8, .7, .6, .5, .4, .3];
  const layers = COUNTS.map((n, li) => Array.from({ length: n }, (_, j) => ({ a: j / n * TAU + li * .37 + (r() - .5) * .25, w: .5 + r() * .2, l: .92 + r() * .16, curl: (r() - .5) * .3 })));
  const falling = Array.from({ length: 26 }, () => ({ x: r(), y: r(), s: 8 + r() * 10, rot: r() * TAU, vr: (r() - .5) * .02, f: r() * TAU, v: .3 + r() * .5 }));

  function petal(g, L, w, open, shade) {
    g.beginPath(); g.moveTo(0, 0);
    g.bezierCurveTo(w * .62, -L * .18, w * .72, -L * .82, w * .16, -L);
    g.quadraticCurveTo(0, -L * .93, -w * .16, -L);
    g.bezierCurveTo(-w * .72, -L * .82, -w * .62, -L * .18, 0, 0); g.closePath();
    const gr = g.createLinearGradient(0, 0, 0, -L); gr.addColorStop(0, P.base); gr.addColorStop(.45, P.mid); gr.addColorStop(1, P.tip);
    g.fillStyle = gr; g.fill();
    g.fillStyle = `rgba(20,0,10,${shade})`; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = P.vein; g.lineWidth = .8; g.beginPath();
    for (let k = -2; k <= 2; k++) { g.moveTo(0, -L * .05); g.quadraticCurveTo(k * w * .12, -L * .5, k * w * .2, -L * .9); } g.stroke();
  }

  return {
    frame(p, t) {
      const { W, H } = st, g = st.begin();
      let gr = g.createRadialGradient(W / 2, H * .42, 0, W / 2, H * .42, Math.max(W, H) * .8);
      gr.addColorStop(0, P.bg[2]); gr.addColorStop(.45, P.bg[1]); gr.addColorStop(1, P.bg[0]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H * .42, R = Math.min(W * .46, H * .34), breathe = 1 + Math.sin(t * .0012) * .008;
      // soft light behind the flower grows as it opens
      const glow = smooth(.3, .9, p); gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6); gr.addColorStop(0, `rgba(255,230,220,${.25 * glow})`); gr.addColorStop(1, 'rgba(255,230,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.save(); g.translate(cx, cy); g.scale(breathe, breathe); g.rotate(p * .25);
      layers.forEach((ring, li) => {
        const o = E.out(smooth(.04 + li * .07, .4 + li * .07, p)), len = R * LENS[li];
        for (const pe of ring) {
          g.save(); g.rotate(pe.a + (1 - o) * .55 + pe.curl * o);
          g.scale(1, .3 + .7 * o);
          petal(g, len * pe.l * (.35 + .65 * o), len * pe.w * (.7 + .3 * o), o, .35 * (1 - o) + li * .02);
          g.restore();
        }
      });
      // golden stamens appear at the heart
      const c = smooth(.72, .92, p);
      if (c > 0) for (let i = 0; i < 46; i++) { const a = i * 2.4, rr = Math.sqrt(i / 46) * R * .14 * c; g.fillStyle = `rgba(255,${200 + (i % 3) * 15},110,${c})`; g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr, 1.6 + c * 1.6, 0, TAU); g.fill(); }
      g.restore();
      // petals let go and drift
      const drift = smooth(.82, 1, p);
      if (drift > 0) for (const f of falling) {
        f.y += f.v * .0012; if (f.y > 1.1) f.y = -.1; f.rot += f.vr; f.f += .03;
        g.save(); g.globalAlpha = drift * .9; g.translate(f.x * W + Math.sin(t * .001 + f.f) * 20, f.y * H); g.rotate(f.rot); g.scale(Math.cos(f.f), 1);
        petal(g, f.s * 1.6, f.s, 1, .1); g.restore();
      }
      tx.reveal(p, .74, .92, .9, 1);
    },
  };
}
