'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Widget } from '@typeform/embed-react';

export default function TypeformSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);

  const sectionInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const formInView    = useInView(formWrapRef, { once: true, margin: '-40px' });

  const [ready, setReady] = useState(false);

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: '#050505',
        width: '100%',
        padding: '130px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* ── Hairline separator ──────────────────────── */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={sectionInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'rgba(255,255,255,0.06)',
          transformOrigin: 'left center',
        }}
      />

      {/* ── Header copy ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={sectionInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
        style={{ textAlign: 'center', marginBottom: '64px', maxWidth: '600px' }}
      >
        <p
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 400,
            marginBottom: '1.4rem',
            fontFamily: 'var(--font-sans)',
          }}
        >
          05 — Field Intelligence
        </p>

        <h2
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: 'rgba(245,245,245,0.90)',
            textTransform: 'uppercase',
            marginBottom: '1.4rem',
            fontFamily: 'var(--font-sans)',
          }}
        >
          How does the road
          <br />
          feel to you?
        </h2>

        <p
          style={{
            fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
            fontWeight: 300,
            color: 'rgba(245,245,245,0.50)',
            letterSpacing: '0.02em',
            lineHeight: 1.75,
            fontFamily: 'var(--font-sans)',
          }}
        >
          Your comfort is data.
          <br />
          Help us understand real-world ride experience.
        </p>
      </motion.div>

      {/* ── Typeform Widget container ────────────────── */}
      <motion.div
        ref={formWrapRef}
        initial={{ opacity: 0, y: 20 }}
        animate={sectionInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.18 }}
        style={{
          width: '100%',
          maxWidth: '1060px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.015)',
          position: 'relative',
          /* No overflow:hidden — let Widget dictate its own scroll */
        }}
      >
        {/* Spinner until Widget signals ready */}
        {!ready && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#050505',
              zIndex: 2,
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid rgba(200,169,110,0.3)',
              borderTopColor: 'var(--accent)',
              animation: 'tfSpin 0.9s linear infinite',
            }} />
          </div>
        )}

        {/*
          @typeform/embed-react Widget:
          - Renders natively at the correct resolution — no zoom/crop issues.
          - `height` prop controls the widget box height in px.
          - `opacity + onReady` fade in only once Typeform signals it's painted.
        */}
        {formInView && (
          <Widget
            id="jY9OOqn6"
            style={{
              width: '100%',
              height: '680px',
              borderRadius: '16px',
              opacity: ready ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
            onReady={() => setReady(true)}
          />
        )}
      </motion.div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes tfSpin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          /* Widget height on mobile via direct style override */
          [data-tf-widget] { height: 580px !important; }
        }
      `}</style>

      {/* Footnote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={sectionInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.45 }}
        style={{
          marginTop: '2.5rem',
          fontSize: '0.6rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(245,245,245,0.18)',
          fontFamily: 'var(--font-sans)',
          textAlign: 'center',
        }}
      >
        Your responses are anonymous and help train the AISANCE intelligence model.
      </motion.p>
    </section>
  );
}
