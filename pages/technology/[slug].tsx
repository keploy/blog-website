import { useRouter } from "next/router";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import SectionSeparator from "../../components/section-separator";
import Layout from "../../components/layout";
import PostTitle from "../../components/post-title";
import Tags from "../../components/tag";
import {
  getAllSlugsForCategory,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
  getReviewAuthors,
} from "../../lib/api";
import ContainerSlug from "../../components/containerSlug";
import { useRef, useEffect, useMemo } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { REVALIDATE_CONTENT, REVALIDATE_ERROR, REVALIDATE_NOT_FOUND } from "../../lib/isr";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import { AUTHOR_AVATAR_PLACEHOLDER, resolveAuthorAvatar } from "../../lib/constants";
import dynamic from "next/dynamic";
import { getRedirectSlug, hasRedirect } from "../../config/redirect";
import {
  getBlogPostingSchema,
  getBreadcrumbListSchema,
  getFAQPageSchema,
  getSoftwareSourceCodeSchema,
  getDefinedTermSetSchema,
  SITE_URL,
} from "../../lib/structured-data";
import { sanitizeTitle, getSafeDescription, buildPageTitle } from "../../utils/seo";
import { getHowToSchema } from "../../lib/howToSchema";
import { detectCodeLanguages, countWords, extractFaqs } from "../../utils/contentSchema";
import { getTooltipsForSlug } from "../../config/keyword-tooltips";

const PostBody = dynamic(() => import("../../components/post-body"));

const postBody = ({ content, post }) => {
  const urlPattern = /https:\/\/keploy\.io\/wp\/author\/[^\/]+\//g;

  const replacedContent = content.replace(
    urlPattern,
    `/blog/authors/${post?.ppmaAuthorName || "Unknown Author"}/`
  );

  return replacedContent;
};

