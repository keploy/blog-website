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
  getAllPostsForTechnology,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
} from "../../lib/api";
import ContainerSlug from "../../components/containerSlug";
import { useRef, useEffect } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { getReviewAuthorDetails } from "../../lib/api";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";
import { getRedirectSlug } from "../../config/redirect";
import {
  getBlogPostingSchema,
  getBreadcrumbListSchema,
  SITE_URL,
} from "../../lib/structured-data";
import { sanitizeTitle, getSafeDescription } from "../../utils/seo";

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

  // Writer avatar — use ppmaAuthorImage directly (SSR). Previously this
  // was extracted from post.content via regex inside a useEffect, which
  // meant the SSR HTML rendered /blog/images/author.png as a placeholder.
  const ppmaImage =
    typeof post?.ppmaAuthorImage === "string" && post.ppmaAuthorImage.length > 0
      ? post.ppmaAuthorImage
      : "";
  const writerAvatarUrl = ppmaImage || "/blog/images/author.png";

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
        authorImage: ppmaImage || undefined,
        articleSection: post?.categories?.edges?.[0]?.node?.name || "Technology",
        // GEO-13: mark this as TechArticle (more specific than BlogPosting
        // for developer content). AI models weight TechArticle higher
        // for technical queries.
        categorySlug: "technology",
        proficiencyLevel: "Intermediate",
        // LIVE-22: emit reviewedBy Person schema. Skipped by the
        // generator when the reviewer equals the author or when the
        // name falls back to the "Reviewer" placeholder.
        reviewerName: reviewAuthorName || undefined,
        reviewerImage: reviewAuthorImageUrl || undefined,
        reviewerDescription: reviewAuthorDescription || undefined,
      })
    );
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
          <div ref={postBodyRef}>
            <PostBody
              content={
                post?.content && postBody({ content: post?.content, post })
              }
              authorName={post?.ppmaAuthorName || ""}
              authorImageUrl={avatarImgSrc || "/blog/images/author.png"}
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
      revalidate: 60,
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
        revalidate: 60,
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
      // This only runs at ISR runtime (fallback: true), not during next build,
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
        revalidate: 60,
      };
    }

    const moreStories = await getMoreStoriesForSlugs(data.post?.tags, data.post?.slug);
    const authorDetails = await Promise.all([
      getReviewAuthorDetails("neha"),
      getReviewAuthorDetails("Jain"),
    ]);

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
      revalidate: 10,
    };
  } catch (error) {
    console.error("technology/[slug] getStaticProps error:", error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsForTechnology(false);
  const technologyPosts =
    allPosts?.edges
      ?.map(({ node }) => `/technology/${node?.slug}`) || [];
  return {
    paths: technologyPosts || [],
    fallback: true,
  };
};
