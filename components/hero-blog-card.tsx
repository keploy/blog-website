import Link from "next/link";
import Image from "next/image";
import { Post } from "../types/post";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import { getExcerpt } from "../utils/excerpt";

interface HeroBlogCardProps {
  post: Post;
  isAnimating?: boolean;
}

export default function HeroBlogCard({ post, isAnimating = false }: HeroBlogCardProps) {
  const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  return (
    <div
      className={`bg-card rounded-lg p-3 border-2 font-mono text-sm transition-all duration-500 ${
        isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
      }`}
    >
      <Link href={`/technology/${post.slug}`} className="block">
        <div className="space-y-3">
          {/* Author, Date, Read Time - Above heading */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
            {post.ppmaAuthorImage && post.ppmaAuthorImage !== "imag1" && post.ppmaAuthorImage !== "image" ? (
              <Image
                src={post.ppmaAuthorImage}
                alt={`${post.ppmaAuthorName || "Author"}'s avatar`}
                className="w-4 h-4 rounded-full flex-shrink-0"
                height={16}
                width={16}
              />
            ) : (
              <Image
                src="/blog/images/author.png"
                alt="Author avatar"
                className="w-4 h-4 rounded-full flex-shrink-0"
                height={16}
                width={16}
              />
            )}
            <span className="font-semibold text-gray-900 truncate">
              {post.ppmaAuthorName || "Anonymous"}
            </span>
            <span className="text-gray-300 flex-shrink-0">•</span>
            <span className="whitespace-nowrap flex-shrink-0">
              <DateComponent dateString={post.date} />
            </span>
            {readingTime !== undefined && readingTime > 0 && (
              <>
                <span className="text-gray-300 flex-shrink-0">•</span>
                <span className="whitespace-nowrap flex-shrink-0">{readingTime} min read</span>
              </>
            )}
          </div>

          {/* Heading */}
          <h3
            className="text-card-foreground font-semibold line-clamp-2 hover:text-orange-600 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />

          {/* Cover Image */}
          {post.featuredImage && (
            <div className="overflow-hidden rounded-lg">
              <CoverImage
                title={post.title}
                coverImage={post.featuredImage}
                slug={post.slug}
                isCommunity={false}
                imgClassName="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          <div
            className="text-gray-600 text-xs leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 15) }}
          />
        </div>
      </Link>
    </div>
  );
}

