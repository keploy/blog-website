import React, { useState } from "react";
import Image from "next/image";
const PostHeaderAuthors = ({ blogwriter, blogreviewer }) => {
  var sameAuthor = blogwriter[0].name.split(" ")[0].toLowerCase() === blogreviewer[0].name.toLowerCase();
  const [hoverStateBlogWriter, sethoverStateBlogWriter] = useState(false);
  const [hoverStateBlogReviewer, sethoverStateBlogReviewer] = useState(false);
  const onmouseenterBlogWriter = () => {
    sethoverStateBlogWriter(true);
  };

  const onmouseleaveBlogWriter = () => {
    sethoverStateBlogWriter(false);
  };
  const onmouseenterBlogReviewer = () => {
    sethoverStateBlogReviewer(true);
  };

  const onmouseleaveBlogReviewer = () => {
    sethoverStateBlogReviewer(false);
  };

  return (
    <div className="flex flex-row my-7 items-center gap-20 z-0">
      <div
        className="flex flex-row items-center gap-5 static z-10"
        onMouseEnter={onmouseenterBlogWriter}
        onMouseLeave={onmouseleaveBlogWriter}
      >
        <Image
          src={blogwriter[0].ImageUrl}
          alt="blog-writer"
          height={50}
          width={50}
          className={`rounded-full`}  
        />
        <div className="static z-10">
          <p>
            <span className=" text-gray-500"> Written By:</span> <br />{" "}
            <span className=" font-semibold">{blogwriter[0].name}</span>
          </p>{" "}
          {hoverStateBlogWriter && <p className="absolute w-2/12 bg-white p-2 text-sm rounded shadow-md z-40 mt-2">{blogwriter[0].description}</p>}
        </div>
      </div>
      {!sameAuthor && (
        <div
          className="flex flex-row items-center gap-5 static z-10"
          onMouseEnter={onmouseenterBlogReviewer}
          onMouseLeave={onmouseleaveBlogReviewer}
        >
          <Image
            src={blogreviewer[0].ImageUrl}
            alt="blog-writer"
            height={50}
            width={50}
            className="rounded-full"
          />
          <div className=" static z-10">
            <p>
              <span className=" text-gray-500"> Reviewed By:</span> <br />{" "}
              <span className=" font-semibold">{blogreviewer[0].name}</span>
            </p>
            {hoverStateBlogReviewer && <p className=" absolute w-2/12 bg-white p-2 text-sm rounded shadow-md z-40 mt-2">{blogreviewer[0].description}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostHeaderAuthors;
