import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Layout from "../../components/layout";
import Header from "../../components/header";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import { getAllPostsFromTags, getAllTags } from "../../lib/api";
import TagsStories from "../../components/TagsStories";
import { useRouter } from "next/router";
import { getBreadcrumbListSchema, getCollectionPageSchema, SITE_URL } from "../../lib/structured-data";
import { REVALIDATE_CONTENT, REVALIDATE_ERROR, REVALIDATE_NOT_FOUND } from "../../lib/isr";
import { buildPageTitle } from "../../utils/seo";
export default function PostByTags({ postsByTags, preview, tagSlug: tagSlugProp }) {
  const posts = postsByTags?.edges || [];
  const router = useRouter();
  const tagSlug = tagSlugProp || (Array.isArray(router.query.slug) ? router.query.slug[0] : (router.query.slug || ''));
  // Percent-encode the slug for every emitted URL — the tag hub already does
  // (pages/tag/index.tsx), so without this a tag like "c#" produces /tag/c%23
  // on the hub but a raw /tag/c# here, where everything after # is a fragment.
  // The ItemList entry and the canonical would then disagree.
  const encodedTagSlug = encodeURIComponent(tagSlug);
  const tagDisplay = tagSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'All Topics';
  // "{tag} posts" is a SEMrush "title too short" on the shorter tags (/tag/ai,
  // /tag/go, /tag/qa ...). buildPageTitle caps the long end, so the only risk
  // here is being too short.
  const pageTitle = `${tagDisplay} Articles & Tutorials`;
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={pageTitle}
      Description={`Browse all Keploy blog posts tagged "${tagDisplay}" — tutorials, guides, and expert insights on ${tagDisplay} for developers and QA engineers.`}
      structuredData={[
        getBreadcrumbListSchema([
          { name: "Home", url: SITE_URL },
          { name: "Tags", url: `${SITE_URL}/tag` },
          { name: `${tagDisplay || "Tag"}`, url: `${SITE_URL}/tag/${encodedTagSlug || ""}` },
        ]),
        getCollectionPageSchema({
          name: `${tagDisplay} posts`,
          url: `${SITE_URL}/tag/${encodedTagSlug || ""}`,
          description: `Keploy blog posts tagged "${tagDisplay}".`,
          items: posts.map(({ node }: any) => {
            const isCommunity =
              node.categories?.edges?.[0]?.node?.name === "community";
            return {
              url: `${SITE_URL}/${isCommunity ? "community" : "technology"}/${node.slug}`,
              name: node.title,
              image: node.featuredImage?.node?.sourceUrl,
            };
          }),
        }),
      ]}
      canonicalUrl={tagSlug ? `${SITE_URL}/tag/${encodedTagSlug}` : `${SITE_URL}/tag`}
    >
      <Head>
        <title>{buildPageTitle(pageTitle)}</title>
      </Head>
      <Header />
      <Container>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">
          {tagDisplay} posts
        </h1>
        <p className="text-gray-600 max-w-3xl mb-10">
          Browse all Keploy blog posts tagged &quot;{tagDisplay}&quot; — tutorials,
          guides, and expert insights on {tagDisplay} for developers and QA engineers.
        </p>
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
    fallback: "blocking",
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
      revalidate: REVALIDATE_NOT_FOUND,
    };
  }

  let slug = Array.isArray(paramSlug) ? paramSlug.join("-") : paramSlug;
  slug = slug.replace(/\s+/g, "-");

  try {
    const postsByTags = await getAllPostsFromTags(slug.toString(), preview);

    return {
      props: { postsByTags: postsByTags || { edges: [] }, preview, tagSlug: slug },
      revalidate: REVALIDATE_CONTENT,
    };
  } catch (error) {
    console.error("tag/[slug] getStaticProps error:", error);
    return {
      notFound: true,
      revalidate: REVALIDATE_ERROR,
    };
  }
};
