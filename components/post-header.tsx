import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import PostTitle from "./post-title";
import Categories from "./categories";
import { useEffect, useState } from "react";

export default function PostHeader({
  title,
  coverImage,
  date,
  author,
  categories,
  content,
}) {
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    let d = document.createElement("div");
    d.innerHTML = content;
    let src = d
      .querySelector(".pp-author-boxes-avatar")
      .querySelector("img").src;
    setImgSrc(src);
  }, []);

  return (
    <>
      <div className="max-w-4xl mx-auto mb-6 md:mb-0">
        <Categories categories={categories} className="mb-2" />
        <PostTitle>{title}</PostTitle>
        <div className="flex justify-between divide-x-2 gap-x-2 divide-black items-center">
          <div className="flex gap-x-4 items-center">
            <img
              src={imgSrc}
              alt={""}
              className="h-10 w-10 object-contain rounded-full bg-clip-content border"
            />
            <div className="font-semibold text-lg capitalize">{author}</div>
          </div>
          <Date dateString={date} className="pl-4" />
        </div>
      </div>
      <div className="hidden md:flex flex-col items-center justify-center md:mb-12">
        {/* <Avatar author={author} /> */}
        <div className="mb-6 text-lg"></div>
      </div>
      <div className="mb-8 md:mb-16 sm:mx-0 xl:w-2/3 md:w-4/5 w-full md:-translate-x-1/2 md:left-1/2 relative">
        {/* <CoverImage title={title} coverImage={coverImage} /> */}
        <img
          src={coverImage?.node.sourceUrl}
          className="w-full object-contain rounded"
        />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="block md:hidden mb-6">
          <Avatar author={author} />
        </div>
      </div>
    </>
  );
}
