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
    <div className="bg-[#F3F4F6] rounded-2xl" ref={ref}>
      <div className="mb-5">
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

      <div className="p-4">
        <h3 className="text-xl leading-snug heading1 font-semibold">
          <Link
            href={`${basePath}/${slug}`}
            className="bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px] hover:underline"
            dangerouslySetInnerHTML={{ __html: title }}
          ></Link>
        </h3>
        <div className="flex items-center gap-4">
          <Avatar author={author ? author : "Anonymous"} />
          <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
          <div className="text-md mb-4 pt-4">
            <Date dateString={date} />
          </div>
        </div>
        <div
          className="text-sm leading-normal mb-4 body text-slate-600"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
      </div>
    </div>
  );
}
