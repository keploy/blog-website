import Link from "next/link";
import Image from "next/image";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import { Post } from "../types/post";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import { getExcerpt } from "../utils/excerpt";

interface HeroFeaturedCardProps {
  post: Post;
}

export default function HeroFeaturedCard({ post }: HeroFeaturedCardProps) {
  const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  return (
    <div className="rounded-2xl p-6 border-2 relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-rose-50 border-rose-200 min-h-[440px] flex flex-col shadow-[0_20px_45px_rgba(244,114,182,0.18)]">
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-rose-200/60 to-orange-100/60 rounded-full -mr-14 -mt-12" />
      <div className="relative flex flex-col gap-5 flex-1">
        {/* Cover Image - First */}
        {post.featuredImage && (
          <div className="overflow-hidden rounded-[22px] w-full h-48 md:h-52 flex-shrink-0">
            <CoverImage
              title={post.title}
              coverImage={post.featuredImage}
              slug={post.slug}
              isCommunity={false}
              imgClassName="w-full h-full object-cover object-center"
            />
          </div>
        )}

        {/* Author, Date, Read Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          {post.ppmaAuthorImage && post.ppmaAuthorImage !== "imag1" && post.ppmaAuthorImage !== "image" ? (
            <Image
              src={post.ppmaAuthorImage}
              alt={`${post.ppmaAuthorName || "Author"}'s avatar`}
              className="w-7 h-7 rounded-full flex-shrink-0"
              height={28}
              width={28}
            />
          ) : (
            <Image
              src="/blog/images/author.png"
              alt="Author avatar"
              className="w-7 h-7 rounded-full flex-shrink-0"
              height={28}
              width={28}
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

        {/* Title - Always 2 lines */}
        <h3 className="text-2xl font-semibold text-card-foreground leading-tight flex-shrink-0 min-h-[3.5rem]">
          <Link
            href={`/technology/${post.slug}`}
            className="line-clamp-2 hover:text-rose-600 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
        </h3>

        {/* Excerpt - Always 3 lines */}
        <div
          className="text-base text-gray-600 leading-relaxed line-clamp-3 flex-1 min-h-[4.75rem]"
          dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 35) }}
        />
      </div>
    </div>
  );
}
