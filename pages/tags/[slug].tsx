import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Layout from "../../components/layout";
import Header from "../../components/header";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import { getAllPostsFromTags, getAllTags } from "../../lib/api";
import TagsStories from "../../components/TagsStories";

export default function PostByTags({ postsByTags, preview }) {
  const posts = postsByTags?.edges || [];
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Tags`}
      Description={`List of All the Tags`}
    >
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Header />
      <Container>
        <TagsStories posts={posts} />
      </Container>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allTags = await getAllTags();
  const paths = allTags.edges.flatMap(({ node }) => {
    const tagNames = node.tags.edges.map(({ node }) => node.name);
    return tagNames.map(tagName => `/tags/${tagName}`);
  }) || [];
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const { slug } = params;
  const postsByTags = await getAllPostsFromTags(slug, preview);
  return {
    props: { postsByTags, preview },
    revalidate: 10,
  };
};
