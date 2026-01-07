import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";
import { useState, useEffect } from "react";
import { HeroPostSkeleton, MoreStoriesSkeleton } from "../../components/skeletons";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  // Start with false - skeleton shows by default
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only runs on client after hydration
    setIsHydrated(true);
  }, []);

  const heroPost = edges[0]?.node;
  const excerpt = edges[0] ? getExcerpt(edges[0].node.excerpt, 50) : null;
  const morePosts = edges.slice(1);
  const structuredData = [
    getBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Technology", url: `${SITE_URL}/technology` },
    ]),
  ];

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
          <>
            <HeroPostSkeleton />
            <section>
              <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
                More Stories
              </h2>
              <MoreStoriesSkeleton count={6} />
            </section>
          </>
        ) : (
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
            {morePosts.length > 0 && <MoreStories posts={morePosts} isCommunity={false} isIndex={true} />}
          </>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForTechnology(preview);

  return {
    props: { allPosts, preview },
    revalidate: 10,
  };
};
