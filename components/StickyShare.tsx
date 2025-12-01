import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaLinkedin, FaTwitter, FaLink } from "react-icons/fa";

const StickyShare = () => {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const baseUrl = `https://keploy.io/blog${router.asPath}`;
    const currentURL = typeof window !== 'undefined' ? encodeURIComponent(baseUrl) : "";

    const twitterShareUrl = `https://twitter.com/share?url=${currentURL}`;
    const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${currentURL}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(baseUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <div className="hidden lg:flex flex-row gap-4 items-center p-4 bg-white rounded-lg shadow-sm mb-4">
            <p className="text-gray-500 text-sm font-semibold">Share</p>
            <div className="flex flex-row gap-4">
                <Link
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl text-gray-600 transition-colors duration-300 hover:text-blue-500"
                >
                    <FaTwitter />
                </Link>
                <Link
                    href={linkedinShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl text-gray-600 transition-colors duration-300 hover:text-blue-700"
                >
                    <FaLinkedin />
                </Link>
                <button
                    onClick={copyToClipboard}
                    className="text-2xl text-gray-600 transition-colors duration-300 hover:text-orange-500 focus:outline-none relative"
                    aria-label="Copy URL to clipboard"
                >
                    <FaLink />
                    {copied && (
                        <span className="absolute left-1/2 -translate-x-1/2 -top-8 text-xs text-orange-500 whitespace-nowrap bg-white p-1 rounded shadow-sm border border-orange-100">
                            Copied!
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StickyShare;
