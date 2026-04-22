import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
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


const DEMO_CTA = {
  label: "Book a Demo",
  href: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2l-psdTCNCLYAJ-Jt5ESyGP7gi1_U70ySTjtFNr0Kmx5UagNJnyzg7lNjA3NKnaP6qFfpAgcdZ",
};

const AD_ITEMS = [
  {
    src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/coverage.mp4",
    title: "Record API calls from real user flows.",
    description: "Auto-generated on every PR diff, from real behavior. VS Code & JetBrains, 1M+ installs.",
    primaryCTA: { label: "Start Free", href: "https://app.keploy.io/signin" },
    demoCTA: DEMO_CTA,
    secondaryCTA: { label: "Read the docs →", href: "https://keploy.io/docs" },
  },
  {
    src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/load+testing.mp4",
    title: "Real traffic. Real tests. Zero manual effort.",
    description: "Captures live API calls and turns them into test cases. Coverage that reflects production.",
    primaryCTA: { label: "Try for Free", href: "https://app.keploy.io/signin" },
    demoCTA: DEMO_CTA,
    secondaryCTA: { label: "Read the docs →", href: "https://keploy.io/docs" },
  },
  {
    src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/api+test+generation+ai+powered+automation.mp4",
    title: "Replay captured traffic to instantly catch regressions.",
    description: "Replay production traffic at scale. No scripted scenarios, no guesswork.",
    primaryCTA: { label: "Get Started", href: "https://app.keploy.io/signin" },
    demoCTA: DEMO_CTA,
    secondaryCTA: { label: "Read the docs →", href: "https://keploy.io/docs" },
  },
];

/* ── Ad / CTA Banner ── */
function SidebarAdBanner() {
  const [videoError, setVideoError] = React.useState(false);
  const [ad, setAd] = React.useState<typeof AD_ITEMS[0] | null>(null);
  const [prefersReduced, setPrefersReduced] = React.useState(false);

  React.useEffect(() => {
    setAd(AD_ITEMS[Math.floor(Math.random() * AD_ITEMS.length)]);
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (!ad) return null;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 flex flex-col overflow-hidden max-w-[320px] mx-auto shadow-md">
      {!videoError ? (
        <video
          src={ad.src}
          autoPlay={!prefersReduced}
          muted
          loop={!prefersReduced}
          playsInline
          preload="metadata"
          poster="/blog/images/keploy-ad-banner.jpg"
          aria-hidden="true"
          onError={() => setVideoError(true)}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      ) : (
        <Link
          href={ad.primaryCTA.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Sign up — ${ad.title}`}
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

      <div className="px-5 pt-5 pb-6 flex flex-col gap-4">
        <div>
          <h4
            className="font-bold text-base leading-snug mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#1D2022" }}
          >
            {ad.title}
          </h4>
          <p
            className="text-sm leading-relaxed text-gray-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {ad.description}
          </p>
        </div>

        <Button asChild variant="default" className="w-full">
          <Link href={ad.primaryCTA.href} target="_blank" rel="noopener noreferrer">
            {ad.primaryCTA.label}
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full rounded-full">
          <Link href={ad.demoCTA.href} target="_blank" rel="noopener noreferrer">
            {ad.demoCTA.label}
          </Link>
        </Button>

        <Link
          href={ad.secondaryCTA.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm font-medium hover:underline pt-1 text-primary-300"
        >
          {ad.secondaryCTA.label}
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
