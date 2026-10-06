// Openers kit: scroll-driven opening scenes for invites.
// Usage in any page:
//   <section data-opener="curtain" data-title="Yulia" data-line="Friday · 8 PM" data-length="3"></section>
//   <script type="module">import {mountAll} from '../openers/kit.js'; mountAll();</script>
// Each opener module exports mount(stage, opts) → {frame(p, t, dt)} where p is scroll progress 0..1.

export const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const E = {
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
export const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

/** A full-stage canvas that tracks size. st.onResize is called after every resize. */
export function canvasIn(stage, z = 0) {
  const c = document.createElement('canvas'); c.className = 'op-cv'; c.style.zIndex = z; c.setAttribute('aria-hidden', 'true'); stage.appendChild(c);
  const st = { c, g: c.getContext('2d'), W: 0, H: 0, d: 1, onResize: null };
  const size = () => { const W = stage.clientWidth, H = stage.clientHeight; if (!W || (W === st.W && Math.abs(H - st.H) < 100 && st.W)) return; st.W = W; st.H = H; st.d = DPR(); c.width = W * st.d; c.height = H * st.d; st.onResize && st.onResize(); };
  new ResizeObserver(size).observe(stage); size();
  st.begin = () => { st.g.setTransform(st.d, 0, 0, st.d, 0, 0); return st.g; };
  return st;
}

/** Title + one line, split into letters so openers can reveal them. */
export function textLayer(stage, o, cls = '') {
  const el = document.createElement('div'); el.className = 'op-text ' + cls;
  const h = document.createElement('h2'); h.className = 'op-title';
  // letters are grouped by word so a title never breaks mid-word
  (o.title || '').split(/(\s+)/).forEach(part => {
    if (!part) return; if (/^\s+$/.test(part)) { h.appendChild(document.createTextNode(' ')); return; }
    const w = document.createElement('span'); w.className = 'op-word';
    [...part].forEach(ch => { const s = document.createElement('span'); s.className = 'op-ch'; s.textContent = ch; w.appendChild(s); }); h.appendChild(w);
  });
  h.setAttribute('aria-label', o.title || '');
  const p = document.createElement('p'); p.className = 'op-line'; p.textContent = o.line || '';
  el.append(h, p); stage.appendChild(el);
  const letters = [...h.querySelectorAll('.op-ch')];
  return {
    el, h, p, letters,
    /** reveal letters one by one across [a,b] of progress, line across [c,d] */
    reveal(prog, a, b, c, d) {
      const n = letters.length || 1;
      letters.forEach((s, i) => { const k = smooth(a + (b - a) * i / n, a + (b - a) * (i + 1.6) / n, prog); s.style.opacity = k; s.style.transform = `translateY(${(1 - k) * .35}em)`; s.style.filter = k < 1 ? `blur(${(1 - k) * 8}px)` : 'none'; });
      const k = smooth(c, d, prog); p.style.opacity = k; p.style.transform = `translateY(${(1 - k) * 12}px)`;
    },
  };
}

const CSS = `
.op{position:relative}
.op-stage{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden}
.op-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
.op-text{position:absolute;left:0;right:0;z-index:5;text-align:center;padding-inline:18px;pointer-events:none}
.op-title{margin:0;font-weight:400;line-height:1;text-wrap:balance}
.op-title .op-word{display:inline-block;white-space:nowrap}
.op-title .op-ch{display:inline-block;will-change:transform,opacity}
.op-line{margin:.7em 0 0;will-change:transform,opacity}
`;

const registry = [];
let running = false, last = performance.now();
function loop(t) {
  const dt = Math.min(50, t - last); last = t; const vh = innerHeight;
  for (const r of registry) {
    const b = r.sec.getBoundingClientRect(); if (b.bottom < -50 || b.top > vh + 50) continue;
    const p = r.forced != null ? r.forced : clamp(-b.top / Math.max(1, b.height - vh));
    r.api.frame(p, t, dt);
  }
  requestAnimationFrame(loop);
}

/** Mount every [data-opener] inside root. Returns the mounted openers. */
export async function mountAll(root = document) {
  if (!document.getElementById('op-kit-css')) { const s = document.createElement('style'); s.id = 'op-kit-css'; s.textContent = CSS; document.head.appendChild(s); }
  const secs = [...root.querySelectorAll('[data-opener]')];
  for (const sec of secs) {
    if (sec.dataset.mounted) continue; sec.dataset.mounted = '1';
    sec.classList.add('op'); const len = +(sec.dataset.length || 3);
    sec.style.height = `${len * 100}vh`; sec.style.height = `${len * 100}svh`;
    const stage = document.createElement('div'); stage.className = 'op-stage'; sec.appendChild(stage);
    const mod = await import(`./${sec.dataset.opener}.js`);
    const api = mod.mount(stage, { ...sec.dataset });
    registry.push({ sec, api, forced: null });
  }
  if (!running) { running = true; requestAnimationFrame(loop); }
  return registry;
}
