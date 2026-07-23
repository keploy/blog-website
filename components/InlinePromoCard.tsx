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

          {/* CTA */}
          <a
            href="https://keploy.io/credits-form"
            target="_blank"
            rel="noopener noreferrer"
            className="k5y-cta-btn"
            aria-label="Get 1 month of Keploy credits free"
            aria-describedby={`${bannerId}-desc`}
          >
            Get 1 Month Free
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
