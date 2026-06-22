# Rolex Day-Date 40 — Everose Gold

A scroll-driven luxury watch landing page. The hero is a **canvas frame-scrub**
(no `<video>`, no scroll listener — a `requestAnimationFrame` loop reading
`getBoundingClientRect`) that scrubs from the assembled watch to a full exploded
view as you scroll. Built with Next.js 15 (App Router), React 19, Framer Motion,
TypeScript.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

`predev`/`prebuild` automatically run `scripts/generate-frames.mjs`, so the hero
frames exist on a fresh clone with no extra steps. The frames themselves are
git-ignored (they're generated, and large) — see below to swap in a real video.

## The hero frames

The hero canvas reads JPEG frames from `public/frames/frame_0001.jpg …`. The
frame count is published at build time in `public/frames/manifest.json` and read
by the client at runtime (with `FRAME_COUNT` in `app/tokens.ts` as a fallback).

On `dev`/`build`, `scripts/build-frames.mjs` runs automatically and provides the
frames in this order of precedence:

1. **Already populated** — if `public/frames/` has frames, it does nothing.
2. **Real Higgsfield video** — if a hero video URL is available (the `url` field
   of `hero-source.json`, or the `HERO_VIDEO_URL` env var), it downloads the
   video and extracts frames with ffmpeg at `fps=24, scale=1920:-1` — the Step 2
   pipeline. This is what runs on Vercel, where the network can reach the asset
   CDN, so **production serves the real video frames**.
3. **Placeholder** — otherwise it generates a stylized orbit → exploded-view
   (`scripts/generate-frames.mjs`, uses sharp) so the scrub always works.

The generated assets (`public/frames/`, `public/hero.mp4`) are git-ignored — they
are produced at build time. Force-regenerate placeholders with `npm run frames`.

> Environments that block egress to the asset CDN (e.g. a locked-down sandbox)
> fall back to placeholders locally; the real frames still appear on Vercel.

### Using a real Higgsfield hero video

The intended pipeline (Steps 1–2 of the brief):

1. **Generate the assets in Higgsfield AI** — a base product image, an
   exploded-view reference image, then the hero video (orbit → mechanical
   deconstruction) on a pure black background. Save it as `hero.mp4`.
   > Note: this requires Higgsfield credits. The repo was built in an
   > environment with a 0-credit free account, so placeholder frames stand in
   > until you supply a real `hero.mp4`.
2. **Extract frames** (requires `ffmpeg`/`ffprobe`):

   ```bash
   ./scripts/extract-frames.sh hero.mp4
   ```

   This runs `ffprobe`, extracts frames at `fps=24, scale=1920:-1, -q:v 3` into
   `frames/`, copies them to `public/frames/`, copies `hero.mp4` to
   `public/hero.mp4`, and prints the frame count.
3. **Set `FRAME_COUNT`** in `app/tokens.ts` to the printed number.

## Structure

| File | Purpose |
| --- | --- |
| `app/layout.tsx` | Inter + Playfair Display fonts as CSS vars, page title |
| `app/globals.css` | Global reset, black background |
| `app/tokens.ts` | Design tokens + `FRAME_COUNT` |
| `app/components/ScrollHero.tsx` | Canvas frame-scrub hero + overlay |
| `app/components/FeaturesSection.tsx` | 6 feature cards |
| `app/components/SpecsSection.tsx` | Technical specifications table |
| `app/components/ClosingCTA.tsx` | Closing call to action |
| `app/page.tsx` | Composition |
| `scripts/extract-frames.sh` | ffmpeg frame extraction (real video) |
| `scripts/generate-frames.mjs` | Placeholder frame generator |

## Design tokens

Black `#000000` · text `#ffffff` / body `#E5E5E5` · accent (Everose gold)
`#C8A96E`, hover `#E8C98E` · dim `#888888` · subtle border
`rgba(200,169,110,0.2)`. Display font Playfair Display, body font Inter.
Fully responsive — grids collapse to a single column below 768px via
`auto-fill / minmax(300px, 1fr)`.
