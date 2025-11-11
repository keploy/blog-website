import { getExcerpt } from "../utils/excerpt";
import Link from "next/link";
import PostCard from "./post-card";
import PostGrid from "./post-grid";

const TopBlogs = ({ communityPosts, technologyPosts }) => {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      {/* ==== Technology Blogs Section ==== */}
      <div className="mb-16">
        <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-400 dark:to-yellow-300 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
          Recent Technology Blogs
          <span className="absolute left-0 bottom-0 w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-yellow-400"></span>
        </h3>

        <PostGrid>
          {technologyPosts.map(({ node }) => (
            <PostCard
              key={node.slug}
              title={node.title}
              coverImage={node.featuredImage}
              date={node.date}
              author={node.ppmaAuthorName}
              slug={node.slug}
              excerpt={getExcerpt(node.excerpt, 20)}
              isCommunity={false}
            />
          ))}
        </PostGrid>

        {/* See All Technology Blogs Button */}
        <div className="mt-6 flex justify-end">
          <Link
            href="/technology"
            className="see-all-btn inline-flex items-center font-semibold px-5 py-2 rounded-lg border border-gray-300 dark:border-white text-orange-500 dark:text-white bg-transparent dark:bg-[#2b2b30] hover:bg-orange-100 dark:hover:bg-[#3a3a40] hover:text-orange-600 dark:hover:border-orange-400 transition-all duration-300"
          >
            See all technology blogs
            <span className="ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* ==== Community Blogs Section ==== */}
      <div>
        <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-400 dark:to-yellow-300 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
          Recent Community Blogs
          <span className="absolute left-0 bottom-0 w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-yellow-400"></span>
        </h3>

        <PostGrid>
          {communityPosts.map(({ node }) => (
            <PostCard
              key={node.slug}
              title={node.title}
              coverImage={node.featuredImage}
              date={node.date}
              author={node.ppmaAuthorName}
              slug={node.slug}
              excerpt={getExcerpt(node.excerpt, 20)}
              isCommunity={true}
            />
          ))}
        </PostGrid>

        {/* See All Community Blogs Button */}
        <div className="mt-6 flex justify-end">
          <Link
            href="/community"
            className="see-all-btn inline-flex items-center font-semibold px-5 py-2 rounded-lg border border-gray-300 dark:border-white text-orange-500 dark:text-white bg-transparent dark:bg-[#2b2b30] hover:bg-orange-100 dark:hover:bg-[#3a3a40] hover:text-orange-600 dark:hover:border-orange-400 transition-all duration-300"
          >
            See all community blogs
            <span className="ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopBlogs;
