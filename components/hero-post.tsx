import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getTagsByPostId } from "../lib/api";
import { WavyBackground } from "./wavy-background";

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
  authorImage,
  postId,
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");
  const [tag, setTag] = useState([]);

  useEffect(() => {
    const fetchPostTag = async () => {
      const tags = await getTagsByPostId(postId);
      setTag(tags);
    };

    fetchPostTag();
  }, [postId]);

  return (
    <section>
      <div className="relative px-6 py-6 rounded-md xl:grid xl:grid-cols-2 xl:gap-x-8 mb-20 md:mb-28 content-center xl:group overflow-hidden z-10 shadow-2xl bg-[#FBFCFF]">
        {/* Content */}
        <div className="mb-8 lg:mb-0">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              isCommunity={isCommunity}
              classNames="rounded-xl w-full h-auto"
            />
          )}
        </div>
        <div className="mt-2 pb-2">
          {tag[0] && (
            <span className="text-sm px-4 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 text-center">
              {tag[0]}
            </span>
          )}
          <div>
            <h3 className="heading1 text-4xl lg:text-6xl font-bold leading-none hover:underline pt-4">
              <Link
                href={`${basePath}/${slug}`}
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>

          <div>
            <div
              className="body leading-relaxed text-slate-600 mt-4 mb-4 break-words break-keep"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            ></div>
          </div>

          <div className="flex items-center gap-1 mt-6">
            {authorImage != "imag1" && authorImage != "image" ? (
              <Image
                src={authorImage}
                alt={`${author.ppmaAuthorName}'s Avatar`}
                className="w-12 h-12 rounded-full mr-3 sm:mr-2 "
                height={40}
                width={40}
              />
            ) : (
              <Image
                src={`/blog/images/author.png`}
                alt={`${author.ppmaAuthorName}'s Avatar`}
                className="w-12 h-12 rounded-full mr-3 sm:mr-2 "
                height={40}
                width={40}
              />
            )}
            <div className="flex flex-col">
              <Avatar author={author ? author : "Anonymous"} />
              <div className="text-sm mb-0">
                <Date dateString={date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
