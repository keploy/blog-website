import Link from "next/link";
import Image from "next/image";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import { Post } from "../types/post";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import { getExcerpt } from "../utils/excerpt";

interface HeroFeaturedCardProps {
  post: Post;
  isAnimating: boolean;
}

export default function HeroFeaturedCard({ post, isAnimating }: HeroFeaturedCardProps) {
  const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  return (
    <div
      className={`rounded-xl p-4 border-2 relative overflow-hidden transition-all duration-500 bg-yellow-50 border-yellow-200 ${
        isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
      }`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/30 rounded-full -mr-12 -mt-12" />
      <div className="relative">
        <div className="text-xs text-yellow-700 font-mono mb-3">featured.json</div>
        <div className="space-y-3">
          {/* Author, Date, Read Time - Above heading */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            {post.ppmaAuthorImage && post.ppmaAuthorImage !== "imag1" && post.ppmaAuthorImage !== "image" ? (
              <Image
                src={post.ppmaAuthorImage}
                alt={`${post.ppmaAuthorName || "Author"}'s avatar`}
                className="w-5 h-5 rounded-full flex-shrink-0"
                height={20}
                width={20}
              />
            ) : (
              <Image
                src="/blog/images/author.png"
                alt="Author avatar"
                className="w-5 h-5 rounded-full flex-shrink-0"
                height={20}
                width={20}
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

          {/* Title */}
          <h3 className="text-lg font-semibold text-card-foreground leading-snug">
            <Link
              href={`/technology/${post.slug}`}
              className="line-clamp-2 hover:text-yellow-700 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />
          </h3>

          {/* Excerpt */}
          <div
            className="text-sm text-gray-600 leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 15) }}
          />
        </div>
      </div>
    </div>
  );
}
