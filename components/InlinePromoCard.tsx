"use client";

import { useId } from "react";
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
  const descId = useId();
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
        .k5y-heading-mobile { display: none; }

        .k5y-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
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
        .k5y-cta-btn:focus-visible { outline: 3px solid #f76b1c; outline-offset: 2px; }
        .k5y-cta-icon { width: 18px; height: 18px; flex-shrink: 0; }

        @media (max-width: 850px) {
          .k5y-ellipse-tr, .k5y-ellipse-left, .k5y-ellipse-bottom { display: none; }
          .k5y-ellipse-tl-m { display: block; top: 0; left: 0; width: 54px; height: 96px; }
          .k5y-ellipse-top-m { display: block; top: 0; right: 46px; width: 61px; height: 28px; }
          .k5y-ellipse-right-m { display: block; top: 35px; right: 0; width: 41px; height: 166px; }
          .k5y-ellipse-bottom-m { display: block; left: 23px; bottom: 0; width: 53px; height: 33px; }

          .k5y-inner { text-align: center; padding: 0 16px 44px; }
          .k5y-badge-img { display: none; }
          .k5y-badge-img-mobile {
            display: block;
            position: static;
            width: 190px;
            height: auto;
            margin: 32px auto 16px;
          }

          .k5y-heading { font-size: 14px; font-weight: 800; line-height: 1.35; margin: 0 0 22px; }
          .k5y-heading-desktop { display: none; }
          .k5y-heading-mobile { display: block; }

          .k5y-cta-btn { padding: 5px 9px; font-size: 10px; gap: 3px; }
          .k5y-cta-icon { width: 10px; height: 10px; }
        }
      `}</style>

      <div className="k5y-card">
        {/* Decorative blobs — desktop */}
        {/* eslint-disable @next/next/no-img-element */}
        <img className="k5y-ellipse k5y-ellipse-tr" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-top-right.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={42} height={86} />
        <img className="k5y-ellipse k5y-ellipse-left" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-left-side.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={33} height={123} />
        <img className="k5y-ellipse k5y-ellipse-bottom" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-bottom.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={286} height={82} />
        {/* Decorative blobs — mobile */}
        <img className="k5y-ellipse k5y-ellipse-tl-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-top-left-mobile.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={54} height={96} />
        <img className="k5y-ellipse k5y-ellipse-top-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-mobile-top.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={61} height={28} />
        <img className="k5y-ellipse k5y-ellipse-right-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-right-mobile.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={41} height={166} />
        <img className="k5y-ellipse k5y-ellipse-bottom-m" src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-bottom-mobile.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={53} height={33} />

        <img
          className="k5y-badge-img"
          src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/badge.png"
          alt="Keploy 5 years anniversary badge"
          loading="lazy"
          decoding="async"
          width={337}
          height={337}
        />
        <img
          className="k5y-badge-img-mobile"
          src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/badge-tight.png"
          alt="Keploy 5 years anniversary badge"
          loading="lazy"
          decoding="async"
          width={190}
          height={180}
        />

        <div className="k5y-inner">
          <p className="k5y-heading k5y-heading-desktop">
            Celebrate with us
            <br />
            Get <span className="k5y-accent">1 Month</span> of FREE
            <br />
            <span className="k5y-accent">Keploy</span> Credits
          </p>
          <p className="k5y-heading k5y-heading-mobile">
            Celebrate with us
            <br />
            Get <span className="k5y-accent">1 Month</span> of FREE <span className="k5y-accent">Keploy</span> Credits
          </p>
          <p id={descId} className="sr-only">
            Celebrating 5 years of Keploy — claim one month of free credits.
          </p>

          <a
            href="https://keploy.io/credits-form"
            target="_blank"
            rel="noopener noreferrer"
            className="k5y-cta-btn"
            aria-label="Claim 1 month of free Keploy credits"
            aria-describedby={descId}
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
