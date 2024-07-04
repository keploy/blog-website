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
      <div className="flex flex-row mt-7  items-center justify-around  item z-0">
        <p className="text-gray-500 justify-self-start text-sm">{timetoRead} min read</p>
        <div className="flex flex-row gap-8">
          <div
            className="flex flex-row items-center gap-5 relative"
            onMouseEnter={onMouseEnterBlogWriter}
            onMouseLeave={onMouseLeaveBlogWriter}
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
                <span className=" text-gray-500"> Written By:</span>{" "}
                <span className=" font-base">{blogwriter[0].name}</span>
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
              onMouseEnter={onMouseEnterBlogReviewer}
              onMouseLeave={onMouseLeaveBlogReviewer}
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
                  <span className=" text-gray-500"> Reviewed By:</span>{" "}
                  <span className="font-base">{blogreviewer[0].name}</span>
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
        <div className="flex flex-row gap-5">
          <p className="text-gray-500 text-sm">Share this</p>
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
      <hr className="border-slate-300 mb-20 mt-5" />
    </>
  );
};

export default PostHeaderAuthors;
