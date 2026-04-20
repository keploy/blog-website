"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Marquee } from "./Marquee";

const ANNOUNCEMENT_ENABLED = true;

const ANNOUNCEMENT = {
  enabled: ANNOUNCEMENT_ENABLED,
  storageKey: "keploy_announcement_gittogether_sf_may_14_2026",
  eyebrow: "Registrations LIVE",
  href: "https://luma.com/lr79szro",
  ctaLabel: "Register Now",
};

const setAnnouncementHeight = (value: string) => {
  document.documentElement.style.setProperty("--announcement-h", value);
};

function MarqueeContent() {
  const items = [
    "Keploy is hosting a community meetup in San Francisco!",
    "GitTogether SF • May 14, 2026 • San Francisco",
    "Tickets are selling fast, limited seats available register now!",
  ];

  return (
    <>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-3 whitespace-nowrap text-[12px] text-[#23120a] sm:text-[13px] lg:text-[14px]"
        >
          <span
            className={
              item.includes("community meetup")
                ? "font-semibold"
                : item.includes("limited seats")
                ? "font-normal text-[#3f1807]"
                : "font-normal"
            }
          >
            {item}
          </span>
          <span className="text-[15px] font-semibold text-[#23120a]/45">|</span>
        </span>
      ))}
    </>
  );
}

export function Announcements() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);

  useEffect(() => {
    if (!ANNOUNCEMENT.enabled) {
      setAnnouncementHeight("0px");
      return;
    }

    try {
      setIsVisible(!localStorage.getItem(ANNOUNCEMENT.storageKey));
    } catch {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) {
      setAnnouncementHeight("0px");
      return;
    }

    const node = containerRef.current;
    const syncHeight = () => setAnnouncementHeight(`${node.offsetHeight}px`);

    syncHeight();

    const resizeObserver = new ResizeObserver(syncHeight);
    resizeObserver.observe(node);
    window.addEventListener("resize", syncHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);

    try {
      localStorage.setItem(ANNOUNCEMENT.storageKey, "dismissed");
    } catch {
      // Ignore storage failures and just close for this session.
    }
  };

  if (!ANNOUNCEMENT.enabled || !isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="banner"
      aria-label="Event announcement"
      className="fixed inset-x-0 top-0 z-[60] border-b border-white/40 bg-cover bg-center bg-no-repeat shadow-[0_12px_30px_rgba(234,88,12,0.16)] backdrop-blur"
      style={{ backgroundImage: "url('https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/announcement-bar-bg.webp')" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/10" />

      <div className="relative mx-auto max-w-[1440px] px-3 pt-1 pb-2 pr-14 sm:px-5 lg:px-12 lg:py-1.5">
        {/* Mobile layout */}
        <div className="flex w-full flex-col gap-2 lg:hidden">
          <div
            onMouseEnter={() => setIsMarqueePaused(true)}
            onMouseLeave={() => setIsMarqueePaused(false)}
            onPointerEnter={() => setIsMarqueePaused(true)}
            onPointerLeave={() => setIsMarqueePaused(false)}
            className="min-w-0"
          >
            <Marquee
              paused={isMarqueePaused}
              repeat={10}
              className="max-w-full px-0 py-0 [--duration:30s] [--gap:1.25rem]"
            >
              <MarqueeContent />
            </Marquee>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 pr-1">
            <span className="inline-flex h-7 w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-white/20 px-3 text-[9px] font-semibold tracking-[0.08em] leading-none text-[#b43b15] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              {ANNOUNCEMENT.eyebrow}
            </span>

            <Link
              href={ANNOUNCEMENT.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-full border border-black/90 bg-black px-3 text-[11px] font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#141414] hover:shadow-[0_14px_30px_rgba(0,0,0,0.36)]"
            >
              <span>{ANNOUNCEMENT.ctaLabel}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden min-w-0 items-center gap-4 lg:flex">
          <span className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-full border border-white/50 bg-white/20 px-4 text-[10px] font-semibold tracking-[0.08em] leading-none text-[#b43b15] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            {ANNOUNCEMENT.eyebrow}
          </span>

          <div
            className="min-w-0 flex-1"
            onMouseEnter={() => setIsMarqueePaused(true)}
            onMouseLeave={() => setIsMarqueePaused(false)}
            onPointerEnter={() => setIsMarqueePaused(true)}
            onPointerLeave={() => setIsMarqueePaused(false)}
          >
            <Marquee
              paused={isMarqueePaused}
              repeat={10}
              className="max-w-full px-0 py-0 [--duration:35s] [--gap:1.5rem]"
            >
              <MarqueeContent />
            </Marquee>
          </div>

          <Link
            href={ANNOUNCEMENT.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-black/90 bg-black px-4 text-[13px] font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#141414] hover:shadow-[0_16px_34px_rgba(0,0,0,0.36)]"
          >
            <span>{ANNOUNCEMENT.ctaLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/75 bg-white/18 text-[#6f2b00] transition hover:bg-white/30 lg:right-4"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
