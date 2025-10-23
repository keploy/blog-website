import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NotFoundPage from "../components/NotFoundPage";
import { getAllPostsForTechnology, getAllPostsForCommunity } from "../lib/api";
import { GetStaticProps } from "next";

interface Custom404Props {
  latestPosts: { edges: Array<{ node: any }> };
}

export default function Custom404({ latestPosts }: Custom404Props) {
  const router = useRouter();
  const asPath = router.asPath;

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      if (asPath.startsWith("/community/")) {
        router.replace("/community");
      } else if (asPath.startsWith("/technology/")) {
        router.replace("/technology");
      } else {
        router.replace("/");
      }
    }, 300000); // 5 minutes

    return () => clearTimeout(redirectTimeout);
  }, [asPath, router]);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Keploy Blog</title>
        <meta name="description" content="Oops! The page you're looking for doesn't exist. Explore our latest blog posts and featured articles." />
      </Head>
      <NotFoundPage latestPosts={latestPosts} />
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

    return {
      props: {
        latestPosts,
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching posts for 404 page:', error);
    return {
      props: {
        latestPosts: { edges: [] },
      },
      revalidate: 60,
    };
  }
};