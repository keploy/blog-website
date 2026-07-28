import React, { useState } from "react";
import Head from "next/head";
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
// Aspect ratio (width / height) shared by all four banner artworks. Reserves
// the banner's vertical space before the image loads so nothing below it jumps
// (zero layout shift). It's the artwork's shape, not a fixed pixel size — the
// banner stays fully fluid (width:100%).
const AD_ASPECT = "313 / 413";

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
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setBanner(AD_BANNERS[Math.floor(Math.random() * AD_BANNERS.length)]);
  }, []);

  // The banner is picked on the client (avoids an SSR/client hydration
  // mismatch), so its image can only start downloading after hydration. The
  // container reserves the slot via aspectRatio and shows a skeleton shimmer
  // until the image decodes, then the artwork + button fade in — so the
  // unavoidable load reads as an intentional loading state, not a broken gap.
  return (
    <div
      data-banner-id={banner?.id}
      onClick={() => { if (banner) trackBannerClick(banner.id); }}
      className="rounded-2xl overflow-hidden"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: AD_ASPECT,
        // container-query context so the overlaid button scales with the card
        containerType: 'inline-size',
      }}
    >
      {/* Skeleton shown until the banner image has loaded (or errored). */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden="true" />
      )}

      {banner && (
        <>
          {/* Full banner artwork (button excluded from artwork). Fills the
              aspect-ratio slot and fades in once decoded. eager + high priority
              so it starts downloading as soon as it's picked. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.src}
            alt="Keploy — 300M+ mocks and 12.8M+ tests generated"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
            loading="eager"
            fetchPriority="high"
          />

          {/* CTA button — overlaid in the artwork's empty bottom band. Fades in
              with the artwork so it never floats over the bare skeleton. */}
          <Link
            href={CTA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Try for Free"
            className="block text-center font-bold transition-all duration-300 hover:brightness-95 active:scale-[0.98]"
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
              opacity: loaded ? 1 : 0,
            }}
          >
            Try for Free!
          </Link>
        </>
      )}
    </div>
  );
}

/* ── Composed Sidebar ── */
export default function BlogSidebar() {
  return (
    <>
      {/* Warm up the connection to the S3 origin that serves the ad banners so
          the image fetch starts without paying DNS/TLS latency. No crossOrigin
          — a plain <img> loads without CORS, so this must match to be reused. */}
      <Head>
        <link
          rel="preconnect"
          href="https://keploy-devrel.s3.us-west-2.amazonaws.com"
        />
      </Head>
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
    </>
  );
}
