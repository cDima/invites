# Gemini / Veo prompts for the Dmitry & Yulia site

The site already works without any video: the arch, swans, roses and petals are
drawn in code. These prompts are optional upgrades. Save the results into
`invite/assets/` with the exact filenames below and the page uses them automatically.

Use **Gemini → Video (Veo 3)** or **Google Flow**. Choose **9:16 portrait**, the
highest quality available, and **8 seconds**. Turn audio off, or ignore it (the
page plays videos muted).

---

## 1. `assets/hero.mp4`: the arch scene (looping background)

Replaces the drawn arch/lake/swans behind "Dmitry & Yulia". It loops, so ask for
almost no camera motion.

> A dreamy, romantic, hyper-detailed painterly scene in the style of a soft
> Renaissance oil painting, vertical 9:16. We look through a tall, ornate ivory
> Mughal-style carved stone arch with slender fluted columns and delicate floral
> relief carvings. Climbing roses in deep burgundy, blush pink and cream wind up
> both columns, and a garland of small white blossoms and trailing vines hangs
> from the top of the arch. Through the arch: Bass Lake near Yosemite at golden hour, a calm misty
> mountain lake ringed by tall Sierra pines, soft granite domes in the hazy distance, and warm peach and champagne
> light glowing at the horizon. In the lower centre of the frame, two white swans
> float facing each other, their necks forming a heart, with a soft reflection on
> the water. Gentle motion only: tiny ripples, rose petals slowly drifting down,
> dust motes floating in shafts of light, the swans gently bobbing. The camera is
> completely locked off, with no cuts, no zoom and no pan. Keep the upper-middle
> of the arch opening calm and uncluttered (text will be placed there). Warm
> cream, peach, blush and burgundy palette. Cinematic, shallow depth of field,
> 4K, fine detail. No people, no text, no letters, no watermark, no logos.

**Tip for a seamless loop:** in Flow, use *Extend* or generate twice with the same
seed, or ask: "the last frame should match the first frame exactly."

Optional still for fast loading: generate the same scene as an image with
**Gemini image (Nano Banana / Imagen)** using the prompt above, and save it as
`assets/hero.jpg` (1080×1920). It shows instantly while the video loads.

---

## 2. `assets/story.mp4`: the "Twelve Years" scroll video

This plays **frame by frame as guests scroll** behind the wreath of 12 roses
(dimmed to about 40%, so keep it dark and slow). One continuous, smooth camera
move works best for scroll-scrubbing.

> A slow, continuous, perfectly smooth cinematic dolly shot moving forward
> through a candle-lit rose garden at night, vertical 9:16. Deep burgundy and
> cocoa tones, warm golden candlelight, hundreds of small candles in glass
> holders along a path lined with dark red and blush roses. Bokeh sparkles,
> floating golden dust, soft mist. As the camera glides forward, the roses slowly
> open and bloom in gentle time-lapse. The shot ends on an elegant table for two
> with silk ribbons and champagne glasses glowing in the candlelight. One single
> take, with no cuts, no shake and no sudden motion. Hyper-detailed, romantic,
> luxurious, dark and moody, cinematic lighting, shallow depth of field, 4K. No
> people, no text, no watermark.

**Important: re-encode it for smooth scrubbing.** Browsers can only scrub video
smoothly when every frame is a keyframe. Run this once (needs `ffmpeg`,
`brew install ffmpeg`):

```bash
ffmpeg -i story-original.mp4 -vf "scale=720:-2" -c:v libx264 -g 1 -crf 23 -pix_fmt yuv420p -an -movflags +faststart assets/story.mp4
```

Do the same for the hero (without `-g 1`, since it just loops):

```bash
ffmpeg -i hero-original.mp4 -vf "scale=1080:-2" -c:v libx264 -crf 22 -pix_fmt yuv420p -an -movflags +faststart assets/hero.mp4
```

---

## Optional extra prompts (image, Nano Banana / Imagen)

**Wax seal close-up** (if you want a photographic seal instead of the drawn one):

> Macro product photo of a single round peach-blush wax seal with the monogram
> "D&Y" in elegant script pressed into it, soft irregular wax edges, subtle
> sheen, on a dark chocolate embossed paper envelope with tone-on-tone rose
> damask pattern, soft warm lighting, top-down view, transparent background.

**Gold engraved roses** (for a richer envelope pattern):

> Seamless tileable pattern of engraved gold foil roses, buds and leaves in a
> vintage damask style, metallic gold line art on a pure black background,
> hyper-detailed, luxurious, symmetrical sprigs, 2048×2048.

---

## Music: `assets/music.mp3` (optional)

The page already plays an original music-box waltz, generated live in the browser.
To use a real song instead (your wedding song is the most romantic choice), save it
as `assets/music.mp3` and it replaces the waltz automatically.

To generate one with **Gemini (Lyria music)**:

> A tender, romantic instrumental waltz in 3/4 time for a 12th wedding
> anniversary. A delicate music box and soft felt piano carry a gentle,
> nostalgic melody, with warm string pads and a light harp that swell gently in
> the middle. Candlelit, intimate and dreamy, in D major, about 76 BPM. It should
> loop seamlessly. No vocals, no drums.
