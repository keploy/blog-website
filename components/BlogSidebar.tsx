import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SubscribeNewsletter from "./subscribe-newsletter";
import {
  AD_BANNERS,
  pickBannerForPage,
  hasFiredImpression,
  claimImpression,
} from "../lib/banner-rotation";
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
        style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: "#1D2022" }}
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

// AD_BANNERS + the per-page banner pick and one-impression-per-page latch live
// in lib/banner-rotation.ts — shared so the two sidebar instances (desktop +
// sub-1440 copy) agree on one banner and don't double-count on a resize across
// the 1440px breakpoint. Each artwork is an edge-to-edge card with an empty
// bottom band; the CTA is built in code and overlaid there (per-variant colors).
// btnCenter = that band's vertical center (% from the top).

const CTA_HREF = "https://app.keploy.io/signin";
// Shared artwork shape (not a fixed size) — reserves space to avoid layout shift.
const AD_ASPECT = "260 / 360";

// Clarity (lazyOnload) + GA (afterInteractive) are set up in components/layout.tsx.
declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const READY_POLL_MS = 250;
// Clicks: a human decision precedes them, so gtag (afterInteractive) / clarity
// (lazyOnload) have long loaded. ~5s is plenty.
const CLICK_READY_TRIES = 20;
// Impressions: fire on scroll-into-view with no user action, so on a wide
// desktop the banner can be in view within the first seconds — racing Clarity's
// lazyOnload on a slow connection. Give up much later than clicks so impressions
// aren't dropped while clicks aren't; a one-sided drop would inflate CTR. This
// is safe to run long because the poller is aborted on unmount (see the effect).
const IMPRESSION_READY_TRIES = 80; // ~20s

// Clarity (lazyOnload) and GA (afterInteractive) may be undefined on an early
// call, so run each once its global exists — poll, then give up after maxTries.
// Pass a signal to drop the poller on unmount (impressions fire before the user
// acts, so their poller can outlive the component; aborting avoids firing after
// an SPA nav, which would attribute the event to the next page).
function whenReady(
  get: () => unknown,
  use: () => void,
  opts: { signal?: AbortSignal; maxTries?: number } = {},
) {
  const { signal, maxTries = CLICK_READY_TRIES } = opts;
  if (typeof window === "undefined" || signal?.aborted) return;
  if (typeof get() === "function") { use(); return; }
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (signal?.aborted) {
      clearInterval(timer);
    } else if (typeof get() === "function") {
      clearInterval(timer);
      use();
    } else if (tries >= maxTries) {
      clearInterval(timer); // script never loaded (blocked?)
    }
  }, READY_POLL_MS);
  signal?.addEventListener("abort", () => clearInterval(timer), { once: true });
}

function trackBannerClick(bannerId: string) {
  whenReady(() => window.gtag, () => window.gtag!("event", "banner_click", { banner_id: bannerId }));
  whenReady(() => window.clarity, () => window.clarity!("set", "banner_clicked", bannerId));
}

function trackBannerImpression(bannerId: string, signal?: AbortSignal) {
  const opts = { signal, maxTries: IMPRESSION_READY_TRIES };
  whenReady(() => window.gtag, () => window.gtag!("event", "banner_impression", { banner_id: bannerId }), opts);
  whenReady(() => window.clarity, () => window.clarity!("set", "banner_shown", bannerId), opts);
}

