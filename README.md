# Family invites

Animated, single-file invitation pages, hosted free on GitHub Pages from
[github.com/cDima/invites](https://github.com/cDima/invites). No login is needed to open them.

| Page | Live link | Theme |
|---|---|---|
| `index.html` | https://cdima.github.io/invites/ (also `/yulia/`) | Yulia: 12th anniversary dinner, The Barking Frog |
| `michelle/index.html` | https://cdima.github.io/invites/michelle/ | Michelle (7): princess → queen, bedtime story |
| `nicholas/index.html` | https://cdima.github.io/invites/nicholas/ | Nicholas: co-op gaming, Roblox / PlayStation / vibe coding |
| `sting/index.html` | https://cdima.github.io/invites/sting/ | Yulia: Sting 3.0 at Benaroya Hall, Fri 9 Oct 2026 ("Shape of My Heart") |

## Update or reuse an invite
Each page has a `CONFIG` block at the top of its `<script>` (names, date, time, venue).
Edit it, then:
```bash
git add -A && git commit -m "Update invite" && git push
```
The site updates in about a minute. For a new person, copy a folder (e.g. `cp -r nicholas alex`),
edit it, and push. It will be live at `https://cdima.github.io/invites/alex/`.

## What's in each page (building blocks to reuse)
- **Intro overlay** that locks scrolling until it's opened: an envelope with a wax seal (Yulia),
  a storybook with a crown clasp (Michelle), a boot screen with hold-to-start (Nicholas).
- **Rub/scratch-to-reveal** on canvas: the `Rub` / `Scratch` classes keep an erase mask and
  reveal the content once about 45–55% has been rubbed away.
- **Scroll-driven scenes**: sticky stages whose progress (0 to 1) drives canvas drawing (arch
  fly-through, wreath of 12 roses, crown gems, split-worlds seam).
- **Sound**: synthesized live with Web Audio. There are no audio files (waltz / Twinkle Twinkle /
  chiptune + effects). Audio unlocks on the first tap, and there's a mute button.
  Yulia's page plays `assets/music.mp3` instead if you add one.
- **Particles** (`FX`): sparkles, hearts, crowns and pixel confetti on a fixed overlay canvas.
- Everything is drawn in code (roses, swans, castle, islands). Optional Veo videos go in
  `assets/`; see `GEMINI_PROMPTS.md`.

## Reference material
- `reference/inspiration/`: the original Instagram reel (@webgency_invitations) that inspired
  the style, plus frame contact sheets. **Local only**: it's someone else's work, so it's
  git-ignored and never pushed to the public repo. Backup copy: SD card `FlashCardML/invites-reference/`.
- `reference/screenshots/`: how each of our invites looked when first published.
- `reference/yulia-v1-guests-version.html`: the first version of Yulia's page, written for guests.

## Test in a phone-sized browser
```bash
cd tools && npm install
# args: url, screenshot-prefix, intro action ('#seal' | '#clasp' | 'hold'), sections to capture
node screenshot-flow.js file://$PWD/../michelle/index.html m '#clasp' '#hero:0.4,#procl,#crownSec:2.3'
pip install imageio-ffmpeg && python3 tile.py sheet.png m1.png m2.png m3.png
```
`screenshot-flow.js` expects Google Chrome at `/Applications/Google Chrome.app`.

## AI-rendered openings (Imagen + Veo → frame sequence)
`tools/ai/gen.py` renders a still with Imagen and animates it with Veo (prompts in `tools/ai/*.txt`).
`tools/ai/frames.sh clip.mp4 sting 96 720 [crop]` turns the clip into `sting/assets/frames/`, and the
Sting card plays those frames as she rubs (it falls back to the code-drawn fire when there are none).
The Google Cloud project `gen-lang-client-0972016419` returned 404 for Imagen on Vertex. Generating
needs either Vertex model access on a billed project, or a Gemini API key exported as `GEMINI_API_KEY`.
