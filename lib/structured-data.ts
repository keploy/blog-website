import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";
import { AUTHOR_AVATAR_PLACEHOLDER } from "./constants";
import { decodeEntities } from "../utils/seo";

// Match the placeholder by filename (e.g. "/author.webp") rather than its full
// basePath'd or S3 path, so a basePath-less "/images/author.webp" is also
// recognised and never leaks the generic avatar into an author's JSON-LD `image`.
const AUTHOR_AVATAR_FILE = `/${AUTHOR_AVATAR_PLACEHOLDER.split("/").pop()}`;

// Single schema.org @context value. Every builder below references this rather
// than repeating the literal, so the vocabulary URL lives in exactly one place.
export const SCHEMA_CONTEXT = "https://schema.org";

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
// Stable @id for the Keploy product as a SoftwareApplication entity. Emitted
// once as a global node (pages/_document.tsx) and referenced by @id from every
// article's `mentions`, so AI/search engines resolve "Keploy" to one known
// developer tool instead of loose brand text scattered across posts.
export const SOFTWARE_ID = `${MAIN_SITE_URL}/#software`;
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
  /**
   * Approximate body word count (utils/contentSchema.countWords). Emitted as
   * schema.org `wordCount`.
   */
  wordCount?: number;
  /**
   * Estimated reading time in minutes. Emitted as ISO-8601 `timeRequired`
   * (e.g. 7 -> "PT7M").
   */
  readingTimeMinutes?: number;
  /**
   * Topical keywords (post categories + detected code languages). De-duped and
   * emitted as a comma-separated schema.org `keywords` string.
   */
  keywords?: string[];
};

// Shared @id-reference nodes. The Keploy Organization and Blog are each emitted
// as a full node exactly once (getOrganizationSchema / getBlogSchema), then
// referenced by @id from many other nodes (author.worksFor, isPartOf, …). These
// helpers keep every reference byte-identical so a crawler merges them into one
// entity instead of seeing subtly-different inline copies — build any new
// worksFor/isPartOf/publisher reference from here, never hand-rolled.
export const orgReference = () => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: ORG_NAME,
  url: MAIN_SITE_URL,
});

export const blogReference = () => ({
  "@type": "Blog",
  "@id": BLOG_ID,
  name: BLOG_NAME,
  url: SITE_URL,
});

export const getOrganizationSchema = () => ({
  "@context": SCHEMA_CONTEXT,
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
  "@context": SCHEMA_CONTEXT,
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: BLOG_NAME,
  url: SITE_URL,
  inLanguage: "en-US",
  // Link the site to the single Keploy Organization entity by @id, same node
  // the Blog's publisher uses — keeps the site/blog/org graph resolving to one.
  publisher: orgReference(),
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
 * The Keploy product modeled as a SoftwareApplication. This is the single
 * highest-leverage entity for AI citation on a product blog: answer engines
 * resolve "what is Keploy / best API-testing tool" against a typed software
 * entity, not against prose. Emitted once globally (pages/_document.tsx) with a
 * stable @id that every article's `mentions` points back at.
 *
 * No aggregateRating on purpose — same policy as getReviewSchema: there are no
 * first-party rating values, and a fabricated/self-serving rating is the exact
 * invalid structured data this work is clearing. Authority rides on `sameAs`.
 */
export const getSoftwareApplicationSchema = () => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "SoftwareApplication",
  "@id": SOFTWARE_ID,
  name: ORG_NAME,
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "API Testing",
  operatingSystem: "Linux, macOS, Windows",
  url: MAIN_SITE_URL,
  downloadUrl: "https://github.com/keploy/keploy/releases",
  softwareHelp: { "@type": "CreativeWork", url: `${MAIN_SITE_URL}/docs` },
  description:
    "Keploy is a developer-centric API testing platform with an open-source core that auto-generates test cases and data mocks from real API traffic.",
  // No isAccessibleForFree/offers: this node is named "Keploy" (the whole
  // product), which ships paid Cloud/Enterprise tiers, so a blanket price: 0 /
  // free claim would be inaccurate. The open-source core is conveyed by the
  // GitHub downloadUrl and the description instead of a fabricated price.
  author: orgReference(),
  publisher: { "@type": "Organization", "@id": ORG_ID },
  sameAs: [
    "https://github.com/keploy/keploy",
    "https://www.g2.com/products/keploy/reviews",
    "https://www.gartner.com/reviews/product/keploy-618993540",
    "https://www.capterra.in/software/1070466/Keploy",
    "https://marketplace.visualstudio.com/items?itemName=Keploy.keployio",
  ],
});

