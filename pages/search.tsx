import Head from "next/head";
import Container from "../components/container";
import Layout from "../components/layout";
import MoreStories from "../components/more-stories";
import { getAllPostsForSearch } from "../lib/api"; // This now exists
import { Post } from "../types/post";
import { HOME_OG_IMAGE_URL, S3_ASSET_BASE } from "../lib/constants";
import { getBreadcrumbListSchema, SITE_URL } from "../lib/structured-data";
import { REVALIDATE_CONTENT } from "../lib/isr";

export default function SearchPage({ allPosts }: { allPosts: { node: Post }[] }) {
  // Never echo the visitor's query into <head> title or meta tags (defense in depth alongside strict mode; see components/KeployUICapture.tsx).
  const pageTitle = "Search | Keploy Blog";

  // This page is noindex, so search engines don't process its structured data.
  // SearchResultsPage was dead markup here (review #8); the breadcrumb is kept
  // only as a lightweight nav hint.
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
      Description="Search the Keploy Blog for articles on API testing, test automation, CI/CD, developer tools, and software quality engineering."
      featuredImage={HOME_OG_IMAGE_URL || `${S3_ASSET_BASE}/images/blog-bunny.webp`} // Fallback to string if constant fails
      structuredData={structuredData}
    >
      <Head>
        <title>{pageTitle}</title>
        <meta name="robots" content="noindex, follow" />
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
    revalidate: REVALIDATE_CONTENT,
  };
};