export default function Post({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const { slug } = router.query;
  const morePosts = posts?.edges;
  const time = 5 + calculateReadingTime(post?.content || "");

  // Reviewer data — computed synchronously at render time so the reviewer
  // name appears in the SSR HTML payload (not just after client hydration).
  // Previously this was a useEffect that set state, which meant AI crawlers
  // saw the literal placeholder "Reviewer" string in the initial HTML.
  // Author mismatch + reviewer bugs reported 2026-04-14.
  const reviewerIndex = post?.ppmaAuthorName === "Neha" ? 1 : 0;
  const reviewerNode =
    reviewAuthorDetails && reviewAuthorDetails.length > 0
      ? reviewAuthorDetails[reviewerIndex]?.edges?.[0]?.node
      : null;
  const postBodyReviewerAuthor = reviewerIndex;
  const reviewAuthorName = reviewerNode?.name || "";
  const reviewAuthorImageUrl = reviewerNode?.avatar?.url || "";
  const reviewAuthorDescription = reviewerNode?.description || "";

  // Writer avatar — use ppmaAuthorImage directly (SSR). resolveAuthorAvatar
  // rejects junk values ("imag1", "image", "n/a", empty) that would otherwise
  // 400 the next/image optimizer and render a broken byline avatar; a real URL
  // passes through unchanged (and it falls back to the S3 AUTHOR_AVATAR_PLACEHOLDER
  // when missing).
  const writerAvatarUrl = resolveAuthorAvatar(post?.ppmaAuthorImage);
  // For JSON-LD only: a genuine author photo (absolute URL) or nothing — never
  // the placeholder or a junk value, either of which would be invalid in schema.
  const rawPpmaImage = (post?.ppmaAuthorImage ?? "").trim();
  const ppmaSchemaImage = /^https?:\/\//i.test(rawPpmaImage) ? rawPpmaImage : undefined;

  // Writer description — extract synchronously from post content (no effect).
  const writerDescriptionMatch =
    post?.content?.match(
      /<p[^>]*class="[^"]*pp-author-boxes-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    );
  const blogWriterDescription =
    writerDescriptionMatch && writerDescriptionMatch[1]?.trim().length > 0
      ? writerDescriptionMatch[1].trim()
      : "An author for Keploy's blog.";

  // Back-compat alias for any downstream reference to avatarImgSrc.
  const avatarImgSrc = writerAvatarUrl;

  const blogwriter = [
    {
      name: post?.ppmaAuthorName || "Author",
      ImageUrl: writerAvatarUrl,
      description: blogWriterDescription,
    },
  ];
  const blogreviewer = [
    {
      name: reviewAuthorName || "Reviewer",
      ImageUrl: reviewAuthorImageUrl || AUTHOR_AVATAR_PLACEHOLDER,
      description: reviewAuthorDescription || "A Reviewer for keploy's blog",
    },
  ];
  const postBodyRef = useRef<HTMLDivElement>();
  const readProgress = useSpringValue(0);
  useScroll({
    onChange(v) {
      const topOffset = postBodyRef.current?.offsetTop || 0;
      const clientHeight = postBodyRef.current?.clientHeight || 0;
      if (v.value.scrollY < topOffset) v.value.scrollY = 0;
      else if (
        v.value.scrollY > topOffset &&
        v.value.scrollY < clientHeight + topOffset
      ) {
        v.value.scrollY = ((v.value.scrollY - topOffset) / clientHeight) * 100;
      } else {
        v.value.scrollY = 100;
      }
      readProgress.set(v.value.scrollY);
    },
  });
  // Author + description extraction previously lived in a useEffect here
  // and produced client-only state updates. Both are now computed
  // synchronously above so the SSR HTML contains the correct data.

  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404");
    }
  }, [router, router.isFallback, post]);

  const safeTitle = sanitizeTitle(post?.title);
  const safeDescription = getSafeDescription(router.isFallback, post?.seo?.metaDesc, safeTitle);

  const postUrl = post?.slug ? `${SITE_URL}/technology/${post.slug}` : `${SITE_URL}/technology`;
  // These scan the full post HTML; memoize so the passes run once on hydration
  // and never again on the frequent re-renders this page triggers (scroll
  // progress, router state) — see PR review #5.
  const { codeLanguages, wordCount, faqs } = useMemo(
    () => ({
      codeLanguages: detectCodeLanguages(post?.content),
      wordCount: countWords(post?.content),
      faqs: extractFaqs(post?.content),
    }),
    [post?.content],
  );
  const tooltipTerms = post?.slug ? getTooltipsForSlug(post.slug) : [];
  const structuredData = [];
  if (post?.slug) {
    structuredData.push(
      getBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Technology", url: `${SITE_URL}/technology` },
        { name: safeTitle || "Post", url: postUrl },
      ]),
      getBlogPostingSchema({
        title: safeTitle || "Keploy Blog Post",
        url: postUrl,
        datePublished: post?.date,
        dateModified: post?.modified,
        description: safeDescription,
        imageUrl: post?.featuredImage?.node?.sourceUrl,
        authorName: post?.ppmaAuthorName,
        // LIVE-22: use PublishPress author image, not the placeholder.
        authorImage: ppmaSchemaImage,
        articleSection: post?.categories?.edges?.[0]?.node?.name || "Technology",
        // GEO-13: mark this as TechArticle (more specific than BlogPosting
        // for developer content). AI models weight TechArticle higher
        // for technical queries.
        categorySlug: "technology",
        proficiencyLevel: "Intermediate",
        // Populate TechArticle.dependencies from the code languages actually
        // present in the post (was defined but never set).
        dependencies: codeLanguages.length ? codeLanguages : undefined,
        // Voice-assistant spoken summary: title + section headings.
        speakableSelectors: ["h1", "h2"],
        // Developer-intent content signals (serialized from existing UI data).
        wordCount,
        readingTimeMinutes: time,
        keywords: [
          ...(post?.categories?.edges?.map((e) => e?.node?.name).filter(Boolean) || []),
          ...codeLanguages,
        ],
        // LIVE-22: emit reviewedBy Person schema. Skipped by the
        // generator when the reviewer equals the author or when the
        // name falls back to the "Reviewer" placeholder.
        reviewerName: reviewAuthorName || undefined,
        reviewerImage: reviewAuthorImageUrl || undefined,
        reviewerDescription: reviewAuthorDescription || undefined,
      })
    );
    const howTo = getHowToSchema(post, postUrl, safeTitle, safeDescription);
    if (howTo) {
      structuredData.push(howTo);
    }
    // FAQPage only when the post has an explicit "FAQ" / "Frequently Asked
    // Questions" section with ≥2 clean Q&A pairs (see utils/contentSchema
    // extractFaqs). Marker-gated so we never scrape stray "?" headings or
    // flatten code/tables into answers. Linked to the post WebPage via @id.
    if (faqs.length) {
      structuredData.push(getFAQPageSchema(faqs, postUrl));
    }
    for (const language of codeLanguages) {
      structuredData.push(
        getSoftwareSourceCodeSchema({ language, url: postUrl, name: `${safeTitle} — ${language} example` }),
      );
    }
    if (tooltipTerms.length) {
      structuredData.push(
        getDefinedTermSetSchema({
          name: `${safeTitle} — glossary`,
          url: postUrl,
          terms: tooltipTerms.map((t) => ({ term: t.keyword, description: t.heading })),
        }),
      );
    }
  } else {
    structuredData.push(
      getBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Technology", url: `${SITE_URL}/technology` },
      ])
    );
  }

  return (
    <Layout
      preview={preview}
      featuredImage={post?.featuredImage?.node?.sourceUrl || ""}
      Title={post?.seo?.title || "Loading..."}
      Description={safeDescription}
      structuredData={structuredData}
      canonicalUrl={!router.isFallback && post?.slug ? postUrl : undefined}
      ogType="article"
      publishedDate={post?.date}
    >
      <Header readProgress={readProgress} />
      <Container>
        <div className="-mt-16 md:-mt-20">
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <title>{buildPageTitle(post?.title)}</title>
                {/* Fonts self-hosted via next/font in _app.tsx */}
              </Head>
              <PostHeader
                title={post?.title || "Loading..."}
                coverImage={post?.featuredImage}
                date={post?.date || ""}
                author={post?.ppmaAuthorName || ""}
                categories={post?.categories || []}
                BlogWriter={blogwriter}
                BlogReviewer={blogreviewer}
                TimeToRead={time}
                tags={post?.tags}
              />
            </article>
          </>
        )}
        </div>
      </Container>
      {/* DM Sans wrapper — scoped to blog article content only */}
      <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
        <ContainerSlug>
          <div ref={postBodyRef}>
            <PostBody
              content={
                post?.content && postBody({ content: post?.content, post })
              }
              authorName={post?.ppmaAuthorName || ""}
              authorImageUrl={avatarImgSrc || AUTHOR_AVATAR_PLACEHOLDER}
              authorDescription={blogWriterDescription || "An author for keploy's blog."}
              slug={slug}
              ReviewAuthorDetails={
                reviewAuthorDetails &&
                reviewAuthorDetails?.length > 0 &&
                reviewAuthorDetails[postBodyReviewerAuthor]
              }
              categories={post?.categories}
            />
          </div>
        </ContainerSlug>
        <Container>
          <article>
            <footer>
              {post?.tags?.edges?.length > 0 && <Tags tags={post?.tags} />}
            </footer>
            <SectionSeparator />
            {morePosts?.length > 0 && (
              <MoreStories isIndex={false} posts={morePosts} isCommunity={false} showSearch={true} />
            )}
          </article>
        </Container>
      </div> {/* end DM Sans wrapper */}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const slugParam = params?.slug;

  if (typeof slugParam !== "string") {
    return {
      notFound: true,
      revalidate: REVALIDATE_NOT_FOUND,
    };
  }

  let realSlug = slugParam;
  const redirectSlug = getRedirectSlug(realSlug);

  if (redirectSlug) {
    realSlug = redirectSlug;
  }

  try {
    const data = await getPostAndMorePosts(realSlug, preview, previewData);

    if (!data?.post) {
      return {
        notFound: true,
        revalidate: REVALIDATE_NOT_FOUND,
      };
    }

    // Validate that this post belongs to the "technology" category.
    // Without this check, posts from "community" are also accessible at
    // /technology/SLUG (duplicate content). If the post is not in the
    // "technology" category, redirect to the correct category URL.
    const postCategories = data.post?.categories?.edges?.map(
      (edge: { node: { name: string } }) => edge.node.name.toLowerCase()
    ) || [];
    if (!postCategories.includes("technology")) {
      // Post belongs to a different category — 301 redirect to preserve SEO signals.
      // This only runs at ISR runtime (fallback: "blocking"), not during next build,
      // because getStaticPaths only returns paths from the technology category query.
      const correctCategory = postCategories.find((c: string) =>
        ['community', 'technology'].includes(c)
      );
      if (correctCategory) {
        return {
          redirect: {
            destination: `/${correctCategory}/${data.post.slug}`,
            permanent: true,
          },
        };
      }
      return {
        notFound: true,
        revalidate: REVALIDATE_NOT_FOUND,
      };
    }

    const moreStories = await getMoreStoriesForSlugs(data.post?.tags, data.post?.slug);
    // Same two records for every post — memoized in lib/api so a build makes
    // this request twice in total instead of twice per post.
    const authorDetails = await getReviewAuthors();

    // If we resolved a redirect slug, send a proper 301 redirect response
    if (redirectSlug) {
      return {
        redirect: {
          destination: `/technology/${redirectSlug}`,
          permanent: true,
        },
      };
    }

    return {
      props: {
        preview,
        post: data.post,
        posts: moreStories?.techMoreStories || { edges: [] },
        reviewAuthorDetails: authorDetails,
      },
      revalidate: REVALIDATE_CONTENT,
    };
  } catch (error) {
    console.error("technology/[slug] getStaticProps error:", error);
    // WordPress failed, the post may well exist — retry soon rather than
    // pinning a real post as a 404 for a day.
    return {
      notFound: true,
      revalidate: REVALIDATE_ERROR,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  // getAllPostsForTechnology is capped at `first: 22`, so using it here left
  // most posts un-prerendered and rendering on demand. Paginate for the full set.
  const slugs = await getAllSlugsForCategory("technology");

  return {
    // Slugs with a configured redirect must NOT be pre-rendered. getStaticProps
    // returns `redirect` for them, and Next.js rejects that during prerendering
    // ("`redirect` can not be returned from getStaticProps during prerendering").
    // They were previously never hit at build time only because getStaticPaths
    // was capped at 22 paths and happened to miss them. These URLs are already
    // 301'd at the edge by vercel.json, so they never reach a function anyway.
    paths: slugs.filter((slug) => !hasRedirect(slug)).map((slug) => `/technology/${slug}`),
    // 'blocking' rather than true: `true` served an empty skeleton with a 200
    // for any unknown slug (soft 404 for crawlers) before resolving. 'blocking'
    // returns the correct status on the first request. Real posts are all
    // pre-rendered above, so this path is only hit by new posts and bad URLs.
    fallback: "blocking",
  };
};
