export type InlinePromoId = "keploy-5years";

export interface InlinePromoConfig {
  blogSlug: string;
  afterText: string;
  promoId: InlinePromoId;
}

export const inlinePromos: InlinePromoConfig[] = [
  {
    blogSlug: "software-testing-basics",
    afterText: "Software testing is the process of evaluating a software",
    promoId: "keploy-5years",
  },
  {
    blogSlug: "api-testing-strategies",
    afterText: "Keploy can auto-generate these tests by recording real service interactions, removing the need to write each scenario by hand.",
    promoId: "keploy-5years",
  },
  {
    blogSlug: "software-testing-strategies",
    afterText: "Automation is typically used for repetitive tasks such as regression testing and CI/CD validation.",
    promoId: "keploy-5years",
  },
  {
    blogSlug: "software-testing-strategies",
    afterText: "I usually run these at defined milestones using tools like JMeter or k6 instead of on every build.",
    promoId: "keploy-5years",
  },
];

export function getInlinePromosForSlug(slug: string): InlinePromoConfig[] {
  return inlinePromos.filter((p) => p.blogSlug === slug);
}
