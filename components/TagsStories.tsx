import { getExcerpt } from "../utils/excerpt";
import TagsPostPreview from "./TagsPostPreview";
import { useRouter } from "next/router";
export default function TagsStories({ posts }) {
  const router = useRouter();
  const { slug } = router.query;
  return (
    <section>
      <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-600 dark:to-orange-500 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight dark:text-white">
        Tags
      </h2>
      <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-600 dark:to-orange-500 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-2xl heading1 md:text-2xl font-bold tracking-tighter leading-tight dark:text-white">
        #{slug}
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-16">
        {posts.map(({ node }) => (
          <TagsPostPreview
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            date={node.date}
            author={node.ppmaAuthorName}
            slug={node.slug}
            excerpt={getExcerpt(node.excerpt, 20)}
            isCommunity={node.categories}
          />
        ))}
      </div>
    </section>
  );
}
