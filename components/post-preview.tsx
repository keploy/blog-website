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
      className="bg-gradient-to-b from-white to-gray-100 p-8 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-2xl"
      ref={ref}
      style={springStyles}
    >
      <div className="relative mb-6 rounded-lg overflow-hidden">
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
          />
        )}
      </div>

      <h3 className="text-3xl font-semibold text-gray-800 tracking-wide mb-2">
        <Link
          href={`${basePath}/${slug}`}
          className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </h3>

      <div className="flex items-center mb-4">
        <Avatar author={author ? author : "Anonymous"} />
        <div className="mx-3 h-1 w-1 bg-orange-500 rounded-full"></div>
        <span className="text-gray-500 text-sm">
          <Date dateString={date} />
        </span>
      </div>

      <div
        className="text-gray-600 text-md leading-relaxed tracking-wide"
        dangerouslySetInnerHTML={{ __html: excerpt }}
      />

      <div className="mt-6 flex items-center gap-2">
        <Link
          href={`${basePath}/${slug}`}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full shadow hover:from-orange-600 hover:to-pink-600 transition-all duration-300"
        >
          Read More
        </Link>
      </div>
    </animated.div>

  );
}
