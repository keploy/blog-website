import Link from "next/link";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import { Post } from "../types/post";
import Image from "next/image";

interface Props {
  post: Post;
  isCommunity?: boolean;
  excerptOverride?: string;
  readingTime?: number;
}

export default function PostListRow({ post, isCommunity = false, excerptOverride, readingTime }: Props) {
  const { title, featuredImage, slug, date, ppmaAuthorName, excerpt, ppmaAuthorImage } = post;
  const rawExcerpt = excerptOverride ?? excerpt ?? "";
  const cleanedExcerpt = rawExcerpt
    .replace("Table of Contents", "")
    // Normalize various WP-style ellipsis markers "[...]", "[&hellip;]", "[…]" to a clean "..."
    .replace(/\[\s*\.\.\.\s*\]/g, "...")
    .replace(/\[\s*…\s*\]/g, "...")
    .replace(/\[\s*&hellip;\s*\]/gi, "...");
  const hasImage = Boolean(featuredImage?.node?.sourceUrl);
  const basePath = isCommunity ? "/community" : "/technology";

  return (
    <article className="group flex flex-col md:flex-row gap-4 p-5 bg-white/95 rounded-2xl border border-orange-100 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-orange-300 hover:-translate-y-1.5 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)]">
      <div className="md:w-[26%] w-full">
        {hasImage ? (
          <CoverImage
            title={title}
            coverImage={featuredImage}
            slug={slug}
            isCommunity={isCommunity}
            imgClassName="w-full h-36 md:h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-36 md:h-full rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-sm font-semibold text-orange-600">
            No image
          </div>
        )}
      </div>

      <div className="md:w-[74%] w-full flex flex-col gap-3.5">
        <h3
          className="type-card-title text-xl md:text-2xl text-gray-700 transition-colors line-clamp-2 group-hover:text-orange-600"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        <div className="flex items-center gap-3 text-[0.8rem] md:text-[0.9rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden">
          {ppmaAuthorImage && ppmaAuthorImage !== "imag1" && ppmaAuthorImage !== "image" ? (
            <Image
              src={ppmaAuthorImage}
              alt={`${ppmaAuthorName || "Author"}'s avatar`}
              className="w-9 h-9 rounded-full"
              height={36}
              width={36}
            />
          ) : (
            <Image
              src="/blog/images/author.png"
              alt="Author avatar"
              className="w-9 h-9 rounded-full"
              height={36}
              width={36}
            />
          )}
          <span className="font-heading font-semibold text-gray-700 tracking-tight truncate max-w-[170px] text-[0.98rem] md:text-[1.02rem]">
            {ppmaAuthorName || "Anonymous"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="whitespace-nowrap flex-shrink-0 text-[0.72rem] md:text-[0.8rem]">
            <DateComponent dateString={date} />
          </span>
          {readingTime !== undefined && readingTime > 0 && (
            <>
              <span className="text-slate-300">•</span>
                <span className="type-meta text-slate-500 text-[0.72rem] md:text-[0.8rem]">
                {readingTime} min read
              </span>
            </>
          )}
        </div>

        <div
          className="type-card-excerpt text-[0.88rem] md:text-[0.95rem] line-clamp-3 min-h-[3.1rem]"
          dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
        />

        <div className="mt-auto flex justify-end">
          <Link
            href={`${basePath}/${slug}`}
            className="inline-flex items-center gap-1 text-orange-600 font-semibold text-sm hover:text-orange-700 hover:underline transition-colors duration-200"
          >
            Read article →
          </Link>
        </div>
      </div>
    </article>
  );
}

