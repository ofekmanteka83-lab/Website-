// Build-time frame provider. Runs on `predev` / `prebuild`.
//
// Precedence:
//   1. If public/frames is already populated, do nothing (real frames committed,
//      or produced by a previous step / scripts/extract-frames.sh).
//   2. If a hero video source is available (HERO_VIDEO_URL env, or the `url`
//      field of hero-source.json), download it and extract frames with ffmpeg
//      at fps=24, 1920px wide — exactly the Step 2 pipeline. This runs on Vercel
//      where the network can reach the asset CDN.
//   3. Otherwise fall back to stylized placeholder frames.
//
// In every case a public/frames/manifest.json {count} is written so the client
// learns the frame count at runtime.

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const FRAMES_DIR = "public/frames";
const MANIFEST = path.join(FRAMES_DIR, "manifest.json");

function alreadyPopulated() {
  return existsSync(path.join(FRAMES_DIR, "frame_0001.jpg"));
}

function getSourceUrl() {
  if (process.env.HERO_VIDEO_URL) return process.env.HERO_VIDEO_URL.trim();
  if (existsSync("hero-source.json")) {
    try {
      const url = JSON.parse(readFileSync("hero-source.json", "utf8")).url;
      return url && String(url).trim() ? String(url).trim() : null;
    } catch {
      return null;
    }
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function extractFromVideo(url) {
  const ffmpegPath = (await import("ffmpeg-static")).default;
  if (!ffmpegPath) throw new Error("ffmpeg-static binary not found");

  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });
  mkdirSync("public", { recursive: true });

  const tmp = path.join(process.env.TMPDIR || "/tmp", "hero.mp4");
  console.log("[build-frames] downloading hero video…");
  await download(url, tmp);
  writeFileSync("public/hero.mp4", readFileSync(tmp));

  console.log("[build-frames] extracting frames with ffmpeg…");
  const r = spawnSync(
    ffmpegPath,
    [
      "-hide_banner",
      "-i",
      tmp,
      "-vf",
      "fps=24,scale=1920:-1",
      "-q:v",
      "3",
      path.join(FRAMES_DIR, "frame_%04d.jpg"),
    ],
    { stdio: "inherit" }
  );
  if (r.status !== 0) throw new Error("ffmpeg exited non-zero");

  const count = readdirSync(FRAMES_DIR).filter((f) =>
    f.endsWith(".jpg")
  ).length;
  if (count === 0) throw new Error("no frames produced");
  writeFileSync(MANIFEST, JSON.stringify({ count }));
  console.log(`[build-frames] extracted ${count} frames from video.`);
}

async function main() {
  if (alreadyPopulated()) {
    console.log("[build-frames] public/frames already populated — skipping.");
    return;
  }

  const url = getSourceUrl();
  if (url) {
    try {
      await extractFromVideo(url);
      return;
    } catch (e) {
      console.error(
        `[build-frames] video extraction failed (${e.message}); ` +
          "falling back to placeholder frames."
      );
    }
  }

  const { generatePlaceholders } = await import("./generate-frames.mjs");
  await generatePlaceholders({ force: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
