export interface GatedReportConfig {
  blogSlug: string;
  afterHeading: string;
  previewImageSrc: string;
  previewImageAlt: string;
  title: string;
  subtitle: string;
  reportId: string;
}

export const gatedReports: GatedReportConfig[] = [
  {
    blogSlug: "api-testing-tools",
    afterHeading: "How to Choose the Right API Testing Tool",
    previewImageSrc: "/blog/report-preview.png",
    previewImageAlt: "API Testing Tools Report — Preview",
    title: "Get the Full API Testing Report",
    subtitle:
      "A comprehensive guide trusted by thousands of engineers. Delivered free to your inbox.",
    reportId: "api-testing-report-2024",
  },
];

export function getGatedReportConfig(slug: string): GatedReportConfig | null {
  return gatedReports.find((r) => r.blogSlug === slug) ?? null;
}
