import { useRef, useEffect } from "react";
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
import Tag from "../../components/tag";
import {
  getAllPostsForCommunity,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
  getReviewAuthorDetails,
} from "../../lib/api";
import PrismLoader from "../../components/prism-loader";
import ContainerSlug from "../../components/containerSlug";
import { useScroll, useSpringValue } from "@react-spring/web";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";
import "./styles.module.css";

const PostBody = dynamic(() => import("../../components/post-body"), { ssr: false });

const postBody = ({ content, post }) => {
  const urlPattern = /https:\/\/keploy\.io\/wp\/author\/[^\/]+\//g;
  return content.replace(urlPattern, `/blog/authors/${post?.ppmaAuthorName || "Unknown Author"}/`);
};

export default function Post({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const morePosts = posts?.edges;
  const time = 5 + calculateReadingTime(post?.content || "");

  const blogwriter = {
    name: post?.ppmaAuthorName || "Author",
    ImageUrl:
      post?.content?.match(/<img[^>]*src='([^']*)'[^>]*\/>/)?.[1] || "/blog/images/author.png",
    description:
      post?.content?.match(/<p[^>]*class="pp-author-boxes-description[^>]*>(.*?)<\/p>/s)?.[1]?.trim() ||
      "An author for Keploy's blog.",
  };

  const blogreviewer = reviewAuthorDetails?.[post?.ppmaAuthorName === "Neha" ? 1 : 0]?.edges[0]?.node || {
    name: "Reviewer",
    ImageUrl: "/blog/images/author.png",
    description: "A Reviewer for Keploy's blog",
  };

  const updatedContent = post?.content
    ? post.content.replace(/<table[^>]*>[\s\S]*?<\/table>/gm, (table) => `<div class="overflow-x-auto">${table}</div>`)
    : "";

  const postBodyRef = useRef<HTMLDivElement>(null);
  const readProgress = useSpringValue(0);
  useScroll({
    onChange: ({ value: { scrollY } }) => {
      const topOffset = postBodyRef.current?.offsetTop || 0;
      const clientHeight = postBodyRef.current?.clientHeight || 0;
      let progress = 0;
      if (scrollY > topOffset && scrollY < clientHeight + topOffset) {
        progress = ((scrollY - topOffset) / clientHeight) * 100;
      } else if (scrollY >= clientHeight + topOffset) {
        progress = 100;
      }
      readProgress.set(progress);
    },
  });

  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404");
    }
  }, [router, post]);

  return (
    <Layout
      preview={preview}
      featuredImage={post?.featuredImage?.node?.sourceUrl || ""}
      Title={post?.seo.title || "Loading..."}
      Description={post?.seo.metaDesc || `Blog About ${post?.title}`}
    >
      <Head>
        <title>{`${post?.title || "Loading..."} | Keploy Blog`}</title>
        {post?.featuredImage?.node.sourceUrl && (
          <link rel="preload" href={post.featuredImage.node.sourceUrl} as="image" />
        )}
        <style>{`
          .post-title { font-size: 2rem; font-weight: bold; }
          @media (min-width: 768px) { .post-title { font-size: 2.5rem; } }
        `}</style>
      </Head>
      <Header readProgress={readProgress} />
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <PrismLoader />
            <article>
              <PostHeader
                title={post?.title || "Loading..."}
                coverImage={post?.featuredImage}
                date={post?.date || ""}
                author={post?.ppmaAuthorName || ""}
                categories={post?.categories || []}
                BlogWriter={[blogwriter]}
                BlogReviewer={[blogreviewer]}
                TimeToRead={time}
              />
            </article>
          </>
        )}
      </Container>
      <ContainerSlug>
        <div ref={postBodyRef}>
          <PostBody
            content={updatedContent && postBody({ content: updatedContent, post })}
            authorName={post?.ppmaAuthorName || ""}
            ReviewAuthorDetails={reviewAuthorDetails?.[post?.ppmaAuthorName === "Neha" ? 1 : 0]}
            slug={router.query.slug}
          />
        </div>
      </ContainerSlug>
      <Container>
        <article>
          <footer>
            {post?.tags?.edges?.length > 0 && <Tag tags={post.tags} />}
          </footer>
          <SectionSeparator />
          {morePosts?.length > 0 && (
            <MoreStories isIndex={false} posts={morePosts} isCommunity={true} />
          )}
        </article>
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const [postData, authorDetails] = await Promise.all([
    getPostAndMorePosts(params?.slug, preview, previewData),
    Promise.all([getReviewAuthorDetails("neha"), getReviewAuthorDetails("Jain")]),
  ]);

  const { communityMoreStories } = await getMoreStoriesForSlugs(postData?.post?.tags, postData?.post?.slug);

  return {
    props: {
      preview,
      post: postData?.post || {},
      posts: communityMoreStories || { edges: [] },
      reviewAuthorDetails: authorDetails || [],
    },
    revalidate: 300,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsForCommunity(false);
  const communityPosts = allPosts?.edges?.map(({ node }) => `/community/${node?.slug}`) || [];
  return {
    paths: communityPosts.slice(0, 50),
    fallback: "blocking",
  };
};