import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NotFoundPage from "../components/NotFoundPage";
import { getAllPostsForTechnology, getAllPostsForCommunity } from "../lib/api";
import { GetStaticProps } from "next";
import { getBreadcrumbListSchema, SITE_URL } from "../lib/structured-data";
import { safeJsonLdStringify } from "../utils/seo";

interface Custom404Props {
  latestPosts: { edges: Array<{ node: any }> };
  communityPosts: { edges: Array<{ node: any }> };
  technologyPosts: { edges: Array<{ node: any }> };
}

export default function Custom404({
  latestPosts,
  communityPosts,
  technologyPosts,
}: Custom404Props) {
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
        <meta
          name="description"
          content="Oops! The page you're looking for doesn't exist. Explore our latest blog posts and featured articles."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(structuredData),
          }}
        />
      </Head>
      <NotFoundPage
        latestPosts={latestPosts}
        communityPosts={communityPosts}
        technologyPosts={technologyPosts}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch latest posts from both technology and community
    const [techPosts, communityPosts] = await Promise.all([
      getAllPostsForTechnology(false, null),
      getAllPostsForCommunity(false, null),
    ]);

    // Combine and sort by date to get the latest posts
    const allPosts = [...techPosts.edges, ...communityPosts.edges];
    const sortedPosts = allPosts.sort(
      (a, b) =>
        new Date(b.node.date).getTime() - new Date(a.node.date).getTime(),
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
    const message = error instanceof Error ? error.message : String(error);
    // Structured log mirroring pages/sitemap.xml.tsx so on-call can diagnose
    // from Vercel logs alone. The 404 still renders (with empty post rails)
    // rather than 500ing — these are supplementary "latest posts" widgets.
    console.error("[404] degraded: latest-posts rails empty", {
      endpoint:
        process.env.WORDPRESS_API_URL ||
        process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
      error: message,
      nextSteps: [
        "1. Verify WPGraphQL is up: curl -sS -X POST <endpoint> -H 'Content-Type: application/json' -d '{\"query\":\"{ __typename }\"}'",
        "2. If the curl 5xx's or hangs, check wp.keploy.io host status and the WPGraphQL plugin (WP admin → Plugins)",
        "3. If the endpoint logged above is unexpected, double-check WORDPRESS_API_URL in Vercel project settings and redeploy",
        "4. Page is served with revalidate: 60, so the rails self-heal within ~1 min after WP recovers",
      ],
    });
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
