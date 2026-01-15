import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaLinkedin, FaTwitter, FaLink } from "react-icons/fa";

const StickyShare = () => {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const buildShareLinks = () => {
        const baseUrlFallback = "https://keploy.io";
        const fullUrl = typeof window !== "undefined"
            ? `${window.location.origin}${router.basePath}${router.asPath}`
            : `${baseUrlFallback}${router.basePath}${router.asPath}`;

        const encodedUrl = encodeURIComponent(fullUrl);

        return {
            fullUrl,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        };
    };

    const { fullUrl, twitter: twitterShareUrl, linkedin: linkedinShareUrl } = buildShareLinks();

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
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
