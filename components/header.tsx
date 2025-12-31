"use client";

import { SpringValue, animated } from "@react-spring/web";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { cn } from "../lib/utils/utils";
import SearchCommand from "./SearchCommand";

export default function Header({
  readProgress,
}: {
  readProgress?: SpringValue<number>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const isBlogReadingPage =
    router.pathname === "/technology/[slug]" ||
    router.pathname === "/community/[slug]";

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
          scrolled ? "" : ""
        )}
      >
        <div className="max-w-6xl px-5 mx-auto sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center flex-1">
              <div className="mr-4 shrink-0">
                <Link href="https://keploy.io/">
                  <Image
                    src={sideBySideSvg}
                    alt="Keploy Logo"
                    className="h-[50px] w-[100px] mb-2"
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden xl:flex flex-grow justify-start mr-4">
                <MainNav />
              </div>
            </div>

            <div className="justify-end flex-1 hidden header-btn-container xl:flex gap-2">
              <SearchCommand />
              <Vscode />
              <GitHubStars />
              <Button className="ml-[8px]">
                <a
                  href="https://app.keploy.io/signin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sign In
                </a>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center gap-2 xl:hidden">
              <SearchCommand />
              <GitHubStars />
              <Button className="ml-[8px] hidden md:flex">
                <a
                  href="https://app.keploy.io/signin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sign In
                </a>
              </Button>
              <MobileNav />
            </div>
          </div>
        </div>
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
