import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NotFoundPage from "../components/NotFoundPage";
import {
  getFirstTwoPostsForCommunity,
  getFirstTwoPostsForTechnology,
} from "../lib/api";
import PostPreview from "../components/post-preview";
import { getExcerpt } from "../utils/excerpt";

export default function Custom404() {
  const router = useRouter();
  const asPath = router.asPath;

  const [topTechnologyPosts, setTopTechnologyPosts] = useState<any[]>([]);
  const [topCommunityPosts, setTopCommunityPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const tech = await getFirstTwoPostsForTechnology();
      setTopTechnologyPosts(tech.edges || []);
      const community = await getFirstTwoPostsForCommunity();
      setTopCommunityPosts(community.edges || []);
    };

    fetchPosts();

    const redirectTimeout = setTimeout(() => {
      if (asPath.startsWith("/community")) {
        router.replace("/community");
      } else if (asPath.startsWith("/technology")) {
        router.replace("/technology");
      } else {
        router.replace("/");
      }
    }, 5000);

    return () => clearTimeout(redirectTimeout);
  }, [asPath, router]);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Keploy Blog</title>
      </Head>

      <div className="text-center">
        <NotFoundPage />

        <div className="text-center mt-6 text-gray-700">
          <p>You will be redirected in 5 seconds...</p>
        </div>

        {topCommunityPosts.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <h2 className="text-2xl font-semibold text-center mb-6 text-orange-600">
              Community Posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {topCommunityPosts.map(({ node }: any) => (
                <PostPreview
                  key={node.slug}
                  title={node.title}
                  coverImage={node.featuredImage}
                  date={node.date}
                  author={node.ppmaAuthorName}
                  slug={node.slug}
                  excerpt={getExcerpt(node.excerpt, 50)}
                />
              ))}
            </div>
          </section>
        )}

        {topTechnologyPosts.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-16">
            <h2 className="text-2xl font-semibold text-center mb-6 text-orange-600">
              Technology Posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {topTechnologyPosts.map(({ node }: any) => (
                <PostPreview
                  key={node.slug}
                  title={node.title}
                  coverImage={node.featuredImage}
                  date={node.date}
                  author={node.ppmaAuthorName}
                  slug={node.slug}
                  excerpt={getExcerpt(node.excerpt, 50)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
