import PostPreview from "./post-preview";
import { getExcerpt } from "../utils/excerpt";
import Link from "next/link";

const TopBlogs = ({ communityPosts, technologyPosts }) => {
  return (
    <>
      <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        Top Technology Blogs
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-4">
        {technologyPosts.map(({ node }) => (
          <PostPreview
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            date={node.date}
            author={node.postAuthor}
            slug={node.slug}
            excerpt={getExcerpt(node.excerpt, 20)}
            isCommunity={false}
          />
        ))}
      </div>
      <div className="w-full flex justify-end bold underline text-md">
        <Link
          href="/technology"
          className="text-secondary-100 hover:text-secondary-200 hover:translate-x-0.5 transition "
        >
          See all technology blogs
        </Link>
      </div>

      <h3 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        Top Community Blogs
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-4 ">
        {communityPosts.map(({ node }) => (
          <PostPreview
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            date={node.date}
            author={node.postAuthor}
            slug={node.slug}
            excerpt={getExcerpt(node.excerpt, 20)}
            isCommunity={true}
          />
        ))}
      </div>
      <div className="w-full flex justify-end bold underline text-md mb-16">
        <Link
          href="/community"
          className="text-secondary-100 hover:text-secondary-200 hover:translate-x-0.5 transition "
        >
          See all community blogs
        </Link>
      </div>
    </>
  );
};
export default TopBlogs;
