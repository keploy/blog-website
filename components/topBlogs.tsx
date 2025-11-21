import { getExcerpt } from "../utils/excerpt";
import Link from "next/link";
import PostCard from "./post-card";
import PostGrid from "./post-grid";
import { PostGridSkeleton } from "./skeletons";

const TopBlogs = ({ communityPosts, technologyPosts, isLoading = false }) => {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 ">
      <div className="mb-16">
        <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        Recent Technology Blogs
          <span className="absolute left-0 bottom-0 w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></span>
        </h3>

        {isLoading ? (
          <PostGridSkeleton count={3} />
        ) : (
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
        )}

        <div className="mt-6 flex justify-end">
          <Link
            href="/technology"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center transition-colors duration-300"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
         Recent Community Blogs
          <span className="absolute left-0 bottom-0 w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></span>
        </h3>

        {isLoading ? (
          <PostGridSkeleton count={3} />
        ) : (
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
        )}

        <div className="mt-6 flex justify-end">
          <Link
            href="/community"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center transition-colors duration-300"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopBlogs;