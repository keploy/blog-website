import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import { useState, useEffect } from "react";
import { HeroPostSkeleton, MoreStoriesSkeleton } from "../../components/skeletons";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  // Start with false - skeleton shows by default
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Only runs on client after hydration
    setIsHydrated(true);
  }, []);
  
  console.log("tech posts: ", edges.length)
  const heroPost = edges[0]?.node;
  const excerpt = edges[0] ? getExcerpt(edges[0].node.excerpt, 50) : null;
  const morePosts = edges.slice(1);

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
        {!isHydrated ? (
          // Default state: Skeleton renders immediately, no waiting
          <div className="loading-skeleton">
            <div className="skeleton-hero">
              <div className="skeleton-hero-img skeleton-shimmer"></div>
              <div className="skeleton-hero-content">
                <div className="skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-text skeleton-shimmer" style={{marginTop: '2rem'}}></div>
                <div className="skeleton-text skeleton-shimmer"></div>
                <div className="skeleton-text medium skeleton-shimmer"></div>
              </div>
            </div>
            <div className="skeleton-section-title"></div>
            <div className="skeleton-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-card-img skeleton-shimmer"></div>
                  <div className="skeleton-card-content">
                    <div className="skeleton-title small skeleton-shimmer"></div>
                    <div className="skeleton-text skeleton-shimmer"></div>
                    <div className="skeleton-text skeleton-shimmer"></div>
                    <div className="skeleton-text short skeleton-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Content renders only after client-side hydration
          <>
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
              <MoreStories isIndex={true} posts={morePosts} isCommunity={false} initialPageInfo={pageInfo} />
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const emptyData = { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };

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
