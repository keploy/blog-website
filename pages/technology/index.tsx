import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import { WavyBackground } from "../../components/wavy-background";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
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

      <div className="relative h-auto overflow-hidden">
        <WavyBackground />
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
              authorImage={heroPost.author.node.avatar.url}
              postId={heroPost.postId}
            />
          )}
        </Container>
      </div>

      <Container>
        {morePosts.length > 0 && (
          <MoreStories
            isIndex={true}
            posts={morePosts}
            isCommunity={false}
            initialPageInfo={pageInfo}
          />
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
