import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Post } from "../types/post";
interface Props extends Partial<Pick<Post, "title" | "slug">> {
  coverImage: Post["featuredImage"];
  isCommunity?: boolean;
  imgClassName?: string;
  containerClassName?: string;
}

export default function CoverImage({
  title,
  coverImage,
  slug,
  isCommunity,
  imgClassName,
  containerClassName,
}: Props) {
  const basePath = isCommunity ? "/community/" : "/technology/";

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={coverImage?.node.sourceUrl}
      className={cn("transition-border duration-300", imgClassName, {
        "transition-scale duration-300": slug,
      })}
      priority
    />
  );
  return (
    <div className={cn("sm:mx-0 h-full w-full", containerClassName)}>
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