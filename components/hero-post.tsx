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
            />
          )}
        </div>
        <div className="">
          <span className="text-md px-3 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 text-center">
            {tag[0]}
          </span>
          <div>
            <h3 className="heading1 text-4xl lg:text-6xl font-extrabold leading-none hover:underline pt-4">
              <Link
                href={`${basePath}/${slug}`}
                className="hero-title-link title-link"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>

          <div>
            <div
              className="body xl:text-md text-md leading-relaxed mb-4 text-slate-600 mt-6"
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
