import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NotFoundPage from "../components/NotFoundPage";
import { getAllPostsForTechnology, getAllPostsForCommunity } from "../lib/api";
import { GetStaticProps } from "next";
import { getBreadcrumbListSchema, SITE_URL } from "../lib/structured-data";

interface Custom404Props {
  latestPosts: { edges: Array<{ node: any }> };
  communityPosts: { edges: Array<{ node: any }> };
  technologyPosts: { edges: Array<{ node: any }> };
}

export default function Custom404({ latestPosts, communityPosts, technologyPosts }: Custom404Props) {
  const router = useRouter();
  const asPath = router.asPath;
  const structuredData = getBreadcrumbListSchema([
    { name: "Home", url: SITE_URL },
    { name: "Not Found", url: `${SITE_URL}${asPath || "/404"}` },
  ]);

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      if (asPath.startsWith("/community/")) {
        router.replace("/community");
      } else if (asPath.startsWith("/technology/")) {
        router.replace("/technology");
      } else {
        router.replace("/");
      }
    }, 12000); //12 secs

    return () => clearTimeout(redirectTimeout);
  }, [asPath, router]);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Keploy Blog</title>
        <meta name="description" content="Oops! The page you're looking for doesn't exist. Explore our latest blog posts and featured articles." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <NotFoundPage latestPosts={latestPosts} communityPosts={communityPosts} technologyPosts={technologyPosts} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch latest posts from both technology and community
    const [techPosts, communityPosts] = await Promise.all([
      getAllPostsForTechnology(false, null),
      getAllPostsForCommunity(false, null)
    ]);

    // Combine and sort by date to get the latest posts
    const allPosts = [...techPosts.edges, ...communityPosts.edges];
    const sortedPosts = allPosts.sort((a, b) => 
      new Date(b.node.date).getTime() - new Date(a.node.date).getTime()
    );

    // Get latest 6 posts for latest section
    const latestPosts = { edges: sortedPosts.slice(0, 6) };

    // Get latest 6 posts for each category
    const latestCommunityPosts = { edges: communityPosts.edges.slice(0, 6) };
    const latestTechnologyPosts = { edges: techPosts.edges.slice(0, 6) };

    return {
      props: {
        latestPosts,
        communityPosts: latestCommunityPosts,
        technologyPosts: latestTechnologyPosts,
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching posts for 404 page:', error);
    return {
      props: {
        latestPosts: { edges: [] },
        communityPosts: { edges: [] },
        technologyPosts: { edges: [] },
      },
      revalidate: 60,
    };
  }
};
