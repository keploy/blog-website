"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import sideBySideSvg from "../public/images/sidebyside-transparent.svg"
import { SpringValue, animated } from "@react-spring/web";
import { FaGithub } from "react-icons/fa";
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
        href="https://www.app.keploy.io/signin"
        className="inline-flex items-center p-3 text-xl rounded-3xl text-white bg-primary-300 ring-2 ring-primary-300 font-semibold  hover:bg-orange-500"
      >
        <span>Sign In</span>
        <svg
          className="w-3 h-3 ml-2 -mr-1 fill-current hover:text-primary-300 shrink-0"
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
      href="https://www.app.keploy.io/signin"
      className="py-2.5 px-8 rounded-full leading-[1.375rem] text-white  bg-gradient-to-r from-primary-300 via-primary-deep-orange to-primary-deep-orange hover:bg-gradient-to-l hover:from-primary-300 hover:via-primary-deep-orange hover:to-primary-deep-orange "
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
    <button className="w-full p-2 overflow-hidden border-2 border-primary-50/0 hover:border-2  hover:border-orange-500 hover:text-primary-300 px-6 border-opacity-0 rounded-full lg:w-auto sm:border-opacity-100">
      <Link
        className="flex items-center gap-2 ml-4 text-sm font-extrabold  transition-colors lg:ml-0"
        href="https://github.com/keploy/keploy"
      >
        <svg
          className="w-5 h-5 text-black "
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Github Logo</title>
          <path
            d="M8 .2C3.6.2 0 3.8 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V14c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
        {/* <FaGithub className="h-6 w-6" /> */}
        {/* <span className="text-gradient-500 opacity-30 hover:text-orange-500">
          |
        </span> */}
        <span className="flex gap-1 text-base ">
          {/* ⭐️  */}
          <p>{formatStars(stars)}</p>
        </span>
      </Link>
    </button>
  );
};

const MenuBtn = () => {
  return (
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
};

export default function Header({
  readProgress,
}: {
  readProgress?: SpringValue<number>;
}) {
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleMenuHandler = () => {
    setToggleMenu((prev) => !prev);
  };

  return (
    <div className="h-32 md:h-40">
      <header className="fixed z-30 w-full transition duration-300 ease-in-out bg-neutral-100 md:bg-opacity-90 ">
        <div className="max-w-6xl px-5  mx-auto sm:px-6">
          <div className="flex  items-center h-16 md:h-20">
            <div className="w-2/12 ">
              <Link href={"https://keploy.io/"}>
                <Image
                  src={sideBySideSvg}
                  alt="Keploy Logo"
                  className="w-auto h-10"
                /> 
              </Link>
            </div>
            <nav className=" hidden w-6/12 lg:flex -translate-x-10 ">
              <ul className="flex flex-wrap items-center justify-start grow">
                {menuItems.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link
                        href={item.link}
                        className="flex items-center flex-grow-0 px-5 pt-3.5 font-medium text-gray-600 transition duration-150 ease-in-out hover:text-primary-300 lg:flex"
                      >
                        {item.text} 
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="justify-end flex-1 hidden header-btn-container lg:gap-2 lg:flex pt-3.5 ">
              <GithubBtn />
              <WaitListBtn />
            </div>
            <div className="flex lg:hidden">
              <button
                onClick={toggleMenuHandler}
                className={toggleMenu ? "hamburger active" : "hamburger "}
              >
                <span className="sr-only">Menu</span>
                <MenuBtn />
                {/* <img src="/blog/images/Menu.svg" className="w-6 h-6"></img> */}
              </button>
              <div>
                {toggleMenu ? (
                  <nav className="absolute left-0 z-20 flex-grow-0 w-full h-screen pb-16 overflow-scroll translate-y-0 bg-white opacity-100 top-full">
                    <ul className="px-5 py-2">
                      <li>
                        <GithubBtn />
                      </li>
                      {menuItems.map((item, index) => {
                        return (
                          <li key={index}>
                            <Link
                              href={item.link}
                              className="flex items-center px-5 py-3 font-medium text-gray-600 transition duration-150 ease-in-out hover:text-primary-300"
                            >
                              {item.text}
                            </Link>
                          </li>
                        );
                      })}
                      <li>
                        <WaitListBtn mobile={true} />
                      </li>
                    </ul>
                  </nav>
                ) : null}
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
    </div>
  );
}
