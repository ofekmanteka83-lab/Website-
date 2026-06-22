#!/usr/bin/env bash
# STEP 2 — EXTRACT VIDEO FRAMES
# Usage: ./scripts/extract-frames.sh path/to/hero.mp4
# Requires ffmpeg + ffprobe on PATH.
set -euo pipefail

SRC="${1:-hero.mp4}"

if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  echo "ffmpeg/ffprobe not found. Install ffmpeg first." >&2
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "Source video not found: $SRC" >&2
  exit 1
fi

echo "== ffprobe: $SRC =="
ffprobe -v error -select_streams v:0 \
  -show_entries stream=duration,r_frame_rate,nb_frames \
  -of default=noprint_wrappers=1 "$SRC"

rm -rf frames
mkdir -p frames

# Extract all frames at 24fps, 1920px wide, high-quality JPEG.
ffmpeg -hide_banner -i "$SRC" -vf "fps=24,scale=1920:-1" -q:v 3 \
  "frames/frame_%04d.jpg"

FRAME_COUNT=$(find frames -name 'frame_*.jpg' | wc -l | tr -d ' ')
echo "FRAME_COUNT=$FRAME_COUNT"

# Publish to /public so Next.js serves them.
rm -rf public/frames
mkdir -p public/frames
cp frames/*.jpg public/frames/
cp "$SRC" public/hero.mp4

echo "Copied $FRAME_COUNT frames to public/frames/ and $SRC to public/hero.mp4"
echo "Now set FRAME_COUNT = $FRAME_COUNT in app/tokens.ts"
