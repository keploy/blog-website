import Head from "next/head";
import { GetStaticProps } from "next";
import { useState, useEffect } from "react";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import HeroPostSkeleton from "../../components/skeletons/HeroPostSkeleton";
import PostGridSkeleton from "../../components/skeletons/PostGridSkeleton";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  const [isLoading, setIsLoading] = useState(true);
  const [displayPosts, setDisplayPosts] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setDisplayPosts(edges || []);
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [edges]);

  console.log("tech posts: ", edges.length);
  const heroPost = displayPosts[0]?.node;
  const excerpt = displayPosts[0]
    ? getExcerpt(displayPosts[0].node.excerpt, 50)
    : null;
  const morePosts = displayPosts.slice(1);

  return (
    <Layout
      preview={preview}
      featuredImage={heroPost?.featuredImage?.node.sourceUrl}
      Title={heroPost?.title}
      Description={`Blog from the Technology Page`}
    >
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Header />
      <Container>
        {isLoading ? (
          <>
            <HeroPostSkeleton />
            <PostGridSkeleton count={11} />
          </>
        ) : (
          <>
            {/* <Intro /> */}
            {heroPost && (
              <HeroPost
                title={heroPost.title}
                coverImage={heroPost.featuredImage}
                date={heroPost.date}
                author={heroPost.ppmaAuthorName}
                slug={heroPost.slug}
                excerpt={excerpt}
                isCommunity={false}
              />
            )}
            {morePosts.length > 0 && (
              <MoreStories
                isIndex={true}
                posts={morePosts}
                isCommunity={false}
                initialPageInfo={pageInfo}
              />
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const emptyData = {
    edges: [],
    pageInfo: { hasNextPage: false, endCursor: null },
  };

  try {
    const allPosts = await getAllPostsForTechnology(preview);

    return {
      props: { allPosts: allPosts ?? emptyData, preview },
      revalidate: 10,
    };
  } catch (error) {
    console.error("technology/index getStaticProps error:", error);
    return {
      props: { allPosts: emptyData, preview },
      revalidate: 60,
    };
  }
};
