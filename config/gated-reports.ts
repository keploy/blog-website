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
  {
    blogSlug: "api-testing-strategies",
    afterHeading: "Set Up Test Environments with Realistic Data",
    preview: {
      imageSrc: "/blog/images/healthcare-api-testing-security-report-preview.webp",
      alt: "Healthcare API Testing & Security Report — Preview",
    },
    title: "Get the Full Healthcare API Testing & Security Report",
    subtitle: "In-depth data on securing and scaling healthcare APIs.",
    redirectUrl: "https://keploy.io/healthcare-api-testing-security-report",
  },
];

export function getGatedReportConfig(slug: string): GatedReportConfig | null {
  return gatedReports.find((r) => r.blogSlug === slug) ?? null;
}
