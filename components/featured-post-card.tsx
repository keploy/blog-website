import Link from "next/link";
import Image from "next/image";
import { Post } from "../types/post";
import Date from "./date";
import { Clock, User } from "lucide-react";
import { animated, easings, useInView } from "@react-spring/web";

interface FeaturedPostCardProps {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
  variant?: "large" | "medium" | "small";
}

export default function FeaturedPostCard({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
  variant = "medium",
}: FeaturedPostCardProps) {
  const basePath = isCommunity ? "/community" : "/technology";
  const cleanedExcerpt = (excerpt || "").replace("Table of Contents", "");

  const [ref, springStyles] = useInView(
    () => ({
      from: {
        opacity: 0,
        y: 20,
      },
      to: {
        opacity: 1,
        y: 0,
      },
      config: {
        duration: 600,
        easing: easings.easeOutCubic,
      },
    }),
    {
      rootMargin: "-100px 0px",
    }
  );

  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = cleanedExcerpt.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const variantClasses = {
    large: "col-span-1 md:col-span-2 row-span-2",
    medium: "col-span-1 md:col-span-1 row-span-2",
    small: "col-span-1 md:col-span-1 row-span-1",
  };

  return (
    <animated.div
      ref={ref}
      style={springStyles}
      className={`${variantClasses[variant]} group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-orange-300 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-100/50`}
    >
      <Link href={`${basePath}/${slug}`} className="block h-full">
        <div className="relative h-full flex flex-col">
          {/* Image Section */}
          <div
            className={`relative overflow-hidden ${
              variant === "large" ? "h-64 md:h-80" : variant === "medium" ? "h-56" : "h-48"
            }`}
          >
            {coverImage?.node?.sourceUrl && (
              <div className="relative w-full h-full">
                <Image
                  src={coverImage.node.sourceUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )}
            
            {/* Featured Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg backdrop-blur-sm">
                Featured
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3
                className={`font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 ${
                  variant === "large"
                    ? "text-2xl md:text-3xl"
                    : variant === "medium"
                    ? "text-xl md:text-2xl"
                    : "text-lg md:text-xl"
                }`}
                dangerouslySetInnerHTML={{ __html: title }}
              />
              
              {variant !== "small" && (
                <div
                  className={`text-gray-600 mb-4 ${
                    variant === "large" ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"
                  }`}
                  dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
                />
              )}
            </div>

            {/* Meta Information */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-semibold">
                  {(author || "A")[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {author || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    <Date dateString={date} />
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">{readTime} min read</span>
              </div>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </animated.div>
  );
}
