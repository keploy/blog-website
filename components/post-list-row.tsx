import Link from "next/link";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import { Post } from "../types/post";

interface Props {
  post: Post;
  isCommunity?: boolean;
  excerptOverride?: string;
}

export default function PostListRow({ post, isCommunity = false, excerptOverride }: Props) {
  const { title, featuredImage, slug, date, ppmaAuthorName, excerpt } = post;
  const cleanedExcerpt = (excerptOverride ?? excerpt ?? "").replace("Table of Contents", "");
  const hasImage = Boolean(featuredImage?.node?.sourceUrl);
  const basePath = isCommunity ? "/community" : "/technology";

  return (
    <article className="group flex flex-col md:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-[26px] shadow-[0_6px_18px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_20px_40px_rgba(255,149,5,0.15)]">
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
          <span>{ppmaAuthorName || "Anonymous"}</span>
          <span className="text-gray-300">•</span>
          <DateComponent dateString={date} />
        </div>

        <div
          className="text-gray-600 text-sm md:text-base line-clamp-3"
          dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
        />

        <div className="mt-auto flex justify-end">
          <Link
            href={`${basePath}/${slug}`}
            className="inline-flex items-center gap-1 text-orange-600 font-semibold text-sm hover:underline"
          >
            Read article →
          </Link>
        </div>
      </div>
    </article>
  );
}

