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

  
  let marginLeft;
  switch (type) {
    case "h1":
      marginLeft = 0;
      break;
    case "h2":
      marginLeft = "1rem";
      break;
    case "h3":
      marginLeft = "1.5rem";
      break;
    case "h4":
      marginLeft = "2rem";
      break;
    default:
      marginLeft = "2rem";
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

  const cleanedHeadings = headings.map(heading => ({
    ...heading,
    title: heading.title.replace(/#\s*$/, '').trim()
  }));

  useEffect(() => {
    if (!tocRef.current) return;

    const container = tocRef.current;

    function resizeHandler() {
      setIsList(container.clientHeight > window.innerHeight * 0.8);
    }

    resizeHandler()
    window.addEventListener("resize", resizeHandler)

    return () => { window.removeEventListener("resize", resizeHandler) }
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

      let textContent = element.textContent || element.innerText || '';
      textContent = textContent.replace(/#\s*$/, '').trim();
      
      const urlChange = sanitizeStringForURL(textContent, true);
      window.history.replaceState(null, null, `#${urlChange}`);
    }
  };


  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 1024);
  };

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return (
    <>
      <div className="left-0 inline-block p-4 lg:hidden top-20">
        <div className="mb-2 text-lg font-semibold">Table of Contents</div>
        <select
          className="block w-full px-4 py-2 text-sm leading-tight bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:outline-none focus:shadow-outline"
          onChange={(e) => handleItemClick(e.target.value)}
        >
          {cleanedHeadings.map((item, index) => (
            <option key={index} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden lg:inline-block left-0 top-20 bg-inherit p-4 sticky">
        <div className="mb-2 text-lg font-semibold">Table of Contents</div>
        {isList ?
          <select
            className="block w-full px-4 py-2 text-sm leading-tight bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:outline-none focus:shadow-outline"
            onChange={(e) => handleItemClick(e.target.value)}
          >
            {cleanedHeadings.map((item, index) => (
              <option key={index} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          :
          <nav ref={tocRef}>
            <ul className="pl-0 leading-5">
              {cleanedHeadings.map((item, index) => (
                <TOCItem
                  key={index}
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  onClick={handleItemClick}
                />
              ))}
            </ul>
          </nav>}
      </div>
    </>
  );
}