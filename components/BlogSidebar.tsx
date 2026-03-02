import React, { useState } from "react";
import Link from "next/link";
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

/* ── Category Pill ── */
function SidebarCategory({
  categories,
}: {
  categories?: { edges: { node: { name: string } }[] };
}) {
  if (!categories?.edges?.length) return null;

  const first = categories.edges[0].node.name;
  const label = first.charAt(0).toUpperCase() + first.slice(1);

  return (
    <div>
      <span
        className="inline-block border border-gray-400 text-gray-700 text-xs font-medium px-3 py-1 rounded-full"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Ad / CTA Banner ── */
function SidebarAdBanner() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: "#FFF4EE",
        border: "1.5px solid #FF914D",
      }}
    >
      <h4
        className="font-bold text-base leading-snug mb-1.5"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "#1D2022",
        }}
      >
        Try Keploy for free
      </h4>

      <p
        className="text-sm leading-relaxed mb-3"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "#4b5563",
        }}
      >
        Generate test cases and data mocks with one click. Reduce unit test development time by 90%.
      </p>

      <Link
        href="https://keploy.io"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold text-sm transition-colors duration-150 hover:opacity-80"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "#FF6D41",
        }}
      >
        Sign up <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

/* ── Composed Sidebar ── */
export default function BlogSidebar({
  categories,
}: {
  categories?: { edges: { node: { name: string } }[] };
}) {
  return (
    <div className="w-full max-w-[260px] flex flex-col gap-5">
      {/* Share */}
      <SidebarShare />

      {/* Dashed divider */}
      <hr className="border-0 border-t-2 border-dashed border-gray-300" />

      {/* Category pill */}
      <SidebarCategory categories={categories} />

      {/* Ad banner */}
      <SidebarAdBanner />
    </div>
  );
}
