'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    // ── Skip entirely on touch / coarse-pointer devices ─────────────────────
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    mounted.current = true;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let scaleTarget  = 1,  scaleCurrent  = 1;
    let glowTarget   = 0,  glowCurrent   = 0;   // 0 = default, 1 = hover
    let visible = false;
    let rafId: number;

    // ── Show cursors only after first mouse move ──────────────────────────────
    const reveal = () => {
      if (!visible) {
        visible = true;
        if (dotRef.current)  dotRef.current.style.opacity  = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
    };

    // ── Track pointer ─────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      reveal();
    };

    // ── Hover detection via event delegation ─────────────────────────────────
    const isInteractive = (t: EventTarget | null) =>
      !!(t instanceof Element &&
         t.closest('a, button, input, label, [role="button"], [data-interactive]'));

    const onMouseOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) { scaleTarget = 1.5; glowTarget = 1; }
    };
    const onMouseOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) { scaleTarget = 1;   glowTarget = 0; }
    };

    // ── RAF loop ──────────────────────────────────────────────────────────────
    const tick = () => {
      if (!mounted.current) return;

      const dot  = dotRef.current;
      const ring = ringRef.current;

      // Dot: tracks precisely
      if (dot) {
        dot.style.left = `${mouseX}px`;
        dot.style.top  = `${mouseY}px`;
      }

      // Ring: lerp position
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      // Lerp scale + glow
      scaleCurrent += (scaleTarget  - scaleCurrent) * 0.14;
      glowCurrent  += (glowTarget   - glowCurrent)  * 0.12;

      if (ring) {
        ring.style.left      = `${ringX}px`;
        ring.style.top       = `${ringY}px`;
        ring.style.transform = `translate(-50%, -50%) scale(${scaleCurrent.toFixed(4)})`;

        // Interpolate glow: default ↔ hover
        const glowAlpha    = 0.14 + glowCurrent * 0.40;
        const borderAlpha  = 0.32 + glowCurrent * 0.45;
        const accentMix    = glowCurrent; // 0 = white, 1 = gold
        const r = Math.round(200 * accentMix + 255 * (1 - accentMix));
        const g = Math.round(169 * accentMix + 255 * (1 - accentMix));
        const b = Math.round(110 * accentMix + 255 * (1 - accentMix));

        ring.style.boxShadow   = `0 0 ${8 + glowCurrent * 10}px rgba(${r},${g},${b},${glowAlpha})`;
        ring.style.borderColor = `rgba(${r},${g},${b},${borderAlpha})`;
      }

      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout',  onMouseOut,  { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      mounted.current = false;
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout',  onMouseOut);
    };
  }, []);

  return (
    <>
      {/* ── Inner dot — precise tracker ─────────────────────────────────────── */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         '7px',
          height:        '7px',
          borderRadius:  '50%',
          background:    'rgba(245,245,245,0.92)',
          transform:     'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex:        99999,
          opacity:       0,
          boxShadow:     '0 0 6px rgba(255,255,255,0.5)',
          willChange:    'left, top',
          transition:    'opacity 0.4s ease',
        }}
      />

      {/* ── Outer ring — lagged, scales on hover ────────────────────────────── */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         '30px',
          height:        '30px',
          borderRadius:  '50%',
          border:        '1px solid rgba(255,255,255,0.32)',
          transform:     'translate(-50%, -50%) scale(1)',
          pointerEvents: 'none',
          zIndex:        99998,
          opacity:       0,
          boxShadow:     '0 0 8px rgba(255,255,255,0.14)',
          willChange:    'left, top, transform',
          transition:    'opacity 0.4s ease',   // only opacity via CSS; rest via RAF
        }}
      />
    </>
  );
}
