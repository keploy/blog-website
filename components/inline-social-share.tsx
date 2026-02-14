import React, { useState } from "react";
import Link from "next/link";
import { FaTwitter, FaLinkedin, FaLink } from "react-icons/fa";

interface InlineSocialShareProps {
  postUrl: string;
  postTitle: string;
}

const InlineSocialShare: React.FC<InlineSocialShareProps> = ({ postUrl, postTitle }) => {
  const [copied, setCopied] = useState(false);

  const currentURL = encodeURIComponent(postUrl);
  const twitterShareUrl = `https://twitter.com/share?url=${currentURL}&text=${encodeURIComponent(postTitle)}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${currentURL}&title=${encodeURIComponent(postTitle)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-6 mb-6 lg:hidden">
      <span className="text-sm text-gray-600 font-medium">Share:</span>
      <div className="flex gap-3">
        <Link
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-blue-500 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
          aria-label="Share on Twitter"
        >
          <FaTwitter className="w-5 h-5" />
        </Link>
        <Link
          href={linkedinShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
          aria-label="Share on LinkedIn"
        >
          <FaLinkedin className="w-5 h-5" />
        </Link>
        <button
          onClick={copyToClipboard}
          className="text-gray-700 hover:text-orange-500 transition-colors duration-200 p-2 rounded-full hover:bg-orange-50 focus:outline-none relative"
          aria-label="Copy link to clipboard"
        >
          <FaLink className="w-5 h-5" />
          {copied && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Copied!
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default InlineSocialShare;