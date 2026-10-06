// Gift: the bow unties, the lid lifts, light and confetti pour out, the name rises. For birthdays.
import { canvasIn, textLayer, clamp, smooth, lerp, E, mulberry, TAU, reduced } from './kit.js';

export function mount(stage, o) {
  const st = canvasIn(stage), tx = textLayer(stage, o, 'op-gift');
  Object.assign(tx.el.style, { top: '14%', color: '#fff' });
  Object.assign(tx.h.style, { font: `700 clamp(48px,14vw,108px)/1 ${o.font || '"Fredoka", "Avenir Next Rounded", system-ui, sans-serif'}`, textShadow: '0 6px 0 rgba(0,0,0,.18), 0 0 30px rgba(255,220,140,.6)' });
  Object.assign(tx.p.style, { font: '600 clamp(17px,4.6vw,22px)/1.4 "Fredoka", system-ui, sans-serif', color: '#fff6d8' });
  const box = o.color || '#2bb3a6', box2 = o.color2 || '#1a7f76', ribbon = o.ribbon || '#ffcf4a';
  const r = mulberry(21), conf = [], cols = ['#ff5d8f', '#ffcf4a', '#5dd6ff', '#9b7bff', '#7dff9a', '#ffffff'];
  const balloons = Array.from({ length: 6 }, (_, i) => ({ x: .12 + i * .15 + (r() - .5) * .05, s: .9 + r() * .3, c: cols[i % 5], ph: r() * TAU, d: r() * .1 }));
  let lastP = 0;

  function quad(g, pts, fill) { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.closePath(); g.fillStyle = fill; g.fill(); }

  return {
    frame(p, t, dt) {
      const { W, H } = st, g = st.begin();
      let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#4b2a8c'); gr.addColorStop(.6, '#8a3fb0'); gr.addColorStop(1, '#f07fb0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const u = smooth(.04, .28, p), lid = E.out(smooth(.26, .48, p)), burst = smooth(.4, .62, p), rise = E.out(smooth(.5, .8, p)), party = smooth(.72, 1, p);
      const S = Math.min(W * .5, H * .3), cx = W / 2 - S * .1, base = H * .84, dx = S * .3, dy = S * .18, top = base - S;
      // light rays out of the open box
      if (burst > 0) {
        g.save(); g.translate(cx + dx / 2, top - dy / 2); g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 6.5) * .14 + Math.sin(t * .0008 + i) * .03, len = H * (.5 + .3 * Math.sin(i * 3.1)); const rg = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len); rg.addColorStop(0, `rgba(255,236,170,${.22 * burst})`); rg.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = rg; g.beginPath(); g.moveTo(-S * .3, 0); g.lineTo(Math.cos(a - .05) * len, Math.sin(a - .05) * len); g.lineTo(Math.cos(a + .05) * len, Math.sin(a + .05) * len); g.lineTo(S * .3, 0); g.fill(); }
        g.restore();
      }
      // box body: right side, front, inside (when open)
      quad(g, [[cx + S / 2, top], [cx + S / 2 + dx, top - dy], [cx + S / 2 + dx, base - dy], [cx + S / 2, base]], box2);
      gr = g.createLinearGradient(cx - S / 2, 0, cx + S / 2, 0); gr.addColorStop(0, box); gr.addColorStop(1, box2); quad(g, [[cx - S / 2, top], [cx + S / 2, top], [cx + S / 2, base], [cx - S / 2, base]], gr);
      quad(g, [[cx - S / 2, top], [cx + S / 2, top], [cx + S / 2 + dx, top - dy], [cx - S / 2 + dx, top - dy]], lid > .05 ? '#0f4d48' : box);
      // ribbon on box
      g.fillStyle = ribbon; g.fillRect(cx - S * .07, top, S * .14, S); quad(g, [[cx + S / 2, top + S * .43], [cx + S / 2 + dx, top + S * .43 - dy], [cx + S / 2 + dx, top + S * .57 - dy], [cx + S / 2, top + S * .57]], '#d9a92e');
      // lid: lifts, tips back, flies off to the right
      g.save(); g.translate(cx + dx / 2, top - dy / 2); g.translate(lid * S * .9, -lid * S * 1.1); g.rotate(lid * .7);
      const lw = S * 1.08, lh = S * .2;
      quad(g, [[lw / 2, -lh / 2 + dy / 2], [lw / 2 + dx, -lh / 2 - dy / 2], [lw / 2 + dx, lh / 2 - dy / 2], [lw / 2, lh / 2 + dy / 2]].map(([x, y]) => [x - dx / 2, y]), box2);
      quad(g, [[-lw / 2, -lh / 2 + dy / 2], [lw / 2, -lh / 2 + dy / 2], [lw / 2, lh / 2 + dy / 2], [-lw / 2, lh / 2 + dy / 2]].map(([x, y]) => [x - dx / 2, y]), box);
      quad(g, [[-lw / 2, -lh / 2 + dy / 2], [lw / 2, -lh / 2 + dy / 2], [lw / 2 + dx, -lh / 2 - dy / 2], [-lw / 2 + dx, -lh / 2 - dy / 2]].map(([x, y]) => [x - dx / 2, y]), '#3fd0c2');
      g.fillStyle = ribbon; g.fillRect(-S * .07 - dx / 2, -lh / 2 + dy / 2, S * .14, lh);
      // the bow: loops shrink and tails swing away as it unties
      const bow = 1 - u, by = -lh / 2 - dy / 4;
      g.save(); g.translate(0, by); g.fillStyle = ribbon; g.strokeStyle = '#c98f14'; g.lineWidth = 2;
      for (const sd of [-1, 1]) { g.save(); g.rotate(sd * (.5 + u * 1.2)); g.beginPath(); g.ellipse(sd * S * .16 * bow, -S * .05, S * .17 * (.3 + .7 * bow), S * .09 * (.3 + .7 * bow), sd * .3, 0, TAU); g.fill(); g.stroke(); g.restore(); }
      for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(sd * S * .1, S * .12 + u * S * .2, sd * S * (.16 + u * .25), S * (.2 + u * .25)); g.lineTo(sd * S * (.12 + u * .25), S * (.24 + u * .25)); g.quadraticCurveTo(sd * S * .06, S * .14, 0, S * .03); g.fill(); }
      g.beginPath(); g.arc(0, 0, S * .05, 0, TAU); g.fill(); g.restore();
      g.restore();
      // confetti pours out while scrolling forward
      if (burst > 0 && p > lastP && !reduced) for (let i = 0; i < 4; i++) conf.push({ x: cx + dx / 2 + (Math.random() - .5) * S * .6, y: top - dy / 2, vx: (Math.random() - .5) * 5, vy: -6 - Math.random() * 7, c: cols[(Math.random() * cols.length) | 0], s: 4 + Math.random() * 5, rot: Math.random() * TAU, vr: (Math.random() - .5) * .3, life: 0 });
      lastP = p;
      for (let i = conf.length - 1; i >= 0; i--) { const c = conf[i]; c.life += dt; c.vy += .18; c.vx *= .99; c.x += c.vx; c.y += c.vy * .9; c.rot += c.vr; if (c.y > H + 20 || c.life > 4000) { conf.splice(i, 1); continue; } g.save(); g.translate(c.x, c.y); g.rotate(c.rot); g.scale(Math.cos(c.rot * 2), 1); g.fillStyle = c.c; g.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2); g.restore(); }
      // balloons float up
      if (party > 0) for (const b of balloons) {
        const y = lerp(H + 80, H * (.15 + b.d * 2), E.out(clamp((party - b.d) / .8))), x = b.x * W + Math.sin(t * .001 + b.ph) * 10, rr = Math.min(W, H) * .06 * b.s;
        g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + rr * 1.2); g.quadraticCurveTo(x + 8, y + rr * 2.5, x - 4, y + rr * 4); g.stroke();
        const bg = g.createRadialGradient(x - rr * .3, y - rr * .4, rr * .1, x, y, rr * 1.2); bg.addColorStop(0, '#fff'); bg.addColorStop(.25, b.c); bg.addColorStop(1, b.c); g.fillStyle = bg; g.beginPath(); g.ellipse(x, y, rr, rr * 1.2, 0, 0, TAU); g.fill();
        g.beginPath(); g.moveTo(x - 3, y + rr * 1.2); g.lineTo(x + 3, y + rr * 1.2); g.lineTo(x, y + rr * 1.2 + 6); g.fill();
      }
      // the name rises out of the box
      tx.el.style.transform = `translateY(${(1 - rise) * (base - H * .3)}px) scale(${.4 + .6 * rise})`; tx.el.style.opacity = rise;
      tx.reveal(p, .5, .72, .78, .9);
    },
  };
}
