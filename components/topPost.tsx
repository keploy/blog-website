import { getExcerpt } from "../utils/excerpt";
import Link from "next/link";
import PostBentoGrid from "./post-bento-grid";
import PostBentoCard from "./post-bento-card";

const TopPosts = ({ featuredPosts, latestPosts }) => {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      {/* TECHNOLOGY BLOGS */}
      <div className="mb-16">
        <h3 className="text-center lg:text-left w-max mb-6 text-3xl lg:text-4xl font-bold tracking-tighter leading-tight mt-16 bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom">
          Featured Posts
        </h3>

        <PostBentoGrid>
          {featuredPosts.map(({ node }, i: number) => (
            <PostBentoCard
              key={node?.slug || `${i}slug`}
              title={node?.title || "title for post"}
              coverImage={
                node?.featuredImage ||
                "https://thumbs.dreamstime.com/b/digital-representation-word-demo-illuminated-blue-orange-lights-high-tech-background-setting-bright-text-375641085.jpg"
              }
              excerpt={getExcerpt(node?.excerpt || " Demo content here  ", 10)}
              author={node?.ppmaAuthorName || "author name"}
              slug={node?.slug || "demo"}
              readTime={node?.readingTime || 2} // fallback
              size={i === 0 ? "tall" : i === 1 || i === 2 ? "wide" : "normal"}
            />
          ))}
        </PostBentoGrid>

        <div className="mt-6 flex justify-end">
          <Link
            href="/technology"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2"
          >
            See all featured Posts →
          </Link>
        </div>
      </div>

      {/* COMMUNITY BLOGS */}
      <div>
        <h3 className="text-center lg:text-left w-max mb-6 text-3xl lg:text-4xl font-bold tracking-tighter leading-tight mt-16 bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom">
          Latest Posts
        </h3>

        <PostBentoGrid>
          {latestPosts.map(({ node }, i: number) => (
            <PostBentoCard
              key={node?.slug || `${i}slug`}
              title={node?.title || "title for post"}
              coverImage={
                node?.featuredImage ||
                "https://thumbs.dreamstime.com/b/digital-representation-word-demo-illuminated-blue-orange-lights-high-tech-background-setting-bright-text-375641085.jpg"
              }
              excerpt={getExcerpt(node?.excerpt || " Demo content here  ", 10)}
              author={node?.ppmaAuthorName || "author name"}
              slug={node?.slug || "demo"}
              readTime={node?.readingTime || 2} // fallback
              size={i === 0 ? "tall" : i === 1 || i === 2 ? "wide" : "normal"}
            />
          ))}
        </PostBentoGrid>

        <div className="mt-6 flex justify-end">
          <Link
            href="/community"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2"
          >
            See all Latest Posts →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopPosts;
