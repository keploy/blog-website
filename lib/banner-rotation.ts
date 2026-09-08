// Shared state for the sidebar ad banner's impression tracking.
//
// The sidebar renders TWICE per page (post-body.tsx: a wide-desktop ≥1440px
// copy and a sub-1440px copy), so two SidebarAdBanner instances mount for one
// page view. If each picked its own banner and kept its own "impression fired"
// latch, resizing across the 1440px breakpoint would mount the previously
// display:none instance, load its lazy image, and fire a SECOND impression for
// a DIFFERENT banner_id — inflating the denominator and understating CTR for
// both banners off a single page view.
//
// Keeping the pick and the latch here (module scope, keyed per page view) makes
// both instances agree on ONE banner and fire exactly ONE impression per page.

export type Banner = {
  id: string;
  src: string;
  btnBg: string;
  btnText: string;
  btnCenter: string;
};

// Random rotation for aggregate per-banner CTR — NOT a per-user/per-session A/B
// test. A reader can see different banners on consecutive articles; the pick is
// per page view, so don't read the dashboard as an A/B conclusion about users.
export const AD_BANNERS: Banner[] = [
  { id: "banner_1", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/banner1.webp", btnBg: "#ED5D0F", btnText: "#ffffff", btnCenter: "88.5%" },
  { id: "banner_2", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/banner2.webp", btnBg: "#ffffff", btnText: "#ED5D0F", btnCenter: "88.5%" },
  { id: "banner_3", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/banner3.webp", btnBg: "#ED5D0F", btnText: "#ffffff", btnCenter: "88.5%" },
  { id: "banner_4", src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/banner4.webp", btnBg: "#16324F", btnText: "#ffffff", btnCenter: "88.5%" },
];

// Module-scoped mutable state. Safe ONLY because the sidebar is imported with
// dynamic(..., { ssr: false }) — it runs client-side, one module instance per
// tab. If BlogSidebar is ever server-rendered, this pick + latch would be shared
// across concurrent requests; move it into request/component scope first.
let pageKey: string | null = null;
let picked: Banner | null = null;
let impressionFired = false;

// Pick the banner for this page view. Idempotent per key: the first caller picks
// and re-arms the impression latch; every later caller for the SAME key (the
// second sidebar instance, an effect re-run) gets the identical banner. A new
// key (SPA nav to another post) re-picks and re-arms.
export function pickBannerForPage(key: string, rand: () => number = Math.random): Banner {
  if (pageKey !== key || !picked) {
    pageKey = key;
    picked = AD_BANNERS[Math.floor(rand() * AD_BANNERS.length)];
    impressionFired = false;
  }
  return picked;
}

export function hasFiredImpression(): boolean {
  return impressionFired;
}

// Claim the single impression for this page view. Returns true exactly once
// (the caller that should actually send the event); every later call — the other
// instance, or a re-intersection — returns false and must NOT send.
//
// The latch is set here, BEFORE the event is confirmed sent. Deliberate: if
// trackBannerImpression's analytics-ready poll times out (~20s, IMPRESSION_
// READY_TRIES) the impression is dropped with no retry. That's the accepted
// trade — latching only on a confirmed send would let the second sidebar
// instance win the race and re-open the double-count this module exists to close.
export function claimImpression(): boolean {
  if (impressionFired) return false;
  impressionFired = true;
  return true;
}

// Test-only: reset module state between cases.
export function __resetBannerRotation(): void {
  pageKey = null;
  picked = null;
  impressionFired = false;
}
