// Placeholder frame generator.
//
// The real pipeline (Steps 1-2) is: generate hero.mp4 in Higgsfield, then run
// scripts/extract-frames.sh to populate public/frames/. Until you have that
// video, this script renders a stylized "orbit -> exploded view" of an Everose
// Day-Date so the scroll-scrub is fully functional as a live demo.
//
// Output: public/frames/frame_0001.jpg ... matching FRAME_COUNT in app/tokens.ts
//
// Requires: sharp (npm i -D sharp)

import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const W = 1600;
const H = 900;
const CX = W / 2;
const CY = H / 2;
const COUNT = 120;

const GOLD = "#C8A96E";
const GOLD_DARK = "#8a6f43";
const GOLD_HI = "#E8C98E";
const DIAL = "#3a2417";
const DIAL_HI = "#5a3a22";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Each component: base radius and its exploded vertical offset factor.
const parts = [
  { name: "bezel", r: 230, w: 18, color: GOLD_HI, off: -2.6 },
  { name: "crystal", r: 200, w: 6, color: "rgba(220,220,235,0.35)", off: -1.5 },
  { name: "dial", r: 192, w: 0, color: DIAL, off: -0.4, dial: true },
  { name: "movement", r: 150, w: 10, color: GOLD, off: 0.7, gears: true },
  { name: "case", r: 215, w: 26, color: GOLD_DARK, off: 1.8 },
  { name: "caseback", r: 196, w: 14, color: GOLD, off: 3.0 },
];

