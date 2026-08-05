import { useId } from "react";
import type { InlinePromoId } from "../config/inline-promos";
import styles from "./InlinePromoCard.module.css";

// ─── Inline banner ─────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg
      className={styles["k5y-cta-icon"]}
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
      <div className={styles["k5y-card"]}>
        {/* Decorative blobs — desktop */}
        {/* eslint-disable @next/next/no-img-element */}
        <img className={`${styles["k5y-ellipse"]} ${styles["k5y-ellipse-tr"]}`} src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-top-right.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={42} height={86} />
        <img className={`${styles["k5y-ellipse"]} ${styles["k5y-ellipse-left"]}`} src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-left-side.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={33} height={123} />
        <img className={`${styles["k5y-ellipse"]} ${styles["k5y-ellipse-bottom"]}`} src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-bottom.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={286} height={82} />
        {/* Decorative blobs — mobile */}
        <img className={`${styles["k5y-ellipse"]} ${styles["k5y-ellipse-tl-m"]}`} src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-top-left-mobile.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={54} height={96} />
        <img className={`${styles["k5y-ellipse"]} ${styles["k5y-ellipse-top-m"]}`} src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-mobile-top.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={61} height={28} />
        <img className={`${styles["k5y-ellipse"]} ${styles["k5y-ellipse-right-m"]}`} src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-right-mobile.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={41} height={166} />
        <img className={`${styles["k5y-ellipse"]} ${styles["k5y-ellipse-bottom-m"]}`} src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/ellipse-bottom-mobile.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width={53} height={33} />

        <img
          className={styles["k5y-badge-img"]}
          src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/badge.png"
          alt="Keploy 5 years anniversary badge"
          loading="eager"
          decoding="async"
          width={337}
          height={337}
        />
        <img
          className={styles["k5y-badge-img-mobile"]}
          src="https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/5years/badge-tight.png"
          alt="Keploy 5 years anniversary badge"
          loading="eager"
          decoding="async"
          width={190}
          height={180}
        />

        <div className={styles["k5y-inner"]}>
          <p className={`${styles["k5y-heading"]} ${styles["k5y-heading-desktop"]}`}>
            Celebrate with us
            <br />
            Get <span className={styles["k5y-accent-gradient"]}>1 Month of FREE</span>
            <br />
            Keploy Credits
          </p>
          <p className={`${styles["k5y-heading"]} ${styles["k5y-heading-mobile"]}`}>
            Celebrate with us
            <br />
            Get <span className={styles["k5y-accent-gradient"]}>1 Month of FREE</span> Keploy Credits
          </p>
          <p id={descId} className="sr-only">
            Celebrating 5 years of Keploy - claim one month of free credits.
          </p>

          <a
            href="https://keploy.io/credits-form"
            target="_blank"
            rel="noopener noreferrer"
            className={styles["k5y-cta-btn"]}
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
