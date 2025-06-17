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
  { text: "Careers", link: "https://keploy.io/careers" }, // New link
];

const formatStars = (num: number) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);

const WaitListBtn = ({ mobile }: { mobile?: Boolean }) => {
  const baseClass =
    "inline-flex py-2 px-4 rounded font-semibold ml-3 text-white bg-[#00163d] hover:bg-[#002255]";
  return (
    <Link
      href="https://app.keploy.io/signin"
      className={mobile ? `${baseClass}` : `${baseClass} hidden lg:inline-flex`}
    >
      <span>Sign In</span>
    </Link>
  );
};

const ContributeBtn = () => (
  <Link
    href="https://github.com/keploy/keploy"
    className="inline-flex py-2 px-4 rounded ml-3 text-white bg-green-600 hover:bg-green-700 font-semibold"
  >
    Contribute
  </Link>
);

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
    <button className="w-full p-2 overflow-hidden border border-orange-500 border-opacity-25 rounded lg:w-auto sm:border-opacity-100">
      <Link
        className="flex items-center gap-2 ml-4 text-sm font-extrabold text-orange-500 transition-colors lg:ml-0 hover:text-primary-300"
        href="https://github.com/keploy/keploy"
      >
        <svg className="w-5 h-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <title>Github Logo</title>
          <path
            d="M8 .2C3.6.2 0 3.8 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V14c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
        <span className="text-gradient-500 opacity-30 hover:text-orange-500">|</span>
        <span className="flex gap-1 text-base">
          ⭐️ <p>{formatStars(stars)}</p>
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

  return (
    <div className="h-32 md:h-40">
      <header className="fixed z-30 w-full transition duration-300 ease-in-out bg-neutral-100 md:bg-opacity-90">
        <div className="max-w-6xl px-5 mx-auto sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex-grow-0 w-2/12 mr-4 shrink-0">
              <Link href={"https://keploy.io/"}>
                <Image src={sideBySideSvg} alt="Keploy Logo" className="w-auto h-10" />
              </Link>
            </div>

            <nav className="flex-grow-0 hidden w-6/12 lg:flex">
              <ul className="flex flex-wrap items-center justify-end grow">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.link}
                      className="flex items-center px-5 py-3 font-medium text-gray-700 hover:text-primary-300"
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="justify-end flex-1 hidden lg:flex header-btn-container">
              <GithubBtn />
              <ContributeBtn />
              <WaitListBtn />
            </div>

            <div className="flex lg:hidden">
              <button
                onClick={() => setToggleMenu(!toggleMenu)}
                className={toggleMenu ? "hamburger active" : "hamburger"}
              >
                <span className="sr-only">Menu</span>
                <MenuBtn />
              </button>
              {toggleMenu && (
                <nav className="absolute left-0 z-20 w-full h-screen pb-16 overflow-scroll bg-white top-full">
                  <ul className="px-5 py-2">
                    <li><GithubBtn /></li>
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.link}
                          className="flex items-center px-5 py-3 font-medium text-gray-600 hover:text-primary-300"
                        >
                          {item.text}
                        </Link>
                      </li>
                    ))}
                    <li><ContributeBtn /></li>
                    <li><WaitListBtn mobile={true} /></li>
                  </ul>
                </nav>
              )}
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
