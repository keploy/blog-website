import Image from "next/image";
import Link from "next/link";
import { Post } from "../types/post";

interface Props extends Partial<Pick<Post, "title" | "slug">> {
  coverImage: Post["featuredImage"];
  isCommunity?: boolean;
  imgClassName?: string;
}

export default function CoverImage({
  title,
  coverImage,
  slug,
  isCommunity,
  imgClassName,
}: Props) {
  const basePath = isCommunity ? "/community/" : "/technology/";

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={coverImage?.node.sourceUrl}
      className={`w-full h-auto object-cover${imgClassName ? ` ${imgClassName}` : ""}${slug ? " transition-transform duration-300 hover:scale-[1.01]" : ""}`}
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