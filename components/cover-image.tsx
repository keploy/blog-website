import Image from "next/image";
import Link from "next/link";
import { Post } from "../types/post";

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

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={title ? `Cover Image for ${title}` : "Cover Image"}
      src={coverImage?.node.sourceUrl || "/blog/images/blog-bunny.png"}
      className={cn("rounded-md transition-border duration-300", imgClassName, {
        "  transition-scale duration-300": slug,
      })}
      priority
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