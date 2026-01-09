"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import FloatingNavbarClient from "./FloatingNavbarClient";

const glassNavBase =
  "relative overflow-visible rounded-full transition-all duration-300 backdrop-blur-2xl";
const glassNavDefault =
  "bg-gradient-to-br from-gray-100/80 via-gray-100/62 to-gray-100/48 border border-white/70 shadow-[0_18px_44px_rgba(15,23,42,0.18)]";
const glassNavScrolled =
  "bg-gradient-to-br from-gray-300/90 via-gray-300/78 to-gray-200/68 border border-gray-200/70 ring-1 ring-white/40 shadow-none";
const glassNavReading =
  "bg-white/75 border-none shadow-none backdrop-blur-2xl";

type FloatingNavbarProps = {
  isBlogReadingPage?: boolean;
};

export default function FloatingNavbar({ isBlogReadingPage }: FloatingNavbarProps) {
  const router = useRouter();
  const derivedBlogReadingPage =
    typeof isBlogReadingPage === "boolean"
      ? isBlogReadingPage
      : router.pathname === "/technology/[slug]" || router.pathname === "/community/[slug]";
  const [isScrolled, setIsScrolled] = useState(derivedBlogReadingPage);

  useEffect(() => {
    if (derivedBlogReadingPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [derivedBlogReadingPage]);

  const navPositionClasses = derivedBlogReadingPage
    ? "relative top-0 mx-auto z-40"
    : "fixed top-6 left-1/2 -translate-x-1/2 z-40";
  const navWidthClasses = isScrolled
    ? "w-[calc(100%-3rem)] md:w-[calc(100%-5rem)] lg:w-[calc(100%-8rem)] max-w-[72rem]"
    : "w-full max-w-full";
  const navPaddingClasses = isScrolled
    ? "px-4 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5"
    : "px-5 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4";
  const navShadowClasses = derivedBlogReadingPage
    ? ""
    : isScrolled
      ? "shadow-none"
      : "shadow-[0_18px_44px_rgba(15,23,42,0.18)]";

  const navGlassClasses = derivedBlogReadingPage
    ? glassNavReading
    : isScrolled
      ? glassNavScrolled
      : glassNavDefault;

  return (
    <nav className={`${navPositionClasses} transition-all duration-300 ${navWidthClasses}`}>
        <div
          className={`${glassNavBase} ${navGlassClasses} overflow-visible ${navShadowClasses} ${navPaddingClasses}`}
        >
        <div className="pointer-events-none absolute inset-0 rounded-full">
          <div className="absolute -top-8 -left-6 h-24 w-24 rounded-full bg-gray-200/60 blur-2xl" />
          <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-gray-200/40 blur-3xl" />
        </div>
        <FloatingNavbarClient isScrolled={isScrolled} />
      </div>
    </nav>
  );
}

