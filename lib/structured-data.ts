import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";
import { decodeEntities } from "../utils/seo";

export const SITE_URL = "https://keploy.io/blog";
export const MAIN_SITE_URL = "https://keploy.io";
export const ORG_NAME = "Keploy";
export const BLOG_NAME = "Keploy Blog";
export const ORG_LOGO_URL = `${SITE_URL}/favicon/android-chrome-512x512.png`;
// Stable @id for the Keploy Organization entity. Every place that emits an
// Organization node (global node, per-post publisher, author worksFor) points
// at this same @id so AI/search engines resolve ONE Keploy entity instead of
// treating each inline copy as a separate organization (entity fragmentation).
export const ORG_ID = `${MAIN_SITE_URL}/#organization`;
// Same reasoning as ORG_ID, for the two other site-level entities. Both are
// emitted repeatedly — Blog as the global node plus every post's and listing's
// `isPartOf`, WebSite as the home node plus every search page's `isPartOf` —
// so without a shared @id a crawler sees one anonymous copy per page instead
// of one blog and one site.
export const BLOG_ID = `${SITE_URL}/#blog`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
// Default article image when a post's WordPress featuredImage is null (common on
// older/migrated posts). Mirrors HOME_OG_IMAGE_URL in lib/constants.ts so the
// schema image matches the og:image the page actually renders.
export const DEFAULT_ARTICLE_IMAGE_URL =
  "https://wp.keploy.io/wp-content/uploads/2023/11/thumbnil-.png";
// Author fallback when a post has no usable ppmaAuthorName. A named team
// Person with its own profile URL is a valid author node; the previous
// fallback ("Keploy") produced a URL-less Person, a weaker E-E-A-T signal.
export const AUTHOR_FALLBACK_NAME = "Keploy Team";
export const SOCIAL_LINKS = [
  "https://twitter.com/Keployio",
  "https://www.linkedin.com/company/keploy/",
  "https://www.youtube.com/@keploy",
  "https://www.instagram.com/keploy.io/",
  "https://www.github.com/keploy/keploy",
  // Authority / review profiles — kept in sync with keploy.io Organization
  // sameAs so AI engines resolve one consistent Keploy entity across
  // landing, blog, and docs (reduces entity fragmentation).
  "https://discord.gg/keploy",
  "https://community.keploy.io",
  "https://marketplace.visualstudio.com/items?itemName=Keploy.keployio",
  "https://chromewebstore.google.com/detail/keploy-api-test-recorder/ohcclfkaidblnjnggclkiecgkpgldihe",
  "https://www.crunchbase.com/organization/hybridk8s",
  "https://www.gartner.com/reviews/product/keploy-618993540",
  "https://www.g2.com/products/keploy/reviews",
  "https://www.capterra.in/software/1070466/Keploy",
  "https://aws.amazon.com/marketplace/reviews/reviews-list/prodview-xgwmdk4ivjjv4",
];

type BreadcrumbItem = {
  name: string;
  url: string;
};

