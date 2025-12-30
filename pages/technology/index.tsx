import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import HeroPostSkeleton from "../../components/skeletons/HeroPostSkeleton";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { useConnectionAwareSkeleton } from "../../hooks/useConnectionAwareSkeleton";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  const safeEdges = edges ?? [];
  const heroPost = safeEdges[0]?.node;
  const excerpt = heroPost ? getExcerpt(heroPost.excerpt, 50) : null;
  const morePosts = safeEdges.slice(1);
  const layoutTitle = heroPost?.title ?? "Keploy Technology Blog";
  const layoutDescription = heroPost
    ? getExcerpt(heroPost.excerpt, 30)
    : "Latest updates from Keploy's technology team.";
  const layoutImage =
    heroPost?.featuredImage?.node?.sourceUrl ?? HOME_OG_IMAGE_URL;
  const showSkeleton = useConnectionAwareSkeleton();
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

  const structuredData = [
    getBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Technology", url: `${SITE_URL}/technology` },
    ]),
  ];

  return (
    <Layout
      preview={preview}
      featuredImage={layoutImage}
      Title={layoutTitle}
      Description={layoutDescription}
      structuredData={structuredData}
    >
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Header />
      <Container>
        {heroPost ? (
          <>
            <div className="relative">
              <div
                className={`transition-opacity duration-300 ${
                  showSkeleton ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden={showSkeleton}
              >
                <HeroPost
                  title={heroPost.title}
                  coverImage={heroPost.featuredImage}
                  date={heroPost.date}
                  author={heroPost.ppmaAuthorName}
                  slug={heroPost.slug}
                  excerpt={excerpt}
                  isCommunity={false}
                />
              </div>
              {showSkeleton && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <HeroPostSkeleton />
                </div>
              )}
            </div>
            {morePosts.length > 0 && (
              <div className="relative mt-10">
                <MoreStories
                  isIndex={true}
                  posts={morePosts}
                  isCommunity={false}
                  initialPageInfo={pageInfo}
                  initialSkeleton={showSkeleton}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">
            No technology posts are available right now. Please check back soon.
          </p>
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
