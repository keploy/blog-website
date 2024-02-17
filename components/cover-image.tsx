import cn from "classnames";
import Image from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  coverImage: {
    node: {
      sourceUrl: string;
    };
  };
  slug?: string;
  isCommunity?: boolean;
}

export default function CoverImage({
  title,
  coverImage,
  slug,
  isCommunity,
}: Props) {
  const basePath = isCommunity ? "/community/" : "/technology/";

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={coverImage?.node.sourceUrl}
      className={cn("rounded-md transition-border duration-300", {
        "  transition-scale duration-300": slug,
      })}
    />
  );
  return (
    <div className="sm:mx-0 ">
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
