import Image from "next/image";
import Link from "next/link";
import { Post } from "../types/post";

interface Props extends Partial<Pick<Post, "title" | "slug">> {
  coverImage: Post["featuredImage"];
  isCommunity?: boolean;
  imgClassName?: string;
  /** Set true only for the LCP image (post header). Defaults to false. */
  priority?: boolean;
}

export default function CoverImage({
  title,
  coverImage,
  slug,
  isCommunity,
  imgClassName,
  priority = false,
}: Props) {
  const basePath = isCommunity ? "/community/" : "/technology/";

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={coverImage?.node.sourceUrl}
      className={`w-full h-auto object-cover${imgClassName ? ` ${imgClassName}` : ""}${slug ? " transition-transform duration-300 hover:scale-[1.01]" : ""}`}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 780px, 780px"
    />
  );

  return (
    <div className="w-full overflow-hidden">
      {slug ? (
        <Link href={`${basePath}${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
}