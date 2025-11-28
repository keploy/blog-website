import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import { Post } from "../types/post";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import { getExcerpt } from "../utils/excerpt";

type HeroCardVariant = "visual" | "details";

interface HeroLatestCardProps {
  post: Post;
  variant: HeroCardVariant;
  heading?: string;
  headingIcon?: ReactNode;
  className?: string;
}

export default function HeroLatestCard({
  post,
  variant,
  heading,
  headingIcon,
  className = "",
}: HeroLatestCardProps) {
  const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  if (variant === "visual") {
    return (
      <div
        className={`rounded-md border border-black/90 bg-white shadow-md shadow-neutral-900 overflow-hidden flex flex-col ${className}`}
      >
        {heading && (
          <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
            {headingIcon}
            <span className="text-white font-semibold tracking-wide uppercase text-sm">{heading}</span>
          </div>
        )}
        <div className="flex flex-col gap-4 px-4 pb-4 pt-4 flex-1">
          {post.featuredImage && (
            <div className="w-full overflow-hidden rounded-md bg-slate-100/60">
              <div className="aspect-[16/9]">
                <CoverImage
                  title={post.title}
                  coverImage={post.featuredImage}
                  slug={post.slug}
                  isCommunity={false}
                  containerClassName="h-full w-full"
                  imgClassName="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          )}
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
            <span className="font-semibold text-gray-900 truncate">{post.ppmaAuthorName || "Anonymous"}</span>
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
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-md border border-black/90 bg-white shadow-md shadow-neutral-900 px-4 py-4 flex flex-col gap-3 ${className}`}
    >
      <h3 className="text-lg font-semibold text-card-foreground leading-snug line-clamp-1">
        <Link
          href={`/technology/${post.slug}`}
          className="hover:text-orange-700 transition-colors"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
      </h3>
      <div
        className="text-sm text-gray-600 leading-relaxed line-clamp-2"
        dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 28) }}
      />
    </div>
  );
}
