import Avatar, { AvatarAuthor } from "./avatar";
import DateComponent from "./date";
import CoverImage, { CoverImageNode } from "./cover-image";
import Link from "next/link";

export interface HeroPostProps {
  title: string;
  coverImage?: {
    node?: CoverImageNode;
  };
  date: string;
  excerpt?: string;
  author?: {
    node?: AvatarAuthor;
  } | AvatarAuthor;
  slug: string;
}

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: HeroPostProps) {
  const resolvedAuthor: AvatarAuthor | undefined = author
    ? "node" in author && author.node
      ? author.node
      : (author as AvatarAuthor)
    : undefined;

  return (
    <section>
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 mb-20 md:mb-28">
        <div className="mb-8 md:mb-16">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              priority={true}
            />
          )}
        </div>
        <div>
          <div>
            <h3 className="heading1 mb-4 text-4xl lg:text-6xl font-bold leading-tight">
              <Link
                href={`/posts/${slug}`}
                className="hero-title-link title-link bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
                dangerouslySetInnerHTML={title ? { __html: title } : undefined}
              >
                {!title ? 'Untitled Post' : null}
              </Link>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {resolvedAuthor && <Avatar author={resolvedAuthor} />}
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <div className="text-md mb-4 pt-4">
              <DateComponent dateString={date} />
            </div>
          </div>
          {excerpt && (
            <div>
              <div
                className="body xl:text-lg text-md leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: excerpt }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
