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
        className={`rounded-2xl bg-white/95 border border-orange-100 shadow-[0_18px_55px_rgba(15,23,42,0.08)] hover:border-orange-300 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)] overflow-hidden flex flex-col transition-all duration-300 ${className}`}
      >
        {heading && (
          <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
            {headingIcon}
            <span className="font-heading text-white font-semibold uppercase tracking-[0.3em] text-xs">
              {heading}
            </span>
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
          <div className="flex items-center gap-2 text-[0.8rem] md:text-[0.9rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden">
            {post.ppmaAuthorImage && post.ppmaAuthorImage !== "imag1" && post.ppmaAuthorImage !== "image" ? (
              <Image
                src={post.ppmaAuthorImage}
                alt={`${post.ppmaAuthorName || "Author"}'s avatar`}
                className="w-9 h-9 rounded-full flex-shrink-0"
                height={36}
                width={36}
              />
            ) : (
              <Image
                src="/blog/images/author.png"
                alt="Author avatar"
                className="w-9 h-9 rounded-full flex-shrink-0"
                height={36}
                width={36}
              />
            )}
            <span className="font-heading font-semibold text-slate-900 tracking-tight truncate max-w-[150px] text-[0.98rem] md:text-[1.02rem]">
              {post.ppmaAuthorName || "Anonymous"}
            </span>
            <span className="text-slate-300 flex-shrink-0">•</span>
            <span className="whitespace-nowrap flex-shrink-0 text-[0.72rem] md:text-[0.8rem]">
              <DateComponent dateString={post.date} />
            </span>
            {readingTime !== undefined && readingTime > 0 && (
              <>
                <span className="text-slate-300 flex-shrink-0">•</span>
                <span className="whitespace-nowrap flex-shrink-0 type-meta text-slate-500 text-[0.72rem] md:text-[0.8rem]">
                  {readingTime} min read
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-white/95 border border-orange-100 shadow-[0_14px_40px_rgba(15,23,42,0.08)] hover:border-orange-300 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] px-4 py-4 flex flex-col gap-3 transition-all duration-300 ${className}`}
    >
      <h3 className="type-card-title text-lg text-card-foreground line-clamp-1">
        <Link
          href={`/technology/${post.slug}`}
          className="hover:text-orange-700 transition-colors"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
      </h3>
      <div
        className="type-card-excerpt text-[0.88rem] md:text-[0.95rem] line-clamp-2"
        dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 28) }}
      />
    </div>
  );
}
