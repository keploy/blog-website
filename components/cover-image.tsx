import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Post } from "../types/post";

interface Props extends Partial<Pick<Post, "title" | "slug">> {
  coverImage: Post["featuredImage"];
  isCommunity?: boolean;
  className?: string; // Add className prop
}

export default function CoverImage({
  title,
  coverImage,
  slug,
  isCommunity,
  className, // Destructure className prop
}: Props) {
  const basePath = isCommunity ? "/community/" : "/technology/";

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={coverImage?.node.sourceUrl}
      className={cn("rounded-md transition-border duration-300", {
        "transition-scale duration-300": slug,
        [className]: className, // Apply className if provided
      })}
      priority
    />
  );

  return (
    <div className={cn("sm:mx-0", className)}> {/* Apply className to the div */}
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
