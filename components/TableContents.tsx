import React, { useState, useEffect, useRef } from "react";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";

function TOCItem({
  id,
  title,
  type,
  onClick,
  activeId,
}: {
  id: string;
  title: string;
  type: string;
  activeId: string;
  onClick: (id: string) => void;
}) {
  let marginLeft = "2rem";

  switch (type) {
    case "h1":
      marginLeft = "0";
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
  }

  const isActive = activeId === id;

  return (
    <li
      data-toc-id={id}
      className="mb-1 space-y-1"
      style={{ marginLeft }}
    >
      <button
        onClick={() => onClick(id)}
        className={`block w-full py-1 text-sm text-left transition-all duration-150 rounded-md ${
          isActive
            ? "text-orange-500 font-medium opacity-100"
            : "text-black opacity-75 hover:text-orange-500 hover:opacity-100"
        }`}
      >
        {title}
      </button>
    </li>
  );
}

export default function TOC({ headings, isList }) {
  const tocContainerRef = useRef<HTMLDivElement | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  /* ---------------- Scroll Spy ---------------- */
  useEffect(() => {
    if (!headings?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => {
      const id = sanitizeStringForURL(h.id, true);
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  /* ---------------- Auto-scroll TOC to active item ---------------- */
  useEffect(() => {
    if (!activeId || !tocContainerRef.current) return;

    const activeEl = tocContainerRef.current.querySelector(
      `[data-toc-id="${activeId}"]`
    ) as HTMLElement | null;

    if (activeEl) {
      activeEl.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeId]);

  /* ---------------- Scroll on click ---------------- */
  const handleItemClick = (id: string) => {
    const sanitizedId = sanitizeStringForURL(id, true);
    const element = document.getElementById(sanitizedId);
    if (!element) return;

    const offset = 80;
    window.scrollTo({
      top: element.offsetTop - offset,
      behavior: "smooth",
    });

    window.history.replaceState(null, "", `#${sanitizedId}`);
    setActiveId(sanitizedId);
  };

  /* ---------------- Screen size ---------------- */
  useEffect(() => {
    const resize = () => setIsSmallScreen(window.innerWidth < 1024);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------------- Mobile ---------------- */
  if (isSmallScreen) {
    return (
      <div className="w-full max-w-[700px] px-4 mx-auto top-20">
        <button
          onClick={() => setIsDropdownOpen((p) => !p)}
          className="w-full px-4 py-2 bg-white text-gray-700 border rounded-md shadow-sm flex justify-between"
        >
          <span className="font-semibold">Table of Contents</span>
          <span>{isDropdownOpen ? "▲" : "▼"}</span>
        </button>

        {isDropdownOpen && (
          <div className="mt-2 max-h-[300px] overflow-y-auto border rounded-md shadow-md p-2 bg-white">
            <ul className="space-y-1">
              {headings.map((item) => {
                const id = sanitizeStringForURL(item.id, true);
                return (
                  <li key={id}>
                    <button
                      onClick={() => {
                        handleItemClick(item.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left text-sm ${
                        activeId === id
                          ? "text-orange-500 font-medium"
                          : "text-gray-700 hover:text-orange-500"
                      }`}
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
    );
  }

  /* ---------------- Desktop ---------------- */
  return (
    <>
      {/* Page-scoped scrollbar styling */}
      <style>{`
        .toc-scroll {
          scrollbar-width: thin;
          scrollbar-color: #fb923c transparent;
        }
        .toc-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .toc-scroll::-webkit-scrollbar-thumb {
          background-color: #fb923c;
          border-radius: 9999px;
        }
        .toc-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      <div
        ref={tocContainerRef}
        className="toc-scroll hidden lg:inline-block sticky top-24 left-0 p-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="mb-2 text-lg font-semibold">Table of Contents</div>

        {isList ? (
          <select
            className="block w-full px-4 py-2 border rounded-md bg-white"
            onChange={(e) => handleItemClick(e.target.value)}
          >
            {headings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        ) : (
          <nav>
            <ul className="pl-0 leading-5 space-y-1">
              {headings.map((item) => {
                const id = sanitizeStringForURL(item.id, true);
                return (
                  <TOCItem
                    key={id}
                    id={id}
                    title={item.title}
                    type={item.type}
                    activeId={activeId}
                    onClick={handleItemClick}
                  />
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
