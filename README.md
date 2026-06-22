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

The hero canvas reads JPEG frames from `public/frames/frame_0001.jpg …` and the
count is set by `FRAME_COUNT` in `app/tokens.ts`.

On `dev`/`build` the project generates **120 placeholder frames** (a stylized
orbit → exploded-view of the watch) so the scrub works out of the box. The
generator **skips if `public/frames/` is already populated**, so it never
clobbers real frames. Force a regenerate with:

```bash
npm run frames       # node scripts/generate-frames.mjs --force (uses sharp)
```

To **deploy real frames** (e.g. on Vercel), commit them explicitly past the
gitignore: `git add -f public/frames public/hero.mp4`.

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
