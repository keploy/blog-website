"use client";

import Script from "next/script";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { InlinePromoId } from "../config/inline-promos";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

// ─── Lead capture modal ────────────────────────────────────────────────────────

function LeadModal({ onClose }: { onClose: () => void }) {
  const gradId = useId();
  const headingId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [countdown, setCountdown] = useState(10);

  // Scroll lock + ESC key + focus trap
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab") {
        const modal = backdropRef.current;
        if (!modal) return;
        const focusable = Array.from(modal.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    if (submitted) {
      confirmRef.current?.focus();
    } else {
      firstInputRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, submitted]);

  // After submit: tick countdown, then redirect + close
  useEffect(() => {
    if (!submitted) return;
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        const next = c - 1;
        if (next <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return Math.max(0, next);
      });
    }, 1000);
    const timer = setTimeout(() => {
      onClose();
      window.location.href = "https://app.keploy.io/signin";
    }, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timer);
    };
  }, [submitted, onClose]);

  // Backdrop click only dismisses when the form is still open
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!submitted && e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    const form = e.currentTarget;
    const getInput = (name: string): string => {
      const el = form.elements.namedItem(name);
      if (!(el instanceof HTMLInputElement)) throw new Error(`Missing input: ${name}`);
      return el.value.trim();
    };
    let data: Record<string, string>;
    try {
      data = {
        name: getInput("name"),
        email: getInput("email"),
        company: getInput("company"),
        designation: getInput("designation"),
        source: "inline-promo-5years",
        page: window.location.pathname,
      };
    } catch {
      setSubmitError("Form error. Please refresh and try again.");
      return;
    }

    if (!data.name) {
      setSubmitError("Full name is required.");
      return;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setSubmitError("A valid email address is required.");
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || !window.grecaptcha) {
      setSubmitError("Verification unavailable. Please try again.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await Promise.race([
        new Promise<string>((resolve, reject) => {
          window.grecaptcha.ready(() => {
            try {
              window.grecaptcha
                .execute(siteKey, { action: "submit_lead" })
                .then(resolve)
                .catch(reject);
            } catch (err) {
              reject(err);
            }
          });
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("reCAPTCHA timeout")), 10000)
        ),
      ]);
      data.recaptchaToken = token;
    } catch {
      setSubmitError("Verification failed. Please try again.");
      setSubmitting(false);
      return;
    }

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("https://telemetry.keploy.io/blog-mql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(fetchTimeout);
      const json: Record<string, string> = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      setSubmitted(true);
    } catch {
      clearTimeout(fetchTimeout);
      setSubmitError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        backgroundColor: "rgba(12, 6, 0, 0.58)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <style>{`
        @keyframes k5y-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes k5y-modal-border {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes k5y-circle-in {
          from { stroke-dashoffset: 214; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes k5y-check-in {
          from { stroke-dashoffset: 53; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes k5y-confirm-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .k5y-input {
          width: 100%;
          box-sizing: border-box;
          background: #fafaf9;
          border: 1.5px solid #e7e5e4;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          color: #1c1917;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          font-family: inherit;
        }
        .k5y-input::placeholder { color: #a8a29e; }
        .k5y-input:focus {
          background: #ffffff;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3.5px rgba(245,158,11,0.10);
        }
        @media (forced-colors: active) {
          .k5y-input:focus {
            outline: 3px solid ButtonText;
            outline-offset: 2px;
          }
        }
        .k5y-label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #57534e;
          margin-bottom: 7px;
        }
        .k5y-submit-btn {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(90deg, #f59e0b, #f97316);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(249,115,22,0.36);
          transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }
        .k5y-submit-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(249,115,22,0.44);
        }
        .k5y-submit-btn:active {
          transform: translateY(0);
          opacity: 1;
        }
        .k5y-submit-btn:focus-visible {
          outline: 3px solid #f59e0b;
          outline-offset: 2px;
        }
        .k5y-close-btn {
          background: rgba(245,244,242,0.9);
          border: 1.5px solid #e7e5e4;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #78716c;
          transition: background 0.15s ease, transform 0.15s ease;
          flex-shrink: 0;
          padding: 0;
          font-family: inherit;
        }
        .k5y-close-btn:hover {
          background: #f5f4f2;
          transform: scale(1.08);
        }
        .k5y-close-btn:focus-visible {
          outline: 3px solid #f59e0b;
          outline-offset: 2px;
        }
        @media (max-width: 440px) {
          .k5y-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Animated gradient border wrapping the modal */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #fbbf24, #f97316, #f59e0b, #fb923c, #fde68a, #f97316, #fbbf24)",
          backgroundSize: "400% 400%",
          animation: "k5y-modal-border 4.5s ease infinite",
          padding: "1.5px",
          borderRadius: 22,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 24px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(251,191,36,0.12)",
        }}
      >
        {/* Modal card */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          style={{
            background: "#ffffff",
            borderRadius: "calc(22px - 1.5px)",
            padding: "36px 36px 32px",
            position: "relative",
            animation: "k5y-modal-in 0.24s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Warm radial glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background:
                "radial-gradient(ellipse at 80% 0%, rgba(251,191,36,0.03) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {submitted ? (
            /* ── Confirmation screen ── */
            <div
              ref={confirmRef}
              tabIndex={-1}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "12px 0 8px",
                animation: "k5y-confirm-in 0.3s ease both",
                outline: "none",
              }}
            >
              {/* Animated checkmark */}
              <svg
                width="88"
                height="88"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: 24 }}
              >
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                {/* Outer glow ring */}
                <circle cx="40" cy="40" r="38" fill="rgba(34,197,94,0.08)" />
                {/* Animated circle stroke */}
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke={`url(#${gradId})`}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="214"
                  strokeDashoffset="214"
                  style={{
                    animation: "k5y-circle-in 0.55s cubic-bezier(0.4,0,0.2,1) 0.05s forwards",
                    transformOrigin: "center",
                    transform: "rotate(-90deg)",
                  }}
                />
                {/* Animated tick */}
                <path
                  d="M22 42 L34 54 L58 28"
                  stroke="#22c55e"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="53"
                  strokeDashoffset="53"
                  style={{
                    animation: "k5y-check-in 0.38s cubic-bezier(0.4,0,0.2,1) 0.52s forwards",
                  }}
                />
              </svg>

              {/* Heading */}
              <h2
                id={headingId}
                style={{
                  color: "#1c1917",
                  fontSize: 22,
                  fontWeight: 800,
                  margin: "0 0 10px",
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                You&apos;re all set! 🎉
              </h2>

              {/* Body */}
              <p
                style={{
                  color: "#78716c",
                  fontSize: 14,
                  margin: "0 0 28px",
                  lineHeight: 1.7,
                  maxWidth: 340,
                }}
              >
                Thanks for sharing your details. We&apos;ll get back to you
                with your free Keploy credits{" "}
                <strong style={{ color: "#44403c" }}>within 24 hours.</strong>
              </p>

              {/* Divider */}
              <div
                style={{
                  width: "100%",
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, #e5e7eb 30%, #e5e7eb 70%, transparent)",
                  marginBottom: 20,
                }}
              />

              {/* Countdown */}
              <p
                style={{
                  fontSize: 12,
                  color: "#a8a29e",
                  margin: "0 0 10px",
                  letterSpacing: "0.02em",
                }}
              >
                Redirecting you to Keploy in{" "}
                <strong style={{ color: "#f59e0b" }}>{countdown}s</strong>
                &hellip;
              </p>

              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: 3,
                  background: "#e7e5e4",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #f59e0b, #f97316)",
                    borderRadius: 2,
                    width: `${countdown * 10}%`,
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </div>
          ) : (
            /* ── Form screen ── */
            <>
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 28,
                  gap: 12,
                }}
              >
                <div>
                  {/* Badge */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "linear-gradient(90deg, #f59e0b, #f97316)",
                      borderRadius: 20,
                      padding: "3px 11px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    ✦ 5 Years Of Keploy
                  </span>

                  <h2
                    id={headingId}
                    style={{
                      color: "#1c1917",
                      fontSize: 21,
                      fontWeight: 800,
                      margin: 0,
                      lineHeight: 1.28,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Claim Your Free Keploy Credits!
                  </h2>

                  <p
                    style={{
                      color: "#78716c",
                      fontSize: 13.5,
                      margin: "8px 0 0",
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    One month of Keploy credits, on us. Fill in your details
                    and we&apos;ll get back to you with your free credits!
                  </p>
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="k5y-close-btn"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L13 13M13 1L1 13"
                      stroke="#78716c"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, #e5e7eb 30%, #e5e7eb 70%, transparent)",
                  marginBottom: 28,
                }}
              />

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  <div>
                    <label className="k5y-label" htmlFor="k5y-name">Full Name <span aria-hidden="true" style={{ color: "#f97316" }}>*</span></label>
                    <input
                      ref={firstInputRef}
                      id="k5y-name"
                      name="name"
                      type="text"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Enter Your Full Name"
                      className="k5y-input"
                    />
                  </div>

                  <div>
                    <label className="k5y-label" htmlFor="k5y-email">Work / Personal Email <span aria-hidden="true" style={{ color: "#f97316" }}>*</span></label>
                    <input
                      id="k5y-email"
                      name="email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      placeholder="your@email.com"
                      className="k5y-input"
                    />
                  </div>

                  <div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
                    className="k5y-two-col"
                  >
                    <div>
                      <label className="k5y-label" htmlFor="k5y-company">Company</label>
                      <input
                        id="k5y-company"
                        name="company"
                        type="text"
                        maxLength={100}
                        autoComplete="organization"
                        placeholder="Company Name"
                        className="k5y-input"
                      />
                    </div>

                    <div>
                      <label className="k5y-label" htmlFor="k5y-designation">Designation</label>
                      <input
                        id="k5y-designation"
                        name="designation"
                        type="text"
                        maxLength={100}
                        autoComplete="organization-title"
                        placeholder="Designation / Role"
                        className="k5y-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <button
                      type="submit"
                      className="k5y-submit-btn"
                      disabled={submitting}
                      style={{ opacity: submitting ? 0.7 : undefined, cursor: submitting ? "not-allowed" : undefined }}
                    >
                      {submitting ? "Submitting…" : "Get 1 Month of Keploy Credits For Free ✦"}
                    </button>

                    {submitError && (
                      <p role="alert" style={{
                        marginTop: 10,
                        fontSize: 12.5,
                        color: "#dc2626",
                        textAlign: "center",
                        lineHeight: 1.5,
                      }}>
                        {submitError}
                      </p>
                    )}

                    <p style={{ fontSize: 12, color: "#a8a29e", textAlign: "center", margin: "8px 0 0", lineHeight: 1.5 }}>
                      Protected by reCAPTCHA &mdash;{" "}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#a8a29e", textDecoration: "underline" }}>Privacy</a>
                      {" & "}
                      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#a8a29e", textDecoration: "underline" }}>Terms</a>
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Inline banner ─────────────────────────────────────────────────────────────

function Keploy5YearsBanner() {
  const bannerId = useId();
  const [modalOpen, setModalOpen] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const handleClose = useCallback(() => setModalOpen(false), []);

  if (!siteKey) return null;

  return (
    <div className="my-8" style={{ width: "100%" }}>
      {siteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="afterInteractive"
        />
      )}
      <style>{`
        .grecaptcha-badge { visibility: hidden; }
        @keyframes k5y-border {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes k5y-glow {
          0%, 100% { box-shadow: 0 2px 16px rgba(0,0,0,0.06), 0 0 0 0 rgba(251,176,45,0); }
          50%       { box-shadow: 0 2px 20px rgba(0,0,0,0.07), 0 0 20px 4px rgba(251,176,45,0.16); }
        }
        @keyframes k5y-sweep {
          0%        { transform: translateX(-120%) skewX(-12deg); }
          65%, 100% { transform: translateX(600%) skewX(-12deg); }
        }
        @keyframes k5y-sparkle {
          0%, 100% { opacity: 0.55; transform: scale(1) rotate(0deg); }
          50%       { opacity: 1;    transform: scale(1.25) rotate(18deg); }
        }
        .k5y-body { display: flex; align-items: center; gap: 24px; }
        .k5y-badge { display: flex; flex-direction: column; align-items: center; gap: 7px; }
        .k5y-divider { display: block; }
        .k5y-cta-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          background: linear-gradient(90deg, #f59e0b, #f97316);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 3px 14px rgba(249,115,22,0.32);
          letter-spacing: 0.02em;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.15s ease, transform 0.15s ease;
          font-family: inherit;
        }
        .k5y-cta-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .k5y-cta-btn:focus-visible {
          outline: 3px solid #f59e0b;
          outline-offset: 2px;
        }
        @media (max-width: 600px) {
          .k5y-body { flex-direction: column; align-items: flex-start; gap: 14px; }
          .k5y-badge { flex-direction: row; align-items: center; gap: 8px; }
          .k5y-divider { display: none; }
          .k5y-cta-btn { width: 100%; text-align: center; white-space: normal; }
        }
      `}</style>

      {/* Animated gradient border */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #fbbf24, #f97316, #f59e0b, #fb923c, #fde68a, #f97316, #fbbf24)",
          backgroundSize: "400% 400%",
          animation: "k5y-border 4.5s ease infinite, k5y-glow 3s ease-in-out infinite",
          padding: "1.5px",
          borderRadius: 16,
        }}
      >
        {/* Card body */}
        <div
          className="k5y-body"
          style={{
            background: "#fffcf7",
            borderRadius: "calc(16px - 1.5px)",
            padding: "22px 28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shine sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "25%",
              height: "100%",
              background:
                "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.06) 50%, transparent 70%)",
              animation: "k5y-sweep 4.5s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Left: sparkle + badge */}
          <div className="k5y-badge" style={{ flexShrink: 0 }}>
            <span
              style={{
                fontSize: 22,
                color: "#f59e0b",
                display: "inline-block",
                animation: "k5y-sparkle 2.5s ease-in-out infinite",
                lineHeight: 1,
              }}
            >
              ✦
            </span>
            <span
              style={{
                background: "linear-gradient(90deg, #f59e0b, #f97316)",
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.09em",
                textTransform: "uppercase" as const,
                whiteSpace: "nowrap" as const,
              }}
            >
              5 Years ✨
            </span>
          </div>

          {/* Vertical divider */}
          <div
            className="k5y-divider"
            style={{
              width: 1,
              alignSelf: "stretch",
              flexShrink: 0,
              background:
                "linear-gradient(to bottom, transparent, #fde68a 30%, #fed7aa 70%, transparent)",
            }}
          />

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#1c0f00",
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 6px",
                lineHeight: 1.35,
              }}
            >
              Keploy has completed its 5 years this month!
            </p>
            <p
              id={`${bannerId}-desc`}
              style={{
                color: "#92400e",
                fontSize: 13.5,
                margin: 0,
                lineHeight: 1.65,
              }}
            >
              To celebrate our 5 years, we are giving away one month of Keploy credits for free!
            </p>
          </div>

          {/* CTA — now opens modal instead of navigating */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="k5y-cta-btn"
            aria-label="Get 1 month of Keploy credits free"
            aria-describedby={`${bannerId}-desc`}
          >
            Get 1 Month Free
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <LeadModal onClose={handleClose} />}
    </div>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function InlinePromoCard({ promoId }: { promoId: InlinePromoId }) {
  if (promoId === "keploy-5years") return <Keploy5YearsBanner />;
  return null;
}
