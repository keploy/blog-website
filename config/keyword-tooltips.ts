export interface TooltipMedia {
  type: "image" | "gif" | "video";
  src: string;
  alt?: string;
}

export interface KeywordTooltipConfig {
  key: string;
  blogSlug: string;
  keyword: string;
  media: TooltipMedia;
  heading: string;
  ctaText: string;
  ctaHref: string;
}

export const keywordTooltips: KeywordTooltipConfig[] = [
  {
    key: "white-box-captured-traffic",
    blogSlug: "white-box-testing",
    keyword: "captured production traffic",
    media: {
      type: "video",
      src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/load+testing.mp4",
      alt: "Keploy capturing production traffic",
    },
    heading: "Real traffic. Real tests. Zero manual effort.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "white-box-quality-signals",
    blogSlug: "white-box-testing",
    keyword: "measurable quality signals",
    media: {
      type: "video",
      src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/coverage.mp4",
      alt: "Keploy quality signals and coverage",
    },
    heading: "Coverage that reflects real production behavior.",
    ctaText: "See it in action →",
    ctaHref: "https://app.keploy.io/signin",
  },
];

export function getTooltipsForSlug(slug: string): KeywordTooltipConfig[] {
  return keywordTooltips.filter((t) => t.blogSlug === slug);
}
