import Image from "next/image";
import Link from "next/link";
import { Post } from "../types/post";
import { DEFAULT_ARTICLE_IMAGE_URL } from "../lib/structured-data";

interface Props extends Partial<Pick<Post, "title" | "slug">> {
  coverImage: Post["featuredImage"];
  isCommunity?: boolean;
  imgClassName?: string;
  /** Set true only for the LCP image (post header). Defaults to false. */
  priority?: boolean;
  /** Custom sizes attribute for responsive image selection. Defaults to post-header width. */
  sizes?: string;
}

export default function CoverImage({
  title,
  coverImage,
  slug,
  isCommunity,
  imgClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 780px, 780px",
}: Props) {
  const basePath = isCommunity ? "/community/" : "/technology/";
  // Never let the link's accessible name or the image alt end up empty (some
  // cards render without a title) — an empty aria-label is an anchor-less link.
  const safeTitle = title || "Keploy blog article";

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${safeTitle}`}
      src={coverImage?.node?.sourceUrl || DEFAULT_ARTICLE_IMAGE_URL}
      className={`w-full h-auto object-cover${imgClassName ? ` ${imgClassName}` : ""}${slug ? " transition-transform duration-300 hover:scale-[1.01]" : ""}`}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
    />
  );

  return (
    <div className="w-full overflow-hidden">
      {slug ? (
        <Link href={`${basePath}${slug}`} aria-label={safeTitle}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
}