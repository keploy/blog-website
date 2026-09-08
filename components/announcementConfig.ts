// Announcement config lives in its own module (no Marquee / lucide imports) so
// _app can gate the dynamic() import on ANNOUNCEMENT_ENABLED without pulling the
// whole Announcements chunk into the graph. While the flag is false the chunk is
// never fetched; flip it to true to re-enable the bar.
export const ANNOUNCEMENT_ENABLED = false;

export const ANNOUNCEMENT = {
  enabled: ANNOUNCEMENT_ENABLED,
  eyebrow: "Event LIVE",
  href: "https://luma.com/lr79szro",
  ctaLabel: "Register NOW",
};
