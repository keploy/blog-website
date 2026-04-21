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


const AD_VIDEOS = [
  "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/record+replay+k8s.mp4",
  "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/coverage.mp4",
  "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/load+testing.mp4",
];

/* ── Ad / CTA Banner ── */
function SidebarAdBanner() {
  const [videoError, setVideoError] = React.useState(false);
  const [videoSrc] = React.useState(
    () => AD_VIDEOS[Math.floor(Math.random() * AD_VIDEOS.length)]
  );

  return (
    <div
      className="rounded-2xl bg-[#FFF4EE] border border-[#FF914D] flex flex-col overflow-hidden"
      style={{ maxWidth: 320, margin: '0 auto' }}
    >
      {!videoError ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      ) : (
        <Link
          href="https://app.keploy.io/signin"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', width: '100%' }}
        >
          <Image
            src="/blog/images/keploy-ad-banner.jpg"
            alt="Keploy Ad Banner"
            width={320}
            height={200}
            sizes="320px"
            className="transition-shadow duration-200 ease-in-out cursor-pointer hover:shadow-lg"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
          />
        </Link>
      )}

      <div className="p-4 flex flex-col gap-3">
        <div>
          <h4
            className="font-bold text-base leading-snug mb-1"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#1D2022" }}
          >
            AI-Powered Test Agent
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#4b5563" }}
          >
            Generate test cases and data mocks with one click. Reduce unit test development time by 90%.
          </p>
        </div>

        <Link
          href="https://app.keploy.io/signin"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center font-bold text-sm py-2.5 rounded-xl transition-opacity duration-150 hover:opacity-90"
          style={{ backgroundColor: "#E8622A", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
        >
          Start Free
        </Link>

        <Link
          href="https://keploy.io/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center font-bold text-sm py-2.5 rounded-xl border border-gray-300 transition-colors duration-150 hover:bg-gray-50"
          style={{ color: "#1D2022", fontFamily: "'DM Sans', sans-serif" }}
        >
          Read Docs
        </Link>

        <Link
          href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2l-psdTCNCLYAJ-Jt5ESyGP7gi1_U70ySTjtFNr0Kmx5UagNJnyzg7lNjA3NKnaP6qFfpAgcdZ"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center font-bold text-sm py-2.5 rounded-xl border border-gray-300 transition-colors duration-150 hover:bg-gray-50"
          style={{ color: "#1D2022", fontFamily: "'DM Sans', sans-serif" }}
        >
          Book a Demo
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
