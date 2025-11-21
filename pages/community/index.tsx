import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForCommunity } from "../../lib/api";
import Header from "../../components/header";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";
import { useState, useEffect } from "react";

export default function Community({ allPosts: { edges, pageInfo }, preview }) {
  // Start false - skeleton shows immediately
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Runs only after client hydration
    setIsHydrated(true);
  }, []);
  
  const heroPost = edges[0]?.node;
  const excerpt = getExcerpt(edges[0]?.node.excerpt);
  const morePosts = edges.slice(1);
  const structuredData = [
    getBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Community", url: `${SITE_URL}/community` },
    ]),
  ];
  function getExcerpt(content) {
    const maxWords = 50;
    // Split the content into an array of words
    const words = content.split(" ");

    // Ensure the excerpt does not exceed the maximum number of words
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }

    return content;
  }

  return (
    <Layout
      preview={preview}
      featuredImage={heroPost?.featuredImage?.node.sourceUrl}
      Title={heroPost?.title}
      Description={`Blog from the Technology Page`}
      structuredData={structuredData}
    >
      <Head>
        <title>{`Keploy Blog`}</title>
      </Head>
      <Header />
      <Container>
        {!isHydrated ? (
          // Skeleton renders immediately as default state
          <div className="loading-skeleton">
            <div className="skeleton-hero">
              <div className="skeleton-hero-img skeleton-shimmer"></div>
              <div className="skeleton-hero-content">
                <div className="skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-text skeleton-shimmer mt-8"></div>
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
          // Content shows after hydration
          <>
            {heroPost && (
              <HeroPost
                title={heroPost.title}
                coverImage={heroPost.featuredImage}
                date={heroPost.date}
                author={heroPost.ppmaAuthorName}
                slug={heroPost.slug}
                excerpt={excerpt}
                isCommunity={true}
              />
            )}
            {morePosts.length > 0 && (
              <MoreStories posts={morePosts} isCommunity={true} />
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForCommunity(preview);

  return {
    props: { allPosts, preview },
    revalidate: 10,
  };
};
