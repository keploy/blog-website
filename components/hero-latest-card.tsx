import Link from "next/link";
import Image from "next/image";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import { Post } from "../types/post";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import { getExcerpt } from "../utils/excerpt";

type HeroCardVariant = "full" | "visual" | "details";

interface HeroLatestCardProps {
  post: Post;
  variant?: HeroCardVariant;
}

export default function HeroLatestCard({ post, variant = "full" }: HeroLatestCardProps) {
  const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  const visualSection = (
    <div className="rounded-2xl p-6 border-2 relative overflow-hidden bg-orange-50 border-orange-200 shadow-[0_18px_40px_rgba(249,115,22,0.18)]">
      <div className="absolute top-0 right-0 w-28 h-28 bg-orange-200/30 rounded-full -mr-14 -mt-12" />
      <div className="relative flex flex-col gap-5">
        {post.featuredImage && (
          <div className="overflow-hidden rounded-[22px] w-full h-48 md:h-52">
            <CoverImage
              title={post.title}
              coverImage={post.featuredImage}
              slug={post.slug}
              isCommunity={false}
              imgClassName="w-full h-full object-cover object-center"
            />
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
      </div>
    </div>
  );

  const detailSection = (
    <div className="rounded-2xl p-6 border-2 bg-orange-50 border-orange-200 shadow-[0_12px_26px_rgba(249,115,22,0.12)]">
      <h3 className="text-2xl font-semibold text-card-foreground leading-tight mb-4">
        <Link
          href={`/technology/${post.slug}`}
          className="line-clamp-2 hover:text-orange-700 transition-colors"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
      </h3>
      <div
        className="text-base text-gray-600 leading-relaxed line-clamp-3"
        dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 35) }}
      />
    </div>
  );

  if (variant === "visual") return visualSection;
  if (variant === "details") return detailSection;

  return (
    <div className="flex flex-col gap-6">
      {visualSection}
      {detailSection}
    </div>
  );
}
