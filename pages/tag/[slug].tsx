import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Layout from "../../components/layout";
import Header from "../../components/header";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import { getAllPostsFromTags, getAllTags } from "../../lib/api";
import { sanitizeStringForURL } from "../../utils/sanitizeStringForUrl";
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
  const paths = (edgesAllTags || [])
    .map((node) => `/tag/${sanitizeStringForURL(String(node?.name || ""))}`)
    .filter((p) => !!p && !p.endsWith("/tag/"));
  return {
    paths: paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview=false,
  params
}) => {
  let { slug } = params;
  if (Array.isArray(slug)) {
    slug = slug.join('-');
  } else {
    // Replace spaces with dashes
    slug = (slug || '').replace(/\s+/g, '-');
  }
  const safeSlug = sanitizeStringForURL(String(slug || ""));
  const fetched = await getAllPostsFromTags(safeSlug, preview);
  // Ensure no undefined values are passed to props
  const postsByTags = fetched && typeof fetched === 'object'
    ? {
        ...(fetched as any),
        edges: Array.isArray((fetched as any).edges)
          ? (fetched as any).edges.filter(Boolean)
          : [],
      }
    : { edges: [] };
  return {
    props: { postsByTags,preview},
    revalidate: 10,
  };
};
