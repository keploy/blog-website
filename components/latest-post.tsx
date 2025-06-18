import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { JSX } from "react";

interface Props extends Pick<Post, "title" | "date" | "excerpt" | "slug"> {
  coverImage: Post["featuredImage"];
  author: Post["ppmaAuthorName"];
  isCommunity?: boolean;
}

export default function LatestPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity,
}: Props): JSX.Element {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");

  return (
    <section>
      <div className="bg-gray-100 border px-8 py-8 rounded-md flex flex-col lg:gap-x-8 mb-20 md:mb-28 relative lg:hover:shadow-md transition">
        <h2 className="heading1 text-4xl lg:text-5xl font-bold leading-none mb-8">
          Our Latest Blog Post -
        </h2>

        <div className="mb-8 w-full lg:mb-0">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              isCommunity={isCommunity}
            />
          )}
        </div>

        <div className="flex flex-col flex-1">
          <h3 className="heading1 text-3xl lg:text-4xl font-bold leading-none mb-4">
            <Link
              href={`${basePath}/${slug}`}
              className="hero-title-link title-link bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
              dangerouslySetInnerHTML={{ __html: title }}
              aria-label={`Read more about ${title}`}
            />
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <Avatar author={author ? author : "Anonymous"} />
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <div className="text-md pt-1">
              <Date dateString={date} />
            </div>
          </div>

          <div>
            <div
              className="body xl:text-md text-md leading-relaxed mb-4 text-slate-600"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </div>

          <div className="mt-auto self-end">
            <Link
              href={`${basePath}/${slug}`}
              className="text-orange-400 hover:text-orange-600 font-semibold flex items-center"
              aria-label={`Read more about ${title}`}
            >
              Read More
              <span className="ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 010-1.414L10.586 10 7.707 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
