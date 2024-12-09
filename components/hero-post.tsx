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

  const cleanExcerpt = excerpt.replace("Table of Contents", "");

  console.log("cleanExcerpt", cleanExcerpt);

  return (
    <section>
      <div className="relative bg-gray-100 border border-gray-300 px-8 py-8 rounded-md lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center lg:group transition-all duration-500 hover:border-orange-500 hover:shadow-[0_0_10px_2px_rgba(255,165,0,0.6)]">
        {/* Banner */}
        <div className="absolute top-0 left-0 bg-orange-200 text-orange-800 text-xs font-bold py-1 px-3 rounded-br-md shadow-md">
          Latest Blog
        </div>

        {/* Content */}
        <div className="mb-8 lg:mb-0 ">
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
            <h3 className="heading1 text-4xl lg:text-6xl font-bold leading-none">
              <Link
                href={`${basePath}/${slug}`}
                className="hero-title-link title-link bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <Avatar author={author ? author : "Anonymous"} />
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <div className="text-md mb-4 pt-4">
              <Date dateString={date} />
            </div>
          </div>
          <div>
            <div
              className="body xl:text-md text-md leading-relaxed mb-4 text-slate-600"
              dangerouslySetInnerHTML={{ __html: cleanExcerpt }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
