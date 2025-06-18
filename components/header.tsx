"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import sideBySideSvg from "../public/images/sidebyside-transparent.svg";
import { SpringValue, animated } from "@react-spring/web";

const menuItems = [
  { text: "Docs", link: "https://keploy.io/docs" },
  { text: "Tech Blogs", link: "/technology" },
  { text: "Community Articles", link: "/community" },
];

const formatStars = (num: number) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);

const WaitListBtn = ({ mobile }: { mobile?: Boolean }) => {
  const baseStyle =
    "inline-flex items-center py-2 px-4 rounded-full text-white bg-gradient-to-r from-orange-500 to-yellow-400 font-semibold shadow transition hover:from-yellow-400 hover:to-orange-500";
  return (
    <Link href="https://app.keploy.io/signin" className={`${baseStyle} ${mobile ? "ml-3" : "ml-3"}`}>
      <span>Sign In</span>
      {mobile && (
        <svg
          className="w-3 h-3 ml-2 -mr-1 fill-current shrink-0"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z"
            fillRule="nonzero"
          />
        </svg>
      )}
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
    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition">
      <Link
        href="https://github.com/keploy/keploy"
        className="flex items-center gap-2"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>GitHub Logo</title>
          <path
            d="M8 .2C3.6.2 0 3.8 0 8c0 3.5 2.3 6.5 5.5 7.6..."
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
        <span className="text-gray-800 text-sm font-semibold">
          ⭐ {formatStars(stars)}
        </span>
      </Link>
    </button>
  );
};

const MenuBtn = () => (
  <svg
    className="w-6 h-6 text-gray-900 fill-current"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect y="4" width="24" height="2" />
    <rect y="11" width="24" height="2" />
    <rect y="18" width="24" height="2" />
  </svg>
);

export default function Header({
  readProgress,
}: {
  readProgress?: SpringValue<number>;
}) {
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleMenuHandler = () => setToggleMenu((prev) => !prev);

  return (
    <div className="h-32 md:h-40">
      <header className="fixed z-30 w-full transition duration-300 ease-in-out bg-neutral-100 md:bg-opacity-90">
        <div className="max-w-6xl px-5 mx-auto sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center w-auto mr-8">
              <Link href="https://keploy.io/">
                <Image src={sideBySideSvg} alt="Keploy Logo" className="h-12 w-auto" />
              </Link>
            </div>

            <nav className="hidden lg:flex space-x-8">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="text-gray-700 font-medium hover:text-orange-500 transition"
                >
                  {item.text}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex gap-4">
              <GithubBtn />
              <WaitListBtn />
            </div>

            <div className="flex lg:hidden">
              <button
                onClick={toggleMenuHandler}
                className={toggleMenu ? "hamburger active" : "hamburger"}
              >
                <span className="sr-only">Menu</span>
                <MenuBtn />
              </button>
              <div>
                {toggleMenu && (
                  <nav className="absolute left-0 z-20 w-full h-screen pb-16 overflow-scroll bg-white top-full">
                    <ul className="px-5 py-2">
                      <li>
                        <GithubBtn />
                      </li>
                      {menuItems.map((item, index) => (
                        <li key={index}>
                          <Link
                            href={item.link}
                            className="flex items-center px-5 py-3 font-medium text-gray-600 transition duration-150 ease-in-out hover:text-primary-300"
                          >
                            {item.text}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <WaitListBtn mobile={true} />
                      </li>
                    </ul>
                  </nav>
                )}
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
            />
            <div className="absolute top-0 w-full h-full bg-gray-300 -z-10"></div>
          </div>
        )}
      </header>
    </div>
  );
}
