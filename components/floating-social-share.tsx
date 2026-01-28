import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaTwitter, FaLinkedin, FaLink } from "react-icons/fa";
import { useRouter } from "next/router";

interface FloatingSocialShareProps {
  postUrl: string;
  postTitle: string;
}

const FloatingSocialShare: React.FC<FloatingSocialShareProps> = ({ postUrl, postTitle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past header (around 300px)
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200/50">
        <p className="text-xs text-gray-600 mb-2 text-center font-medium">Share</p>
        <div className="flex flex-col gap-3">
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
            className="text-gray-700 hover:text-orange-500 transition-colors duration-200 p-2 rounded-full hover:bg-orange-50 focus:outline-none"
            aria-label="Copy link to clipboard"
          >
            <FaLink className="w-5 h-5" />
          </button>
        </div>
        {copied && (
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingSocialShare;