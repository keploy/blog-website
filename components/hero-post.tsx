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
      <div className="relative bg-gray-100 border border-gray-300 p-8 rounded-md grid lg:grid-cols-2 gap-8 mb-20 md:mb-28 transition-all duration-500 hover:border-orange-500 hover:shadow-[0_0_10px_2px_rgba(255,165,0,0.6)] overflow-hidden">
        {/* Banner */}
        <div className="absolute top-0 right-0 transform rotate-45 translate-x-[25%] translate-y-[90%] bg-orange-200 text-orange-800 text-xs font-bold py-0.5 w-24 flex justify-center items-center shadow-md">
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
              className="w-full h-64 object-cover" // Ensure consistent image size
            />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-4xl lg:text-6xl font-bold leading-tight mb-4">
            <Link
              href={`${basePath}/${slug}`}
              className="hero-title-link title-link bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
              dangerouslySetInnerHTML={{ __html: title }}
            ></Link>
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <Avatar author={author ? author : "Anonymous"} />
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <div className="text-md">
              <Date dateString={date} />
            </div>
          </div>
          <div
            className="text-md leading-relaxed mb-4 text-slate-600"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        </div>
      </div>
    </section>
  );
}
