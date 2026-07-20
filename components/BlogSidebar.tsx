import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import SubscribeNewsletter from "./subscribe-newsletter";
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


// 4 static banner variants for A/B testing. The artwork is a full-card image
// (button excluded from the artwork); the "Try for Free!" button is built in
// code and overlaid in the empty bottom band, with per-variant button colors.
// The artwork PNGs carry ~8.3% transparent drop-shadow padding, so button
// positions are measured against the FULL image. btnCenter is the vertical
// center of each card's empty band (as % from the top); the button is anchored
// there via translateY(-50%) so it stays centered regardless of its height.
const AD_BANNERS = [
  { src: "/blog/images/keploy-ad-banner-1.png", btnBg: "#ffffff", btnText: "#ED5D0F", btnCenter: "77.8%" },
  { src: "/blog/images/keploy-ad-banner-2.png", btnBg: "#ED5D0F", btnText: "#ffffff", btnCenter: "81.6%" },
  { src: "/blog/images/keploy-ad-banner-3.png", btnBg: "#ED5D0F", btnText: "#ffffff", btnCenter: "82.0%" },
  { src: "/blog/images/keploy-ad-banner-4.png", btnBg: "#16324F", btnText: "#ffffff", btnCenter: "81.8%" },
];

const CTA_HREF = "https://app.keploy.io/signin";
const AD_W = 313;
const AD_H = 413;

/* ── Ad / CTA Banner ── */
function SidebarAdBanner() {
  const [banner, setBanner] = React.useState<(typeof AD_BANNERS)[number] | null>(null);

  React.useEffect(() => {
    setBanner(AD_BANNERS[Math.floor(Math.random() * AD_BANNERS.length)]);
  }, []);

  if (!banner) {
    return (
      <div
        className="rounded-2xl"
        style={{ width: '100%', maxWidth: 320, margin: '0 auto', aspectRatio: `${AD_W} / ${AD_H}`, background: '#F3F4F6' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 320,
        margin: '0 auto',
        // container-query context so the overlaid button scales with the card
        containerType: 'inline-size',
      }}
    >
      {/* Full banner artwork (button excluded from artwork) */}
      <Image
        src={banner.src}
        alt="Keploy — 300M+ mocks and 12.8M+ tests generated"
        width={AD_W}
        height={AD_H}
        sizes="320px"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        loading="lazy"
      />

      {/* CTA button — built in code, overlaid in the artwork's empty bottom band */}
      <Link
        href={CTA_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Try for Free"
        className="block text-center font-bold transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
        style={{
          position: 'absolute',
          zIndex: 2,
          left: '13%',
          right: '13%',
          top: banner.btnCenter,
          transform: 'translateY(-50%)',
          // sized in cqw so the button scales with the card and always fits the band
          padding: '3.4cqw 0',
          borderRadius: '3.4cqw',
          fontSize: '5.8cqw',
          lineHeight: 1.2,
          background: banner.btnBg,
          color: banner.btnText,
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Try for Free!
      </Link>
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

      {/* Dashed divider */}
      <hr className="border-0 border-t-2 border-dashed border-gray-300" />

      {/* Newsletter + lead capture */}
      <SubscribeNewsletter />
    </div>
  );
}
