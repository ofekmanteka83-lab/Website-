"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { tokens, labelStyle, FRAME_COUNT } from "../tokens";

const framePath = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let cancelled = false;
    let cleanupResize = () => {};

    // Wire up the scrub once we know how many frames there are.
    const run = (frameCount: number) => {
      if (cancelled) return;

      const images: HTMLImageElement[] = new Array(frameCount);
      let currentIdx = -1;

      const isReady = (img?: HTMLImageElement) =>
        !!img && img.complete && img.naturalWidth > 0;

      // Fit: cover on landscape (full-bleed), contain on portrait so the whole
      // exploded composition stays visible. On black, contain's letterbox is
      // invisible.
      const draw = (idx: number) => {
        const img = images[idx];
        const dpr = window.devicePixelRatio || 1;
        const cw = canvas.width / dpr;
        const ch = canvas.height / dpr;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

        if (!isReady(img)) return;

        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const canvasAspect = cw / ch;
        const imgAspect = iw / ih;
        const scale =
          canvasAspect < imgAspect
            ? Math.min(cw / iw, ch / ih) // narrower than the frame → contain
            : Math.max(cw / iw, ch / ih); // wider/equal → cover

        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, dx, dy, dw, dh);
        currentIdx = idx;
      };

      const sizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      };

      sizeCanvas();

      // Preload all frames. Draw frame 0 as soon as it lands.
      let firstDrawn = false;
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = framePath(i);
        images[i] = img;
        if (i === 0) {
          img.onload = () => {
            if (!firstDrawn) {
              firstDrawn = true;
              draw(0);
            }
          };
        }
      }

      // rAF loop — no scroll event listener. A smoothed (eased) value trails the
      // raw scroll progress for a weighted, cinematic scrub.
      let displayed = -1;
      const tick = () => {
        const top = container.getBoundingClientRect().top;
        const scrollable = container.offsetHeight - window.innerHeight;
        const progress =
          scrollable > 0 ? clamp(-top / scrollable, 0, 1) : 0;

        if (displayed < 0) displayed = progress; // initialise without a jump
        displayed += (progress - displayed) * 0.1; // momentum / easing
        if (Math.abs(progress - displayed) < 0.0006) displayed = progress;

        const target = Math.round(displayed * (frameCount - 1));
        if (target !== currentIdx && isReady(images[target])) {
          draw(target);
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      const onResize = () => {
        sizeCanvas();
        if (currentIdx >= 0) draw(currentIdx);
        else if (firstDrawn) draw(0);
      };
      window.addEventListener("resize", onResize);
      window.addEventListener("orientationchange", onResize);
      cleanupResize = () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onResize);
      };
    };

    // Frame count comes from the build-time manifest; fall back to the constant.
    fetch("/frames/manifest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => run(m && m.count ? m.count : FRAME_COUNT))
      .catch(() => run(FRAME_COUNT));

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cleanupResize();
    };
  }, []);

  const fade = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.8 + i * 0.15, duration: 0.8, ease: "easeOut" },
    }),
  } as const;

  return (
    <div ref={containerRef} style={{ height: "400vh", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100svh",
          overflow: "hidden",
          background: tokens.bg,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />

        {/* Gradient + overlay content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding: "clamp(1.5rem, 5vw, 4.5rem)",
              paddingBottom: "max(clamp(1.5rem, 5vw, 4.5rem), env(safe-area-inset-bottom))",
              width: "100%",
              maxWidth: 760,
            }}
          >
            <motion.p
              custom={0}
              variants={fade}
              initial="hidden"
              animate="show"
              style={{ ...labelStyle, marginBottom: "1.25rem" }}
            >
              Est. 1905 · Geneva
            </motion.p>

            <motion.h1
              custom={1}
              variants={fade}
              initial="hidden"
              animate="show"
              style={{
                fontFamily: tokens.fontDisplay,
                fontWeight: 400,
                fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
                lineHeight: 1.05,
                color: tokens.textPrimary,
                marginBottom: "1.25rem",
              }}
            >
              Day-Date 40
            </motion.h1>

            <motion.p
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
              style={{
                fontFamily: tokens.fontBody,
                fontWeight: 300,
                fontSize: "clamp(0.95rem, 2.6vw, 1.05rem)",
                lineHeight: 1.6,
                color: tokens.textBody,
                maxWidth: 460,
                marginBottom: "2rem",
              }}
            >
              The watch worn by those who shape the world — cast entirely in 18 ct
              Everose gold, forged in our own foundry.
            </motion.p>

            <motion.a
              custom={3}
              variants={fade}
              initial="hidden"
              animate="show"
              href="#features"
              style={{
                display: "inline-block",
                background: tokens.accent,
                color: "#000",
                fontFamily: tokens.fontBody,
                fontWeight: 500,
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "0.9rem 2.6rem",
                pointerEvents: "auto",
              }}
            >
              Explore Collection
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
}
