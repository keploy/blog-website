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
import { useEffect, useRef, useState } from "react";
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

const PostBody = dynamic(() => import("../../components/post-body"), {
  ssr: false,
});

const postBody = ({ content, post }) => {
  const urlPattern = /https:\/\/keploy\.io\/wp\/author\/[^\/]+\//g;

  const replacedContent = content.replace(
    urlPattern,
    `/blog/authors/${post.ppmaAuthorName}/`
  );

  return replacedContent;
};

export default function Post({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const { slug } = router.query;
  const morePosts = posts?.edges;
  const [avatarImgSrc, setAvatarImgSrc] = useState("");
  const time = 5 + calculateReadingTime(post?.content);
  const [blogWriterDescription, setBlogWriterDescription] = useState("");
  const [reviewAuthorName, setreviewAuthorName] = useState("");
  const [reviewAuthorImageUrl, setreviewAuthorImageUrl] = useState("");
  const [reviewAuthorDescription, setreviewAuthorDescription] = useState("");
  const [postBodyReviewerAuthor, setpostBodyReviewerAuthor] = useState(0);
  const [updatedContent, setUpdatedContent] = useState("");

  useEffect(() => {
    if (reviewAuthorDetails && reviewAuthorDetails?.length > 0) {
      const authorIndex = post.ppmaAuthorName === "Neha" ? 1 : 0;
      const authorNode = reviewAuthorDetails[authorIndex]?.edges[0]?.node;
      if (authorNode) {
        setpostBodyReviewerAuthor(authorIndex);
        setreviewAuthorName(authorNode.name);
        setreviewAuthorImageUrl(authorNode.avatar.url);
        setreviewAuthorDescription(authorNode.description);
      }
    }
  }, [post, reviewAuthorDetails]);
  const blogwriter = [
    {
      name: post?.ppmaAuthorName || "Author",
      ImageUrl: avatarImgSrc || "/blog/images/author.png",
      description: blogWriterDescription || "An author for keploy's blog.",
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
  useEffect(() => {
    if (post && post.content) {

      const content = post.content;
      const avatarDivMatch = content.match(
        /<div[^>]*class="pp-author-boxes-avatar"[^>]*>\s*<img[^>]*src='([^']*)'[^>]*\/?>/
      );
      console.log(avatarDivMatch ? avatarDivMatch[1] : "No avatar match");
      if (avatarDivMatch && avatarDivMatch[1]) {
        setAvatarImgSrc(avatarDivMatch[1]);
      } else {
        setAvatarImgSrc("/blog/images/author.png");
      }

      // Match the <p> with class pp-author-boxes-description and extract its content
      const authorDescriptionMatch = content.match(
        /<p[^>]*class="[^"]*pp-author-boxes-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i
      );

      // Apply table responsive wrapper
      const newContent = content.replace(
        /<table[^>]*>[\s\S]*?<\/table>/gm,
        (table) => `<div class="overflow-x-auto">${table}</div>`
      );

      setUpdatedContent(newContent);

      if (authorDescriptionMatch && authorDescriptionMatch[1].trim()?.length > 0) {
        setBlogWriterDescription(authorDescriptionMatch[1].trim());
      } else {
        setBlogWriterDescription("An author for Keploy's blog.");
      }
    }
  }, [post]);

  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404"); // Redirect to 404 page if slug is not available
    }
  }, [router, router.isFallback, post]);

  const safeTitle = (post?.title || 'Loading...').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#?\w+;/g, '');
  const safeDescription = router.isFallback
    ? 'Keploy engineering blog — practical guides, tutorials, and best practices for developers and QA engineers.'
    : (post?.seo?.metaDesc && post.seo.metaDesc.length >= 60)
      ? post.seo.metaDesc
      : `Learn about ${safeTitle} — practical guide with examples and best practices from the Keploy engineering blog.`;

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
        articleSection: post?.categories?.edges?.[0]?.node?.name || "Community",
      })
    );
  } else {
    structuredData.push(
      getBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Community", url: `${SITE_URL}/community` },
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
              content={
                post?.content && postBody({ content: post?.content, post })
              }
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
      // Post exists but belongs to a different category — redirect to it
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
      // Unknown category (e.g. "Uncategorized") — return 404
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
