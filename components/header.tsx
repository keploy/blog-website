"use client";

import Image from "next/image";
import Link from "next/link";
import sideBySideSvg from "../public/images/sidebyside-transparent.svg";
import { SpringValue, animated } from "@react-spring/web";
import { MainNav } from "../components/navbar/main-nav";
import { GitHubStars } from "./navbar/github-stars";
import { Vscode } from "./navbar/vscode-number";
import { Button } from "./navbar/Button";
import { MobileNav } from "../components/navbar/mobile-nav";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils/utils";

export default function Header({
  readProgress,
}: {
  readProgress?: SpringValue<number>;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-32 md:h-40">
      <header
        className={cn(
          "fixed z-30 w-full transition duration-300 ease-in-out border-none md:bg-opacity-90",
          scrolled ? "lg:bg-neutral-100 lg:shadow-none" : "lg:bg-transparent",
          "bg-white"
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
                    className="h-[50px] w-[100px]"
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex flex-grow justify-start mr-4">
                <MainNav />
              </div>
            </div>

            <div className="justify-end flex-1 hidden header-btn-container lg:flex gap-2">
              <Vscode />
              <GitHubStars />
              <Button className="ml-[8px]">Sign In</Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center gap-2 lg:hidden">
              <GitHubStars />
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
