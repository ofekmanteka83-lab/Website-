"use client";

import { motion } from "framer-motion";
import { tokens, labelStyle } from "../tokens";

type Feature = {
  title: string;
  copy: string;
  icon: React.ReactNode;
};

const stroke = { stroke: tokens.accent, strokeWidth: 1.25, fill: "none" };

const features: Feature[] = [
  {
    title: "Perpetual Movement",
    copy: "Calibre 3255 — a self-winding mechanical heart wound by the natural motion of the wrist, delivering uninterrupted precision.",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="11" {...stroke} />
        <path d="M16 9v7l5 3" {...stroke} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Everose Gold",
    copy: "An exclusive 18 ct pink gold alloy cast in Rolex's own foundry, engineered to retain its warm lustre for a lifetime.",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <path d="M8 12h16l-3 12H11z" {...stroke} strokeLinejoin="round" />
        <path d="M8 12l3-5h10l3 5" {...stroke} strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Oyster Waterproofing",
    copy: "A hermetically sealed Oyster case, screwed down like a submarine hatch, guards the movement against water and dust.",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="9" {...stroke} />
        <path
          d="M16 7v3M16 22v3M7 16h3M22 16h3"
          {...stroke}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "President Bracelet",
    copy: "Conceived in 1956 and reserved for the Day-Date, the semi-circular three-piece links flow with concealed Crownclasp security.",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <rect x="6" y="13" width="6" height="6" rx="1.5" {...stroke} />
        <rect x="13" y="13" width="6" height="6" rx="1.5" {...stroke} />
        <rect x="20" y="13" width="6" height="6" rx="1.5" {...stroke} />
      </svg>
    ),
  },
  {
    title: "Superlative Chronometer",
    copy: "Certified to a precision of −2/+2 seconds per day, redefining the chronometric standard well beyond official COSC testing.",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <path d="M6 20l5-6 4 4 5-8 6 7" {...stroke} strokeLinejoin="round" />
        <path d="M6 24h20" {...stroke} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Cyclops Date",
    copy: "A 2.5× sapphire lens magnifies the date at three o'clock — an unmistakable Rolex signature for instant legibility.",
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="14" cy="14" r="7" {...stroke} />
        <path d="M19 19l6 6" {...stroke} strokeLinecap="round" />
      </svg>
    ),
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0, 0, 1] as const },
  },
};

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        background: tokens.bg,
        padding: "clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 5rem)",
      }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <motion.p variants={item} style={{ ...labelStyle, marginBottom: "1rem" }}>
          Crafted Without Compromise
        </motion.p>
        <motion.h2
          variants={item}
          style={{
            fontFamily: tokens.fontDisplay,
            fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            color: tokens.textPrimary,
            maxWidth: 720,
            marginBottom: "clamp(2.5rem, 5vw, 4rem)",
          }}
        >
          Every detail, answerable to no one but time.
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "clamp(1.5rem, 3vw, 2.5rem)",
          }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              style={{
                borderTop: `1px solid ${tokens.borderSubtle}`,
                paddingTop: "1.75rem",
              }}
            >
              <div style={{ marginBottom: "1.25rem" }}>{f.icon}</div>
              <h3
                style={{
                  fontFamily: tokens.fontBody,
                  fontWeight: 500,
                  fontSize: "1.05rem",
                  letterSpacing: "0.02em",
                  color: tokens.textPrimary,
                  marginBottom: "0.6rem",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: tokens.fontBody,
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                  color: tokens.textBody,
                }}
              >
                {f.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
