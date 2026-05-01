import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { getRedirectSlug } from "../../config/redirect";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import SectionSeparator from "../../components/section-separator";
import Layout from "../../components/layout";
import PostTitle from "../../components/post-title";
import Tag from "../../components/tag";
import {
  getAllPostsForCommunity,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
} from "../../lib/api";
import ContainerSlug from "../../components/containerSlug";
import { useEffect, useRef } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { getReviewAuthorDetails } from "../../lib/api";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";
import "./styles.module.css"
import {
  getBlogPostingSchema,
  getBreadcrumbListSchema,
  SITE_URL,
} from "../../lib/structured-data";
import { sanitizeTitle, getSafeDescription } from "../../utils/seo";

const PostBody = dynamic(() => import("../../components/post-body"));

// Apply all HTML transformations in one synchronous pass so the
// transformed content is available at render time (SSR-friendly) and
// no useEffect/setState round-trip is needed:
//   1. Wrap every <table> in <div class="overflow-x-auto"> so wide
//      tables scroll horizontally on narrow screens instead of
//      breaking the page layout.
//   2. Rewrite /wp/author/<slug>/ links to /blog/authors/<ppma-name>/
//      so clicking an author link in an embedded post stays inside
//      the blog app and uses the PublishPress author slug.
const transformPostContent = (content: string, ppmaAuthorName: string) => {
  if (!content) return "";
  return content
    .replace(
      /<table[^>]*>[\s\S]*?<\/table>/gm,
      (table) => `<div class="overflow-x-auto">${table}</div>`,
    )
    .replace(
      /https:\/\/keploy\.io\/wp\/author\/[^\/]+\//g,
      `/blog/authors/${ppmaAuthorName}/`,
    );
};

