import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { easings, useInView } from "@react-spring/web";
import Image from "next/image";

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
  authorImage: string;
  tags: string;
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
    <div className="bg-[#F6F8FD] rounded-2xl" ref={ref}>
      <div>
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
            classNames="rounded-tr-2xl rounded-tl-2xl"
          />
        )}
      </div>

      <div className="p-[24px]">
        {tags && (
          <span className="text-sm px-4 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 text-center">
            {tags}
          </span>
        )}
        <h3 className="text-[22px] heading1 font-medium leading-[30px] mt-[8px]">
          <Link
            href={`${basePath}/${slug}`}
            className="bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px] hover:underline"
            dangerouslySetInnerHTML={{ __html: title }}
          ></Link>
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex flex-row mt-4 justify-center items-center">
            {authorImage && (
              <Image
                src={authorImage}
                width={40}
                height={40}
                alt="author-image"
                className="rounded-full h-10 w-10 mr-4"
              />
            )}
            <div>
              <Avatar author={author ? author : "Anonymous"} />
              <div className="text-md mb-0">
                <Date dateString={date} />
              </div>
            </div>
          </div>
        </div>
        {/* <div
          className="text-sm leading-normal mb-4 body text-slate-600"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        /> */}
      </div>
    </div>
  );
}
