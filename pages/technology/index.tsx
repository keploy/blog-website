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

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  console.log("tech posts: ", edges.length)
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
        <title>{`Keploy`}</title>
      </Head>
      <Header />
      <Container>
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
          <MoreStories isIndex={true} posts={morePosts} isCommunity={false} initialPageInfo={pageInfo}/>
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