// schema.org image URLs must be absolute; some fixtures/runtime data carry
// root-relative ("/blog/...") or protocol-relative ("//...") URLs. Coerce those
// to absolute so crawlers don't get a non-canonical image URL.
const toAbsoluteImageUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${MAIN_SITE_URL}${url}`;
  return url;
};

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
  url: toAbsoluteImageUrl(url),
  ...(caption ? { caption } : {}),
  ...(typeof width === "number" ? { width } : {}),
  ...(typeof height === "number" ? { height } : {}),
});

export const getBreadcrumbListSchema = (items: BreadcrumbItem[]) => ({
  "@context": SCHEMA_CONTEXT,
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
  items
    // Drop entries without a usable name/url — a ListItem with an empty name is
    // invalid schema (e.g. a WP post with a null title). Filtering before the
    // map keeps `position` sequential (1, 2, 3, …).
    .filter((it) => it.url && it.url.trim() && it.name && it.name.trim())
    .map((it, index) => ({
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
export const getItemListSchema = (items: ListEntry[], listName?: string) => {
  const itemListElement = toListItems(items);
  // Return null (not an empty ItemList) when nothing survives the name/url
  // filter — an ItemList with an empty itemListElement is invalid schema, and
  // this standalone builder needs the same guard as getCollectionPageSchema.
  if (!itemListElement.length) return null;
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    ...(listName ? { name: listName } : {}),
    numberOfItems: itemListElement.length,
    itemListElement,
  };
};

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
}) => {
  const listItems = toListItems(items);
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "CollectionPage",
    name,
    url,
    ...(description ? { description } : {}),
    isPartOf: blogReference(),
    // Omit the ItemList entirely when the collection is empty (e.g. an orphan
    // tag with no posts) — an ItemList with an empty itemListElement is invalid.
    ...(listItems.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: listItems.length,
            itemListElement: listItems,
          },
        }
      : {}),
  };
};

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
  wordCount,
  readingTimeMinutes,
  keywords,
}: BlogPostingInput) => {
  const providedAuthorName = Array.isArray(authorName) ? authorName[0] : authorName;
  const resolvedAuthorName = providedAuthorName || AUTHOR_FALLBACK_NAME;
  // True when the name came from AUTHOR_FALLBACK_NAME rather than WordPress. The
  // fallback has no /authors/{slug} page, so its Person node must stay url-less.
  const isFallbackAuthor = !providedAuthorName;
  const authorSlug = sanitizeAuthorSlug(resolvedAuthorName);

  // GEO-13: blog/technology posts render as TechArticle
  // (more specific than BlogPosting for developer content).
  // blog/community posts stay as BlogPosting.
  const schemaType = categorySlug === "technology" ? "TechArticle" : "BlogPosting";

  const authorNode: Record<string, unknown> = {
    "@type": "Person",
    name: resolvedAuthorName,
  };
  // @id/url point at the enriched Person on /authors/{slug} (ProfilePage.mainEntity)
  // so engines merge the two into one entity instead of treating each post's author
  // as a separate stub. Skipped for the "Keploy Team" fallback: it has no author
  // page, and authors/[slug] renders an empty div for unknown slugs, so linking it
  // would point the article's author at a soft-404.
  if (!isFallbackAuthor && resolvedAuthorName !== ORG_NAME && authorSlug) {
    authorNode["@id"] = `${SITE_URL}/authors/${authorSlug}#person`;
    authorNode.url = `${SITE_URL}/authors/${authorSlug}`;
  }
  // worksFor is repeated on the article's author (rather than left to the merge
  // with the author page) because a crawler that only fetches this post never sees
  // that page, and the Keploy affiliation is the E-E-A-T signal we most need here.
  // It stays valid on the url-less fallback too.
  if (resolvedAuthorName !== ORG_NAME) {
    authorNode.worksFor = orgReference();
  }
  if (authorImage && !authorImage.includes(AUTHOR_AVATAR_FILE)) {
    authorNode.image = authorImage;
  }

  // Resolve dates from the post's own values only — never invent one. An
  // earlier version fell back to `new Date()`, but this builder runs in the
  // page render body (client + server), so a build-time clock produced a
  // hydration mismatch on the ld+json script AND a publish date that shifted
  // on every ISR revalidate. When WP gives us nothing usable we omit the
  // field: a missing datePublished is a soft "recommended" warning, whereas a
  // fabricated one is exactly the invalid/misleading data this work refuses.
  const resolvedPublished = toISODate(datePublished) || toISODate(dateModified);
  const resolvedModified = toISODate(dateModified) || resolvedPublished;

  const schema: Record<string, unknown> = {
    "@context": SCHEMA_CONTEXT,
    "@type": schemaType,
    headline: title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(resolvedPublished ? { datePublished: resolvedPublished } : {}),
    ...(resolvedModified ? { dateModified: resolvedModified } : {}),
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
    isPartOf: blogReference(),
    // The blog article itself is free to read (no paywall/registration) — a
    // recognized signal, and accurate here in a way it is NOT for the paid-tier
    // product (SoftwareApplication deliberately omits this; see that builder).
    isAccessibleForFree: true,
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
    if (reviewerImage && !reviewerImage.includes(AUTHOR_AVATAR_FILE)) {
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

  // Content signals AI/search engines weight for developer-intent ranking.
  // Reading time is already computed for the UI (calculateReadingTime); this
  // just serializes it (+ word count + topical keywords) into the schema.
  schema.inLanguage = "en-US";
  if (typeof wordCount === "number" && wordCount > 0) {
    schema.wordCount = wordCount;
  }
  if (typeof readingTimeMinutes === "number" && readingTimeMinutes > 0) {
    schema.timeRequired = `PT${readingTimeMinutes}M`;
  }
  if (keywords && keywords.length > 0) {
    schema.keywords = Array.from(new Set(keywords.filter(Boolean))).join(", ");
  }

  // Link every post to the single Keploy SoftwareApplication entity by @id (the
  // full node is emitted globally in _document.tsx). `mentions`, not `about`:
  // the product is discussed in every post but isn't necessarily each post's
  // primary topic. This is the connective tissue that lets an AI engine attach
  // "Keploy does X" claims from any article to the one known tool entity.
  schema.mentions = [
    { "@type": "SoftwareApplication", "@id": SOFTWARE_ID, name: ORG_NAME },
  ];

  return schema;
};

/**
 * FAQPage from extracted question/answer pairs in a post body. AI answer
 * engines cite FAQ Q&A directly, so surfacing them as structured data is high
 * leverage. Only call this when real Q&A pairs were detected.
 */
// `url` is the post URL. FAQPage gets its own `@id` (`…#faq`) and an `isPartOf`
// back to the article's WebPage (same `@id` the BlogPosting's mainEntityOfPage
// uses), so the FAQ reads as part of the post rather than a competing page-type
// node on the same URL (PR review #2).
export const getFAQPageSchema = (
  faqs: { question: string; answer: string }[],
  url?: string,
) => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "FAQPage",
  ...(url
    ? { "@id": `${url}#faq`, url, isPartOf: { "@type": "WebPage", "@id": url } }
    : {}),
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
  "@context": SCHEMA_CONTEXT,
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
  codeRepository,
}: {
  language: string;
  url: string;
  name?: string;
  codeRepository?: string;
}) => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "SoftwareSourceCode",
  programmingLanguage: language,
  ...(name ? { name } : {}),
  // Only claim a source repo when the caller actually knows the snippet lives in
  // one. A post can contain incidental python/js unrelated to keploy/keploy, so
  // hardcoding that repo for every detected language would be a misleading claim.
  ...(codeRepository ? { codeRepository } : {}),
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
  "@context": SCHEMA_CONTEXT,
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
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: MAIN_SITE_URL,
    review: reviewNodes,
  };
};

