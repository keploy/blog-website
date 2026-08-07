import Head from "next/head";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import {
  getAllPosts,
  getContent,
  getPostsByAuthorName,
} from "../../lib/api";
import { GetStaticPaths, GetStaticProps } from "next";
import PostByAuthorMapping from "../../components/postByAuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { sanitizeAuthorSlug } from "../../utils/sanitizeAuthorSlug";
import {
  getBreadcrumbListSchema,
  getItemListSchema,
  MAIN_SITE_URL,
  SITE_URL,
  ORG_ID,
} from "../../lib/structured-data";

// Server-safe author-box extraction. extractAuthorData (utils) relies on
// `document`, so it can't run in getStaticProps/SSR — these regexes pull the
// same fields from the raw PublishPress author-box HTML for the JSON-LD.
function extractAuthorMeta(html: string): { avatarUrl?: string; linkedIn?: string } {
  if (!html) return {};
  const avatar = html.match(
    /pp-author-boxes-avatar[\s\S]{0,200}?<img[^>]+src=["']([^"']+)["']/i,
  );
  const linkedIn = html.match(/href=["'](https?:\/\/[^"']*linkedin\.com[^"']*)["']/i);
  return {
    avatarUrl: avatar?.[1],
    linkedIn: linkedIn?.[1],
  };
}
import { REVALIDATE_CONTENT, REVALIDATE_ERROR, REVALIDATE_NOT_FOUND } from "../../lib/isr";

export default function AuthorPage({ preview, filteredPosts, content }) {
  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div>
        <p>No posts found for this author.</p>
      </div>
    );
  }

  const authorName = filteredPosts[0]?.node?.ppmaAuthorName || "Keploy Author";
  const authorSlug = sanitizeAuthorSlug(authorName);
  const authorUrl = `${SITE_URL}/authors/${authorSlug}`;
  const pageTitle = `${authorName} — Keploy Blog Author`;
  const pageDescription = `Read all articles by ${authorName} on the Keploy blog — covering software testing, API development, automation, and engineering best practices.`;

  // Person JSON-LD for E-E-A-T author credibility (LIVE-11).
  // AI models use Person.url + sameAs to resolve author identity and
  // weight the authority of the pages they cite. worksFor.url points at
  // MAIN_SITE_URL (https://keploy.io) — not the blog subpath — so the
  // Organization entity is consistent across every JSON-LD payload.
  const authorMeta = extractAuthorMeta(content || "");
  const authoredItems = filteredPosts.map(({ node }) => ({
    url: `${SITE_URL}/${node?.categories?.edges?.[0]?.node?.name === "community" ? "community" : "technology"}/${node.slug}`,
    name: node.title,
  }));

  // Enriched Person node (no @context — it's nested as ProfilePage.mainEntity).
  const personNode: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${authorUrl}#person`,
    name: authorName,
    url: authorUrl,
    jobTitle: "Author",
    worksFor: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Keploy",
      url: MAIN_SITE_URL,
    },
    knowsAbout: [
      "API Testing",
      "Test Automation",
      "Software Engineering",
      "Developer Tools",
    ],
  };
  if (authorMeta.avatarUrl) personNode.image = authorMeta.avatarUrl;
  if (authorMeta.linkedIn) personNode.sameAs = [authorMeta.linkedIn];

  // Wrap the author identity in a ProfilePage (the route IS a profile), and
  // model the author's posts as an ItemList so AI engines see the body of work.
  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: personNode,
    mainEntityOfPage: authorUrl,
  };
  const authoredWorksSchema = getItemListSchema(authoredItems, `Posts by ${authorName}`);

  return (
    <div className="bg-accent-1">
      {/*
        LIVE-11 fix. Previously the <title> tag was absent from author
        pages because components/meta.tsx does not emit a <title>, and
        this page never added one locally. Authors pages returned 200
        with empty <title></title>, which kills CTR and AI extraction
        signal.
      */}
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={pageTitle}
        Description={pageDescription}
        structuredData={[
          getBreadcrumbListSchema([
            { name: "Home", url: SITE_URL },
            { name: "Authors", url: `${SITE_URL}/authors` },
            { name: authorName, url: authorUrl },
          ]),
          profilePageSchema,
          authoredWorksSchema,
        ]}
        canonicalUrl={authorUrl}
      >
        {/* DM Sans + Baloo 2 are preloaded globally in _document.tsx */}
        <Header />
        <Container>
          <PostByAuthorMapping filteredPosts={filteredPosts} Content={content} />
        </Container>
      </Layout>
    </div>
  );
}
export const getStaticPaths: GetStaticPaths = async ({ }) => {
  try {
    const allPosts = await getAllPosts();
    const uniqueNames = new Set<string>();

    allPosts?.edges?.forEach(({ node }) => {
      const authorName = node?.ppmaAuthorName;
      if (typeof authorName === "string" && authorName.trim().length > 0) {
        uniqueNames.add(authorName);
      }
    });

    const paths = Array.from(uniqueNames).map((name) => `/authors/${sanitizeAuthorSlug(name)}`);

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("authors/[slug] getStaticPaths error:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const slugParam = params?.slug;

  if (typeof slugParam !== "string" || slugParam.trim().length === 0) {
    return {
      notFound: true,
      revalidate: REVALIDATE_NOT_FOUND,
    };
  }

  const normalizedSlug = slugParam.toLowerCase();
  const slugWords = normalizedSlug.split(/[-_\s]+/).filter(Boolean);
  const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
  const titleCaseName = slugWords.map(capitalise).join(" ");
  const spacedLower = slugWords.join(" ");
  const hyphenLower = slugWords.join("-");
  const titleHyphen = slugWords.map(capitalise).join("-");

  const candidateAuthorNames = new Set<string>();
  candidateAuthorNames.add(slugParam);
  candidateAuthorNames.add(normalizedSlug);
  if (spacedLower) candidateAuthorNames.add(spacedLower);
  if (hyphenLower) candidateAuthorNames.add(hyphenLower);
  if (titleCaseName) candidateAuthorNames.add(titleCaseName);
  if (titleHyphen) candidateAuthorNames.add(titleHyphen);
  if (slugWords.length) {
    candidateAuthorNames.add(capitalise(slugWords[0]));
    candidateAuthorNames.add(slugWords[0]);
  }

  let filteredPosts = [];

  // fetchAPI throws on GraphQL errors and on network failure, and every WP call
  // below is individually caught — which makes "WordPress is down" look
  // identical to "this author has no posts". They must not share a TTL: a
  // genuine 404 should stick, but an outage must self-heal in a minute rather
  // than pinning a real author page as a 404 for a day.
  let wordpressFailed = false;

  for (const candidate of Array.from(candidateAuthorNames)) {
    if (!candidate) continue;
    try {
      const postsResponse = await getPostsByAuthorName(candidate);
      const edges = postsResponse?.edges || [];
      if (edges.length > 0) {
        filteredPosts = edges;
        break;
      }
    } catch (error) {
      wordpressFailed = true;
      console.error(`authors/[slug] failed to fetch posts for candidate "${candidate}":`, error);
    }
  }

  if (!filteredPosts.length) {
    try {
      const allPostsResponse = await getAllPosts();
      filteredPosts =
        allPostsResponse?.edges?.filter(({ node }) => {
          const candidateName = node?.ppmaAuthorName;
          if (!candidateName || Array.isArray(candidateName)) {
            return false;
          }
          return sanitizeAuthorSlug(candidateName) === sanitizeAuthorSlug(slugParam);
        }) || [];
    } catch (error) {
      wordpressFailed = true;
      console.error("authors/[slug] fallback to getAllPosts failed:", error);
      filteredPosts = [];
    }
  }

  // Return a proper 404 instead of rendering a page with empty content (soft 404)
  if (!filteredPosts.length) {
    return {
      notFound: true,
      revalidate: wordpressFailed ? REVALIDATE_ERROR : REVALIDATE_NOT_FOUND,
    };
  }

  let content = null;
  const postId = filteredPosts[0]?.node?.postId;
  if (postId) {
    try {
      content = await getContent(postId);
    } catch (error) {
      console.error(`authors/[slug] failed to fetch content for postId ${postId}:`, error);
    }
  }

  return {
    props: {
      preview,
      filteredPosts,
      content,
    },
    revalidate: REVALIDATE_CONTENT,
  };
};

