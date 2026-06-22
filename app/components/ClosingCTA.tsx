"use client";

import { motion } from "framer-motion";
import { tokens, labelStyle } from "../tokens";

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

export default function ClosingCTA() {
  return (
    <section
      style={{
        background: tokens.bg,
        padding: "clamp(6rem, 12vw, 11rem) clamp(1.5rem, 5vw, 5rem)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial glow behind button */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          bottom: "8%",
          width: "min(900px, 90vw)",
          height: "60%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse, rgba(200,169,110,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}
      >
        <motion.p variants={item} style={{ ...labelStyle, marginBottom: "1.5rem" }}>
          Yours to Command
        </motion.p>

        <motion.h2
          variants={item}
          style={{
            fontFamily: tokens.fontDisplay,
            fontWeight: 400,
            fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
            lineHeight: 1.1,
            color: tokens.textPrimary,
            marginBottom: "1.5rem",
          }}
        >
          A century of mastery.{" "}
          <span style={{ fontStyle: "italic", color: tokens.textBody }}>
            One expression of it.
          </span>
        </motion.h2>

        <motion.p
          variants={item}
          style={{
            fontFamily: tokens.fontBody,
            fontWeight: 300,
            fontSize: "1.05rem",
            lineHeight: 1.65,
            color: tokens.textBody,
            maxWidth: 480,
            margin: "0 auto 2.75rem",
          }}
        >
          The Day-Date is not acquired in passing. It is presented — at an official
          Rolex retailer, by hands trained to honour it.
        </motion.p>

        <motion.a
          variants={item}
          href="#"
          whileHover={{ y: -2 }}
          style={{
            display: "inline-block",
            background: tokens.accent,
            color: "#000",
            border: `1px solid ${tokens.accent}`,
            fontFamily: tokens.fontBody,
            fontWeight: 500,
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "0.9rem 2.6rem",
            transition: "background 0.3s ease, color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#000";
            e.currentTarget.style.color = tokens.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = tokens.accent;
            e.currentTarget.style.color = "#000";
          }}
        >
          Find an Authorised Retailer
        </motion.a>
      </motion.div>
    </section>
  );
}
