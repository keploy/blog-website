import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Intro from "../../components/intro";
import Layout from "../../components/layout";
import { getAllPostsForHome, getAllTags } from "../../lib/api";
import { CMS_NAME } from "../../lib/constants";
import Header from "../../components/header";

export default function Community({ allPosts: { edges }, preview }) {
  const heroPost = edges[0]?.node;
  const excerpt = getExcerpt(edges[0]?.node.excerpt);
  const morePosts = edges.slice(1);
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
    <Layout preview={preview} featuredImage={heroPost?.featuredImage?.node.sourceUrl} Title={heroPost?.title} Description={`Blog from the Technology Page`}>
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
            isCommunity={true}
          />
        )}
        {morePosts.length > 0 && (
          <MoreStories posts={morePosts} isCommunity={true} />
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForHome(preview);
  return {
    props: { allPosts, preview },
    revalidate: 10,
  };
};
