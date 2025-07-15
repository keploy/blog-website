import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  console.log("tech posts: ", edges.length);
  const heroPost = edges[0]?.node;
  const excerpt = heroPost ? getExcerpt(heroPost.excerpt, 50) : null;

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
        {edges.length > 1 && (
          <MoreStories
            isIndex={true}
            posts={edges.slice(1)} 
            isCommunity={false}
            initialPageInfo={pageInfo}
          />
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  try {
    const allPosts = await getAllPostsForTechnology(preview);
    return { props: { allPosts, preview }, revalidate: 10 };
  } catch (error) {
    return {
      props: { allPosts: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } }, preview },
      revalidate: 10,
    };
  }
};
