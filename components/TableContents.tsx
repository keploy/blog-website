import React from 'react';

function TOCItem({ id, title }) {
  const itemClasses = 'mb-1 font-bold text-slate-600';

  const handleClick = () => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate the scroll position to scroll a little earlier
      const offset = 80; // Adjust this value as needed
      const offsetPosition = element.offsetTop - offset;

      // Scroll to the adjusted position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <li className={itemClasses}>
      <button
        onClick={handleClick}
        className="block py-1 pl-2 w-full rounded-md text-left transition-colors duration-300 ease-in-out bg-gray-200 hover:bg-gray-300"
      >
        {title}
      </button>
    </li>
  );
}

export default function TOC({ headings }) {
  return (
    <div className="mr-2">
      <div className="text-lg font-semibold mb-2">Table of Contents</div>
      <nav>
        <ul>
          {headings.map((item, index) => (
            <TOCItem key={index} id={item.id} title={item.title} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
