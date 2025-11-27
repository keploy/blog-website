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
  const cleanedExcerpt = (excerptOverride ?? excerpt ?? "").replace("Table of Contents", "");
  const hasImage = Boolean(featuredImage?.node?.sourceUrl);
  const basePath = isCommunity ? "/community" : "/technology";

  return (
    <article className="group flex flex-col md:flex-row gap-4 p-4 bg-white border border-black/90 rounded-md shadow-md shadow-neutral-900 transition-all duration-300 hover:-translate-y-2 hover:shadow-none">
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

      <div className="md:w-[74%] w-full flex flex-col gap-3">
        <h3
          className="text-xl md:text-2xl font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-orange-600"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        <div className="flex flex-wrap gap-2 text-sm text-gray-500 items-center">
          {ppmaAuthorImage && ppmaAuthorImage !== "imag1" && ppmaAuthorImage !== "image" ? (
            <Image
              src={ppmaAuthorImage}
              alt={`${ppmaAuthorName || "Author"}'s avatar`}
              className="w-6 h-6 rounded-full"
              height={24}
              width={24}
            />
          ) : (
            <Image
              src="/blog/images/author.png"
              alt="Author avatar"
              className="w-6 h-6 rounded-full"
              height={24}
              width={24}
            />
          )}
          <span className="font-semibold text-gray-900">{ppmaAuthorName || "Anonymous"}</span>
          <span className="text-gray-300">•</span>
          <DateComponent dateString={date} />
          {readingTime !== undefined && readingTime > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <span>{readingTime} min read</span>
            </>
          )}
        </div>

        <div
          className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 min-h-[3.1rem]"
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

