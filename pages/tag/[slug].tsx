import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Layout from "../../components/layout";
import Header from "../../components/header";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import { getAllPostsFromTags, getAllTags } from "../../lib/api";
import TagsStories from "../../components/TagsStories";
import { useRouter } from "next/router";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";
export default function PostByTags({ postsByTags, preview, tagSlug: tagSlugProp }) {
  const posts = postsByTags?.edges || [];
  const router = useRouter();
  const tagSlug = tagSlugProp || (Array.isArray(router.query.slug) ? router.query.slug[0] : (router.query.slug || ''));
  const tagDisplay = tagSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'All Topics';
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`${tagDisplay} posts`}
      Description={`Browse all Keploy blog posts tagged "${tagDisplay}" — tutorials, guides, and expert insights on ${tagDisplay} for developers and QA engineers.`}
      structuredData={[
        getBreadcrumbListSchema([
          { name: "Home", url: SITE_URL },
          { name: "Tags", url: `${SITE_URL}/tag` },
          { name: `${tagDisplay || "Tag"}`, url: `${SITE_URL}/tag/${tagSlug || ""}` },
        ]),
      ]}
      canonicalUrl={tagSlug ? `${SITE_URL}/tag/${tagSlug}` : `${SITE_URL}/tag`}
    >
      <Head>
        <title>{`${tagDisplay} posts`}</title>
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
      props: { postsByTags: postsByTags || { edges: [] }, preview, tagSlug: slug },
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
