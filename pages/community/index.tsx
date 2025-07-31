import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForCommunity } from "../../lib/api";
import Header from "../../components/header";
import { cn } from "../../lib/utils";

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
    <Layout
      preview={preview}
      featuredImage={heroPost?.featuredImage?.node.sourceUrl}
      Title={heroPost?.title}
      Description={`Blog from the Technology Page`}
    >
      <Head>
        <title>{`Keploy Blog`}</title>
      </Head>
      <div className="relative isolate h-auto overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 z-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#a1a1aa_1px,transparent_1px),linear-gradient(to_bottom,#a1a1aa_1px,transparent_1px)]"
          )}
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-b from-orange-100/70 via-orange-50/80 to-white" />

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#FBFCFF] z-20" />

        <div className="relative z-30">
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
                authorImage={heroPost.author.node.avatar.url}
                postId={heroPost.postId}
              />
            )}
          </Container>
        </div>
      </div>
      <Container>
        {morePosts.length > 0 && (
          <MoreStories
            isIndex={true}
            posts={morePosts}
            isCommunity={true}
            initialPageInfo={pageInfo}
          />
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