type BlogPostingInput = {
  title: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  description?: string;
  imageUrl?: string;
  authorName?: string | string[];
  /**
   * Optional direct URL to the author's avatar image. When set, the
   * Person schema for the author gains an `image` field that AI models
   * can use to render a real author photo in rich results.
   */
  authorImage?: string;
  articleSection?: string;
  /**
   * WordPress category slug. When "technology", emit TechArticle
   * instead of BlogPosting (GEO-13). AI models weight TechArticle
   * higher for developer content because the schema.org type
   * specifically denotes "a technical article — typically an
   * on-line manual, describing how to accomplish a task."
   */
  categorySlug?: string;
  /**
   * Optional list of programming languages or frameworks the post
   * discusses. Maps to TechArticle.dependencies.
   */
  dependencies?: string[];
  /**
   * TechArticle proficiencyLevel. "Beginner" | "Intermediate" | "Expert".
   */
  proficiencyLevel?: "Beginner" | "Intermediate" | "Expert";
  /**
   * Reviewer name. When set, emits a reviewedBy Person schema on the
   * Article. Used for E-E-A-T review credibility — every Keploy blog
   * post is reviewed by a senior engineer before publication.
   */
  reviewerName?: string;
  /**
   * Reviewer avatar URL.
   */
  reviewerImage?: string;
  /**
   * Reviewer description / job title.
   */
  reviewerDescription?: string;
  /**
   * CSS selectors for the sections a voice assistant should read aloud
   * (e.g. the intro + key-takeaways). Emits a SpeakableSpecification.
   */
  speakableSelectors?: string[];
};

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: ORG_NAME,
  url: MAIN_SITE_URL,
  logo: ORG_LOGO_URL,
  // Entity/E-E-A-T signals kept in sync with the keploy.io landing
  // Organization node so all three properties resolve to one Keploy entity.
  foundingDate: "2021-01-01",
  knowsAbout: [
    "API Testing",
    "Test Automation",
    "eBPF-based Testing",
    "Dependency Virtualization",
    "AI-Powered Testing",
    "Production Behavior Replay",
    "Unit Test Generation",
  ],
  award: [
    "API World 2023 Award: Best in API Infrastructure",
    "CNCF Landscape",
    "Google for Startups Accelerator",
    "Google Summer of Code Mentoring Organization",
  ],
  sameAs: SOCIAL_LINKS,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: MAIN_SITE_URL,
      availableLanguage: ["English"],
    },
  ],
});

export const getWebSiteSchema = (searchTarget = `${SITE_URL}/search?q={search_term_string}`) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: BLOG_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: searchTarget,
    },
    "query-input": "required name=search_term_string",
  },
});

/**
 * Reusable ImageObject node. Google/AI engines prefer a typed ImageObject over
 * a bare URL string (it can carry caption + dimensions), and it's the shape the
 * Article `image` field and listing/cover images should share.
 */
export const getImageObjectSchema = ({
  url,
  caption,
  width,
  height,
}: {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}) => ({
  "@type": "ImageObject",
  url,
  ...(caption ? { caption } : {}),
  ...(typeof width === "number" ? { width } : {}),
  ...(typeof height === "number" ? { height } : {}),
});

export const getBreadcrumbListSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Coerce a possibly-null/malformed WordPress date into a valid ISO 8601 string,
// or null if unparseable. Stops empty / "Invalid Date" values from reaching the
// schema, which is a structured-data validation error.
const toISODate = (value?: string): string | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

type ListEntry = { url: string; name: string; image?: string };

const toListItems = (items: ListEntry[]) =>
  items.map((it, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: it.url,
    name: it.name,
    ...(it.image
      ? { image: getImageObjectSchema({ url: it.image, caption: it.name }) }
      : {}),
  }));

/**
 * ItemList for a grid/collection of posts. Emitted standalone (has @context) so
 * AI/search engines can map the ordered set of links on listing pages, which
 * currently ship zero collection schema.
 */
export const getItemListSchema = (items: ListEntry[], listName?: string) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  ...(listName ? { name: listName } : {}),
  itemListElement: toListItems(items),
});

/**
 * CollectionPage for an archive/listing route (community, technology, tag,
 * authors). Wraps the post/author grid as an ItemList mainEntity so the whole
 * archive is a modeled collection rather than an unlabeled wall of cards.
 */
export const getCollectionPageSchema = ({
  name,
  url,
  description,
  items,
}: {
  name: string;
  url: string;
  description?: string;
  items: ListEntry[];
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  url,
  ...(description ? { description } : {}),
  isPartOf: {
    "@type": "Blog",
    "@id": BLOG_ID,
    name: BLOG_NAME,
    url: SITE_URL,
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: toListItems(items),
  },
});

