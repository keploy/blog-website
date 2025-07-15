import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../../components/container";
import HeroPost from "../../components/hero-post";
import Layout from "../../components/layout";
import { getAllPostsForCommunity } from "../../lib/api";
import Header from "../../components/header";
import BlogPagination from "../../components/BlogPagination";

export default function Community({ allPosts: { edges, pageInfo }, preview }) {
  const heroPost = edges[0]?.node;
  const excerpt = getExcerpt(edges[0]?.node.excerpt);
  const morePosts = edges.slice(1);

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

  // Transform the posts data to match BlogPagination interface
  const transformedPosts = morePosts.map(({ node }) => ({
    id: node.id || node.slug,
    title: node.title,
    excerpt: getExcerpt(node.excerpt), // Use the existing getExcerpt function
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
      Description={`Blog from the Community Page`}
    >
      <Head>
        <title>{`Keploy Blog`}</title>
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
            isCommunity={true}
          />
        )}
        
        {/* Paginated Posts Section */}
        {transformedPosts.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <BlogPagination 
              posts={transformedPosts} 
              postsPerPage={6}
              category="community"
            />
          </div>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForCommunity(preview);

  return {
    props: { allPosts, preview },
    revalidate: 10,
  };
};