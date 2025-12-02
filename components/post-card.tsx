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
  variant = "default",
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
  variant?: "default" | "subtle";
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

  const cardBaseClasses =
    "flex flex-col h-full transition-all duration-300";

  const isSubtle = variant === "subtle";
  const avatarSize = isSubtle ? 36 : 24;
  const avatarClass = isSubtle
    ? "w-9 h-9 rounded-full flex-shrink-0"
    : "w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0";

  const subtleCardClasses =
    "bg-white/95 rounded-2xl border border-orange-100 shadow-[0_14px_45px_rgba(15,23,42,0.08)] hover:border-orange-300 hover:shadow-[0_22px_70px_rgba(15,23,42,0.12)] hover:-translate-y-1.5";

  const cardVariantClasses = isSubtle
    ? subtleCardClasses
    : "bg-white rounded-md border border-orange-200 shadow-md shadow-neutral-900 hover:border-orange-400 hover:shadow-lg hover:-translate-y-2";

  return (
    <Link
      href={`${basePath}/${slug}`}
      className="group block h-full"
    >
      <animated.div
        className={`${cardBaseClasses} ${cardVariantClasses}`}
        ref={ref}
        style={springStyles}
      >
        <div className="aspect-video overflow-hidden rounded-t-2xl">
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
        <div className="px-6 pt-5 pb-6 flex flex-col flex-1 gap-3.5">
          <h3 className="type-card-title text-xl md:text-2xl text-gray-700 line-clamp-2">
            <span
              className="transition-colors duration-200 group-hover:text-orange-600"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </h3>
          <div
            className="type-card-excerpt text-[0.88rem] md:text-[0.95rem] line-clamp-3"
            dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
          />
          <div
            className={
              isSubtle
                ? "mt-auto flex items-center gap-3 text-[0.8rem] md:text-[0.9rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden"
                : "mt-auto flex items-center gap-2 text-[0.78rem] md:text-[0.88rem] text-gray-500 min-w-0 whitespace-nowrap overflow-hidden"
            }
          >
            {authorImage && authorImage !== "imag1" && authorImage !== "image" ? (
              <Image
                src={authorImage}
                alt={`${author || "Author"}'s avatar`}
                className={avatarClass}
                height={avatarSize}
                width={avatarSize}
              />
            ) : (
              <Image
                src="/blog/images/author.png"
                alt="Author avatar"
                className={avatarClass}
                height={avatarSize}
                width={avatarSize}
              />
            )}
            <span
              className={
                isSubtle
                  ? "font-heading font-semibold text-gray-700 tracking-tight max-w-[140px] md:max-w-none truncate text-[0.98rem] md:text-[1.02rem]"
                  : "font-semibold text-gray-700 max-w-[120px] md:max-w-none truncate text-[0.95rem] md:text-[1rem]"
              }
            >
              {author ? author : "Anonymous"}
            </span>
            <span className={`${isSubtle ? "text-slate-300" : "text-gray-300"} flex-shrink-0`}>•</span>
            <span className="whitespace-nowrap flex-shrink-0 text-[0.72rem] md:text-[0.8rem]">
              <Date dateString={date} />
            </span>
            {readingTime !== undefined && readingTime > 0 && (
              <>
                <span className={`${isSubtle ? "text-slate-300" : "text-gray-300"} flex-shrink-0`}>•</span>
                <span
                  className={
                    isSubtle
                      ? "whitespace-nowrap flex-shrink-0 type-meta text-slate-500 text-[0.72rem] md:text-[0.8rem]"
                      : "whitespace-nowrap flex-shrink-0 text-gray-500 text-[0.72rem] md:text-[0.8rem]"
                  }
                >
                  {readingTime} min read
                </span>
              </>
            )}
          </div>
        </div>
      </animated.div>
    </Link>
  );
}


