import { useRouter } from "next/router";
import Head from "next/head";
import Container from "../components/container";
import Layout from "../components/layout";
import MoreStories from "../components/more-stories";
import { getAllPostsForSearch } from "../lib/api"; // This now exists
import { Post } from "../types/post";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import { getBreadcrumbListSchema, SITE_URL } from "../lib/structured-data";

export default function SearchPage({ allPosts }: { allPosts: { node: Post }[] }) {
  const router = useRouter();
  const query = (router.query.q as string) || "";

  // Dynamic title based on query
  const pageTitle = query 
    ? `Search Results for "${query}" | Keploy Blog` 
    : "Search | Keploy Blog";

  const structuredData = [
    getBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Search", url: `${SITE_URL}/search` },
    ]),
  ];

  return (
    <Layout
      preview={false} // Required prop
      Title={pageTitle} // Required prop
      Description={`Search results for ${query} on the Keploy Blog.`} // Required prop
      featuredImage={HOME_OG_IMAGE_URL || "/blog/images/blog-bunny.png"} // Fallback to string if constant fails
      structuredData={structuredData}
    >
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Container>
        <div className="mt-10 mb-20">
           {/* Re-using MoreStories in 'Search Page Mode' */}
           <MoreStories 
             posts={allPosts} 
             isCommunity={false} 
             isIndex={false} 
             isSearchPage={true} // Triggers the instant filter logic
           />
        </div>
      </Container>
    </Layout>
  );
}

// Fetch ALL posts at build time to enable instant client-side filtering
export const getStaticProps = async () => {
  const allPosts = await getAllPostsForSearch(false); 
  
  return {
    props: { allPosts },
    revalidate: 60,
  };
};
