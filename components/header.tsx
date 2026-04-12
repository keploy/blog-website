"use client";

import { SpringValue, animated } from "@react-spring/web";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils/utils";
import FloatingNavbar from "./navbar/FloatingNavbar";

export default function Header({
  readProgress,
}: {
  readProgress?: SpringValue<number>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isBlogReadingPage =
    // next/navigation pathname strips basePath, so match the dynamic segments directly
    pathname === "/technology/[slug]" || pathname === "/community/[slug]" ||
    // also match actual resolved paths like /technology/my-post
    /^\/(technology|community)\/[^/]+$/.test(pathname ?? "");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-28 md:h-32 border-b border-gray-200/50">
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-30 w-full transition duration-300 ease-in-out border-none bg-transparent",
          isBlogReadingPage && "bg-white"
        )}
      >
        <FloatingNavbar isBlogReadingPage={isBlogReadingPage} />
        {readProgress && (
          <div className="relative h-1">
            <animated.div
              className="h-full rounded-r-full bg-gradient-to-r from-orange-500 to-yellow-500"
              style={{ width: readProgress.to((v) => v + "%") }}
            />
            <div className="absolute top-0 w-full h-full bg-gray-300 -z-10" />
          </div>
        )}
      </header>
    </div>
  );
}
