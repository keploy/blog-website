import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";

/* ── Custom tooltip for truncated TOC items ── */
function TocTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    timeout.current = setTimeout(() => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.right + 12,
        });
      }
      setShow(true);
    }, 50);
  };
  const handleLeave = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setShow(false);
  };

  return (
    <div ref={wrapperRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show &&
        createPortal(
          <div
            className="fixed z-[9999] max-w-[240px] px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 leading-snug pointer-events-none -translate-y-1/2"
            style={{
              top: coords.top,
              left: coords.left,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
}

export default function TOC({ headings, isList, setIsList }) {
  const tocRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  // Detect screen size — show mobile dropdown below 1440px (matches grid breakpoint)
  useEffect(() => {
    if (!tocRef.current) return;

    const container = tocRef.current;

    function resizeHandler() {
      setIsList(container.scrollHeight > container.clientHeight);
    }

    resizeHandler()
    window.addEventListener("resize", resizeHandler)

    return () => { window.removeEventListener("resize", resizeHandler) }

  // isList fallback (collapse to select if extremely long)
  useEffect(() => {
    if (!tocRef.current) return;
    const el = tocRef.current;
    const handler = () => setIsList(el.clientHeight > window.innerHeight * 0.8);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleItemClick = (id) => {
    const sanitizedId = sanitizeStringForURL(id, true);
    const element = document.getElementById(sanitizedId);
    if (element) {
      const offset = 80;
      const offsetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.replaceState(null, null, `#${sanitizedId}`);
    }
  };

  // State to track screen width
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Active section tracking
  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveId(visible[0].target.getAttribute("id") ?? "");
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(sanitizeStringForURL(id, true));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  // Auto-scroll TOC to keep active item visible
  useEffect(() => {
    if (!activeId || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current.querySelector(
      `[data-toc-id="${activeId}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const handleItemClick = (id: string) => {
    const sanitizedId = sanitizeStringForURL(id, true);
    const element = document.getElementById(sanitizedId);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
      window.history.replaceState(null, null, `#${sanitizedId}`);
    }
  };

  // ── Small screen: collapsible dropdown ──
  if (isSmallScreen) {
    return (
      <div className="w-full max-w-[780px] px-4 mx-auto">
        <button
          onClick={() => setIsDropdownOpen((p) => !p)}
          className="flex items-center justify-between w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:border-gray-400 focus:outline-none"
          aria-expanded={isDropdownOpen}
        >
          <span className="text-base font-semibold">Table of Contents</span>
          <span className="text-sm">{isDropdownOpen ? "▲" : "▼"}</span>
        </button>

        {isDropdownOpen && (
          <div className="mt-2 border border-gray-200 rounded-xl shadow-md bg-white overflow-hidden">
            <div className="max-h-64 overflow-y-auto px-3 py-2">
              {headings.map((item, index) => {
                const sid = sanitizeStringForURL(item.id, true);
                const isAct = sid === activeId;
                const isH3Plus = item.type === "h3" || item.type === "h4";
                return (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => { handleItemClick(item.id); setIsDropdownOpen(false); }}
                      className={`w-full text-left py-1.5 text-sm leading-snug transition-colors duration-150 ${isH3Plus ? "pl-4 text-sm text-gray-500 font-normal opacity-60" : "pl-0 text-gray-700 font-normal"
                        } ${isAct ? "text-orange-500 !opacity-100 font-normal" : "hover:text-orange-500"}`}
                    >
                      {isAct && <span className="text-orange-500 mr-1">●</span>}
                      {item.title}
                    </button>
                    {index < headings.length - 1 && (
                      <hr className="border-gray-300" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop: card-style scrollable TOC ──
  return (
    <div className="w-full max-w-[320px]">
      {isList ? (
        // Fallback select for extremely long TOCs
        <div className="p-4">
          <p className="!text-[20px] font-bold tracking-widest text-gray-900 mb-2">
            Table of Contents
          </p>
          <select
            className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none"
            onChange={(e) => handleItemClick(e.target.value)}
          >
            {headings.map((item, index) => (
              <option key={index} value={item.id}>{item.title}</option>
            ))}
          </select>
        ) : (
          <nav className="max-h-[80vh] overflow-y-auto pr-2">
            <ul ref={tocRef} className="pl-0 leading-5">
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
