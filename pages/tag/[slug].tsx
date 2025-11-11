import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Layout from "../../components/layout";
import Header from "../../components/header";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import { getAllPostsFromTags, getAllTags } from "../../lib/api";
import TagsStories from "../../components/TagsStories";
import { useRouter } from "next/router";
export default function PostByTags({ postsByTags,preview}) {
  const posts = postsByTags?.edges || [];
  const router = useRouter();
  const {slug} = router.query;
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`${slug} posts`}
      Description={`Posts by tag-${slug}`}
    >
      <Head>
        <title>{`${slug} posts`}</title>
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
  const paths = edgesAllTags.map((node) => `/tag/${node.name}`) || []; // Extract tag names from the nodes and create paths
  return {
    paths: paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const paramSlug = params?.slug;

  if (!paramSlug) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  let slug = Array.isArray(paramSlug) ? paramSlug.join("-") : paramSlug;
  slug = slug.replace(/\s+/g, "-");

  try {
    const postsByTags = await getAllPostsFromTags(slug.toString(), preview);

    return {
      props: { postsByTags: postsByTags || { edges: [] }, preview },
      revalidate: 10,
    };
  } catch (error) {
    console.error("tag/[slug] getStaticProps error:", error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
};
