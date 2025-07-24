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
    <Link href={`${basePath}/${slug}`} className="block h-full">
      <div
        className="group relative h-full overflow-hidden rounded-2xl border-[1px] border-[#C5C5C5] bg-[#FBFBFB] transition duration-500 hover:shadow-xl flex flex-col hover:bg-[#F1F1F1] shadow-lg shadow-[rgba(25,25,25,0.08)] cursor-pointer"
        ref={ref}
      >
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
            classNames="rounded-tr-2xl rounded-tl-2xl h-[200px] w-full group-hover:brightness-[1.15] transition-all duration-500 ease-in-out"
          />
        )}

        <div className="p-[24px] flex flex-col justify-between flex-1">
          <div>
            <div className="flex flex-row text-[13px] text-[#6B7280] mb-2 font-medium gap-2 uppercase items-center">
              <span className="">
                <Date dateString={date} overrideClassName={true} />
              </span>

              <div className="h-1 w-1 bg-[#6B7280] rounded-full text-center"></div>

              <span>6 min read</span>
            </div>
            <h3 className="leading-tight text-xl xl:text-[28px] block mb-[8px]">
              <Link
                href={`${basePath}/${slug}`}
                className="bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>

            <Avatar
              author={author ? author : "Anonymous"}
              overrideClassName={true}
              className="text-[#8E8E8E] mt-[4px] mb-[20px] uppercase"
            />
          </div>
        </div>

        <div className="p-[1rem] pt-0 xl:p-[1.5rem] xl:pt-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-row justify-center items-center text-[#686868] text-sm gap-2">
              <span>#ai</span>
              <span>#oauth</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
