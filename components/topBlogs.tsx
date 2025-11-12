import { getExcerpt } from "../utils/excerpt";
import Link from "next/link";
import FeaturedPostCard from "./featured-post-card";
import LatestPostCard from "./latest-post-card";
import BentoGrid from "./bento-grid";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";

const TopBlogs = ({ communityPosts, technologyPosts }) => {
  // Combine and sort all posts by date for featured section
  const allPosts = [
    ...(technologyPosts || []).map(({ node }) => ({ ...node, isCommunity: false })),
    ...(communityPosts || []).map(({ node }) => ({ ...node, isCommunity: true })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get featured posts (top 3-4 most recent)
  const featuredPosts = allPosts.slice(0, 4);
  
  // Get latest posts (next 6)
  const latestPosts = allPosts.slice(4, 10);

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16">
      {/* Featured Posts Section */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Featured Posts
            </h2>
            <p className="text-gray-600 mt-1">
              Handpicked stories from our community and technology insights
            </p>
          </div>
        </div>

        <BentoGrid>
          {featuredPosts.map((post, index) => (
            <FeaturedPostCard
              key={post.slug}
              title={post.title}
              coverImage={post.featuredImage}
              date={post.date}
              author={post.ppmaAuthorName}
              slug={post.slug}
              excerpt={getExcerpt(post.excerpt, 20)}
              isCommunity={post.isCommunity}
              variant={index === 0 ? "large" : index === 1 ? "medium" : "small"}
            />
          ))}
        </BentoGrid>
      </div>

      {/* Latest Posts Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Latest Posts
              </h2>
              <p className="text-gray-600 mt-1">
                Fresh content from our blog
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {latestPosts.map((post) => (
            <LatestPostCard
              key={post.slug}
              title={post.title}
              coverImage={post.featuredImage}
              date={post.date}
              author={post.ppmaAuthorName}
              slug={post.slug}
              excerpt={getExcerpt(post.excerpt, 15)}
              isCommunity={post.isCommunity}
            />
          ))}
        </div>
      </div>

      {/* Category Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Link
          href="/technology"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-1"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
              Technology Blogs
            </h3>
            <p className="text-gray-600 mb-4">
              Explore in-depth technical articles, tutorials, and insights
            </p>
            <div className="flex items-center text-orange-600 font-semibold">
              View all posts
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        </Link>

        <Link
          href="/community"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Community Blogs
            </h3>
            <p className="text-gray-600 mb-4">
              Stories, experiences, and contributions from our community
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              View all posts
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        </Link>
      </div>
    </section>
  );
};

export default TopBlogs;