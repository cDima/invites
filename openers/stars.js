// Stars: the night sky drifts together and writes a name. For love, anniversaries, "I miss you".
import { canvasIn, textLayer, clamp, smooth, lerp, E, mulberry, mk, TAU, reduced } from './kit.js';

export function mount(stage, o) {
  stage.style.background = '#05061a';
  const st = canvasIn(stage), tx = textLayer(stage, { line: o.line }, 'op-stars');
  Object.assign(tx.el.style, { top: '66%', color: '#f4e9d8' });
  Object.assign(tx.p.style, { font: `italic 400 clamp(20px,5.4vw,28px)/1.4 ${o.lineFont || '"Bodoni Moda", Georgia, serif'}`, color: '#efe3cf' });
  let stars = [], sky = null;
  const font = o.font || '"Pinyon Script", "Snell Roundhand", cursive';

  st.onResize = async () => {
    const { W, H, d } = st;
    try { await document.fonts.load(`80px ${font}`); } catch (e) {}
    // where the name lives
    const tc = mk(W, H), tg = tc.getContext('2d'); let fs = Math.min(W * .26, H * .2, 170);
    tg.font = `${fs}px ${font}`; while (tg.measureText(o.title || '').width > W * .9 && fs > 20) { fs *= .92; tg.font = `${fs}px ${font}`; }
    tg.textAlign = 'center'; tg.textBaseline = 'middle'; tg.fillStyle = '#fff'; tg.fillText(o.title || '', W / 2, H * .44);
    const data = tg.getImageData(0, 0, W, H).data, step = Math.max(3, Math.round(W / 140)), pts = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 140) pts.push([x + (Math.random() - .5) * 1.5, y + (Math.random() - .5) * 1.5]);
    const r = mulberry(5); const free = reduced ? 200 : 520;
    stars = pts.map(([x, y]) => ({ x0: r() * W, y0: r() * H, tx: x, ty: y, delay: r() * .4, arc: (r() - .5) * W * .3, s: .7 + r() * 1.1, p: r() * TAU, warm: r() }))
      .concat(Array.from({ length: free }, () => ({ x0: r() * W, y0: r() * H, tx: null, s: .3 + r() * 1.2, p: r() * TAU, warm: r(), v: (r() - .5) * .01 })));
    // painted sky: gradient, milky way band, faint nebula
    sky = mk(W * d, H * d); const b = sky.getContext('2d'); b.scale(d, d);
    let gr = b.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#03041a'); gr.addColorStop(.6, '#0b1038'); gr.addColorStop(1, '#1d1440'); b.fillStyle = gr; b.fillRect(0, 0, W, H);
    b.save(); b.translate(W / 2, H / 2); b.rotate(-.5);
    for (let i = 0; i < 260; i++) { const x = (r() - .5) * W * 1.8, y = (r() - .5) * H * .22 * (1 - Math.abs(x) / (W * 1.2)), rr = 20 + r() * 70; const c = r() < .5 ? '120,140,255' : '255,150,210'; const ng = b.createRadialGradient(x, y, 0, x, y, rr); ng.addColorStop(0, `rgba(${c},.045)`); ng.addColorStop(1, `rgba(${c},0)`); b.fillStyle = ng; b.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    b.restore();
    for (let i = 0; i < W * H / 500; i++) { b.fillStyle = `rgba(255,255,255,${r() * .5})`; b.fillRect(r() * W, r() * H, .8, .8); }
  };
  st.onResize();

  return {
    frame(p, t) {
      if (!sky) return; const { W, H } = st, g = st.begin(); g.drawImage(sky, 0, 0, W, H);
      const k = smooth(.06, .72, p), settle = smooth(.72, .95, p);
      g.globalCompositeOperation = 'lighter';
      for (const s of stars) {
        let x, y, size = s.s, a;
        if (s.tx != null) {
          const e = E.inOut(clamp((k - s.delay) / .6));
          x = lerp(s.x0, s.tx, e) + Math.sin(e * Math.PI) * s.arc * .4; y = lerp(s.y0, s.ty, e) + Math.sin(e * Math.PI) * s.arc * .2;
          a = .55 + .45 * Math.sin(t * .003 + s.p) * (1 - e * .7); size = s.s * (1 + e * .35 + settle * .3);
          if (e > 0 && e < 1) { g.strokeStyle = `rgba(255,236,200,${.18 * Math.sin(e * Math.PI)})`; g.lineWidth = size * .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x - (s.tx - s.x0) * .03, y - (s.ty - s.y0) * .03); g.stroke(); }
        } else {
          s.x0 += s.v; if (s.x0 < 0) s.x0 += W; if (s.x0 > W) s.x0 -= W; x = s.x0; y = s.y0; a = (.25 + .75 * Math.pow(Math.abs(Math.sin(t * .0015 + s.p)), 3)) * (1 - settle * .5);
        }
        const c = s.warm > .5 ? '255,236,205' : '205,220,255', rr = size * 2.6;
        const sg = g.createRadialGradient(x, y, 0, x, y, rr); sg.addColorStop(0, `rgba(${c},${a})`); sg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = sg; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
      }
      if (settle > 0) { const gg = g.createRadialGradient(W / 2, H * .44, 0, W / 2, H * .44, W * .6); gg.addColorStop(0, `rgba(255,200,150,${.12 * settle})`); gg.addColorStop(1, 'rgba(255,200,150,0)'); g.fillStyle = gg; g.fillRect(0, 0, W, H); }
      // a shooting star crosses once the name is written
      const sh = smooth(.78, .9, p); if (sh > 0 && sh < 1) { const x = lerp(W * .1, W * .9, sh), y = lerp(H * .12, H * .3, sh); const lg = g.createLinearGradient(x, y, x - W * .2, y - H * .05); lg.addColorStop(0, 'rgba(255,255,255,.9)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.strokeStyle = lg; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - W * .2, y - H * .05); g.stroke(); }
      g.globalCompositeOperation = 'source-over';
      tx.reveal(p, 0, 0, .82, .95);
    },
  };
}
