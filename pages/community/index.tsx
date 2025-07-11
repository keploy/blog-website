import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForCommunity } from "../../lib/api";
import Header from "../../components/header";

export default function Community({ allPosts: { edges, pageInfo }, preview }) {
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
        <title>{`Keploy Blog`}</title>
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
            authorImage={heroPost.author.node.avatar.url}
            postId={heroPost.postId}
          />
        )}
        {morePosts.length > 0 && (
          <MoreStories isIndex={true} posts={morePosts} isCommunity={true} initialPageInfo={pageInfo} />
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