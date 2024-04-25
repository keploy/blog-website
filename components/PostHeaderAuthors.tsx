import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const PostHeaderAuthors = ({ blogwriter, blogreviewer }) => {
  var sameAuthor =
    blogwriter[0].name.split(" ")[0].toLowerCase() ===
    blogreviewer[0].name.toLowerCase();
  const [hoverStateBlogWriter, sethoverStateBlogWriter] = useState(false);
  const [hoverStateBlogReviewer, sethoverStateBlogReviewer] = useState(false);

  const onmouseenterBlogWriter = () => {
    sethoverStateBlogWriter(true);
  };

  const onmouseleaveBlogWriter = () => {
    setTimeout(() => {
      sethoverStateBlogWriter(false);
    }, 400);
  };

  const onmouseenterBlogReviewer = () => {
    sethoverStateBlogReviewer(true);
  };

  const onmouseleaveBlogReviewer = () => {
    setTimeout(() => {
      sethoverStateBlogReviewer(false);
    }, 400);
  };

  return (
    <div className="flex flex-row my-7 items-center gap-20 z-0">
      <div
        className="flex flex-row items-center gap-5 relative"
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
        <div className="relative">
          <p>
            <span className=" text-gray-500"> Written By:</span> <br />{" "}
            <span className=" font-semibold">{blogwriter[0].name}</span>
          </p>{" "}
        </div>
        {hoverStateBlogWriter && (
          <>
            <div className="absolute  bg-white p-4 text-sm rounded shadow-md z-40 mt-2 top-12 w-80">
              <Link href={`/authors/${blogwriter[0].name}`}>
                <div className=" flex flex-row items-center gap-5">
                  <Image
                    src={blogwriter[0].ImageUrl}
                    alt="blog-writer"
                    height={40}
                    width={40}
                    className={`rounded-full`}
                  />
                  <p className="text-lg">{blogwriter[0].name}</p>
                </div>
                <p className=" mt-2">{blogwriter[0].description}</p>
              </Link>
            </div>
          </>
        )}
      </div>
      {!sameAuthor && (
        <div
          className="flex flex-row items-center gap-5 relative"
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
          <div className="relative">
            <p>
              <span className=" text-gray-500"> Reviewed By:</span> <br />{" "}
              <span className=" font-semibold">{blogreviewer[0].name}</span>
            </p>
          </div>
          {hoverStateBlogReviewer && (
            <>
              <div className="absolute  bg-white p-4 text-sm rounded shadow-md z-40 mt-2 top-12 w-80">
                <Link href={`/authors/${blogreviewer[0].name}`}>
                  <div className=" flex flex-row items-center gap-5">
                    <Image
                      src={blogreviewer[0].ImageUrl}
                      alt="blog-writer"
                      height={40}
                      width={40}
                      className={`rounded-full`}
                    />
                    <p className="text-lg">{blogreviewer[0].name}</p>
                  </div>
                  <p className=" mt-2">{blogreviewer[0].description}</p>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeaderAuthors;
