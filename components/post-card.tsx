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
      className="bg-white rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 transition-all duration-300 overflow-hidden group hover:border-orange-300 hover:-translate-y-1 flex flex-col h-full"
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
            imgClassName="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1 gap-4">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
          <Link
            href={`${basePath}/${slug}`}
            className="line-clamp-2 hover:underline group-hover:text-orange-600 transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </h3>
        <div
          className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2"
          dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
        />
        <div className="mt-auto flex items-center gap-2 text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{author ? author : "Anonymous"}</span>
          <span className="text-gray-300">•</span>
          <span>
            <Date dateString={date} />
          </span>
        </div>
      </div>
    </animated.div>
  );
}


