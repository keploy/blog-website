export interface GatedReportConfig {
  blogSlug: string;
  afterHeading: string;
  preview: {
    imageSrc: string;
    alt: string;
  };
  title: string;
  subtitle: string;
  redirectUrl: string;
  ctaText?: string;
}

export const gatedReports: GatedReportConfig[] = [
  {
    blogSlug: "api-testing-tools",
    afterHeading: "How to Choose the Right API Testing Tool",
    preview: {
      imageSrc: "/blog/report-preview.png",
      alt: "API Testing Tools Report — Preview",
    },
    title: "Get the Full API Testing Report",
    subtitle: "A comprehensive guide trusted by thousands of engineers.",
    // TODO: replace with the real report page URL before merging
    redirectUrl: "https://keploy.io/ai-testing-in-saas",
  },
];

export function getGatedReportConfig(slug: string): GatedReportConfig | null {
  return gatedReports.find((r) => r.blogSlug === slug) ?? null;
}
