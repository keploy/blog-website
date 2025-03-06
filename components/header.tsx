"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import sideBySideSvg from "../public/images/sidebyside-transparent.svg";
import { SpringValue, animated } from "@react-spring/web";
import Github from "../public/images/github-logo.svg"

const menuItems = [
  { text: "Docs", link: "https://keploy.io/docs" },
  { text: "Tech Blogs", link: "/technology" },
  { text: "Community Articles", link: "/community" },
];

const formatStars = (num: number) =>
  Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);

const SignInButton = ({ mobile }: { mobile?: boolean }) => {
  return (
    <Link
      href="https://www.app.keploy.io/signin"
      className={`
        inline-flex items-center px-6 py-2.5 rounded-full font-semibold
        bg-gradient-to-r from-orange-400 to-orange-600
        text-white transition-all duration-300
        hover:shadow-lg hover:shadow-orange-500/30
        active:scale-95
        ${mobile ? 'w-full justify-center mt-4' : ''}
      `}
    >
      Sign In
    </Link>
  );
};

const GithubButton = () => {
  const [stars, setStars] = useState<number>(5412);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/keploy/keploy"
        );
        const data = await response.json();
        setStars(data.stargazers_count);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  return (
    <Link
      href="https://github.com/keploy/keploy"
      className="flex items-center gap-3 px-4 py-2 text-gray-700 transition-colors hover:text-gray-900"
    >
      <Image className="w-6 h-6" src={Github} alt="" />
      <span className="font-medium">{formatStars(stars)}</span>
    </Link>
  );
};

const MenuButton = () => {
  return (
    <svg
      className="w-6 h-6 text-gray-900"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect y="4" width="24" height="2" />
      <rect y="11" width="24" height="2" />
      <rect y="18" width="24" height="2" />
    </svg>
  );
};

export default function Header({
  readProgress,
}: {
  readProgress?: SpringValue<number>;
}) {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <div className="h-20">
      <header className="fixed z-30 w-full bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-8">
              <Link href="https://keploy.io/">
                <Image
                  src={sideBySideSvg}
                  alt="Keploy Logo"
                  className="h-8 w-auto"
                />
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    {item.text}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <GithubButton />
              <SignInButton />
            </div>

            <button
              onClick={() => setToggleMenu(!toggleMenu)}
              className="md:hidden"
            >
              <MenuButton />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {toggleMenu && (
          <div className="md:hidden">
            <div className="px-4 pt-2 pb-6 space-y-2 bg-white shadow-lg">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="block py-2 text-gray-600 hover:text-gray-900"
                >
                  {item.text}
                </Link>
              ))}
              <div className="pt-2">
                <GithubButton />
                <SignInButton mobile />
              </div>
            </div>
          </div>
        )}

        {readProgress && (
          <div className="relative h-1">
            <animated.div
              className="h-full rounded-r-full bg-gradient-to-r from-orange-400 to-orange-600"
              style={{
                width: readProgress.to((v) => v + "%"),
              }}
            />
            <div className="absolute top-0 w-full h-full bg-gray-200 -z-10" />
          </div>
        )}
      </header>
    </div>
  );
}