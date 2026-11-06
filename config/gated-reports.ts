export interface GatedReportConfig {
  blogSlug: string;
  afterHeading?: string;
  afterText?: string;
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
      imageSrc: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/report-0-ai-saas.webp",
      alt: "API Testing Tools Report — Preview",
    },
    title: "Get the Full API Testing Report",
    subtitle: "A comprehensive guide trusted by thousands of engineers.",
  
    redirectUrl: "https://keploy.io/ai-testing-in-saas",
  },
  {
    blogSlug: "api-testing-strategies",
    afterText: "Edge cases specific to your domain — business logic exceptions",
    preview: {
      imageSrc: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/healthcare-api-testing-security-report-preview.webp",
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