// Topics an author is credited as knowledgeable about (Person.knowsAbout).
// Default for the author-profile pages; override per-author if that data ever
// becomes available.
export const AUTHOR_KNOWS_ABOUT = [
  "API Testing",
  "Test Automation",
  "Software Engineering",
  "Developer Tools",
];

type PersonInput = {
  name: string;
  /** The author's profile URL (…/authors/{slug}); also seeds the `#person` @id. */
  url: string;
  image?: string;
  /** External identity links (e.g. the author's LinkedIn) for sameAs. */
  sameAs?: string[];
  jobTitle?: string;
  knowsAbout?: string[];
};

/**
 * Enriched Person node for a blog author. Meant to nest as ProfilePage.mainEntity
 * (so it carries no @context) and shares the `{url}#person` @id that every post's
 * `author` points at — engines merge the per-post author stub and this full
 * profile into one entity. worksFor references the single Keploy Organization by
 * @id (orgReference), same as the article author's affiliation.
 */
export const getPersonSchema = ({
  name,
  url,
  image,
  sameAs,
  jobTitle = "Author",
  knowsAbout = AUTHOR_KNOWS_ABOUT,
}: PersonInput) => {
  const node: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${url}#person`,
    name,
    url,
    jobTitle,
    hasOccupation: {
      "@type": "Occupation",
      name: "Technical Author",
      // No occupationLocation: schema.org expects a geographic Place there, not
      // an employer. The Keploy affiliation is already modeled via worksFor.
    },
    worksFor: orgReference(),
  };
  if (knowsAbout && knowsAbout.length) node.knowsAbout = knowsAbout;
  if (image) node.image = image;
  if (sameAs && sameAs.length) node.sameAs = sameAs;
  return node;
};

/**
 * ProfilePage wrapper for an author route (the route IS a profile). Wraps the
 * enriched Person as mainEntity so AI engines read the page as an author
 * identity rather than an untyped list of posts.
 */
export const getProfilePageSchema = (
  person: Record<string, unknown>,
  url: string,
) => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "ProfilePage",
  mainEntity: person,
  mainEntityOfPage: url,
});

export const getBlogSchema = () => ({
  "@context": SCHEMA_CONTEXT,
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
