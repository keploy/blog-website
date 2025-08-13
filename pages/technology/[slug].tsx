// pages/technology/[slug].tsx
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
import { getAllPostsForTechnology, getMoreStoriesForSlugs, getPostAndMorePosts, getReviewAuthorDetails } from "../../lib/api";
import PrismLoader from "../../components/prism-loader";
import ContainerSlug from "../../components/containerSlug";
import { useRef, useState, useEffect } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";

const PostBody = dynamic(() => import("../../components/post-body"), { ssr: false });

function PostPage({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const { slug } = router.query;

  // Wait for client-side navigation to know the slug and fallback state
  useEffect(() => {
    if (!router.isReady) return;
    if (!slug || Array.isArray(slug) || !post?.slug) {
      router.push("/404");
    }
  }, [router.isReady, slug, post]);

  // redirect if no post after fallback
  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404");
    }
  }, [router.isFallback, post, router]);

  // ...rest of your existing logic for avatars, reviewer, scroll progress...

  return (
    <Layout /* your props */>
      <Header readProgress={readProgress} />
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <PrismLoader />
            <article>
              <Head>
                <title>{post?.title} | Keploy Blog</title>
              </Head>
              <PostHeader /* your props */ />
            </article>
          </>
        )}
      </Container>

      <ContainerSlug>
        <div ref={postBodyRef}>
          <PostBody /* your props */ />
        </div>
      </ContainerSlug>

      <Container>
        <article>
          {post?.tags?.edges?.length > 0 && <Tags tags={post.tags} />}
          <SectionSeparator />
          {posts?.edges?.length > 0 && (
            <MoreStories posts={posts.edges} /* other props */ />
          )}
        </article>
      </Container>
    </Layout>
  );
}

export default PostPage;

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const data = await getPostAndMorePosts(params.slug as string, preview, previewData);
  const { techMoreStories } = await getMoreStoriesForSlugs(data.post.tags, data.post.slug);
  const authorDetails = [
    await getReviewAuthorDetails("neha"),
    await getReviewAuthorDetails("Jain"),
  ];

  return {
    props: {
      preview,
      post: data.post ?? null,
      posts: techMoreStories ?? { edges: [] },
      reviewAuthorDetails: authorDetails,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const all = await getAllPostsForTechnology(false);
  const paths = all.edges.map(({ node }) => ({
    params: { slug: node.slug },
  }));

  return {
    paths,
    fallback: true,
  };
};
