import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getContent } from "../lib/api";
import { calculateReadingTime } from "../utils/calculateReadingTime";

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
  postId,
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  const [postReadingTime, setPostReadingTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchPostContent = async () => {
      const postContent = await getContent(postId);
      const readingTime = calculateReadingTime(postContent);
      setPostReadingTime(5 + readingTime);
    };

    if (postId) fetchPostContent();
  }, [postId]);

  return (
      <div className="relative bg-gray-100 border border-gray-300 rounded-2xl lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center lg:group transition-all duration-500 overflow-hidden">
        <div className="mb-8 lg:mb-0">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              isCommunity={isCommunity}
            />
          )}
        </div>

        <div className="px-8 pt-5 flex flex-col justify-between">
          <div>
            <h3 className="heading1 text-4xl lg:text-6xl font-bold leading-none">
              <p
                className="hero-title-link title-link bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                dangerouslySetInnerHTML={{ __html: title }}
              ></p>
            </h3>

            <Link
              href={`authors/${author}`}
              className="mt-4 text-[#0069FF] font-thin hover:underline hover:text-[#1433D6] inline-block"
            >
              <Avatar author={author || "Anonymous"} />
            </Link>

            <div className="flex items-center gap-4 mt-2">
              <div className="text-md">
                <Date dateString={date} />
              </div>
              <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
              <div className="text-md text-gray-500">
                <span>
                  {postReadingTime ? `${postReadingTime} min read` : null}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`${basePath}/${slug}`}
            className="relative group w-fit mt-6 lg:mt-10 mb-6 md:mb-8"
          >
            <span className="flex items-center gap-1 font-medium transition-all duration-300">
              Read More
              <FaArrowRight className="text-sm pl-[.15rem] transition-all duration-300 group-hover:translate-x-1 group-hover:scale-x-125" />
            </span>
            <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>
      </div>
  );
}