export const getBlogPostingSchema = ({
  title,
  url,
  datePublished,
  dateModified,
  description,
  imageUrl,
  authorName,
  authorImage,
  articleSection,
  categorySlug,
  dependencies,
  proficiencyLevel,
  reviewerName,
  reviewerImage,
  reviewerDescription,
  speakableSelectors,
}: BlogPostingInput) => {
  const resolvedAuthorName =
    (Array.isArray(authorName) ? authorName[0] : authorName) || AUTHOR_FALLBACK_NAME;
  const authorSlug = sanitizeAuthorSlug(resolvedAuthorName);

  // GEO-13: blog/technology posts render as TechArticle
  // (more specific than BlogPosting for developer content).
  // blog/community posts stay as BlogPosting.
  const schemaType = categorySlug === "technology" ? "TechArticle" : "BlogPosting";

  const authorNode: Record<string, unknown> = {
    "@type": "Person",
    name: resolvedAuthorName,
    // Same @id as the enriched Person on /authors/{slug} (ProfilePage.mainEntity),
    // so engines merge the two into one entity instead of treating each post's
    // author as a separate stub. The full sameAs/image/knowsAbout live there.
    // worksFor is repeated here rather than left to that merge because a crawler
    // that only fetches this post never sees the author page, and the Keploy
    // affiliation is the E-E-A-T signal we most need on the article itself.
    ...(resolvedAuthorName !== ORG_NAME && authorSlug
      ? {
          "@id": `${SITE_URL}/authors/${authorSlug}#person`,
          url: `${SITE_URL}/authors/${authorSlug}`,
          worksFor: {
            "@type": "Organization",
            "@id": ORG_ID,
            name: ORG_NAME,
            url: MAIN_SITE_URL,
          },
        }
      : {}),
  };
  if (authorImage && !authorImage.includes("/images/author.png")) {
    authorNode.image = authorImage;
  }

  // Never emit an empty/invalid datePublished. Prefer the post's own date,
  // then its modified date, and only as a last resort the current build time.
  const resolvedPublished =
    toISODate(datePublished) || toISODate(dateModified) || new Date().toISOString();
  const resolvedModified = toISODate(dateModified) || resolvedPublished;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: resolvedPublished,
    dateModified: resolvedModified,
    author: authorNode,
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: ORG_NAME,
      logo: {
        "@type": "ImageObject",
        url: ORG_LOGO_URL,
        width: 512,
        height: 512,
      },
    },
    isPartOf: {
      "@type": "Blog",
      "@id": BLOG_ID,
      name: BLOG_NAME,
      url: SITE_URL,
    },
  };

  // E-E-A-T: reviewedBy Person. Only emit when we actually have a
  // reviewer name AND it is different from the author — a post being
  // "reviewed by" its own author is not a useful credibility signal
  // and AI models weight the review less.
  if (
    reviewerName &&
    reviewerName !== resolvedAuthorName &&
    reviewerName !== "Reviewer" // placeholder fallback
  ) {
    const reviewerNode: Record<string, unknown> = {
      "@type": "Person",
      name: reviewerName,
      "@id": `${SITE_URL}/authors/${sanitizeAuthorSlug(reviewerName)}#person`,
      url: `${SITE_URL}/authors/${sanitizeAuthorSlug(reviewerName)}`,
    };
    if (reviewerImage && !reviewerImage.includes("/images/author.png")) {
      reviewerNode.image = reviewerImage;
    }
    if (reviewerDescription) {
      reviewerNode.description = reviewerDescription;
    }
    schema.reviewedBy = reviewerNode;
  }

  if (articleSection) {
    schema.articleSection = articleSection;
  }

  // Sanitize the WP excerpt before it enters the schema: strip HTML tags and
  // decode entities (script-safe) so unescaped markup/entities can't produce a
  // structured-data parse warning. Only emit when something survives.
  if (description) {
    const cleanDescription = decodeEntities(description);
    if (cleanDescription) {
      schema.description = cleanDescription;
    }
  }

  if (speakableSelectors && speakableSelectors.length > 0) {
    schema.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: speakableSelectors,
    };
  }

  // Always emit an image so the Article schema never trips the "missing field
  // image" validation error — WordPress returns a null featuredImage on many
  // older/migrated posts. Fall back to the site's default OG cover, and emit a
  // typed ImageObject (not a bare URL) so rich results can use its caption.
  schema.image = getImageObjectSchema({
    url: imageUrl || DEFAULT_ARTICLE_IMAGE_URL,
    caption: title,
  });

  // TechArticle-specific fields — only emit when set AND when we're
  // actually rendering a TechArticle.
  if (schemaType === "TechArticle") {
    if (dependencies && dependencies.length > 0) {
      schema.dependencies = dependencies.join(", ");
    }
    if (proficiencyLevel) {
      schema.proficiencyLevel = proficiencyLevel;
    }
  }

  return schema;
};

