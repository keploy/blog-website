import React, { useState, useEffect } from "react";

function TOCItem({ id, title, type, onClick }) {
  const itemClasses = "mb-1 font-bold text-slate-600";

  return (
    <li className={itemClasses}>
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
  const [isDropdown, setIsDropdown] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDropdown(window.innerWidth < 900); // Adjust threshold as needed
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Initial check for screen size on component mount
    handleResize();

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  if (isDropdown) {
    // Render as dropdown menu
    return null;
  }

  // Render as static list
  return (
    <div className="overflow-y-auto sticky left-0 top-20">
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
