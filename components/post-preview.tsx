import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { easings, useInView } from "@react-spring/web";
import Image from "next/image";
import { Tag } from "../types/tag";

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
  authorImage,
  tags,
}: {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
  authorImage: Post["ppmaAuthorImage"];
  tags: Tag["node"]["name"];
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");
  const [ref] = useInView(
    () => ({
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: { duration: 500, delay: 100, easing: easings.easeInCubic },
    }),
    { rootMargin: "-200px 0px" }
  );

  return (
    <div
      className="group relative h-full overflow-hidden rounded-2xl border-[1px] border-gray-300 bg-[#FFFFFF] transition duration-500 flex flex-col cursor-pointer hover:border-orange-400"
      ref={ref}
    >
      <div className="pointer-events-none absolute inset-0 before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_60%)] before:opacity-0 before:transition-opacity before:duration-500 before:content-['']" />

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.15)_0%,rgba(168,85,247,0)_70%)] opacity-0 group-hover:opacity-100 transition duration-500" />

      <div className="p-2 relative mb-2">
        {coverImage && (
          <div className="overflow-hidden rounded-lg">
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              isCommunity={isCommunity}
              classNames="h-[200px] w-full transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          </div>
        )}
      </div>

      <div className="px-[24px] pb-[24px] flex flex-col justify-between flex-1">
        {tags && (
          <span className="inline-block w-fit text-sm font-semibold bg-orange-100 text-orange-700 px-4 rounded-full py-1 mb-[8px]">
            {tags}
          </span>
        )}

        <h3 className="leading-tight font-medium text-lg 2xl:text-xl block">
          <Link
            href={`${basePath}/${slug}`}
            className="bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
            dangerouslySetInnerHTML={{ __html: title }}
          ></Link>
        </h3>

        {excerpt && (
          <div
            dangerouslySetInnerHTML={{ __html: excerpt }}
            className="text-sm text-gray-500 mt-2 line-clamp-2"
          />
        )}
      </div>

      <div className="px-[1.5rem] pt-0 pb-[1rem] xl:pb-[1.5rem]">
        <div className="flex items-center gap-4">
          <div className="flex flex-row justify-center items-center">
            <Image
              src={
                authorImage &&
                authorImage !== "imag1" &&
                authorImage !== "image"
                  ? authorImage
                  : `/blog/images/author.png`
              }
              alt={`${author}'s Avatar`}
              className="w-10 h-10 rounded-full mr-3 sm:mr-2"
              height={40}
              width={40}
            />
            <div>
              <Avatar author={author ? author : "Anonymous"} />
              <div className="text-[12px] mb-0 -mt-1 text-gray-500">
                <Date dateString={date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
