export interface ContentModalCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface ContentModalImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ContentModalConfig {
  /** Unique, kebab-case. Used as the DOM id and the trigger's data attribute. */
  id: string;
  blogSlug: string;
  /**
   * Plain-text phrase from the post body that becomes the clickable trigger.
   * First match only, case-insensitive. Skipped inside links, headings, code and buttons.
   * If the phrase is not found, the modal is not rendered at all.
   */
  anchorText: string;
  title: string;
  /** Small pill next to the title, e.g. "Deep dive". */
  tag?: string;
  /** Paragraphs of plain text. */
  body: string[];
  bullets?: string[];
  image?: ContentModalImage;
  ctas?: ContentModalCta[];
}

// Add entries here. Template (copy, uncomment, replace every value):
// {
//   // https://keploy.io/blog/community/software-testing-basics
//   id: "software-testing-basics-strong-foundation",
//   blogSlug: "software-testing-basics",
//   anchorText: "strong foundation",
//   title: "What a strong testing foundation looks like",
//   tag: "Deep dive",
//   body: [
//     "A strong foundation means every layer of your stack has the right kind of test: fast unit tests for logic, integration tests for service boundaries, and end-to-end tests for critical user journeys.",
//     "Teams that skip the middle layer usually end up with slow, flaky suites that nobody trusts.",
//   ],
//   bullets: [
//     "Unit tests: catch logic bugs in milliseconds",
//     "Integration and API tests: verify contracts between services",
//     "End-to-end tests: protect the few flows that make money",
//   ],
//   ctas: [
//     { label: "Try Keploy Free", href: "https://app.keploy.io/signin", variant: "primary" },
//     { label: "Read the docs", href: "https://keploy.io/docs/", variant: "secondary" },
//   ],
// },

export const contentModals: ContentModalConfig[] = [];

export function getContentModalsForSlug(slug: string): ContentModalConfig[] {
  return contentModals.filter((m) => m.blogSlug === slug);
}
