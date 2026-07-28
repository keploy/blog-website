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
        .k5y-body { display: flex; align-items: center; gap: 20px; }
        .k5y-card { padding: 22px 28px; }
        .k5y-badge-wrap {
          position: relative;
          width: 84px;
          height: 85px;
          flex-shrink: 0;
          overflow: hidden;
          transform: translateY(-7px);
        }
        .k5y-badge-img {
          position: absolute;
          top: 50%;
          left: 50%;
          height: 124px;
          width: auto;
          max-width: none;
          transform: translate(-50%, -50%);
        }
        .k5y-divider { display: block; }
        .k5y-heading {
          color: #171412;
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 2px;
          line-height: 1.35;
        }
        .k5y-desc {
          color: #92400e;
          font-size: 13.5px;
          margin: 0;
          line-height: 1.65;
        }
        .k5y-cta-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 12px;
          background: linear-gradient(180deg, #ff9d2e 0%, #ff6b00 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
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
        @media (max-width: 600px) {
          .k5y-body { flex-direction: column; align-items: center; text-align: center; gap: 14px; }
          .k5y-badge-wrap { width: 150px; height: 155px; transform: none; margin: 0 auto; }
          .k5y-badge-img { height: 224px; }
          .k5y-divider { display: none; }
          .k5y-content { text-align: center; }
          .k5y-heading { font-size: 21px; margin: 0 0 8px; }
          .k5y-desc { font-size: 14px; line-height: 1.5; }
          .k5y-card { padding: 20px 18px; }
          .k5y-cta-btn {
            width: 100%;
            white-space: normal;
            padding: 15px 20px;
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
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
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
              "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.10) 50%, transparent 70%)",
            animation: "k5y-sweep 4.5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* Left: badge */}
        <div className="k5y-badge-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/keploy5years.png"
            alt="5 years of Keploy badge"
            className="k5y-badge-img"
          />
        </div>

        {/* Vertical divider */}
        <div
          className="k5y-divider"
          style={{
            width: 1.5,
            alignSelf: "stretch",
            flexShrink: 0,
            opacity: 0.35,
            background:
              "linear-gradient(to bottom, transparent, #fdba74 15%, #f97316 50%, #fdba74 85%, transparent)",
          }}
        />

        {/* Text */}
        <div className="k5y-content" style={{ flex: 1, minWidth: 0 }}>
          <p className="k5y-heading">Keploy Turns 5 This Month!</p>
          <p id={`${bannerId}-desc`} className="k5y-desc">
            To celebrate our 5 years, we&apos;re giving away
            <br />
            one month of Keploy credits for free.
          </p>
        </div>

        {/* CTA */}
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
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function InlinePromoCard({ promoId }: { promoId: InlinePromoId }) {
  if (promoId === "keploy-5years") return <Keploy5YearsBanner />;
  return null;
}
