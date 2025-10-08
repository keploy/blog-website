import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { animated, easings, useInView } from "@react-spring/web";

export default function PostCard({
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
  const cleanedExcerpt = (excerpt || "").replace("Table of Contents", "");

  const [ref, springStyles] = useInView(
    () => ({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 100,
      },
      config: {
        duration: 500,
        delay: 100,
        easing: easings.easeInCubic,
      },
    }),
    {
      rootMargin: "-200px 0px",
    }
  );

  return (
    <animated.div
      className="bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:drop-shadow-[0_8px_22px_rgba(249,115,22,0.18)] border border-gray-200 transition-all duration-300 overflow-hidden group hover:border-orange-300 hover:-translate-y-1"
      ref={ref}
      style={springStyles}
    >
      <div className="aspect-video overflow-hidden">
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 leading-snug">
          <Link
            href={`${basePath}/${slug}`}
            className="line-clamp-2 hover:underline group-hover:text-orange-600 transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">{author ? author : "Anonymous"}</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-500">
            <Date dateString={date} />
          </span>
        </div>
        <div
          className="text-gray-600 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
        />
      </div>
    </animated.div>
  );
}


