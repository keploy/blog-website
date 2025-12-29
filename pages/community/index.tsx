import Head from "next/head";
import { GetStaticProps } from "next";
import { useState, useEffect } from "react";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import HeroPostSkeleton from "../../components/skeletons/HeroPostSkeleton";
import Layout from "../../components/layout";
import { getAllPostsForCommunity } from "../../lib/api";
import Header from "../../components/header";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { useConnectionAwareSkeleton } from "../../hooks/useConnectionAwareSkeleton";

export default function Community({ allPosts: { edges, pageInfo }, preview }) {
  const safeEdges = edges || [];
  const [displayPosts, setDisplayPosts] = useState(safeEdges);
  const showSkeleton = useConnectionAwareSkeleton();

  useEffect(() => {
    setDisplayPosts(edges || []);
  }, [edges]);

  const heroPost = displayPosts[0]?.node || safeEdges[0]?.node;
  const excerpt = getExcerpt(heroPost?.excerpt || "");
  const morePosts = heroPost ? displayPosts.slice(1) : [];
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

  const layoutTitle = heroPost?.title || "Keploy Community Blog";
  const layoutDescription = heroPost
    ? getExcerpt(heroPost?.excerpt || "")
    : "Latest stories from the Keploy community.";
  const layoutImage =
    heroPost?.featuredImage?.node?.sourceUrl || HOME_OG_IMAGE_URL;

  return (
    <Layout
      preview={preview}
      featuredImage={layoutImage}
      Title={layoutTitle}
      Description={layoutDescription}
    >
      <Head>
        <title>{`Keploy Blog`}</title>
      </Head>
      <Header />
      <Container>
        {heroPost && (
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
                isCommunity={true}
              />
            </div>
            {showSkeleton && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <HeroPostSkeleton />
              </div>
            )}
          </div>
        )}

        {morePosts.length > 0 && (
          <div className="relative mt-10">
            <MoreStories
              isIndex={true}
              posts={morePosts}
              isCommunity={true}
              initialPageInfo={pageInfo}
              initialSkeleton={showSkeleton}
              initialSkeletonCount={11}
            />
          </div>
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
