"use client";

import { useId } from "react";
import type { InlinePromoId } from "../config/inline-promos";

// ─── Inline banner ─────────────────────────────────────────────────────────────

function Keploy5YearsBanner() {
  const bannerId = useId();

  return (
    <div className="my-8" style={{ width: "100%" }}>
      <style>{`
        @keyframes k5y-border {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes k5y-glow {
          0%, 100% { box-shadow: 0 2px 16px rgba(0,0,0,0.05), 0 0 0 0 rgba(251,146,60,0); }
          50%       { box-shadow: 0 2px 20px rgba(0,0,0,0.06), 0 0 18px 3px rgba(251,146,60,0.14); }
        }
        @keyframes k5y-sweep {
          0%        { transform: translateX(-120%) skewX(-12deg); }
          65%, 100% { transform: translateX(600%) skewX(-12deg); }
        }
        .k5y-body { display: flex; align-items: center; gap: 26px; }
        .k5y-badge-img { display: block; height: 76px; width: auto; flex-shrink: 0; }
        .k5y-divider { display: block; }
        .k5y-cta-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 22px;
          background: linear-gradient(135deg, #fb923c, #f97316);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(249,115,22,0.28);
          letter-spacing: 0.01em;
          cursor: pointer;
          white-space: nowrap;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
          font-family: inherit;
        }
        .k5y-cta-btn:hover {
          box-shadow: 0 6px 16px rgba(249,115,22,0.36);
          transform: translateY(-1px);
        }
        .k5y-cta-btn:focus-visible {
          outline: 3px solid #f59e0b;
          outline-offset: 2px;
        }
        @media (max-width: 600px) {
          .k5y-body { flex-direction: column; align-items: flex-start; gap: 16px; }
          .k5y-badge-img { height: 64px; }
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
            background:
              "radial-gradient(55% 100% at 0% 50%, rgba(251,146,60,0.16) 0%, rgba(253,186,116,0.07) 22%, rgba(255,255,255,0) 42%), " +
              "#ffffff",
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
                "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.10) 50%, transparent 70%)",
              animation: "k5y-sweep 4.5s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Left: badge */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/keploy5years.png"
            alt="5 years of Keploy badge"
            className="k5y-badge-img"
          />

          {/* Vertical divider */}
          <div
            className="k5y-divider"
            style={{
              width: 1.5,
              alignSelf: "stretch",
              flexShrink: 0,
              background:
                "linear-gradient(to bottom, transparent, #fdba74 15%, #f97316 50%, #fdba74 85%, transparent)",
            }}
          />

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#171412",
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 6px",
                lineHeight: 1.35,
              }}
            >
              keploy turned 5 this month!
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

          {/* CTA */}
          <a
            href="https://keploy.io/credits-form"
            target="_blank"
            rel="noopener noreferrer"
            className="k5y-cta-btn"
            aria-label="Claim your free 1 month of Keploy credits"
            aria-describedby={`${bannerId}-desc`}
          >
            claim free 1 month credits
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
