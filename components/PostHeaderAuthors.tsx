import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaLinkedin, FaTwitter, FaLink } from "react-icons/fa"; 

const PostHeaderAuthors = ({ blogwriter, blogreviewer, timetoRead }) => {
  const sameAuthor =
    blogwriter[0].name.split(" ")[0].toLowerCase() ===
    blogreviewer[0].name.toLowerCase();

  const [hoverStateBlogWriter, setHoverStateBlogWriter] = useState(false);
  const [hoverStateBlogReviewer, setHoverStateBlogReviewer] = useState(false);
  const [copied, setCopied] = useState(false); 

  const onMouseEnterBlogWriter = () => {
    setHoverStateBlogWriter(true);
  };

  const onMouseLeaveBlogWriter = () => {
    setTimeout(() => {
      setHoverStateBlogWriter(false);
    }, 400);
  };

  const onMouseEnterBlogReviewer = () => {
    setHoverStateBlogReviewer(true);
  };

  const onMouseLeaveBlogReviewer = () => {
    setTimeout(() => {
      setHoverStateBlogReviewer(false);
    }, 400);
  };
  const router = useRouter();
  const currentURL = encodeURIComponent(
    `keploy.io/${router.basePath + router.asPath}`
  );
  const twitterShareUrl = `https://twitter.com/share?url=${currentURL}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${currentURL}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`https://keploy.io/blog${router.asPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <>
      <div className="flex flex-row mt-7 items-center justify-around z-0">
        <p className="text-gray-500 justify-self-start text-sm">
          {timetoRead} min read
        </p>
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
                <span className="text-gray-500">Written By:</span>{" "}
                <span className="font-base">{blogwriter[0].name}</span>
              </p>
            </div>
            {hoverStateBlogWriter && (
              <div className="absolute bg-white p-4 text-sm rounded shadow-md z-40 mt-2 top-12 w-80">
                <Link href={`/authors/${blogwriter[0].name}`}>
                  <div className="flex flex-row items-center gap-5">
                    <Image
                      src={blogwriter[0].ImageUrl}
                      alt="blog-writer"
                      height={40}
                      width={40}
                      className={`rounded-full`}
                    />
                    <p className="text-lg">{blogwriter[0].name}</p>
                  </div>
                  {blogwriter[0].description !== "n/a" && (
                    <p className="mt-2">{blogwriter[0].description}</p>
                  )}
                </Link>
              </div>
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
                alt="blog-reviewer"
                height={50}
                width={50}
                className="rounded-full"
              />
              <div className="relative">
                <p>
                  <span className="text-gray-500">Reviewed By:</span>{" "}
                  <span className="font-base">{blogreviewer[0].name}</span>
                </p>
              </div>
              {hoverStateBlogReviewer && (
                <div className="absolute bg-white p-4 text-sm rounded shadow-md z-40 mt-2 top-12 w-80">
                  <Link href={`/authors/${blogreviewer[0].name}`}>
                    <div className="flex flex-row items-center gap-5">
                      <Image
                        src={blogreviewer[0].ImageUrl}
                        alt="blog-reviewer"
                        height={40}
                        width={40}
                        className={`rounded-full`}
                      />
                      <p className="text-lg">{blogreviewer[0].name}</p>
                    </div>
                    {blogreviewer[0].description !== "n/a" && (
                      <p className="mt-2">{blogreviewer[0].description}</p>
                    )}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-row gap-5 items-center">
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
          <button
            onClick={copyToClipboard}
            className="link-share-button text-xl text-black transition-colors duration-300 hover:text-blue-500 focus:outline-none"
            aria-label="Copy URL to clipboard"
          >
            <FaLink className="icon" />
          </button>
          {copied && (
            <span className="ml-2 text-orange-500 text-sm">Copied!</span>
          )}
        </div>
      </div>
      <hr className="border-slate-300 mb-20 mt-5" />
    </>
  );
};

export default PostHeaderAuthors;