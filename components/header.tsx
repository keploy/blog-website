"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

const WaitListBtn = ({ mobile}: { mobile?: Boolean}) => {
  if (mobile) {
    return (
      <Link
        href="https://www.app.keploy.io/signin"
        className="absolute bottom-16 px-32 bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 rounded-full items-center text-lg font-fonts font-semibold shadow-xl text-white py-3" 
      >
        <span>Sign In</span>
      </Link>
    );
  }
  return (
    <Link
      href="https://www.app.keploy.io/signin"
      className="hidden md:block md:bg-gradient-to-r md:from-orange-500 md:to-red-500 md:hover:from-red-500 md:hover:to-orange-500 md:rounded-full md:items-center md:px-8 md:py-3 md:text-lg md:font-fonts md:font-semibold md:shadow-xl"
      > 
      <span className=" not-italic text-xl text-white items-center">Sign In</span>
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
    <button className="relative rounded-full group">
      <Link
        className="relative overflow-hidden px-5 py-1 flex items-center gap-2 transition-all duration-200 rounded-full hover:bg-orange-400/10  text-xl group/link hover:ring-2 hover:ring-orange-400/80"
        href="https://github.com/keploy/keploy"
      >
        <svg
          className="w-7 h-7"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Github Logo</title>
          <path
            d="M8 .2C3.6.2 0 3.8 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V14c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"
            fill="black"
            fillRule="evenodd"
          />
        </svg>
        <span className="flex font-medium gap-2">
           <p className="text-black text-2xl group-hover/link:text-orange-400">{formatStars(stars)}</p>
        </span>
        <div className="absolute inset-0 -translate-x-full group-hover/link:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent"></div>
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
    <div className="h-32 md:h-40 ">
      <header className="fixed z-30 w-full transition duration-300 ease-in-out bg-neutral-100 md:bg-opacity-90 2xl:px-44 items-center ">
        <div className="sm:px-6">
          <div className="flex flex-1 items-center mt-2 md:h-16 px-12">
            <div className="w-auto ">
              <Link href={"https://keploy.io/"}>
                <Image
                  src={sideBySideSvg}
                  alt="Keploy Logo"
                  className="w-auto h-11"
                />
              </Link>
            </div>
            <nav className=" w-auto hidden lg:flex ">
              <ul className="flex flex-wrap items-center justify-end mt-2 ml-9">
                {menuItems.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link
                        href={item.link}
                        className=" hidden 2xl:flex items-center text-center flex-grow-0 px-4 font-medium  text-gray-800 text-xl hover:text-black transition duration-500 ease-in-out"
                      >
                        {item.text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="flex ml-auto">
              <div className="flex justify-end gap-2">
                <GithubBtn/>
                <WaitListBtn />
              </div>
              <div className="flex ml-7 2xl:hidden">
                <button
                  onClick={toggleMenuHandler}
                  className={` ${toggleMenu ? null : "hamburger "}`}
                >
                  <span className="sr-only">Menu</span>
                  <MenuBtn />
                  {/* <img src="/blog/images/Menu.svg" className="w-6 h-6"></img> */}
                </button>
                <div>
                  {toggleMenu ? (
                    <nav className=" flex-col absolute top-0 left-0 z-20 w-8/12 flex-grow-0  h-screen pb-16 overflow-scroll translate-y-0 bg-white opacity-100 ">
                      <ul className="px-5 py-2">
                        <li className="flex justify-between">
                          <div className=" flex-grow-0 text-black text-3xl pt-5 font-bold">Menu</div> 
                          <button
                            onClick={toggleMenuHandler}
                            className={` ${!toggleMenu ? null : "hamburger active"}`}
                          >
                            <MenuBtn />
                          </button>
                        </li>
                        {menuItems.map((item, index) => {
                          return (
                            <li key={index}>
                              <Link
                                href={item.link}
                                className="flex items-center text-center flex-grow-0 py-7 font-semibold  text-gray-800 text-xl hover:text-black hover:underline transition duration-500 ease-in-out"
                              >
                                {item.text}
                              </Link>
                              <hr/>
                            </li>
                          );
                        })}
                        <li>
                          <WaitListBtn mobile={true}/>
                        </li>
                      </ul>
                    </nav>
                  ) : null}
                </div>
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
