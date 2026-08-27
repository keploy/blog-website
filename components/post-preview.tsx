import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { animated, easings, useSpring } from "@react-spring/web";

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
}: {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");
  // Fade in on mount instead of gating visibility on an IntersectionObserver
  // (react-spring useInView). The observer never fired under `next dev`, so
  // previews stayed stuck at opacity 0 / invisible. useSpring runs on mount and
  // always settles at opacity 1, so a misfiring reveal can never leave the
  // content hidden.
  const springStyles = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: {
      duration: 500,
      delay: 100,
      easing: easings.easeInCubic,
    },
  });
  return (
    <animated.div
      data-testid="post-preview"
      className="bg-gray-100 border p-6 rounded-md   lg:hover:shadow-md transition group"
      style={springStyles}
    >
      <div className="mb-5">
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
          />
        )}
      </div>
      <h3 className="text-2xl leading-snug leading-none heading1 font-bold">
        <Link
          href={`${basePath}/${slug}`}
          className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </h3>
      <div className="flex items-center gap-4">
        <Avatar author={author ? author : "Anonymous"} />
        <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
        <div className="text-md mb-4 pt-4">
          <Date dateString={date} />
        </div>
      </div>
      <div
        className="text-sm leading-normal mb-4 body text-slate-600"
        dangerouslySetInnerHTML={{ __html: excerpt }}
      />
    </animated.div>
  );
}
