import React, { useState, useEffect } from "react";

function TOCItem({ id, title, type, onClick }) {
  const itemClasses = "mb-1 font-bold text-slate-600";

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
        className="block py-1 w-full rounded-md text-left text-sm transition-colors"
      >
        {title}
      </button>
    </li>
  );
}

export default function TOC({ headings }) {
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
    setIsSmallScreen(window.innerWidth <= 1100); // Adjust breakpoint as needed
  };

  useEffect(() => {
    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize); // Event listener for screen resize
    return () => {
      window.removeEventListener("resize", checkScreenSize); // Cleanup on component unmount
    };
  }, []);

  // Render dropdown if on a small screen, otherwise render regular TOC
  if (isSmallScreen) {
    return (
      <div className="inline-block left-0 top-20">
        <div className="text-lg font-semibold mb-2">Table of Contents</div>
        <div className="relative">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-md shadow-sm text-sm leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => handleItemClick(e.target.value)}
          >
            {headings.map((item, index) => (
              <option key={index} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.293 12.707a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L10 10.586 4.707 5.293a1 1 0 00-1.414 1.414l5 5zM8 15a1 1 0 112 0 1 1 0 01-2 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    );
    
  } else {
    return (
      <div className="inline-block left-0 top-20 overflow-y-auto h-auto bg-inherit p-4">
        <div className="text-lg font-semibold mb-2">Table of Contents</div>
        <nav>
          <ul className="pl-0">
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
      </div>
    );
  }
}
