import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";

interface Props extends Pick<Post, "title" | "date" | "excerpt" | "slug"> {
  coverImage: Post["featuredImage"];
  author: Post["ppmaAuthorName"];
  isCommunity?: boolean;
}

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity,
}: Props) {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");

  return (
    <section>
      <div className="relative bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-8 py-8 rounded-md lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center lg:group transition-all duration-500 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-[0_0_10px_2px_rgba(255,165,0,0.6)] overflow-hidden">
        {/* Banner */}
        <div className="absolute top-0 right-0 transform rotate-45 translate-x-[25%] translate-y-[90%] bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-[10px] font-bold py-0.5 w-[100px] flex justify-center items-center shadow-md">
          Latest Blog
        </div>

        {/* Content */}
        <div className="mb-8 lg:mb-0">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              isCommunity={isCommunity}
            />
          )}
        </div>
        <div className="">
          <div>
            <h3 className="heading1 text-4xl lg:text-6xl font-bold leading-none text-gray-900 dark:text-gray-100">
              <Link
                href={`${basePath}/${slug}`}
                className="hero-title-link title-link bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-900 dark:to-orange-800 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <Avatar author={author ? author : "Anonymous"} />
            <div className="divider bg-orange-700 dark:bg-orange-400 h-1 w-1 rounded-full"></div>
            <div className="text-md mb-4 pt-4 text-gray-600 dark:text-gray-400">
              <Date dateString={date} />
            </div>
          </div>
          <div>
            <div
              className="body xl:text-md text-md leading-relaxed mb-4 text-slate-600 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
