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
      className="group relative h-full overflow-hidden rounded-2xl border-[1px] border-[#EAEBEF] bg-[#F7F8FA] transition duration-500 flex flex-col cursor-pointer"
      ref={ref}
    >
      <div className="p-4 pt-4">
        {coverImage && (
          <div className="overflow-hidden rounded-2xl">
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
              alt={`${authorImage}'s Avatar`}
              className="w-10 h-10 rounded-full mr-3 sm:mr-2"
              height={40}
              width={40}
            />
            <div>
              <Avatar author={author ? author : "Anonymous"} />
              <div className="text-[12px] mb-0 -mt-1">
                <Date dateString={date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