export default function Post({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const { slug } = router.query;
  const morePosts = posts?.edges;
  const time = 5 + calculateReadingTime(post?.content);

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

  // Writer avatar — source of truth is post.ppmaAuthorImage from the
  // PublishPress Multiple Authors plugin. Fall back to a safe placeholder
  // only if that field is genuinely missing. Previously this was extracted
  // from post.content via regex inside a useEffect which meant the SSR
  // HTML used the /blog/images/author.png placeholder even when the real
  // image was available in the data.
  const ppmaImage =
    typeof post?.ppmaAuthorImage === "string" && post.ppmaAuthorImage.length > 0
      ? post.ppmaAuthorImage
      : "";
  const writerAvatarUrl = ppmaImage || "/blog/images/author.png";

  // Writer description — pulled from the first paragraph with the
  // pp-author-boxes-description class in the post content. Kept here as
  // a one-time synchronous regex so the SSR HTML has the real bio. No
  // state, no effect.
  const writerDescriptionMatch =
    post?.content?.match(
      /<p[^>]*class="[^"]*pp-author-boxes-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    );
  const blogWriterDescription =
    writerDescriptionMatch && writerDescriptionMatch[1]?.trim().length > 0
      ? writerDescriptionMatch[1].trim()
      : "An author for Keploy's blog.";

  // Back-compat alias: other parts of this component previously used
  // avatarImgSrc. Keep the name so references below continue to work.
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
      // Only fall back to the generic "Reviewer" placeholder when we
      // genuinely have no reviewer data. When the data is present the
      // real name renders server-side and reaches AI crawlers.
      name: reviewAuthorName || "Reviewer",
      ImageUrl: reviewAuthorImageUrl || "/blog/images/author.png",
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
  // Table-wrap + author-link rewrite are applied synchronously via
  // transformPostContent() at the PostBody call site below. No
  // useState/useEffect is needed — the transformation is a pure
  // string function so computing it at render time keeps the SSR
  // HTML correct without an extra re-render round-trip.

  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404"); // Redirect to 404 page if slug is not available
    }
  }, [router, router.isFallback, post]);

  const safeTitle = sanitizeTitle(post?.title);
  const safeDescription = getSafeDescription(router.isFallback, post?.seo?.metaDesc, safeTitle);

  const postUrl = post?.slug ? `${SITE_URL}/community/${post.slug}` : `${SITE_URL}/community`;
  const structuredData = [];
  if (post?.slug) {
    structuredData.push(
      getBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Community", url: `${SITE_URL}/community` },
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
        // LIVE-22: use PublishPress author image, not the /blog/images/author.png
        // placeholder. The schema generator also filters the placeholder.
        authorImage: ppmaImage || undefined,
        articleSection: post?.categories?.edges?.[0]?.node?.name || "Community",
        // LIVE-22: emit reviewedBy Person schema when reviewer data is
        // present. The schema generator skips the emit when the reviewer
        // is "Reviewer" (placeholder) or equals the author (self-review).
        reviewerName: reviewAuthorName || undefined,
        reviewerImage: reviewAuthorImageUrl || undefined,
        reviewerDescription: reviewAuthorDescription || undefined,
      }),
    );
  } else {
    structuredData.push(
      getBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Community", url: `${SITE_URL}/community` },
      ]),
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
                <title>{`${post?.title || "Loading..."} | Keploy Blog`}</title>
                {/* DM Sans + Baloo 2 are preloaded globally in _document.tsx */}
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
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <ContainerSlug>
          {/* PostBody component placed outside the Container */}
          <div ref={postBodyRef}>
            <PostBody
              content={transformPostContent(
                post?.content,
                post?.ppmaAuthorName,
              )}
              authorName={post?.ppmaAuthorName || ""}
              authorImageUrl={avatarImgSrc || "/blog/images/author.png"}
              authorDescription={blogWriterDescription || "An author for keploy's blog."}
              ReviewAuthorDetails={
                reviewAuthorDetails &&
                reviewAuthorDetails?.length > 0 &&
                reviewAuthorDetails[postBodyReviewerAuthor]
              }
              slug={slug}
              categories={post?.categories}
            />
          </div>
        </ContainerSlug>
        <Container>
          <article>
            <footer>
              {/* {post?.tags?.edges?.length > 0 && <Tag tags={post?.tags} />} */}
            </footer>
            <SectionSeparator />
            {morePosts?.length > 0 && (
              <MoreStories isIndex={false} posts={morePosts} isCommunity={true} showSearch={true} />
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
  const slug = params?.slug;

  if (typeof slug !== "string") {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  const redirectSlug = getRedirectSlug(slug);
  if (redirectSlug) {
    return {
      redirect: {
        destination: `/community/${redirectSlug}`,
        permanent: true,
      },
    };
  }

  try {
    const data = await getPostAndMorePosts(slug, preview, previewData);

    if (!data?.post) {
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    // Validate that this post belongs to the "community" category.
    // Without this check, posts from "technology" are also accessible at
    // /community/SLUG (duplicate content). If the post is not in the
    // "community" category, redirect to the correct category URL.
    const postCategories = data.post?.categories?.edges?.map(
      (edge: { node: { name: string } }) => edge.node.name.toLowerCase()
    ) || [];
    if (!postCategories.includes("community")) {
      // Post belongs to a different category — 301 redirect to preserve SEO signals.
      // This only runs at ISR runtime (fallback: true), not during next build,
      // because getStaticPaths only returns paths from the community category query.
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
        revalidate: 60,
      };
    }

    const moreStories = await getMoreStoriesForSlugs(data.post?.tags, data.post?.slug);
    const authorDetails = await Promise.all([
      getReviewAuthorDetails("neha"),
      getReviewAuthorDetails("Jain"),
    ]);

    return {
      props: {
        preview,
        post: data.post,
        posts: moreStories?.communityMoreStories || { edges: [] },
        reviewAuthorDetails: authorDetails,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("community/[slug] getStaticProps error:", error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsForCommunity(false);
  const communityPosts =
    allPosts?.edges
      .map(({ node }) => `/community/${node?.slug}`) || [];

  return {
    paths: communityPosts || [],
    fallback: true,
  };
};
