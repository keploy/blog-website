import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SubscribeNewsletter from "./subscribe-newsletter";
import {
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* ── Share Section ── */
function SidebarShare() {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const currentURL = encodeURIComponent(
    `https://keploy.io${router.basePath + router.asPath}`
  );
  const twitterShare = `https://twitter.com/share?url=${currentURL}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${currentURL}`;
  const linkedinShare = `https://www.linkedin.com/shareArticle?url=${currentURL}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://keploy.io/blog${router.asPath}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const iconCls =
    "w-9 h-9 flex items-center justify-center rounded-full text-lg transition-transform duration-150 hover:scale-110 cursor-pointer";

  return (
    <div>
      <h3
        className="font-bold text-base mb-3"
        style={{ fontFamily: "'DM Sans', sans-serif", color: "#1D2022" }}
      >
        Share
      </h3>

      <div className="flex items-center gap-3">
        <Link
          href={twitterShare}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={iconCls}
          style={{ backgroundColor: "#000", color: "#fff" }}
        >
          <FaXTwitter />
        </Link>

        <Link
          href={facebookShare}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={iconCls}
          style={{ backgroundColor: "#1877F2", color: "#fff" }}
        >
          <FaFacebook />
        </Link>

        <Link
          href={linkedinShare}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={iconCls}
          style={{ backgroundColor: "#0A66C2", color: "#fff" }}
        >
          <FaLinkedin />
        </Link>

        {/* Copy link button */}
        <button
          onClick={copyLink}
          aria-label="Copy link"
          className={`${iconCls} border border-gray-300`}
          style={{ backgroundColor: "#fff", color: "#6b7280" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>

        {copied && (
          <span className="text-orange-500 text-xs font-medium whitespace-nowrap">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
}


// 4 static banner variants for A/B testing. The artwork is a full-card image
// (button excluded from the artwork); the "Try for Free!" button is built in
// code and overlaid in the empty bottom band, with per-variant button colors.
// The artwork PNGs carry ~8.3% transparent drop-shadow padding, so button
// positions are measured against the FULL image. btnCenter is the vertical
// center of each card's empty band (as % from the top); the button is anchored
// there via translateY(-50%) so it stays centered regardless of its height.
const AD_BANNERS = [
  { id: "banner_1", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/keploy-ad-banner-1.webp", btnBg: "#ffffff", btnText: "#ED5D0F", btnCenter: "77.8%" },
  { id: "banner_2", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/keploy-ad-banner-2.webp", btnBg: "#ED5D0F", btnText: "#ffffff", btnCenter: "81.6%" },
  { id: "banner_3", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/keploy-ad-banner-3.webp", btnBg: "#ED5D0F", btnText: "#ffffff", btnCenter: "82.0%" },
  { id: "banner_4", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/keploy-ad-banner-4.webp", btnBg: "#16324F", btnText: "#ffffff", btnCenter: "81.8%" },
];

const CTA_HREF = "https://app.keploy.io/signin";
// Aspect ratio of the banner artwork (width / height). Reserves space before
// the image loads so there's no layout shift — a plain <img> doesn't do this
// on its own. It's the shape only, not fixed pixel dimensions, so the banner
// stays fully fluid.
const AD_ASPECT = "313 / 413";
// Displayed max width. Shared by the placeholder and the live banner. Capped to
// match the sidebar column (max-w-[260px]) so the artwork never upscales.
const AD_MAX_W = 260;

// Microsoft Clarity is loaded lazily in components/layout.tsx (id="msclarity").
// Its snippet defines window.clarity as a queuing stub the moment it runs, so
// calls made after that are safely buffered until the real tag downloads. But
// because it's lazyOnload, a very early click can land before the stub exists —
// so we guard, and briefly retry if clarity isn't ready yet.
declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function trackBannerClick(bannerId: string) {
  // Visible in DevTools console so you can confirm clicks are detected.
  console.log("[ad-banner] click detected → banner_clicked:", bannerId);

  // Google Analytics (GA4) — loaded afterInteractive in components/layout.tsx.
  // gtag() buffers into dataLayer even before the library finishes, so a plain
  // optional-chained call is enough here; no retry needed (unlike Clarity).
  // Gives an exact per-banner click COUNT in GA4 (Realtime / DebugView, and in
  // reports once `banner_id` is registered as a custom dimension).
  window.gtag?.("event", "banner_click", { banner_id: bannerId });

  const send = () => window.clarity?.("set", "banner_clicked", bannerId);

  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    send();
    return;
  }

  // Clarity not ready yet (lazyOnload) — poll briefly, then give up.
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (typeof window !== "undefined" && typeof window.clarity === "function") {
      clearInterval(timer);
      send();
    } else if (tries >= 20) {
      clearInterval(timer); // ~5s elapsed; Clarity never loaded (blocked?)
      console.warn("[ad-banner] Clarity not available; skipped banner_clicked:", bannerId);
    }
  }, 250);
}

/* ── Ad / CTA Banner ── */
function SidebarAdBanner() {
  const [banner, setBanner] = React.useState<(typeof AD_BANNERS)[number] | null>(null);

  React.useEffect(() => {
    setBanner(AD_BANNERS[Math.floor(Math.random() * AD_BANNERS.length)]);
  }, []);

  if (!banner) {
    return (
      <div
        className="rounded-2xl"
        style={{ width: '100%', maxWidth: AD_MAX_W, margin: '0 auto', aspectRatio: AD_ASPECT, background: '#F3F4F6' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      data-banner-id={banner.id}
      onClick={() => trackBannerClick(banner.id)}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: AD_MAX_W,
        margin: '0 auto',
        // container-query context so the overlaid button scales with the card
        containerType: 'inline-size',
      }}
    >
      {/* Full banner artwork (button excluded from artwork). Plain <img> — no
          fixed width/height needed; the browser reads the intrinsic size and
          aspectRatio reserves space to avoid layout shift. Intentional over
          next/image: the artwork is already an optimized, small (~313px) .webp,
          so next/image's resizing adds little; this also matches the existing
          sidebar-banner convention (PR #350). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.src}
        alt="Keploy — 300M+ mocks and 12.8M+ tests generated"
        style={{ width: '100%', height: 'auto', aspectRatio: AD_ASPECT, display: 'block' }}
        loading="lazy"
      />

      {/* CTA button — built in code, overlaid in the artwork's empty bottom band */}
      <Link
        href={CTA_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Try for Free"
        className="block text-center font-bold transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
        style={{
          position: 'absolute',
          zIndex: 2,
          left: '13%',
          right: '13%',
          top: banner.btnCenter,
          transform: 'translateY(-50%)',
          // sized in cqw so the button scales with the card and always fits the band
          padding: '3.4cqw 0',
          borderRadius: '3.4cqw',
          fontSize: '5.8cqw',
          lineHeight: 1.2,
          background: banner.btnBg,
          color: banner.btnText,
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Try for Free!
      </Link>
    </div>
  );
}

/* ── Composed Sidebar ── */
export default function BlogSidebar() {
  return (
    <div className="w-full max-w-[260px] flex flex-col gap-5">
      {/* Share */}
      <SidebarShare />

      {/* Dashed divider */}
      <hr className="border-0 border-t-2 border-dashed border-gray-300" />

      {/* Ad banner */}
      <SidebarAdBanner />

      {/* Dashed divider */}
      <hr className="border-0 border-t-2 border-dashed border-gray-300" />

      {/* Newsletter + lead capture */}
      <SubscribeNewsletter />
    </div>
  );
}
