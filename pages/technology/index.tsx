import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";

export default function Index({ allPosts: { edges }, preview }) {
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
          <MoreStories posts={morePosts} isCommunity={false} />
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
