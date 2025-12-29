import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import HeroPost from "../../components/hero-post"; // <--- Imported HeroPost
import Layout from "../../components/layout";
import Header from "../../components/header";
import { getAllPostsForSearch } from "../../lib/api";
import { Post } from "../../types/post";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { getExcerpt } from "../../utils/excerpt"; // Importing from utils instead of inline
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

export default function CommunitySearch({ allPosts }: { allPosts: { node: Post }[] }) {
  const router = useRouter();
  
  // 1. State for Search Term
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<{ node: Post }[]>([]);

  // 2. Initialize from URL
  useEffect(() => {
    if (router.isReady) {
      const q = router.query.q as string;
      if (q) setSearchTerm(q);
      else setSearchTerm("");
    }
  }, [router.isReady, router.query]);

  // 3. Filtering Logic (This controls Hero vs List)
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = allPosts.filter(({ node }) => 
      node.title.toLowerCase().includes(term) ||
      node.excerpt.toLowerCase().includes(term)
    );
    setFilteredPosts(results);
  }, [searchTerm, allPosts]);

  // 4. Handle Input Change (Passed down to MoreStories)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Update URL without reload
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("q", value);
    else url.searchParams.delete("q");
    window.history.replaceState({ path: url.href }, "", url.toString());
  };

  // 5. Split Logic: Identical to your index.tsx
  const heroPost = filteredPosts[0]?.node;
  const morePosts = filteredPosts.slice(1);
  const excerpt = heroPost ? getExcerpt(heroPost.excerpt, 50) : "";
  const structuredData = [
    getBreadcrumbListSchema([
      { name: "Home", url: SITE_URL },
      { name: "Community", url: `${SITE_URL}/community` },
      { name: "Search", url: `${SITE_URL}/community/search` },
    ]),
  ];

  return (
    <Layout 
      preview={false} 
      featuredImage={heroPost?.featuredImage?.node.sourceUrl || HOME_OG_IMAGE_URL} 
      Title={heroPost?.title || `Search: ${searchTerm}`} 
      Description={`Search results for ${searchTerm}`}
      structuredData={structuredData}
    >
      <Head>
        <title>Keploy Community Search</title>
      </Head>
      
      <Header />
      
      <Container>
        {/* Render HeroPost if we have at least one result */}
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

        {/* Render MoreStories (List + Search Bar) */}
        {/* We pass the SEARCH TERM and HANDLER down so the input box works */}
        <div className="mt-8">
           <MoreStories 
             posts={morePosts} // Pass the sliced list
             isCommunity={true} 
             isIndex={false} 
             isSearchPage={true}
             externalSearchTerm={searchTerm}  // Control the input
             onSearchChange={handleSearchChange} // Capture typing
           />
        </div>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const allPosts = await getAllPostsForSearch(false);
  return {
    props: { allPosts },
    revalidate: 60,
  };
};
