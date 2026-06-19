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
];

export function getInlinePromoForSlug(slug: string): InlinePromoConfig | null {
  return inlinePromos.find((p) => p.blogSlug === slug) ?? null;
}
