import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPostsForCommunity, getAllPostsForTechnology, getAllTags } from "../lib/api";
import Header from "../components/header";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import TopBlogs from "../components/topBlogs";
import Testimonials from "../components/testimonials";
import BlogHero from "../components/BlogHero";
export default function Index({ communityPosts, technologyPosts, tags, preview }) {
  return (

    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Blog - Keploy`}
      Description={"The Keploy Blog offers in-depth articles and expert insights on software testing, automation, and quality assurance, empowering developers to enhance their testing strategies and deliver robust applications."}>
      <Head>
        <title>{`Engineering | Keploy Blog`}</title>
      </Head>
      <Header compact transparentOnTop />
      <BlogHero
        latestPost={communityPosts && communityPosts[0] ? communityPosts[0].node : undefined}
        tags={tags}
      />
      <Container>
        <TopBlogs
          communityPosts={communityPosts}
          technologyPosts={technologyPosts}
        />
        <Testimonials />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const [allCommunityPosts, allTehcnologyPosts, allTags] = await Promise.all([
    getAllPostsForCommunity(preview),
    getAllPostsForTechnology(preview),
    getAllTags(),
  ]);

  return {
    props: {
      communityPosts:
        allCommunityPosts?.edges?.length > 3
          ? allCommunityPosts?.edges?.slice(0, 3)
          : allCommunityPosts?.edges,
      technologyPosts:
        allTehcnologyPosts?.edges?.length > 3
          ? allTehcnologyPosts?.edges?.slice(0, 3)
          : allTehcnologyPosts.edges,
      tags: (allTags || []).slice(0, 10).map((t) => (t?.node?.name || t?.name || "")).filter(Boolean),
      preview,
    },
    revalidate: 10,
  };
};