/* ── Ad / CTA Banner ── */
function SidebarAdBanner() {
  const router = useRouter();
  const [banner, setBanner] = React.useState<(typeof AD_BANNERS)[number] | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Key on the path WITHOUT the #fragment. A TOC click uses history.replaceState
  // directly (TableContents/post-body), so asPath only picks up the hash on a
  // later back/forward popstate — and nothing about the banner depends on the
  // fragment. Keying on the hash would re-pick the banner and re-arm the
  // impression latch, firing a second impression for the same page view.
  const pagePath = router.asPath.split("#")[0];

  // Pick from shared state keyed by page: both sidebar instances get the same
  // banner, and a SPA nav to another post re-picks + re-arms the impression.
  React.useEffect(() => {
    setBanner(pickBannerForPage(pagePath));
  }, [pagePath]);

  // Reset the paint gate whenever the artwork changes. Today the whole post
  // subtree remounts on every SPA nav (_app.tsx swaps <Component/> for
  // <PageLoader/> on routeChangeStart), so loaded/errored already start false —
  // but that couples this component's correctness to a distant ancestor. Reset
  // here so the gate stays correct on its own: otherwise a stale loaded=true
  // could let the impression fire before the new artwork paints, and a stuck
  // errored=true could pin the fallback card. Keyed on src (not banner) so
  // re-picking the same banner keeps an already-painted image marked loaded.
  React.useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [banner?.src]);

  // Count a viewable impression once the picked banner scrolls ≥50% into view,
  // a single time per page view, so clicks / impressions gives a real CTR. We
  // gate on (loaded || errored) so it counts only when the artwork (or the
  // fallback card) has actually painted — a slow/blocked banner showing just the
  // skeleton shouldn't count toward the denominator.
  // `loaded`/`errored` are deps so the observer re-attaches once the artwork
  // paints, and to the swapped-in fallback card (different DOM node, same ref).
  React.useEffect(() => {
    if (!banner || hasFiredImpression() || !(loaded || errored)) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Abort any pending analytics-ready poller if we unmount (e.g. SPA nav)
    // before gtag/clarity load, so the event never fires against the next page.
    const ac = new AbortController();
    const io = new IntersectionObserver((entries) => {
      // claimImpression() latches shared across both instances and returns true
      // exactly once per page view, so only the first-seen banner is counted.
      if (entries.some((e) => e.isIntersecting) && claimImpression()) {
        trackBannerImpression(banner.id, ac.signal);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); ac.abort(); };
  }, [banner, loaded, errored]);

  // Text fallback so the ad slot is never blank if the artwork fails to load
  // (content blocker, S3 hiccup, etc.). Keeps a working CTA + click tracking.
  if (banner && errored) {
    return (
      <div
        ref={containerRef}
        className="rounded-2xl p-5 flex flex-col justify-center"
        style={{ width: '100%', aspectRatio: AD_ASPECT, backgroundColor: '#FFF4EE' }}
      >
        <h4 className="font-bold text-base leading-snug mb-1.5" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: '#1D2022' }}>
          Try Keploy for free
        </h4>
        <p className="text-sm leading-relaxed mb-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: '#4b5563' }}>
          Generate test cases and data mocks with one click. Reduce unit test development time by 90%.
        </p>
        <Link
          href={CTA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          data-banner-id={banner.id}
          onClick={() => trackBannerClick(banner.id)}
          className="inline-flex items-center gap-1 font-semibold text-sm transition-colors duration-150 hover:opacity-80"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: '#ED5D0F' }}
        >
          Sign up <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  // Banner is picked client-side (avoids a hydration mismatch): reserve the
  // slot, show a skeleton until the image decodes, then fade the artwork in.
  return (
    <div
      ref={containerRef}
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
          {/* Banner artwork (CTA excluded); fills the slot and fades in on load. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.src}
            alt="Keploy — 300M+ mocks and 12.8M+ tests generated"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
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
            loading="lazy"
          />

          {/* CTA overlaid in the artwork's empty band. Tracking lives here (not
              the card) so only real clickthroughs count. */}
          <Link
            href={CTA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Try for Free"
            data-banner-id={banner.id}
            onClick={() => trackBannerClick(banner.id)}
            className="block text-center font-bold transition-all duration-300 hover:brightness-95 active:scale-[0.98]"
            style={{
              position: 'absolute',
              zIndex: 2,
              left: '11%',
              right: '11%',
              top: banner.btnCenter,
              transform: 'translateY(-50%)',
              // sized in cqw so the button scales with the card and always fits the band
              padding: '4.2cqw 0',
              borderRadius: '4cqw',
              fontSize: '6.6cqw',
              lineHeight: 1.2,
              background: banner.btnBg,
              color: banner.btnText,
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
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
