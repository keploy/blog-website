import React, { useState, useEffect } from "react";

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
        className="block py-1 w-full rounded-md text-left text-sm"
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
      <div className="inline-block left-0 top-20 p-4">
        <div className="text-lg font-semibold mb-2">Table of Contents</div>
        <select
          className="block w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-md shadow-sm text-sm leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => handleItemClick(e.target.value)}
        >
          {headings.map((item, index) => (
            <option key={index} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
    );
  } else {
    return (
      <div className="inline-block left-0 top-20 overflow-y-auto h-auto bg-inherit p-4 sticky">
        <div className="text-lg font-semibold mb-2">Table of Contents</div>
        <nav>
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
      </div>
    );
  }
}