function ellipse(cx, cy, rx, ry, opts = {}) {
  const { fill = "none", stroke = "none", sw = 0, dash = "" } = opts;
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(
    1
  )}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${
    dash ? `stroke-dasharray="${dash}"` : ""
  }/>`;
}

function frameSVG(i) {
  const p = i / (COUNT - 1); // 0..1
  const orbit = easeInOut(clamp(p / 0.5, 0, 1)); // 0->1 over first half
  const explode = easeInOut(clamp((p - 0.5) / 0.5, 0, 1)); // 0->1 over second half
  const persp = 0.62 + 0.38 * orbit; // flatten to front-on by mid
  const handAngle = -90 + orbit * 40 + explode * 220; // sweeping hands

  let body = "";

  for (const part of parts) {
    const oy = CY + part.off * 90 * explode;
    const rx = part.r;
    const ry = part.r * persp;

    if (part.dial) {
      // chocolate sunburst dial
      body += ellipse(CX, oy, rx, ry, { fill: DIAL });
      for (let a = 0; a < 360; a += 12) {
        const rad = (a * Math.PI) / 180;
        const x1 = CX + Math.cos(rad) * rx * 0.12;
        const y1 = oy + Math.sin(rad) * ry * 0.12;
        const x2 = CX + Math.cos(rad) * rx * 0.96;
        const y2 = oy + Math.sin(rad) * ry * 0.96;
        body += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(
          1
        )}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(
          1
        )}" stroke="${DIAL_HI}" stroke-width="1.4" opacity="0.5"/>`;
      }
      // hour markers
      for (let h = 0; h < 12; h++) {
        const rad = (h * 30 * Math.PI) / 180;
        const x = CX + Math.cos(rad) * rx * 0.82;
        const y = oy + Math.sin(rad) * ry * 0.82;
        body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(
          1
        )}" r="5" fill="${GOLD_HI}"/>`;
      }
      // hands (only meaningful when dial is in place / early)
      const hr = (handAngle * Math.PI) / 180;
      const mr = ((handAngle + 130) * Math.PI) / 180;
      const handFade = 1 - explode * 0.85;
      body += `<line x1="${CX}" y1="${oy}" x2="${(
        CX +
        Math.cos(hr) * rx * 0.5
      ).toFixed(1)}" y2="${(oy + Math.sin(hr) * ry * 0.5).toFixed(
        1
      )}" stroke="${GOLD_HI}" stroke-width="6" stroke-linecap="round" opacity="${handFade.toFixed(
        2
      )}"/>`;
      body += `<line x1="${CX}" y1="${oy}" x2="${(
        CX +
        Math.cos(mr) * rx * 0.72
      ).toFixed(1)}" y2="${(oy + Math.sin(mr) * ry * 0.72).toFixed(
        1
      )}" stroke="${GOLD_HI}" stroke-width="4" stroke-linecap="round" opacity="${handFade.toFixed(
        2
      )}"/>`;
      // date cyclops at 3 o'clock
      body += `<rect x="${(CX + rx * 0.58).toFixed(1)}" y="${(
        oy -
        12
      ).toFixed(
        1
      )}" width="34" height="24" rx="3" fill="#111" stroke="${GOLD}" stroke-width="1.5"/>`;
      continue;
    }

    if (part.gears) {
      body += ellipse(CX, oy, rx, ry, {
        fill: "none",
        stroke: part.color,
        sw: part.w,
      });
      // rotor + gear hints
      const ga = (handAngle * 2 * Math.PI) / 180;
      body += `<path d="M ${CX} ${oy} L ${(CX + Math.cos(ga) * rx * 0.9).toFixed(
        1
      )} ${(oy + Math.sin(ga) * ry * 0.9).toFixed(1)} A ${rx * 0.9} ${(
        ry * 0.9
      ).toFixed(1)} 0 0 1 ${(CX + Math.cos(ga + 1.6) * rx * 0.9).toFixed(1)} ${(
        oy +
        Math.sin(ga + 1.6) * ry * 0.9
      ).toFixed(1)} Z" fill="${GOLD_DARK}" opacity="0.55"/>`;
      for (let g = 0; g < 6; g++) {
        const rad = (g * 60 * Math.PI) / 180;
        body += `<circle cx="${(CX + Math.cos(rad) * rx * 0.55).toFixed(
          1
        )}" cy="${(oy + Math.sin(rad) * ry * 0.55).toFixed(
          1
        )}" r="14" fill="none" stroke="${GOLD_HI}" stroke-width="2" opacity="0.6"/>`;
      }
      continue;
    }

    // generic ring component
    body += ellipse(CX, oy, rx, ry, {
      fill: part.name === "case" || part.name === "caseback" ? "#15100a" : "none",
      stroke: part.color,
      sw: part.w,
    });
    if (part.name === "case") {
      // crown at 3 o'clock
      body += `<rect x="${(CX + rx - 4).toFixed(1)}" y="${(oy - 14).toFixed(
        1
      )}" width="${(18 + 26 * explode).toFixed(
        1
      )}" height="28" rx="4" fill="${GOLD}" stroke="${GOLD_DARK}" stroke-width="1.5"/>`;
    }
  }

  // bracelet links, fanning out on explode, top & bottom
  const linkFade = 1;
  for (let s = -1; s <= 1; s += 2) {
    for (let l = 0; l < 4; l++) {
      const baseY = CY + s * (250 * persp + l * 46);
      const ey = baseY + s * l * 60 * explode;
      const lw = 150 - l * 18;
      body += `<rect x="${(CX - lw / 2).toFixed(1)}" y="${(ey - 16).toFixed(
        1
      )}" width="${lw}" height="30" rx="14" fill="none" stroke="${GOLD}" stroke-width="6" opacity="${linkFade}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="70%">
        <stop offset="0%" stop-color="#0a0805"/>
        <stop offset="60%" stop-color="#000000"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g>${body}</g>
  </svg>`;
}

async function main() {
  const force = process.argv.includes("--force");
  // If frames already exist (e.g. real Higgsfield frames from extract-frames.sh,
  // or a previous run), don't clobber them. Use `npm run frames` to force.
  if (!force && existsSync("public/frames/frame_0001.jpg")) {
    console.log(
      "public/frames already populated — skipping placeholder generation. " +
        "Run `npm run frames` to force-regenerate."
    );
    return;
  }

  await rm("public/frames", { recursive: true, force: true });
  await mkdir("public/frames", { recursive: true });

  for (let i = 0; i < COUNT; i++) {
    const svg = frameSVG(i);
    const name = `public/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toFile(name);
  }
  console.log(`Generated ${COUNT} placeholder frames in public/frames/`);
  console.log(`Make sure FRAME_COUNT = ${COUNT} in app/tokens.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
