import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* ── Share Section ── */
function SidebarShare() {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const currentURL = encodeURIComponent(
    `https://keploy.io${router.basePath + router.asPath}`
  );
  const twitterShare = `https://twitter.com/share?url=${currentURL}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${currentURL}`;
  const linkedinShare = `https://www.linkedin.com/shareArticle?url=${currentURL}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://keploy.io/blog${router.asPath}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const iconCls =
    "w-9 h-9 flex items-center justify-center rounded-full text-lg transition-transform duration-150 hover:scale-110 cursor-pointer";

  return (
    <div>
      <h3
        className="font-bold text-base mb-3"
        style={{ fontFamily: "'DM Sans', sans-serif", color: "#1D2022" }}
      >
        Share
      </h3>

      <div className="flex items-center gap-3">
        <Link
          href={twitterShare}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={iconCls}
          style={{ backgroundColor: "#000", color: "#fff" }}
        >
          <FaXTwitter />
        </Link>

        <Link
          href={facebookShare}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={iconCls}
          style={{ backgroundColor: "#1877F2", color: "#fff" }}
        >
          <FaFacebook />
        </Link>

        <Link
          href={linkedinShare}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={iconCls}
          style={{ backgroundColor: "#0A66C2", color: "#fff" }}
        >
          <FaLinkedin />
        </Link>

        {/* Copy link button */}
        <button
          onClick={copyLink}
          aria-label="Copy link"
          className={`${iconCls} border border-gray-300`}
          style={{ backgroundColor: "#fff", color: "#6b7280" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>

        {copied && (
          <span className="text-orange-500 text-xs font-medium whitespace-nowrap">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
}


const AD_IMAGES = [
  "/blog/images/keploy-ad-cream.webp",
  "/blog/images/keploy-ad-dark.webp",
  "/blog/images/keploy-ad-orange.webp",
];

const CTA_HREF = "https://app.keploy.io/signin";

/* ── Ad / CTA Banner ── */
function SidebarAdBanner() {
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSrc(AD_IMAGES[Math.floor(Math.random() * AD_IMAGES.length)]);
  }, []);

  if (!src) {
    return (
      <div
        className="rounded-2xl bg-white border border-gray-200"
        style={{ maxWidth: 320, margin: '0 auto', minHeight: 260, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="rounded-2xl bg-white border border-gray-200 flex flex-col overflow-hidden"
      style={{
        maxWidth: 320,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <Link
        href={CTA_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Try Keploy for free"
        style={{ display: 'block', width: '100%' }}
      >
        <Image
          src={src}
          alt="Try Keploy for free"
          width={720}
          height={448}
          sizes="320px"
          className="cursor-pointer"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          loading="lazy"
        />
      </Link>

      <div className="px-5 pt-5 pb-6">
        <Link
          href={CTA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center font-bold text-sm py-3 rounded-xl transition-all duration-150 hover:brightness-90 active:scale-[0.98]"
          style={{
            background: '#ED5D0F',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(232, 98, 42, 0.35)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Try for Free
        </Link>
      </div>
    </div>
  );
}

/* ── Composed Sidebar ── */
export default function BlogSidebar() {
  return (
    <div className="w-full max-w-[260px] flex flex-col gap-5">
      {/* Share */}
      <SidebarShare />

      {/* Dashed divider */}
      <hr className="border-0 border-t-2 border-dashed border-gray-300" />

      {/* Ad banner */}
      <SidebarAdBanner />
    </div>
  );
}
