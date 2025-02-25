import Head from "next/head";
import { GetStaticProps as GetStaticPropsType } from "next"; // Type-only import
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForCommunity } from "../../lib/api";
import Header from "../../components/header";

const getExcerpt = (content: string, maxWords = 50) => {
  const words = content.split(" ");
  return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "..." : content;
};

export default function Community({ allPosts: { edges }, preview }) {
  const heroPost = edges[0]?.node;
  const excerpt = heroPost ? getExcerpt(heroPost.excerpt) : null;
  const morePosts = edges.slice(1);

  return (
    <Layout
      preview={preview}
      featuredImage={heroPost?.featuredImage?.node.sourceUrl}
      Title={heroPost?.title}
      Description={`Blog from the Community Page`}
    >
      <Head>
        <title>{`Keploy Blog`}</title>
        {heroPost?.featuredImage?.node.sourceUrl && (
          <link rel="preload" href={heroPost.featuredImage.node.sourceUrl} as="image" />
        )}
        <style>{`
          .hero-title { font-size: 2.5rem; font-weight: bold; }
          @media (min-width: 768px) { .hero-title { font-size: 3rem; } }
        `}</style>
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
            isCommunity={true}
          />
        )}
        {morePosts.length > 0 && (
          <MoreStories isIndex={true} posts={morePosts} isCommunity={true} />
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticPropsType = async ({ preview = false }) => {
  const allPosts = await getAllPostsForCommunity(preview);
  return {
    props: { allPosts, preview },
    revalidate: 300,
  };
};