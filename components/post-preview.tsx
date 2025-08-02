import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { easings, useInView } from "@react-spring/web";
import Image from "next/image";
import { Tag } from "../types/tag";

export default function PostPreview({
  title,
  coverImage,
  date,
  author,
  slug,
  isCommunity = false,
  authorImage,
  tags,
}: {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
  authorImage: Post["ppmaAuthorImage"];
  tags: Tag["node"]["name"];
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  const [ref] = useInView(
    () => ({
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: { duration: 500, delay: 100, easing: easings.easeInCubic },
    }),
    { rootMargin: "-200px 0px" }
  );

  return (
    <div
      className="group relative h-full overflow-hidden rounded-2xl border-[2px] border-[#E2E4E9] bg-[#F9FAFE] transition duration-200 hover:shadow-xl flex flex-col"
      ref={ref}
    >
      <Link href={`${basePath}/${slug}`}>
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
            classNames="rounded-tr-2xl rounded-tl-2xl h-[200px] w-full"
          />
        )}

        <div className="p-[24px] flex flex-col justify-between flex-1">
          <div>
            {tags && (
              <span className="inline-block w-fit text-sm font-semibold bg-orange-100 text-orange-700 px-4 rounded-full py-1 mb-[8px]">
                {tags}
              </span>
            )}

            <h3 className="leading-tight font-medium text-lg 2xl:text-xl block group-hover:underline">
              <span
                className="bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px] hover:underline"
                dangerouslySetInnerHTML={{ __html: title }}
              ></span>
            </h3>
          </div>
        </div>

        <div className="p-[1rem] pt-0 xl:p-[1.5rem] xl:pt-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-row justify-center items-center">
              {authorImage &&
              authorImage !== "imag1" &&
              authorImage !== "image" ? (
                <Image
                  src={authorImage}
                  alt={`${authorImage}'s Avatar`}
                  className="w-10 h-10 rounded-full mr-3 sm:mr-2"
                  height={40}
                  width={40}
                />
              ) : (
                <Image
                  src={`/blog/images/author.png`}
                  alt={`${authorImage}'s Avatar`}
                  className="w-10 h-10 rounded-full mr-3 sm:mr-2"
                  height={40}
                  width={40}
                />
              )}
              <div>
                <Avatar author={author ? author : "Anonymous"} />
                <div className="text-[12px] mb-0 -mt-1 text-gray-500">
                  <Date dateString={date} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
