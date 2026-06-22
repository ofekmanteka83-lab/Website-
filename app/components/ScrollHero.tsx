"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { tokens, labelStyle, FRAME_COUNT } from "../tokens";

const framePath = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Headline copy keyed to the scroll stage: assembled → deconstructing → exploded.
const phases = [
  {
    label: "Est. 1905 · Geneva",
    title: "Day-Date 40",
    body: "The watch worn by those who shape the world — cast entirely in 18 ct Everose gold, forged in our own foundry.",
  },
  {
    label: "Anatomy of a Legend",
    title: "Engineered to the core.",
    body: "Beneath the chocolate dial turns the Calibre 3255 — a Chronergy escapement and seventy hours of autonomy, set in motion by the wrist alone.",
  },
  {
    label: "Exploded · Calibre 3255",
    title: "Every part, perfected.",
    body: "Hundreds of components, each finished by hand, suspended in perfect equilibrium. This is mastery, taken apart.",
  },
];

const phaseFor = (p: number) => (p < 0.45 ? 0 : p < 0.8 ? 1 : 2);

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [phase, setPhase] = useState(0);
  const [atStart, setAtStart] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let cancelled = false;
    let cleanupResize = () => {};
    let lastPhase = 0;
    let lastAtStart = true;

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

        let dw: number, dh: number, dx: number, dy: number;
        if (canvasAspect < 1) {
          // Portrait (mobile): map the FULL frame height into the upper region
          // and crop only the empty black sides. The watch sits high and large,
          // every exploded part stays visible, and the lower area is left clear
          // for the headline.
          const topFraction = 0.58;
          dh = ch * topFraction;
          const scale = dh / ih;
          dw = iw * scale;
          dx = (cw - dw) / 2;
          dy = ch * 0.05;
        } else {
          // Landscape (desktop/tablet): cover, full-bleed.
          const scale = Math.max(cw / iw, ch / ih);
          dw = iw * scale;
          dh = ih * scale;
          dx = (cw - dw) / 2;
          dy = (ch - dh) / 2;
        }

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

      // rAF loop — no scroll event listener. Eased value trails raw progress.
      let displayed = -1;
      const tick = () => {
        const top = container.getBoundingClientRect().top;
        const scrollable = container.offsetHeight - window.innerHeight;
        const progress = scrollable > 0 ? clamp(-top / scrollable, 0, 1) : 0;

        if (displayed < 0) displayed = progress;
        displayed += (progress - displayed) * 0.1;
        if (Math.abs(progress - displayed) < 0.0006) displayed = progress;

        const target = Math.round(displayed * (frameCount - 1));
        if (target !== currentIdx && isReady(images[target])) draw(target);

        // Surface stage + scroll-hint visibility to React only on change.
        const nextPhase = phaseFor(progress);
        if (nextPhase !== lastPhase) {
          lastPhase = nextPhase;
          setPhase(nextPhase);
        }
        const nextAtStart = progress < 0.02;
        if (nextAtStart !== lastAtStart) {
          lastAtStart = nextAtStart;
          setAtStart(nextAtStart);
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

  const active = phases[phase];

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
              paddingBottom:
                "max(clamp(1.5rem, 5vw, 4.5rem), env(safe-area-inset-bottom))",
              width: "100%",
              maxWidth: 760,
            }}
          >
            {/* Phased headline — crossfades as the watch deconstructs. */}
            <div
              style={{
                minHeight: "clamp(9rem, 20vh, 14rem)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
                >
                  <p style={{ ...labelStyle, marginBottom: "1.25rem" }}>
                    {active.label}
                  </p>
                  <h1
                    style={{
                      fontFamily: tokens.fontDisplay,
                      fontWeight: 400,
                      fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
                      lineHeight: 1.05,
                      color: tokens.textPrimary,
                      marginBottom: "1.25rem",
                    }}
                  >
                    {active.title}
                  </h1>
                  <p
                    style={{
                      fontFamily: tokens.fontBody,
                      fontWeight: 300,
                      fontSize: "clamp(0.95rem, 2.6vw, 1.05rem)",
                      lineHeight: 1.6,
                      color: tokens.textBody,
                      maxWidth: 460,
                    }}
                  >
                    {active.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.a
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
              href="#features"
              style={{
                display: "inline-block",
                marginTop: "2rem",
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

        {/* Scroll hint — fades out the moment scrolling begins. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: atStart ? 0.9 : 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: atStart ? 1.4 : 0 }}
          aria-hidden
          style={{
            position: "absolute",
            bottom: "calc(env(safe-area-inset-bottom) + 1.4rem)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.7rem",
            pointerEvents: "none",
          }}
        >
          <span style={{ ...labelStyle, fontSize: "0.58rem" }}>Scroll</span>
          <div
            style={{
              position: "relative",
              width: 1,
              height: 48,
              background:
                "linear-gradient(to bottom, rgba(200,169,110,0.55), rgba(200,169,110,0))",
            }}
          >
            <motion.div
              animate={{ y: [0, 40], opacity: [0, 1, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: -2,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: tokens.accent,
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
