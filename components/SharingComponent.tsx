import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaTwitter, FaLinkedin } from "react-icons/fa";

const SharingComponent = ({timetoRead}) => {
  const router = useRouter();
  const currentURL = encodeURIComponent(`keploy.io/${router.basePath + router.asPath}`);
  const twitterShareUrl = `https://twitter.com/share?url=${currentURL}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${currentURL}`;
  return (
    <>
      <div className="flex flex-row items-start justify-between gap-5">
        <div className="flex flex-row items-start">
          <p className="text-gray-500 text-sm">{timetoRead} min read</p>
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

export default SharingComponent;
