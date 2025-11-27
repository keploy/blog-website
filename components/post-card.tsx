import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { animated, easings, useInView } from "@react-spring/web";
import Image from "next/image";

export default function PostCard({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
  authorImage,
  readingTime,
}: {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
  authorImage?: string;
  readingTime?: number;
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
    <Link
      href={`${basePath}/${slug}`}
      className="group block h-full"
    >
      <animated.div
        className="bg-white rounded-md border border-black/90 shadow-md shadow-neutral-900 hover:shadow-none transition-all duration-300 overflow-hidden hover:-translate-y-2 flex flex-col h-full"
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
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug line-clamp-2">
            <span className="transition-colors duration-200 group-hover:text-orange-600" dangerouslySetInnerHTML={{ __html: title }} />
          </h3>
          <div
            className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
          />
          <div className="mt-auto flex items-center gap-1.5 text-xs md:text-sm text-gray-500 min-w-0">
            {authorImage && authorImage !== "imag1" && authorImage !== "image" ? (
              <Image
                src={authorImage}
                alt={`${author || "Author"}'s avatar`}
                className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0"
                height={24}
                width={24}
              />
            ) : (
              <Image
                src="/blog/images/author.png"
                alt="Author avatar"
                className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0"
                height={24}
                width={24}
              />
            )}
            <span className="font-semibold text-gray-900 truncate max-w-[120px] md:max-w-none">{author ? author : "Anonymous"}</span>
            <span className="text-gray-300 flex-shrink-0">•</span>
            <span className="whitespace-nowrap flex-shrink-0">
              <Date dateString={date} />
            </span>
            {readingTime !== undefined && readingTime > 0 && (
              <>
                <span className="text-gray-300 flex-shrink-0">•</span>
                <span className="whitespace-nowrap flex-shrink-0">{readingTime} min read</span>
              </>
            )}
          </div>
        </div>
      </animated.div>
    </Link>
  );
}


