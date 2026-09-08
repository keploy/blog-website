import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import { getBreadcrumbListSchema, getCollectionPageSchema, SITE_URL } from "../../lib/structured-data";
import { REVALIDATE_CONTENT, REVALIDATE_ERROR } from "../../lib/isr";
import { buildPageTitle } from "../../utils/seo";

// Descriptive page title for this archive. Previously the <title> was the bare
// string "Keploy" (SEMrush "title too short") while og:title was the hero post's
// title, so the document title and social metadata described different things.
const PAGE_TITLE = "Technology Articles & API Testing Guides";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  const heroPost = edges[0]?.node;
  const excerpt = edges[0] ? getExcerpt(edges[0].node.excerpt, 50) : null;
  const morePosts = edges.slice(1);
  const structuredData = [
    getBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Technology", url: `${SITE_URL}/technology` },
    ]),
    getCollectionPageSchema({
      name: "Keploy Technology Blog",
      url: `${SITE_URL}/technology`,
      description:
        "In-depth technology articles on API testing, test automation, CI/CD pipelines, eBPF-based testing, and modern software quality engineering.",
      items: edges.map(({ node }) => ({
        url: `${SITE_URL}/technology/${node.slug}`,
        name: node.title,
        image: node.featuredImage?.node?.sourceUrl,
      })),
    }),
  ];

  return (
    <Layout
      preview={preview}
      featuredImage={heroPost?.featuredImage?.node.sourceUrl}
      Title={PAGE_TITLE}
      Description={`Read in-depth Keploy technology articles on API testing, test automation, CI/CD pipelines, eBPF-based testing, and modern software quality engineering.`}
      structuredData={structuredData}
      canonicalUrl={`${SITE_URL}/technology`}
    >
      <Head>
        <title>{buildPageTitle(PAGE_TITLE)}</title>
      </Head>
      <Header />
      <Container>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">
          Keploy Technology Blog
        </h1>
        <p className="text-gray-600 max-w-3xl mb-10">
          In-depth articles on API testing, test automation, CI/CD pipelines,
          eBPF-based testing, and modern software quality engineering.
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
            isCommunity={false}
          />
        )}
        {morePosts.length > 0 && (
          <MoreStories isIndex={true} posts={morePosts} isCommunity={false} initialPageInfo={pageInfo} />
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
      revalidate: REVALIDATE_CONTENT,
    };
  } catch (error) {
    console.error("technology/index getStaticProps error:", error);
    return {
      props: { allPosts: emptyData, preview },
      revalidate: REVALIDATE_ERROR,
    };
  }
};