/**
 * FAQPage from extracted question/answer pairs in a post body. AI answer
 * engines cite FAQ Q&A directly, so surfacing them as structured data is high
 * leverage. Only call this when real Q&A pairs were detected.
 */
export const getFAQPageSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
});

/**
 * DefinedTermSet for a post's keyword-tooltip glossary. Each tooltip term is a
 * DefinedTerm so AI engines can extract Keploy's canonical definitions.
 */
export const getDefinedTermSetSchema = ({
  name,
  url,
  terms,
}: {
  name: string;
  url: string;
  terms: { term: string; description?: string }[];
}) => ({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name,
  url,
  hasDefinedTerm: terms.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    ...(t.description ? { description: t.description } : {}),
    inDefinedTermSet: url,
  })),
});

/**
 * One SoftwareSourceCode node per programming language present in a post's code
 * blocks. Signals to AI engines that the article contains runnable code in
 * those languages (developer-intent queries weight this).
 */
export const getSoftwareSourceCodeSchema = ({
  language,
  url,
  name,
}: {
  language: string;
  url: string;
  name?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  programmingLanguage: language,
  ...(name ? { name } : {}),
  codeRepository: "https://github.com/keploy/keploy",
  isPartOf: {
    "@type": "WebPage",
    "@id": url,
  },
});

/**
 * SearchResultsPage for the /search and /community/search routes, which render
 * a filtered result grid but currently emit no page-type schema.
 */
export const getSearchResultsPageSchema = ({
  url,
  query,
}: {
  url: string;
  query?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "SearchResultsPage",
  url,
  name: query ? `Search results for "${query}"` : "Search the Keploy blog",
  isPartOf: {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: BLOG_NAME,
    url: SITE_URL,
  },
});

/**
 * Community testimonials (the "What our community thinks" wall on /blog) as
 * Review nodes attached to the Keploy Organization by @id.
 *
 * Two deliberate choices, both to keep the payload valid (this repo's P0 is
 * "0 invalid structured data"):
 *  - We emit ONE partial Organization node carrying a `review` array rather
 *    than a dozen free-floating Review nodes. It shares ORG_ID with the global
 *    Organization, so consumers merge them into the single Keploy entity
 *    instead of fragmenting it.
 *  - No `reviewRating` / `AggregateRating`. These testimonials are tweets with
 *    no star values; schema.org requires `ratingValue` on a Rating, so a
 *    rating-less Review is the only valid representation. Fabricating stars —
 *    or an AggregateRating with only a reviewCount — would be invalid and
 *    self-serving, the exact failure this branch is clearing.
 */
export const getReviewSchema = (
  reviews: { author: string; body: string; url?: string }[],
) => {
  const reviewNodes = reviews
    .filter((r) => r?.author && r?.body)
    .map((r) => {
      const node: Record<string, unknown> = {
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        reviewBody: r.body,
      };
      if (r.url) node.url = r.url;
      return node;
    });
  if (!reviewNodes.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: MAIN_SITE_URL,
    review: reviewNodes,
  };
};

export const getBlogSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": BLOG_ID,
  name: BLOG_NAME,
  url: SITE_URL,
  description:
    "Technical blog covering AI-powered API test generation, eBPF-based testing, production behavior replay, dependency virtualization, and developer productivity by Keploy.",
  publisher: {
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: MAIN_SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: ORG_LOGO_URL,
    },
  },
});
