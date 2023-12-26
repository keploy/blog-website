"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  // { text: "Home", link: "https://keploy.io/" },
  { text: "Docs", link: "https://keploy.io/docs" },
  { text: "Blog", link: "/technology" },
  { text: "Community", link: "/community" },
];

const WaitListBtn = ({ mobile }: { mobile?: Boolean }) => {
  if (mobile) {
    return (
      <Link
        href="https://docs.google.com/forms/d/e/1FAIpQLSdj9q7dyRh3D7ZzRExHLWRRkNPOnLnFfrbKqSwqH3Ur4HzP4g/viewform"
        className="inline-flex items-center py-2 px-4 rounded  text-gray-200 bg-[#00163d]  font-semibold ml-3"
      >
        <span>Join Waitlist</span>
        <svg
          className="w-3 h-3 fill-current hover:text-primary-300 shrink-0 ml-2 -mr-1"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z"
            fill-rule="nonzero"
          ></path>
        </svg>
      </Link>
    );
  }
  return (
    <Link
      href="https://docs.google.com/forms/d/e/1FAIpQLSdj9q7dyRh3D7ZzRExHLWRRkNPOnLnFfrbKqSwqH3Ur4HzP4g/viewform"
      className="inline-flex py-2 px-4 rounded leading-[1.375rem] text-gray-200 bg-[#00163d]  hover:font-semibold ml-3"
    >
      <span>Join Waitlist</span>
    </Link>
  );
};

const GithubBtn = () => {
  const [stars, setStars] = useState("0");

  useEffect(() => {
    const init = async () => {
      const response = await fetch(
        "https://api.github.com/repos/keploy/keploy"
      );
      const data = await response.json();
      setStars(data.stargazers_count);
    };
    init();
  }, []);

  return (
    <button className="border border-orange-500 rounded overflow-hidden p-2 w-full lg:w-auto border-opacity-25 sm:border-opacity-100">
      <a
        className="flex items-center ml-4 lg:ml-0 gap-2 text-sm text-orange-500 font-extrabold transition-colors hover:text-primary-300"
        href=" https://github.com/keploy/keploy"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Github Logo</title>
          <path
            d="M8 .2C3.6.2 0 3.8 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V14c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"
            fill="currentColor"
            fill-rule="evenodd"
          ></path>
        </svg>
        <span className="text-gradient-500 opacity-30 hover:text-orange-500">
          |
        </span>
        <span className="text-base flex gap-1">
          ⭐️ <p>{stars}</p>
        </span>
      </a>
    </button>
  );
};

export default function Header() {
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleMenuHandler = () => {
    setToggleMenu((prev) => !prev);
  };

  return (
    <div className="h-32 md:h-40">
      <header className="fixed w-full z-30 bg-neutral-100 md:bg-opacity-90 transition duration-300 ease-in-out ">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="shrink-0 mr-4 flex-1">
              <Link href={"https://keploy.io/"}>
                <img
                  src="/blog/images/sidebyside-transparent.svg"
                  alt=""
                  className="w-auto h-10"
                />
              </Link>
            </div>
            <nav className="hidden lg:flex md:grow flex-1">
              <ul className="flex grow justify-end flex-wrap items-center">
                {menuItems.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link
                        href={item.link}
                        className="font-medium text-gray-600  hover:text-orange-400 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                      >
                        {item.text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className=" header-btn-container flex-1 justify-end hidden lg:flex">
              <GithubBtn />
              <WaitListBtn />
            </div>
            <div className="flex lg:hidden">
              <button onClick={toggleMenuHandler}>
                <span className="sr-only">Menu</span>
                <img src="/blog/images/Menu.svg" className="w-6 h-6"></img>
              </button>
              <div>
                {toggleMenu ? (
                  <nav className="absolute top-full h-screen pb-16 z-20 left-0 w-full overflow-scroll bg-white opacity-100 translate-y-0">
                    <ul className="px-5 py-2">
                      <li>
                        <GithubBtn />
                      </li>
                      {menuItems.map((item, index) => {
                        return (
                          <li key={index}>
                            <Link
                              href={item.link}
                              className="font-medium text-gray-600  hover:text-primary-300 px-5 py-3 flex items-center transition duration-150 ease-in-out"
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
      </header>
    </div>
  );
}
