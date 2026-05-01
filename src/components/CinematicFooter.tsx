'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ── Staggered fade-up helper ───────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  inView,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  inView: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function CinematicFooter() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        backgroundColor: '#050505',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14vh 6vw 6vh',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* ── Hairline top rule ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'absolute',
          top: 0,
          left: '8%',
          right: '8%',
          height: '1px',
          background: 'rgba(255,255,255,0.06)',
          transformOrigin: 'left center',
        }}
      />

      {/* ── Ambient glow (depth layer) ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70vw',
          height: '70vw',
          maxWidth: '900px',
          maxHeight: '900px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(200,169,110,0.055) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Watermark: "AISANCE" ───────────────────────────────────────────── */}
      {/* 7 chars × ~0.6em/char × 20vw ≈ 84vw — never clips edges           */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 2.4, ease: 'easeOut', delay: 0.08 }}
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -46%)',
          fontSize:      '20vw',
          fontWeight:    900,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          color:         'rgba(245,245,245,0.12)',
          fontFamily:    'var(--font-sans)',
          userSelect:    'none',
          pointerEvents: 'none',
          zIndex:        0,
          lineHeight:    1,
          whiteSpace:    'nowrap',
          // Gradient mask: fully visible top, fades to transparent at bottom
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
          maskImage:       'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
        }}
      >
        AISANCE
      </motion.div>

      {/* ── All foreground content ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', width: '100%' }}>

        {/* ── Eyebrow ─────────────────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.15}>
          <p
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              marginBottom: '4rem',
            }}
          >
            A Closing Thought
          </p>
        </FadeUp>

        {/* ── Main quote — line 1 ──────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.28}>
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1.9rem, 4.5vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'rgba(245,245,245,0.92)',
              textTransform: 'uppercase',
              marginBottom: '1.4rem',
            }}
          >
            The road doesn't change.
            <br />
            <span style={{ color: 'var(--accent)' }}>The experience does.</span>
          </h2>
        </FadeUp>

        {/* ── Divider dot ─────────────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.42}>
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              margin: '2.4rem auto',
            }}
          />
        </FadeUp>

        {/* ── Main quote — line 2 ──────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.52}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
              fontWeight: 300,
              color: 'rgba(245,245,245,0.55)',
              lineHeight: 1.75,
              letterSpacing: '0.01em',
              marginBottom: '5rem',
            }}
          >
            Are you still adapting to the road…
            <br />
            or ready to change it?
          </p>
        </FadeUp>

        {/* ── Horizontal rule ─────────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.62}>
          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'rgba(200,169,110,0.35)',
              margin: '0 auto 3.5rem',
            }}
          />
        </FadeUp>

        {/* ── Contact label ────────────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.72}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.58rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(245,245,245,0.3)',
              fontWeight: 400,
              marginBottom: '0.9rem',
            }}
          >
            Start the conversation
          </p>
        </FadeUp>

        {/* ── Email ────────────────────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.80}>
          <a
            href="mailto:experienceaisance@gmail.com"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.9rem, 2vw, 1.3rem)',
              fontWeight: 300,
              color: 'rgba(245,245,245,0.72)',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(200,169,110,0.3)',
              paddingBottom: '2px',
              transition: 'color 0.3s ease, border-color 0.3s ease',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(245,245,245,0.72)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,169,110,0.3)';
            }}
          >
            experienceaisance@gmail.com
          </a>
        </FadeUp>

        {/* ── Signature ────────────────────────────────────────────────────── */}
        <FadeUp inView={inView} delay={0.90}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(245,245,245,0.2)',
              fontWeight: 300,
              marginTop: '5rem',
              marginBottom: '2rem',
            }}
          >
            Designed for human comfort.
          </p>
        </FadeUp>
      </div>

      {/* ── Copyright — pinned to bottom ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.1 }}
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 5vw',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.25em',
            color: 'rgba(245,245,245,0.15)',
            textTransform: 'uppercase',
          }}
        >
          © 2026 AISANCE
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.25em',
            color: 'rgba(245,245,245,0.15)',
            textTransform: 'uppercase',
          }}
        >
          Cognitive Comfort Intelligence
        </span>
      </motion.div>
    </section>
  );
}
