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
      const community = await getFirstTwoPostsForCommunity();
      const tech = await getFirstTwoPostsForTechnology();

      setTopTechnologyPosts(tech.edges || []);
      setTopCommunityPosts(community.edges || []);
    };

    fetchPosts();
  }, [asPath, router]);

  const redirect = () => {
    if (asPath.startsWith("/community/")) {
      router.replace("/community");
    } else if (asPath.startsWith("/technology")) {
      router.replace("/technology");
    } else {
      router.replace("/");
    }
  };

  return (
    <>
      <Head>
        <title>Keploy Blog</title>
      </Head>

      <div className="text-center flex flex-col gap-1">
        <NotFoundPage />

        <button
          onClick={() => redirect()}
          className="underline"
        >
          Home
        </button>

        {topCommunityPosts.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
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
