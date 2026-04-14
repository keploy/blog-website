import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

export const SITE_URL = "https://keploy.io/blog";
export const MAIN_SITE_URL = "https://keploy.io";
export const ORG_NAME = "Keploy";
export const BLOG_NAME = "Keploy Blog";
export const ORG_LOGO_URL = `${SITE_URL}/favicon/android-chrome-512x512.png`;
export const SOCIAL_LINKS = [
  "https://twitter.com/Keployio",
  "https://www.linkedin.com/company/keploy/",
  "https://www.youtube.com/@keploy",
  "https://www.instagram.com/keploy.io/",
  "https://www.github.com/keploy/keploy",
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
};

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORG_NAME,
  url: MAIN_SITE_URL,
  logo: ORG_LOGO_URL,
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

export const getBlogPostingSchema = ({
  title,
  url,
  datePublished,
  dateModified,
  description,
  imageUrl,
  authorName,
  articleSection,
  categorySlug,
  dependencies,
  proficiencyLevel,
}: BlogPostingInput) => {
  const resolvedAuthorName = Array.isArray(authorName)
    ? (authorName[0] || ORG_NAME)
    : (authorName || ORG_NAME);
  const authorSlug = sanitizeAuthorSlug(resolvedAuthorName);

  // GEO-13: blog/technology posts render as TechArticle
  // (more specific than BlogPosting for developer content).
  // blog/community posts stay as BlogPosting.
  const schemaType = categorySlug === "technology" ? "TechArticle" : "BlogPosting";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: resolvedAuthorName,
      ...(resolvedAuthorName !== ORG_NAME && authorSlug
        ? { url: `${SITE_URL}/authors/${authorSlug}` }
        : {}),
    },
    publisher: {
      "@type": "Organization",
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
      name: BLOG_NAME,
      url: SITE_URL,
    },
  };

  if (articleSection) {
    schema.articleSection = articleSection;
  }

  if (description) {
    schema.description = description;
  }

  if (imageUrl) {
    schema.image = [imageUrl];
  }

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

export const getBlogSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: BLOG_NAME,
  url: SITE_URL,
  description:
    "Technical blog covering AI-powered API test generation, eBPF-based testing, production behavior replay, dependency virtualization, and developer productivity by Keploy.",
  publisher: {
    "@type": "Organization",
    name: ORG_NAME,
    url: MAIN_SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: ORG_LOGO_URL,
    },
  },
});
