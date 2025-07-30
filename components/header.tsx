"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import sideBySideSvg from "../public/images/sidebyside-transparent.svg"
import { SpringValue, animated } from "@react-spring/web";
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

const WaitListBtn = ({ mobile }: { mobile?: Boolean }) => {
  if (mobile) {
    return (
      <Link
        href="https://app.keploy.io/signin"
        className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
      >
        <span>Sign In</span>
        <svg
          className="w-3.5 h-3.5 fill-current text-white transition-transform duration-200"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z"
            fillRule="nonzero"
          />
        </svg>
      </Link>
    );
  }
  return (
    <Link
      href="https://app.keploy.io/signin"
      className="py-1.5 px-6 rounded-full text-white text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 shadow-md transition-all duration-300 text-center flex items-center justify-center hover:bg-gradient-to-l"
    >
      <span>Sign In</span>
    </Link>
  );
};

const GithubBtn = () => {
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
  <div className="relative overflow-hidden rounded-full transition-all duration-500 group">
    <div className="rounded-full px-5 py-1.5 border-2 border-transparent transition-all duration-500 group-hover:bg-[#FCEFE5] group-hover:border-[#f5a26f] group-hover:border-opacity-70">
      <span
        className="
          absolute left-0 top-0 h-full w-[200%]
          bg-gradient-to-r from-transparent via-orange-400 to-transparent
          opacity-40
          transform -translate-x-full
          transition-transform duration-700 ease-out
          group-hover:translate-x-full
          pointer-events-none
        " 
      />
      <Link
        className="flex items-center gap-1.5 text-sm font-extrabold transition-colors duration-500 group-hover:text-black"
        rel="noopener noreferrer"
        aria-label="Keploy Github Repo"
        href="https://github.com/keploy/keploy"
        >
          <svg className="h-6 w-6 text-black transition-none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <title>Github Logo</title>
            <path
              d="M8 .2C3.6.2 0 3.8 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V14c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
            <span className="text-base font-medium flex gap-1 group-hover:text-orange-500 transition-colors duration-500">
              <p>{formatStars(stars)}</p>
            </span>
        </Link>
      </div>
    </div>
  );
};

const MenuBtn = ({ open }: { open: boolean }) => {
  return open ? (
    <svg
      className="w-7 h-7 text-gray-900"
      fill="none"
      viewBox="0 0 24 24"
    >
      <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg
      className="w-7 h-7 text-gray-900"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect y="4" width="24" height="2" fill="currentColor" />
      <rect y="11" width="24" height="2" fill="currentColor" />
      <rect y="18" width="24" height="2" fill="currentColor" />
    </svg>
  );
};

export default function Header({
  readProgress,
}: {
  readProgress?: SpringValue<number>;
}) {
  const [toggleMenu, setToggleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenuHandler = () => {
    setToggleMenu((prev) => !prev);
  };

  return (
    <div className="h-32 md:h-40">
      <header className="fixed z-30 w-full transition duration-300 ease-in-out bg-neutral-100 md:bg-opacity-90 ">
        <div className="max-w-6xl px-5 mx-auto sm:px-6">
          <div className="flex items-center h-16 md:h-20">
            <div className="shrink-0">
              <Link href={"https://keploy.io/"}>
                <Image
                  src={sideBySideSvg}
                  alt="Keploy Logo"
                  className="w-auto h-10"
                />
              </Link>
            </div>
            <nav className="hidden lg:flex flex-grow ml-8">
              <ul className="flex items-center space-x-2">
                {menuItems.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link
                        href={item.link}
                        className="flex items-center px-5 py-5 font-medium text-gray-700 transition-colors duration-200 hover:text-black"
                      >
                        {item.text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="flex items-center flex-shrink-0 ml-auto">
              <div className="ml-2">
                <GithubBtn />
              </div>
              <div className="ml-3 hidden md:block">
                <WaitListBtn />
              </div>
              <div className="flex lg:hidden ml-2">
                <button
                  onClick={() => setToggleMenu(true)}
                  aria-label="Open menu"
                  className="p-2 rounded focus:outline-none"
                >
                  <MenuBtn open={false} />
                </button>
              </div>
            </div>
          </div>
        </div>
        {readProgress && (
          <div className="relative h-1">
            <animated.div
              className="h-full rounded-r-full bg-gradient-to-r from-orange-500 to-yellow-500"
              style={{
                width: readProgress.to((v) => v + "%"),
              }}
            >
            </animated.div>
            <div className="absolute top-0 w-full h-full bg-gray-300 -z-10"></div>
          </div>
        )}
      </header>
      {toggleMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-60"
            onClick={() => setToggleMenu(false)}
          />
          <div
            ref={menuRef}
            className="fixed top-0 left-0 z-50 w-4/5 max-w-xs h-full bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col"
            style={{ transform: toggleMenu ? "translateX(0)" : "translateX(-100%)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <span className="text-base font-bold text-gray-700">Menu</span>
              <button
                aria-label="Close menu"
                className="p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                onClick={() => setToggleMenu(false)}
              >
                <svg
                  className="w-5 h-5 text-gray-500 hover:text-orange-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
                  <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="px-4 py-4 divide-y divide-gray-200">
                {menuItems.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.link}
                      className="block py-3 text-[15px] font-semibold text-gray-700 hover:text-orange-500 transition"
                      onClick={() => setToggleMenu(false)}
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sign In Button at Bottom */}
            <div className="px-4 py-6 border-t border-gray-200">
              <WaitListBtn mobile />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
