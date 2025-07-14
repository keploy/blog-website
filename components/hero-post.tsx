import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getTagsByPostId } from "../lib/api";

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
      <div className="relative px-8 py-8 rounded-md lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center lg:group overflow-hidden">
        {/* Content */}
        <div className="mb-8 lg:mb-0">
          {coverImage && (
            <CoverImage
              title={title}
              coverImage={coverImage}
              slug={slug}
              isCommunity={isCommunity}
              classNames="rounded-xl w-full h-auto lg:h-[450px] xl:w-auto sm:w-full sm:h-[300px]"
            />
          )}
        </div>
        <div className="mt-2 pb-2">
          <span className="text-sm px-4 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 text-center">
            {tag[0]}
          </span>
          <div>
            <h3 className="heading1 lg:text-[32px] xl:text-[44px] xl:leading-[48px] lg:leading-[45px] font-extrabold hover:underline pt-4 leading-[32px] text-[32px]">
              <Link
                href={`${basePath}/${slug}`}
                className="hero-title-link title-link"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>

          <div>
            <div
              className="body lg:text-[18px] leading-relaxed mb-4 text-slate-600 mt-6 text-[14px] sm:text-[16px]"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            ></div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Image
              src={authorImage}
              alt="author-image"
              height={40}
              width={40}
              className="rounded-3xl"
            />
            <div className="flex flex-col">
              <Avatar author={author ? author : "Anonymous"} />
              <div className="text-md mb-0">
                <Date dateString={date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
