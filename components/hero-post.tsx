import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { FaArrowRight } from "react-icons/fa";

interface Props extends Pick<Post, "title" | "date" | "excerpt" | "slug"> {
  coverImage: Post["featuredImage"];
  author: Post["ppmaAuthorName"];
  isCommunity?: boolean;
}

export default function HeroPost({
  title,
  coverImage,
  date,
  author,
  slug,
  isCommunity,
}) {
  const basePath = isCommunity ? "/community" : "/technology";

  return (
    <section>
      <div className="relative bg-gray-100 border border-gray-300 rounded-md lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center lg:group transition-all duration-500 overflow-hidden">
        {/* Content */}
        <div className="mb-8 lg:mb-0">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              isCommunity={isCommunity}
            />
          )}
        </div>
        <div className="px-8 pt-5">
          <div>
            <h3 className="heading1 text-4xl lg:text-6xl font-bold leading-none">
              <p
                className="hero-title-link title-link bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                dangerouslySetInnerHTML={{ __html: title }}
              ></p>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-md mb-4 pt-4">
              <Date dateString={date} />
            </div>
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <div className="text-md mb-4 pt-4">
              <span>5 min read</span>
            </div>
          </div>

          <Link
            href={`authors/${author}`}
            className="text-[#0069FF] font-thin hover:underline hover:text-[#1433D6]"
          >
            <Avatar author={author ? author : "Anonymous"} />
          </Link>

          <Link href={`${basePath}/${slug}`} className="block mt-16 group">
            <div className="relative inline-block">
              <span className="flex items-center gap-1 font-medium transition-all duration-300 group-hover:decoration-2">
                Read More
                <span className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-x-120 text-sm pl-[.15rem]">
                  <FaArrowRight />
                </span>
              </span>

              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
