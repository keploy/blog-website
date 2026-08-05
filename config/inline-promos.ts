export type InlinePromoId = "keploy-5years";

export interface InlinePromoConfig {
  blogSlug: string;
  afterText: string;
  promoId: InlinePromoId;
}

export const inlinePromos: InlinePromoConfig[] = [
  {
    // https://keploy.io/blog/community/software-testing-basics
    blogSlug: "software-testing-basics",
    afterText: "There is no doubt that having a strong foundation",
    promoId: "keploy-5years",
  },
  {
    // https://keploy.io/blog/community/api-testing-strategies
    blogSlug: "api-testing-strategies",
    afterText: "Keploy can auto-generate these tests by recording real service interactions, removing the need to write each scenario by hand.",
    promoId: "keploy-5years",
  },
  {
    // https://keploy.io/blog/community/software-testing-strategies
    blogSlug: "software-testing-strategies",
    afterText: "An automation strategy defines which test cases should be automated and how automation fits into the development pipeline.",
    promoId: "keploy-5years",
  },
  {
    // https://keploy.io/blog/community/software-testing-strategies
    blogSlug: "software-testing-strategies",
    afterText: "I usually run these at defined milestones using tools like JMeter or k6 instead of on every build, since they are expensive to execute and their results only change when architecture or traffic patterns change.",
    promoId: "keploy-5years",
  },
];

export function getInlinePromosForSlug(slug: string): InlinePromoConfig[] {
  return inlinePromos.filter((p) => p.blogSlug === slug);
}
