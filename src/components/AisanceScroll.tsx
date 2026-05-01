'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import WaitlistModal from '@/components/WaitlistModal';

// ─── Constants ───────────────────────────────────────────────────────────────
const FRAME_COUNT = 240;
const FRAME_PATH = (i: number) => `/sequence/frame_${String(i).padStart(3, '0')}.png`;

// Story beats mapped to scroll progress
const BEATS = [
  {
    id: 'a',
    start: 0,
    end: 0.22,
    label: '01 — Reactive',
    title: 'THE ROAD\nIS NEVER\nSMOOTH',
    subtitle: 'But every vehicle treats it the same.',
    phase: 'red',
  },
  {
    id: 'b',
    start: 0.25,
    end: 0.47,
    label: '02 — Failure',
    title: 'REACTIVE\nSYSTEMS\nFAIL',
    subtitle: 'They respond only after the discomfort hits.',
    phase: 'red',
  },
  {
    id: 'c',
    start: 0.50,
    end: 0.70,
    label: '03 — Intelligence',
    title: 'AISANCE\nPREDICTS',
    subtitle: 'Using real-time sensing, learning, and anticipation.',
    phase: 'gold',
  },
  {
    id: 'd',
    start: 0.75,
    end: 0.96,
    label: '04 — Redefined',
    title: 'COMFORT.\nREDEFINED.',
    subtitle: 'Not absorbed. Anticipated.',
    phase: 'white',
    cta: true,
  },
];

// ─── Loader Component ─────────────────────────────────────────────────────────
interface LoaderProps {
  progress: number;
  onComplete: () => void;
}

function Loader({ progress, onComplete }: LoaderProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !exiting) {
      const t = setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 700);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [progress, exiting, onComplete]);

  return (
    <motion.div
      className="loader-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="loader-logo">AISANCE</div>

      <div className="loader-bar-track">
        <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="loader-percent">
        {String(Math.round(progress)).padStart(3, '0')}%
      </div>
    </motion.div>
  );
}

// ─── Beat Text Component ──────────────────────────────────────────────────────
interface BeatTextProps {
  beat: typeof BEATS[number];
  scrollProgress: number;
  onOpenWaitlist: () => void;
}

