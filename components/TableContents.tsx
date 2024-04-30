import React, { useState, useEffect, useRef } from "react";

function TOCItem({ id, title, type, onClick }) {
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
      // Calculate the scroll position to scroll a little earlier
      const offset = 80; // Adjust this value as needed
      const offsetPosition = element.offsetTop - offset;

      // Scroll to the adjusted position
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
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
  return (
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
        {isList ?
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
          :
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
          </nav>}
      </div>
    </>
  );
}
