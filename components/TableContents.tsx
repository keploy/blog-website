import React, { useState, useEffect, useRef } from "react";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";

function TOCItem({
  id,
  title,
  type,
  onClick,
}: {
  id: string;
  title: string;
  type: string;
  onClick: (id: string) => void;
}) {
  const itemClasses = "mb-1 text-slate-600 space-y-1";

  // Calculate margin left based on heading type
  let marginLeft;
  switch (type) {
    case "h1":
      marginLeft = 0;
      break;
    case "h2":
      marginLeft = "1rem"; // Adjust as needed
      break;
    case "h3":
      marginLeft = "1.5rem"; // Adjust as needed
      break;
    case "h4":
      marginLeft = "2rem"; // Adjust as needed
      break;
    default:
      marginLeft = "2rem"; // Default to h4 margin
  }

  return (
    <li className={itemClasses} style={{ marginLeft }}>
      <button
        onClick={() => onClick(id)}
        className="block w-full py-1 text-sm text-left text-black transition-all duration-150 ease-in-out rounded-md opacity-75 hover:text-orange-500 hover:opacity-100"
      >
        {title}
      </button>
    </li>
  );
}

export default function TOC({ headings, isList, setIsList }) {
  const tocRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!tocRef.current) return;

    const container = tocRef.current;

    function resizeHandler() {
      setIsList(container.clientHeight > window.innerHeight * 0.8);
    }

    resizeHandler()
    window.addEventListener("resize", resizeHandler)

    return () => { window.removeEventListener("resize", resizeHandler) }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleItemClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; 
      const offsetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      const urlChange = sanitizeStringForURL(element.innerHTML,true)

      window.history.replaceState(null, null, `#${urlChange}`);
    }
  };

  // State to track screen width
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Function to check if screen width is small
  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 1024); // Adjust breakpoint as needed
  };

  useEffect(() => {
    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize); // Event listener for screen resize
    return () => {
      window.removeEventListener("resize", checkScreenSize); // Cleanup on component unmount
    };
  }, []);

  // Render dropdown if on a small screen, otherwise render regular TOC
  return isSmallScreen ? (
    <>
      <div className="w-full max-w-[700px] px-4 mx-auto top-20">
        <div className="flex items-center justify-center text-center w-full">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="text-gray-700 focus:outline-none flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:shadow-outline gap-2 text-center"
            aria-expanded={isDropdownOpen}
            aria-controls="toc-dropdown"
          >
            <span className="text-lg font-semibold text-left flex-grow">
              Table of Contents
            </span>
            <span className="text-sm">{isDropdownOpen ? "▲" : "▼"}</span>
          </button>
        </div>

        {isDropdownOpen && (
          <div className="mt-2 max-h-[300px] overflow-y-auto border rounded-md shadow-md p-2 bg-white w-full md:w-auto">
            <ul className="space-y-1">
              {headings.map((item, index) => {
                let indent = "";
                switch (item.type) {
                  case "h1":
                    indent = "ml-0";
                    break;
                  case "h2":
                    indent = "ml-4";
                    break;
                  case "h3":
                    indent = "ml-8";
                    break;
                  case "h4":
                    indent = "ml-12";
                    break;
                  default:
                    indent = "ml-0";
                }

                return (
                  <li
                    key={item.id}
                    className={`text-sm text-gray-700 hover:text-orange-500 ${indent}`}
                  >
                    <button
                      onClick={() => {
                        const el = document.getElementById(item.id);
                        if (el) {
                          const offset = 80;
                          window.scrollTo({
                            top: el.offsetTop - offset,
                            behavior: "smooth",
                          });
                          const sanitizedId = sanitizeStringForURL(item.title, true);
                          window.history.replaceState(
                            null,
                            null,
                            `#${sanitizedId}`
                          );
                          setIsDropdownOpen(false);
                        }
                      }}
                      className="w-full text-left"
                    >
                      {item.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  ) : (
    <>
      <div className="left-0 inline-block p-4 lg:hidden top-20">
        <div className="mb-2 text-lg font-semibold">Table of Contents</div>
        <select
          className="block w-full px-4 py-2 text-sm leading-tight bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:outline-none focus:shadow-outline"
          onChange={(e) => handleItemClick(e.target.value)}
        >
          {headings.map((item, index) => (
            <option key={index} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden lg:inline-block left-0 top-20 bg-inherit p-4 sticky  ">
        <div className="mb-2 text-lg font-semibold">Table of Contents</div>
        {isList ? (
          <select
            className="block w-full px-4 py-2 text-sm leading-tight bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:outline-none focus:shadow-outline"
            onChange={(e) => handleItemClick(e.target.value)}
          >
            {headings.map((item, index) => (
              <option key={index} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        ) : (
          <nav ref={tocRef}>
            <ul className="pl-0 leading-5">
              {headings.map((item, index) => (
                <TOCItem
                  key={index}
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  onClick={handleItemClick}
                />
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
