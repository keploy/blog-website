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
      Title={`${postsByTags?.slug || "Tag"} posts`}
      Description={`Posts by tag-${postsByTags?.slug || "unknown"}`}
    >
      <Head>
        <title>{`${postsByTags?.slug || "Tag"} posts`}</title>
        <link rel="preload" href={HOME_OG_IMAGE_URL} as="image" />
        <style>{`
          .tags-stories { margin-top: 1rem; }
        `}</style>
      </Head>
      <Header />
      <Container>
        <TagsStories posts={posts} />
      </Container>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const edgesAllTags = await getAllTags();
  const paths = edgesAllTags.map((node) => `/tag/${node.name}`) || [];
  return {
    paths: paths.slice(0, 50),
    fallback: "blocking", 
  };
};

export const getStaticProps: GetStaticProps = async ({ preview = false, params }) => {
  let { slug } = params;
  if (Array.isArray(slug)) {
    slug = slug.join("-");
  } else {
    slug = slug.replace(/\s+/g, "-");
  }
  const postsByTags = await getAllPostsFromTags(slug.toString(), preview);
  return {
    props: { postsByTags: { ...postsByTags, slug }, preview },
    revalidate: 300,
  };
};