function BeatText({ beat, scrollProgress, onOpenWaitlist }: BeatTextProps) {
  const range = beat.end - beat.start;
  const pad = range * 0.12;

  const opacity = (() => {
    const p = scrollProgress;
    if (p < beat.start) return 0;
    if (p < beat.start + pad) return (p - beat.start) / pad;
    if (p < beat.end - pad) return 1;
    if (p < beat.end) return (beat.end - p) / pad;
    return 0;
  })();

  const yOffset = (() => {
    const p = scrollProgress;
    if (p < beat.start) return 20;
    if (p < beat.start + pad) {
      const t = (p - beat.start) / pad;
      return 20 * (1 - t);
    }
    if (p < beat.end - pad) return 0;
    if (p < beat.end) {
      const t = (p - (beat.end - pad)) / pad;
      return -20 * t;
    }
    return -20;
  })();

  const phaseColor = beat.phase === 'red'
    ? '#e55' : beat.phase === 'gold'
    ? 'var(--accent)' : 'var(--white)';

  const titleLines = beat.title.split('\n');

  return (
    <div
      className="beat-container"
      style={{ opacity, transform: `translateY(${yOffset}px)`, transition: 'none' }}
    >
      <div className="beat-label" style={{ color: phaseColor }}>
        {beat.label}
      </div>

      <h2 className="beat-title">
        {titleLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{line}</span>
        ))}
      </h2>

      <p className="beat-subtitle">{beat.subtitle}</p>

      {beat.cta && (
        <motion.div
          style={{ marginTop: '2.5rem', opacity }}
          initial={{ opacity: 0, y: 10 }}
        >
          <button
            onClick={onOpenWaitlist}
            className="cta-button"
            style={{ cursor: 'pointer', background: 'none' }}
          >
            Join the Waitlist
            <span className="cta-arrow">→</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Phase Dots ───────────────────────────────────────────────────────────────
function PhaseDots({ scrollProgress }: { scrollProgress: number }) {
  const phases = [
    { threshold: 0.0, color: '#e55', label: 'Reactive' },
    { threshold: 0.5, color: 'var(--accent)', label: 'Transition' },
    { threshold: 0.75, color: 'var(--white)', label: 'Control' },
  ];

  const active = phases.reduce((acc, p, i) => (scrollProgress >= p.threshold ? i : acc), 0);

  return (
    <div className="phase-indicator">
      {phases.map((p, i) => (
        <div
          key={i}
          className="phase-dot"
          style={{
            backgroundColor: i <= active ? p.color : 'rgba(255,255,255,0.15)',
            transform: i === active ? 'scale(1.5)' : 'scale(1)',
            boxShadow: i === active ? `0 0 8px ${p.color}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ─── Vibration Overlay ────────────────────────────────────────────────────────
function VibrationOverlay({ scrollProgress }: { scrollProgress: number }) {
  // Shake intensity: max at ~0.15, fully gone by 0.55
  const raw = scrollProgress < 0.15
    ? 1
    : scrollProgress < 0.55
    ? 1 - (scrollProgress - 0.15) / 0.4
    : 0;

  const intensity = Math.max(0, Math.min(1, raw));
  const [shake, setShake] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (intensity <= 0) {
      setShake({ x: 0, y: 0 });
      return;
    }
    const interval = setInterval(() => {
      const mag = intensity * 8;
      setShake({
        x: (Math.random() - 0.5) * mag,
        y: (Math.random() - 0.5) * mag * 0.5,
      });
    }, 60);
    return () => clearInterval(interval);
  }, [intensity]);

  if (intensity <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${shake.x}px, ${shake.y}px)`,
        pointerEvents: 'none',
        zIndex: 5,
        boxShadow: `inset 0 0 ${intensity * 80}px rgba(220, 50, 50, ${intensity * 0.08})`,
        transition: 'box-shadow 0.3s ease',
      }}
    />
  );
}

// ─── Canvas Renderer ──────────────────────────────────────────────────────────
function CanvasRenderer({
  images,
  frameIndex,
}: {
  images: HTMLImageElement[];
  frameIndex: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = images[frameIndex];
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    canvas.width = cw;
    canvas.height = ch;

    // contain scaling
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, [images, frameIndex]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const observer = new ResizeObserver(draw);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ─── Main AisanceScroll Component ─────────────────────────────────────────────
export default function AisanceScroll() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // ─── Preload frames ───────────────────────────────
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    let loadedCount = 0;

    const onSettled = (allImgs: HTMLImageElement[]) => {
      loadedCount++;
      setLoadProgress((loadedCount / FRAME_COUNT) * 100);
      if (loadedCount === FRAME_COUNT) {
        setImages(allImgs);
      }
    };

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => onSettled(imgs);
      img.onerror = () => onSettled(imgs);
      imgs.push(img);
    }
  }, []);

  // ─── Map scroll → frame ───────────────────────────
  useEffect(() => {
    const unsub = smoothProgress.on('change', (v) => {
      const clamped = Math.max(0, Math.min(1, v));
      setScrollProgress(clamped);
      const idx = Math.min(
        FRAME_COUNT - 1,
        Math.floor(clamped * FRAME_COUNT)
      );
      setFrameIndex(idx);
    });
    return unsub;
  }, [smoothProgress]);

  const [showContent, setShowContent] = useState(false);
  const isFullyLoaded = images.length === FRAME_COUNT;

  return (
    <>
      {/* Waitlist modal */}
      <WaitlistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Loader */}
      <AnimatePresence>
        {!showContent && (
          <Loader
            progress={isFullyLoaded ? 100 : loadProgress}
            onComplete={() => setShowContent(true)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {/* ─── Hero ──────────────────────────────── */}
        <section className="hero-section">
          <div
            className="glow-orb"
            style={{
              width: 600,
              height: 600,
              background: 'var(--accent)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: '0s',
            }}
          />

          <motion.p
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Cognitive Comfort Intelligence
          </motion.p>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span>AISANCE</span>
          </motion.h1>

          <motion.div
            className="hero-line"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            Intelligence over reaction. Prediction over comfort.
            <br />The road never changes — only the system does.
          </motion.p>

          {/* Scroll cue */}
          <motion.div
            className="scroll-cue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <div className="scroll-cue-text">Scroll to Experience</div>
            <div className="scroll-cue-line" />
          </motion.div>
        </section>

        {/* ─── Scrolly Canvas ────────────────────── */}
        <section
          ref={sectionRef}
          className="canvas-section"
          id="experience"
        >
          <div className="canvas-sticky">
            {/* Canvas frame renderer */}
            {images.length > 0 && (
              <CanvasRenderer images={images} frameIndex={frameIndex} />
            )}

            {/* Vibration shake overlay */}
            <VibrationOverlay scrollProgress={scrollProgress} />

            {/* Phase dots (top right) */}
            <PhaseDots scrollProgress={scrollProgress} />

            {/* Beat text layers */}
            {BEATS.map((beat) => (
              <BeatText
                key={beat.id}
                beat={beat}
                scrollProgress={scrollProgress}
                onOpenWaitlist={() => setModalOpen(true)}
              />
            ))}

            {/* Gradient vignettes */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `
                  radial-gradient(ellipse 60% 40% at 50% 100%, rgba(5,5,5,0.6) 0%, transparent 100%),
                  radial-gradient(ellipse 80% 20% at 50% 0%, rgba(5,5,5,0.4) 0%, transparent 100%)
                `,
                zIndex: 4,
              }}
            />
          </div>
        </section>

        {/* ─── Outro / CTA ───────────────────────── */}
        <section className="outro-section" id="explore">
          <div
            className="glow-orb"
            style={{
              width: 500,
              height: 500,
              background: 'var(--accent)',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: '1s',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <p className="hero-eyebrow" style={{ marginBottom: '2rem' }}>
              04 — The System
            </p>

            <h2 className="outro-title">
              Not a suspension.
              <br />
              <span style={{ color: 'var(--accent)' }}>A cognitive layer.</span>
            </h2>

            <p className="outro-sub">
              AISANCE senses road inputs, predicts discomfort, and
              adapts before impact — transforming every journey into
              pure, engineered calm.
            </p>

            <button
              onClick={() => setModalOpen(true)}
              className="cta-button"
              style={{ cursor: 'pointer', background: 'none' }}
            >
              Join the Waitlist
              <span className="cta-arrow">→</span>
            </button>

            {/* ── Concept triptych ─────────────────────────────────────── */}
            <motion.div
              className="stat-grid"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* You */}
              <div className="stat-item">
                <div
                  style={{
                    fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'rgba(245,245,245,0.92)',
                    lineHeight: 1,
                    marginBottom: '0.6rem',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  You
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,245,245,0.38)',
                    fontWeight: 400,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Human-centered comfort
                </div>
              </div>

              {/* The Road */}
              <div className="stat-item">
                <div
                  style={{
                    fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'rgba(245,245,245,0.92)',
                    lineHeight: 1,
                    marginBottom: '0.6rem',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  The Road
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,245,245,0.38)',
                    fontWeight: 400,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Real-time sensing
                </div>
              </div>

              {/* The System */}
              <div className="stat-item">
                <div
                  style={{
                    fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'rgba(245,245,245,0.92)',
                    lineHeight: 1,
                    marginBottom: '0.6rem',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  The System
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,245,245,0.38)',
                    fontWeight: 400,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Intelligent adaptation
                </div>
              </div>
            </motion.div>

            {/* ── Alignment tagline ─────────────────────────────────────── */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                marginTop: '2rem',
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)',
                fontWeight: 300,
                color: 'rgba(245,245,245,0.38)',
                letterSpacing: '0.04em',
                lineHeight: 1.7,
                textAlign: 'center',
              }}
            >
              You. The road. The system.
              <br />
              <span style={{ color: 'rgba(245,245,245,0.65)' }}>
                AISANCE aligns all three.
              </span>
            </motion.p>
          </motion.div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '3rem',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 5vw',
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
            }}
          >
            <span>© 2024 AISANCE</span>
            <span>Cognitive Comfort Intelligence Platform</span>
          </div>
        </section>
      </motion.div>
    </>
  );
}
