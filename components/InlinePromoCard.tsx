"use client";

import type { InlinePromoId } from "../config/inline-promos";

// ─── Inline banner ─────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg
      className="k5y-cta-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M17 7H8M17 7V16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Keploy5YearsBanner() {
  return (
    <div className="my-8" style={{ width: "100%" }}>
      <style>{`
        .k5y-card {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          border-radius: 0;
        }
        .k5y-ellipse {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          display: block;
        }
        .k5y-ellipse-tr { top: 0; right: 0; width: 42px; height: 86px; }
        .k5y-ellipse-left { left: 0; top: 50%; width: 33px; height: 123px; transform: translateY(-50%); }
        .k5y-ellipse-bottom { right: 14px; bottom: 0; width: 286px; height: 82px; }
        .k5y-ellipse-tl-m,
        .k5y-ellipse-top-m,
        .k5y-ellipse-right-m,
        .k5y-ellipse-bottom-m {
          display: none;
        }

        .k5y-inner {
          position: relative;
          z-index: 1;
          padding: 44px 349px 44px 56px;
        }
        .k5y-badge-img {
          position: absolute;
          z-index: 1;
          top: -21px;
          right: -12px;
          width: 337px;
          height: 337px;
        }
        .k5y-badge-img-mobile { display: none; }

        .k5y-heading {
          font-family: "Lexend", sans-serif;
          font-weight: 700;
          font-size: 28px;
          line-height: 1.28;
          color: #000000;
          margin: 0 0 26px;
        }
        .k5y-accent { color: #f76b1c; }

        .k5y-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9.6px 18px;
          background: #f76b1c;
          color: #ffffff;
          border-radius: 9999px;
          border: none;
          font-family: "Lexend", sans-serif;
          font-weight: 500;
          font-size: 20px;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition: filter 200ms ease, transform 200ms ease;
        }
        .k5y-cta-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
        .k5y-cta-btn:active { transform: translateY(1px); }
        .k5y-cta-btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
        .k5y-cta-icon { width: 18px; height: 18px; flex-shrink: 0; }

        @media (max-width: 600px) {
          .k5y-ellipse-tr, .k5y-ellipse-left, .k5y-ellipse-bottom { display: none; }
          .k5y-ellipse-tl-m { display: block; top: 0; left: 0; width: 54px; height: 96px; }
          .k5y-ellipse-top-m { display: block; top: 0; right: 46px; width: 61px; height: 28px; }
          .k5y-ellipse-right-m { display: block; top: 35px; right: 0; width: 41px; height: 166px; }
          .k5y-ellipse-bottom-m { display: block; left: 23px; bottom: 0; width: 53px; height: 33px; }

          .k5y-inner { text-align: center; padding: 250px 16px 44px; }
          .k5y-badge-img { display: none; }
          .k5y-badge-img-mobile {
            display: block;
            position: absolute;
            top: 32px;
            left: 50%;
            width: 190px;
            height: auto;
            transform: translateX(-50%);
          }

          .k5y-heading { font-size: 15px; font-weight: 800; line-height: 1.35; margin: 0 0 22px; }
          .k5y-lb2 { display: none; }

          .k5y-cta-btn { padding: 4.8px 8.8px; font-size: 10px; gap: 3px; }
          .k5y-cta-icon { width: 10px; height: 10px; }
        }
      `}</style>

      <div className="k5y-card">
        {/* Decorative blobs — desktop */}
        {/* eslint-disable @next/next/no-img-element */}
        <img className="k5y-ellipse k5y-ellipse-tr" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-top-right.svg" alt="" aria-hidden="true" />
        <img className="k5y-ellipse k5y-ellipse-left" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-left-side.svg" alt="" aria-hidden="true" />
        <img className="k5y-ellipse k5y-ellipse-bottom" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-bottom.svg" alt="" aria-hidden="true" />
        {/* Decorative blobs — mobile */}
        <img className="k5y-ellipse k5y-ellipse-tl-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-top-left-mobile.svg" alt="" aria-hidden="true" />
        <img className="k5y-ellipse k5y-ellipse-top-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-mobile-top.svg" alt="" aria-hidden="true" />
        <img className="k5y-ellipse k5y-ellipse-right-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-right-mobile.svg" alt="" aria-hidden="true" />
        <img className="k5y-ellipse k5y-ellipse-bottom-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-bottom-mobile.svg" alt="" aria-hidden="true" />

        <img
          className="k5y-badge-img"
          src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/badge.png"
          alt="Keploy 5 years anniversary badge"
        />
        <img
          className="k5y-badge-img-mobile"
          src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/badge-tight.png"
          alt="Keploy 5 years anniversary badge"
        />

        <div className="k5y-inner">
          <p className="k5y-heading">
            Celebrate with us
            <br />
            Get <span className="k5y-accent">1 Month</span> of FREE
            <br className="k5y-lb2" />
            {" "}
            <span className="k5y-accent">Keploy</span> Credits
          </p>

          <a
            href="https://keploy.io/credits-form"
            target="_blank"
            rel="noopener noreferrer"
            className="k5y-cta-btn"
            aria-label="Claim 1 month of free Keploy credits"
          >
            Claim 1 Month of Free Credits
            <ArrowIcon />
          </a>
        </div>
        {/* eslint-enable @next/next/no-img-element */}
      </div>
    </div>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function InlinePromoCard({ promoId }: { promoId: InlinePromoId }) {
  if (promoId === "keploy-5years") return <Keploy5YearsBanner />;
  return null;
}
