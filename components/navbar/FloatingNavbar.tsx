"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import FloatingNavbarClient from "./FloatingNavbarClient";

const glassNavBase =
  "relative overflow-visible transition-all duration-300 backdrop-blur-2xl";
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
    ? "w-[95%] md:max-w-6xl"
    : "w-[96%] md:max-w-6xl";
  const navPaddingClasses = isScrolled
    ? "px-4 mb-4 pt-2 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5"
    : "px-5 py-2 mb-4 pt-2 md:px-6 md:py-3 lg:px-8 lg:py-4";
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

      const navWidthouterClasses = isScrolled
    ? "w-[89%] md:max-w-[1150px] rounded-full mx-auto items-center justify-center px-[10px]"
    : "";
  return (
    <div className="w-[100%] h-[80px]">
    <div className={` w-[100%] ${isScrolled ? `h-[65px] mt-5` : `h-[80px]`} ${glassNavBase} ${navGlassClasses} ${navWidthouterClasses} overflow-visible ${navShadowClasses} ${navPaddingClasses}`}>
      <nav className={`${navPositionClasses} transition-all duration-500 ${navWidthClasses}`}>
        <FloatingNavbarClient isScrolled={isScrolled} />
      </nav>
    </div>
    </div>
  );
}

