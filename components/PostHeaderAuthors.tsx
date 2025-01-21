import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaTwitter, FaLinkedin } from "react-icons/fa";

const PostHeaderAuthors = ({ blogwriter, blogreviewer, timetoRead }) => {
  var sameAuthor =
    blogwriter[0].name.split(" ")[0].toLowerCase() ===
    blogreviewer[0].name.toLowerCase();
  const [hoverStateBlogWriter, sethoverStateBlogWriter] = useState(false);
  const [hoverStateBlogReviewer, sethoverStateBlogReviewer] = useState(false);

  const onMouseEnterBlogWriter = () => {
    sethoverStateBlogWriter(true);
  };

  const onMouseLeaveBlogWriter = () => {
    setTimeout(() => {
      sethoverStateBlogWriter(false);
    }, 400);
  };

  const onMouseEnterBlogReviewer = () => {
    sethoverStateBlogReviewer(true);
  };

  const onMouseLeaveBlogReviewer = () => {
    setTimeout(() => {
      sethoverStateBlogReviewer(false);
    }, 400);
  };
  const router = useRouter();
  const currentURL = encodeURIComponent(
    `keploy.io/${router.basePath + router.asPath}`
  );
  const twitterShareUrl = `https://twitter.com/share?url=${currentURL}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${currentURL}`;

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:mt-7 items-start sm:items-center sm:justify-around gap-4 sm:gap-0  sm:px-0 lg:mx-28">
        <p className="text-gray-500 text-sm order-1 sm:order-none mr-1 sm:my-2 md:my-4 lg:my-0">
          {timetoRead} min read
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 order-3 sm:order-none w-full sm:w-auto">
          <div
            className="flex flex-row items-center gap-3 sm:gap-5 relative"
            onMouseEnter={onMouseEnterBlogWriter}
            onMouseLeave={onMouseLeaveBlogWriter}
          >
            <Image
              src={blogwriter[0].ImageUrl}
              alt="blog-writer"
              height={40}
              width={40}
              className={`rounded-full`}
            />
            <div className="relative">
              <p>
                <span className=" text-gray-500"> Written By:</span>{" "}
                <span className=" font-base">{blogwriter[0].name}</span>
              </p>{" "}
            </div>

            {hoverStateBlogWriter && (
              <div className="absolute bg-white p-4 text-sm rounded shadow-md z-40 mt-2 top-12 w-80">
                <Link href={`/authors/${blogwriter[0].name}`}>
                  <div className="flex flex-row items-center gap-3 sm:gap-5">
                    <Image
                      src={blogwriter[0].ImageUrl}
                      alt="blog-writer"
                      height={40}
                      width={40}
                      className="rounded-full"
                    />
                    <p className="text-base sm:text-lg">{blogwriter[0].name}</p>
                  </div>
                  <p className="mt-2 text-sm">{blogwriter[0].description}</p>
                </Link>
              </div>
            )}
          </div>

          {!sameAuthor && (
            <div
              className="flex flex-row items-center gap-3 sm:gap-5 relative"
              onMouseEnter={onMouseEnterBlogReviewer}
              onMouseLeave={onMouseLeaveBlogReviewer}
            >
              <Image
                src={blogreviewer[0].ImageUrl}
                alt="blog-reviewer"
                height={40}
                width={40}
                className="rounded-full"
              />
              <div className="relative flex-1">
                <p className="text-sm sm:text-base">
                  <span className="text-gray-500">Reviewed By:</span>{" "}
                  <span className="font-base">{blogreviewer[0].name}</span>
                </p>
              </div>

              {hoverStateBlogReviewer && (
                <div className="absolute bg-white p-4 text-sm rounded shadow-md z-40 mt-2 top-12 w-[calc(100vw-2rem)] sm:w-80 left-0">
                  <Link href={`/authors/${blogreviewer[0].name}`}>
                    <div className="flex flex-row items-center gap-3 sm:gap-5">
                      <Image
                        src={blogreviewer[0].ImageUrl}
                        alt="blog-reviewer"
                        height={40}
                        width={40}
                        className="rounded-full"
                      />
                      <p className="text-base sm:text-lg">
                        {blogreviewer[0].name}
                      </p>
                    </div>
                    <p className="mt-2 text-sm">
                      {blogreviewer[0].description}
                    </p>
                  </Link>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-row items-center gap-3 sm:gap-5 order-2 sm:order-none mt-2 md:mb-2">
            <div>
              <p className="text-gray-500 text-sm">Share this</p>
            </div>
            <div className="flex gap-4">
              <Link
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="twitter-share-button text-xl text-black transition-colors duration-300 hover:text-blue-500"
              >
                <FaTwitter className="icon" />
              </Link>
              <Link
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-share-button text-xl text-black transition-colors duration-300 hover:text-blue-500"
              >
                <FaLinkedin className="icon" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-300 mb-20 mt-5" />
    </>
  );
};

export default PostHeaderAuthors;
