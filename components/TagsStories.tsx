import { getExcerpt } from "../utils/excerpt";
import PostCard from "./post-card";
import PostGrid from "./post-grid";
import { useRouter } from "next/router";
export default function TagsStories({ posts}) {
    const router = useRouter();
  const { slug } = router.query;
  return (
    <section className="pb-16">
      <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
        Tags
      </h2>
      <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-2xl heading1 md:text-2xl font-bold tracking-tighter leading-tight">
        #{slug}
      </h2>

      <PostGrid>
        {posts.map(({ node }) => (
          <PostCard
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            date={node.date}
            author={node.ppmaAuthorName}
            slug={node.slug}
            excerpt={getExcerpt(node.excerpt, 36)}
            isCommunity={
              node.categories &&
              node.categories.edges &&
              node.categories.edges[0] &&
              node.categories.edges[0].node.name === "community"
                ? true
                : false
            }
            variant="subtle"
            hideAuthorImage={true}
            hideReadingTime={true}
          />
        ))}
      </PostGrid>
    </section>
  );
}
