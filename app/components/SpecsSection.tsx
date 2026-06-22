"use client";

import { motion } from "framer-motion";
import { tokens, labelStyle } from "../tokens";

const specs: [string, string][] = [
  ["Reference No.", "m228235"],
  ["Case Diameter", "40 mm"],
  ["Case Material", "18 ct Everose gold"],
  ["Movement", "Perpetual, mechanical, self-winding — Calibre 3255"],
  ["Power Reserve", "Approx. 70 hours"],
  ["Accuracy", "−2 / +2 sec per day, after casing"],
  ["Crystal", "Scratch-resistant sapphire, Cyclops lens over date"],
  ["Water Resistance", "Waterproof to 100 m (330 ft)"],
  ["Dial", "Chocolate sunburst with diamond-set hour markers"],
  ["Bracelet", "President, 18 ct Everose gold, Crownclasp"],
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

export default function SpecsSection() {
  return (
    <section
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
        style={{ maxWidth: 980, margin: "0 auto" }}
      >
        <motion.p variants={item} style={{ ...labelStyle, marginBottom: "1rem" }}>
          Technical Specifications
        </motion.p>
        <motion.h2
          variants={item}
          style={{
            fontFamily: tokens.fontDisplay,
            fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            color: tokens.textPrimary,
            marginBottom: "clamp(2.5rem, 5vw, 4rem)",
          }}
        >
          The architecture of precision.
        </motion.h2>

        <div>
          {specs.map(([label, value]) => (
            <motion.div
              key={label}
              variants={item}
              className="spec-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: "1.5rem",
                alignItems: "baseline",
                padding: "1.1rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span
                style={{
                  fontFamily: tokens.fontBody,
                  fontWeight: 400,
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: tokens.accent,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: tokens.fontBody,
                  fontWeight: 300,
                  fontSize: "1rem",
                  lineHeight: 1.5,
                  color: tokens.textBody,
                }}
              >
                {value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
