import Link from "next/link";
import Image from "next/image";
import { Post } from "../types/post";
import Date from "./date";
import { Clock, ArrowRight } from "lucide-react";
import { animated, easings, useInView } from "@react-spring/web";

interface LatestPostCardProps {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
}

export default function LatestPostCard({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
}: LatestPostCardProps) {
  const basePath = isCommunity ? "/community" : "/technology";
  const cleanedExcerpt = (excerpt || "").replace("Table of Contents", "");

  const [ref, springStyles] = useInView(
    () => ({
      from: {
        opacity: 0,
        y: 30,
      },
      to: {
        opacity: 1,
        y: 0,
      },
      config: {
        duration: 500,
        delay: 100,
        easing: easings.easeOutCubic,
      },
    }),
    {
      rootMargin: "-150px 0px",
    }
  );

  // Calculate read time
  const wordCount = cleanedExcerpt.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <animated.div
      ref={ref}
      style={springStyles}
      className="group relative bg-white rounded-xl border border-gray-200 hover:border-orange-300 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/30 hover:-translate-y-1"
    >
      <Link href={`${basePath}/${slug}`} className="block">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {coverImage?.node?.sourceUrl && (
            <Image
              src={coverImage.node.sourceUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <h3
            className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {/* Excerpt */}
          <div
            className="text-sm text-gray-600 line-clamp-2 mb-4"
            dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
          />

          {/* Meta Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-semibold">
                {(author || "A")[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-700">
                  {author || "Anonymous"}
                </span>
                <span className="text-xs text-gray-500">
                  <Date dateString={date} />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{readTime} min</span>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-500 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    </animated.div>
  );
}
