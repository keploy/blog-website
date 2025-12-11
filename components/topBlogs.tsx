import { getExcerpt } from "../utils/excerpt";
import Link from "next/link";
import PostBentoGrid from "./post-bento-grid";
import PostBentoCard from "./post-bento-card";

const TopBlogs = ({ communityPosts, technologyPosts }) => {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      {/* TECHNOLOGY BLOGS */}
      <div className="mb-16">
        <h3 className="text-center lg:text-left w-max mb-6 text-3xl lg:text-4xl font-bold tracking-tighter leading-tight mt-16 bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom">
          Recent Technology Blogs
        </h3>

        <PostBentoGrid>
          {technologyPosts.map(({ node } , i : number) => (
            <PostBentoCard
              key={node.slug}
              title={node.title}
              coverImage={node.featuredImage}
              excerpt={getExcerpt(node.excerpt, 20)}
              author={node.ppmaAuthorName}
              slug={node.slug}
              readTime={node.readingTime || 2} // fallback
              size={i === 0 ? "tall" : i === 0 ? "wide" : "wide"}
            />
          ))}
        </PostBentoGrid>

        <div className="mt-6 flex justify-end">
          <Link
            href="/technology"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2"
          >
            See all technology blogs →
          </Link>
        </div>
      </div>

      {/* COMMUNITY BLOGS */}
      <div>
        <h3 className="text-center lg:text-left w-max mb-6 text-3xl lg:text-4xl font-bold tracking-tighter leading-tight mt-16 bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom">
          Recent Community Blogs
        </h3>

        <PostBentoGrid>
          {communityPosts.map(({ node }, i: number) => (
            <PostBentoCard
              key={node.slug}
              title={node.title}
              coverImage={node.featuredImage}
              excerpt={getExcerpt(node.excerpt, 20)}
              author={node.ppmaAuthorName}
              slug={node.slug}
              readTime={node.readingTime || 2}
              size={i === 1 ? "tall" : i === 2 ? "wide" : "wide"}
            />
          ))}
        </PostBentoGrid>

        <div className="mt-6 flex justify-end">
          <Link
            href="/community"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2"
          >
            See all community blogs →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopBlogs;
