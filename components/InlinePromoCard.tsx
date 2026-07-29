"use client";

import { useId } from "react";
import type { InlinePromoId } from "../config/inline-promos";

// ─── Inline banner ─────────────────────────────────────────────────────────────

function Keploy5YearsBanner() {
  const bannerId = useId();

  return (
    <div className="my-8" style={{ width: "100%" }}>
      <style>{`
        @keyframes k5y-sweep {
          0%        { transform: translateX(-120%) skewX(-12deg); }
          65%, 100% { transform: translateX(600%) skewX(-12deg); }
        }
        /* Desktop: compact centered card, single vertical column (same shape as mobile, scaled up) */
        .k5y-body { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
        .k5y-card { max-width: 460px; margin: 0 auto; padding: 14px 36px; border-radius: 20px; }
        .k5y-badge-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .k5y-badge-glow {
          position: absolute;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,157,46,0.32) 0%, rgba(255,157,46,0) 70%);
          filter: blur(2px);
          pointer-events: none;
        }
        .k5y-badge-wrap {
          position: relative;
          width: 142px;
          height: 147px;
          overflow: hidden;
        }
        .k5y-badge-img {
          position: absolute;
          top: 50%;
          left: 50%;
          height: 211px;
          width: auto;
          max-width: none;
          transform: translate(-50%, -50%);
        }
        .k5y-content { text-align: center; }
        .k5y-heading {
          color: #171412;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -0.015em;
          margin: 0 0 8px;
          line-height: 1.2;
        }
        .k5y-desc {
          color: #7a3d0f;
          font-size: 14.5px;
          margin: 0;
          line-height: 1.4;
        }
        .k5y-cta-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          padding: 14px 32px;
          background: linear-gradient(180deg, #ff9d2e 0%, #ff6b00 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 5px 14px rgba(255,107,0,0.14);
          letter-spacing: 0.01em;
          cursor: pointer;
          white-space: nowrap;
          transition: box-shadow 200ms ease, transform 200ms ease, filter 200ms ease;
          font-family: inherit;
        }
        .k5y-cta-btn:hover {
          box-shadow: 0 6px 16px rgba(255,107,0,0.18);
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
        .k5y-cta-btn:active {
          transform: translateY(1px);
        }
        .k5y-cta-btn:focus-visible {
          outline: 3px solid #f59e0b;
          outline-offset: 2px;
        }
        /* Extremely subtle celebratory accents — tiny, low-opacity, corner-only */
        .k5y-sparkle {
          position: absolute;
          color: #fdba74;
          pointer-events: none;
          line-height: 1;
        }
        .k5y-sparkle-1 { top: 16px; right: 20px; font-size: 12px; opacity: 0.55; }
        .k5y-sparkle-2 { bottom: 18px; left: 18px; font-size: 9px; opacity: 0.4; }
        .k5y-confetti {
          position: absolute;
          border-radius: 50%;
          background: #fb923c;
          pointer-events: none;
        }
        .k5y-confetti-1 { top: 28px; left: 26px; width: 5px; height: 5px; opacity: 0.35; }
        .k5y-confetti-2 { bottom: 32px; right: 28px; width: 4px; height: 4px; opacity: 0.3; }
        /* Mobile: same vertical shape, scaled back down, full-width thumb-friendly button */
        @media (max-width: 600px) {
          .k5y-body { gap: 10px; }
          .k5y-card { max-width: 100%; padding: 16px; border-radius: 16px; }
          .k5y-badge-glow { width: 150px; height: 150px; }
          .k5y-badge-wrap { width: 115px; height: 118px; }
          .k5y-badge-img { height: 171px; }
          .k5y-heading { font-size: 20px; margin: 0 0 6px; }
          .k5y-desc { font-size: 13.5px; line-height: 1.4; }
          .k5y-cta-btn {
            width: 100%;
            white-space: normal;
            margin-top: 14px;
            padding: 14px 18px;
            border-radius: 16px;
            font-size: 15.5px;
          }
        }
      `}</style>

      {/* Card body */}
      <div
        className="k5y-body k5y-card"
        style={{
          background:
            "radial-gradient(85% 140% at 0% 45%, rgba(255,140,32,0.10) 0%, rgba(255,150,40,0.06) 20%, rgba(255,160,50,0.025) 38%, rgba(255,255,255,0) 64%), #ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 20px rgba(16,24,40,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Celebratory accents — tiny, subtle, corner-only */}
        <span className="k5y-sparkle k5y-sparkle-1" aria-hidden="true">✦</span>
        <span className="k5y-sparkle k5y-sparkle-2" aria-hidden="true">✦</span>
        <span className="k5y-confetti k5y-confetti-1" aria-hidden="true" />
        <span className="k5y-confetti k5y-confetti-2" aria-hidden="true" />

        {/* Shine sweep */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "25%",
            height: "100%",
            background:
              "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.10) 50%, transparent 70%)",
            animation: "k5y-sweep 3s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* Badge, with a soft warm glow behind it */}
        <div className="k5y-badge-stage">
          <div className="k5y-badge-glow" aria-hidden="true" />
          <div className="k5y-badge-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/keploy5years.png"
              alt="5 years of Keploy badge"
              className="k5y-badge-img"
            />
          </div>
        </div>

        {/* Text + CTA, grouped together as one section */}
        <div className="k5y-content" style={{ minWidth: 0 }}>
          <p className="k5y-heading">Keploy Turns 5 This Month!</p>
          <p id={`${bannerId}-desc`} className="k5y-desc">
            To celebrate our 5 years, we&apos;re giving away
            <br />
            one month of Keploy credits for free.
          </p>
          <a
            href="https://keploy.io/credits-form"
            target="_blank"
            rel="noopener noreferrer"
            className="k5y-cta-btn"
            aria-label="Claim 1 month of free Keploy credits"
            aria-describedby={`${bannerId}-desc`}
          >
            Claim 1 Month of Free Credits
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function InlinePromoCard({ promoId }: { promoId: InlinePromoId }) {
  if (promoId === "keploy-5years") return <Keploy5YearsBanner />;
  return null;
}
