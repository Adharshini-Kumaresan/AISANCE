'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Email validation ───────────────────────────────────────────────────────────
const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// ── Types ──────────────────────────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'success' | 'error';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset + focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setStatus('idle');
      setValidationError('');
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[Waitlist] Form submitted');

    const trimmed = email.trim();
    console.log('[Waitlist] Email value:', trimmed);

    // Client-side validation
    if (!trimmed) {
      setValidationError('Please enter your email.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setValidationError('Enter a valid email address.');
      return;
    }

    setValidationError('');
    setStatus('loading');
    console.log('[Waitlist] Validation passed — calling Firestore...');

    try {
      const docRef = await addDoc(collection(db, 'waitlist_emails'), {
        email: trimmed,
        timestamp: serverTimestamp(),
      });

      console.log('[Waitlist] ✅ Document written with ID:', docRef.id);
      setStatus('success');
    } catch (err) {
      console.error('[Waitlist] ❌ Firestore write failed:', err);
      setStatus('error');
    }
  };

  // Backdrop click closes modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          {/* ── Modal card ─────────────────────────────────────────── */}
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'relative',
              background: '#0a0a0a',
              border: '1px solid rgba(200,169,110,0.25)',
              borderRadius: '20px',
              padding: 'clamp(2rem, 5vw, 3.5rem)',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 0 80px rgba(200,169,110,0.06), 0 32px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Close ✕ */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.4rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(245,245,245,0.3)',
                fontSize: '1.1rem',
                lineHeight: 1,
                padding: '4px 8px',
                transition: 'color 0.2s ease',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,245,245,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,245,245,0.3)')}
            >
              ✕
            </button>

            {/* ── Success state ─────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ textAlign: 'center', padding: '1rem 0' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.05 }}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.8rem',
                      color: 'var(--accent)',
                      fontSize: '1.4rem',
                    }}
                  >
                    ✓
                  </motion.div>

                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    marginBottom: '0.8rem',
                  }}>
                    Confirmed
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: 'rgba(245,245,245,0.92)',
                    marginBottom: '0.8rem',
                  }}>
                    You&apos;re on the waitlist 🚀
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    fontWeight: 300,
                    color: 'rgba(245,245,245,0.45)',
                    lineHeight: 1.7,
                  }}>
                    We&apos;ll be in touch when AISANCE is ready.
                  </p>
                </motion.div>

              ) : (
                /* ── Form state ────────────────────────────────────── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Eyebrow */}
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.45em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    fontWeight: 400,
                    marginBottom: '1.2rem',
                  }}>
                    Early Access
                  </p>

                  {/* Headline */}
                  <h2 style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.05,
                    color: 'rgba(245,245,245,0.92)',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}>
                    Join the<br />Waitlist
                  </h2>

                  {/* Sub */}
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    fontWeight: 300,
                    color: 'rgba(245,245,245,0.42)',
                    lineHeight: 1.7,
                    marginBottom: '2rem',
                  }}>
                    Be first to experience AISANCE when we launch.
                  </p>

                  {/* ── Form ─────────────────────────────────────────── */}
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Email input */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <input
                        ref={inputRef}
                        type="email"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (validationError) setValidationError('');
                          if (status === 'error') setStatus('idle');
                        }}
                        placeholder="your@email.com"
                        disabled={status === 'loading'}
                        autoComplete="email"
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${validationError
                            ? 'rgba(220,80,80,0.6)'
                            : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '10px',
                          padding: '0.85rem 1.1rem',
                          color: 'rgba(245,245,245,0.9)',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = 'rgba(200,169,110,0.55)';
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = validationError
                            ? 'rgba(220,80,80,0.6)'
                            : 'rgba(255,255,255,0.1)';
                        }}
                      />
                      {validationError && (
                        <p style={{
                          fontSize: '0.72rem',
                          color: 'rgba(220,80,80,0.8)',
                          marginTop: '0.4rem',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                        }}>
                          {validationError}
                        </p>
                      )}
                    </div>

                    {/* Submit button */}
                    <SubmitButton status={status} />

                    {/* Error feedback */}
                    {status === 'error' && (
                      <p style={{
                        marginTop: '0.8rem',
                        fontSize: '0.75rem',
                        color: 'rgba(220,80,80,0.8)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        textAlign: 'center',
                      }}>
                        Something went wrong. Check the console and try again.
                      </p>
                    )}
                  </form>

                  {/* Privacy note */}
                  <p style={{
                    marginTop: '1.4rem',
                    fontSize: '0.58rem',
                    letterSpacing: '0.2em',
                    color: 'rgba(245,245,245,0.18)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}>
                    No spam. Unsubscribe anytime.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Submit button (isolated for hover state) ─────────────────────────────────
function SubmitButton({ status }: { status: Status }) {
  const [hovered, setHovered] = useState(false);
  const isLoading = status === 'loading';

  return (
    <button
      type="submit"
      disabled={isLoading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '0.9rem 1.5rem',
        background: hovered && !isLoading ? 'var(--accent)' : 'transparent',
        border: '1px solid var(--accent)',
        borderRadius: '10px',
        color: hovered && !isLoading ? '#050505' : 'var(--accent)',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-sans)',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.65 : 1,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
      }}
    >
      {isLoading ? (
        <>
          <span style={{
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            border: '1.5px solid rgba(200,169,110,0.3)',
            borderTopColor: 'var(--accent)',
            display: 'inline-block',
            animation: 'tfSpin 0.8s linear infinite',
            flexShrink: 0,
          }} />
          Joining…
        </>
      ) : 'Join Waitlist →'}
    </button>
  );
}
