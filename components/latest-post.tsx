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

export default function LatestPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity,
}) {
  const basePath = isCommunity ? "/community" : "/technology";

  return (
    <section>
      <div className="bg-gray-100 border px-8 py-8 rounded-md flex flex-col lg:gap-x-8 mb-20 md:mb-28 content-center  lg:hover:shadow-md transition">
        <h2 className="heading1  text-4xl lg:text-5xl font-bold leading-none mb-8">Our Latest Blog Post - </h2>
        <div className="mb-8 w-full lg:mb-0 ">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              isCommunity={isCommunity}
            />
          )}
        </div>
        <div>
          <div>
            <h3 className="heading1  text-3xl lg:text-4xl font-bold leading-none">
              <Link
                href={`${basePath}/${slug}`}
                className="hero-title-link title-link  bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
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
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
