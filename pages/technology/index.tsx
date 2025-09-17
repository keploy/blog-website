import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import BlogPagination from "../../components/BlogPagination";

export default function Index({ allPosts: { edges, pageInfo }, preview }) {
  console.log("tech posts: ", edges.length);
  const heroPost = edges[0]?.node;
  const excerpt = edges[0] ? getExcerpt(edges[0].node.excerpt, 50) : null;
  const morePosts = edges.slice(1);

  // Transform the posts data to match BlogPagination interface
  const transformedPosts = morePosts.map(({ node }) => ({
    id: node.id || node.slug,
    title: node.title,
    excerpt: getExcerpt(node.excerpt, 100), // Adjust excerpt length as needed
    date: node.date,
    author: node.ppmaAuthorName,
    slug: node.slug,
    categories: node.categories?.edges?.map(({ node: cat }) => ({ name: cat.name })) || [],
    featuredImage: node.featuredImage
  }));

  return (
    <Layout
      preview={preview}
      featuredImage={heroPost?.featuredImage?.node.sourceUrl}
      Title={heroPost?.title}
      Description={`Blog from the Technology Page`}
    >
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Header />
      <Container>
        {/* Hero Post Section */}
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
        
        {/* Paginated Posts Section */}
        {transformedPosts.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <BlogPagination 
              posts={transformedPosts} 
              postsPerPage={6}
              category="technology"
            />
          </div>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForTechnology(preview);

  return {
    props: { allPosts, preview },
    revalidate: 10,
  };
};