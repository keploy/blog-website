import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForCommunity } from "../../lib/api";
import Header from "../../components/header";
import { getBreadcrumbListSchema, getCollectionPageSchema, SITE_URL } from "../../lib/structured-data";
import { REVALIDATE_CONTENT } from "../../lib/isr";
import { buildPageTitle } from "../../utils/seo";

// See the note in technology/index.tsx: the <title> was "Keploy Blog" while
// og:title was the hero post's title.
const PAGE_TITLE = "Community Stories & API Testing Tutorials";

export default function Community({ allPosts: { edges, pageInfo }, preview }) {
  const heroPost = edges[0]?.node;
  const excerpt = getExcerpt(edges[0]?.node.excerpt);
  const morePosts = edges.slice(1);
  const structuredData = [
    getBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Community", url: `${SITE_URL}/community` },
    ]),
    getCollectionPageSchema({
      name: "Keploy Community Blog",
      url: `${SITE_URL}/community`,
      description:
        "Developer stories, open-source contributions, API testing tutorials, and hands-on engineering guides from the Keploy community.",
      items: edges.map(({ node }) => ({
        url: `${SITE_URL}/community/${node.slug}`,
        name: node.title,
        image: node.featuredImage?.node?.sourceUrl,
      })),
    }),
  ];
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
      Title={PAGE_TITLE}
      Description={`Explore the Keploy community blog for developer stories, open-source contributions, API testing tutorials, and hands-on engineering guides.`}
      structuredData={structuredData}
      canonicalUrl={`${SITE_URL}/community`}
    >
      <Head>
        <title>{buildPageTitle(PAGE_TITLE)}</title>
      </Head>
      <Header />
      <Container>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">
          Keploy Community Blog
        </h1>
        <p className="text-gray-600 max-w-3xl mb-10">
          Developer stories, open-source contributions, API testing tutorials, and
          hands-on engineering guides from the Keploy community.
        </p>
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
    revalidate: REVALIDATE_CONTENT,
  };
};
