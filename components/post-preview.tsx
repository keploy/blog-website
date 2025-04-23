import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { animated, easings, useInView } from "@react-spring/web";

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
}: {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");
  const [ref, springStyles] = useInView(
    () => ({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 100,
      },
      config: {
        duration: 500,
        delay: 100,
        easing: easings.easeInCubic,
      },
    }),
    {
      rootMargin: "-200px 0px",
    }
  );
  return (
    <animated.div
      className="bg-gray-100 border p-6 rounded-md lg:hover:shadow-[0_4px_12px_rgba(249,115,22,0.25)] lg:hover:border-orange-400 transition group flex flex-col h-full"
      ref={ref}
      style={springStyles}
    >
      <div className="mb-5 h-48 overflow-hidden">
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
          />
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-2xl leading-snug leading-none heading1 font-bold mb-4">
          <Link
            href={`${basePath}/${slug}`}
            className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
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
          className="text-sm leading-normal mt-auto text-slate-600 overflow-hidden flex-grow"
          style={{ 
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: title.length > 60 ? 2 : title.length > 30 ? 4 : 6,
          }}
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
      </div>
    </animated.div>
  );
}
