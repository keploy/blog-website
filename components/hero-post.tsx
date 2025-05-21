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
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");

  return (
    <section>
      <div className="relative bg-gray-100 border border-transparent px-8 py-8 rounded-md lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center lg:group transition-all duration-300 hover:border-orange-500 hover:shadow-[0_4px_12px_rgba(249,115,22,0.25)] overflow-hidden">
        {/* Banner */}
        <div className="absolute top-0 right-0 transform rotate-45 translate-x-[25%] translate-y-[90%] bg-orange-200 text-orange-800 text-[10px] font-bold py-0.5 w-[100px] flex justify-center items-center shadow-md">
          Latest Blog
        </div>

        {/* Content */}
        <div className="mb-8 lg:mb-0 h-64 lg:h-auto overflow-hidden">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              isCommunity={isCommunity}
            />
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="heading1 text-4xl lg:text-6xl font-bold leading-none mb-4">
              <Link
                href={`${basePath}/${slug}`}
                className="hero-title-link title-link bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Avatar author={author ? author : "Anonymous"} />
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <div className="text-md">
              <Date dateString={date} />
            </div>
          </div>
          <div>
            <div
              className="body xl:text-md text-md leading-relaxed text-slate-600 overflow-hidden"
              style={{ 
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: title.length > 60 ? 3 : title.length > 30 ? 5 : 7,
              }}
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
