import React, { useState, useEffect, useRef } from "react";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";

export default function TOC({ headings, isList, setIsList }) {
  const tocRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  // Detect screen size
  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // isList fallback (collapse to select if extremely long)
  useEffect(() => {
    if (!tocRef.current) return;
    const el = tocRef.current;
    const handler = () => setIsList(el.clientHeight > window.innerHeight * 0.8);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="w-full max-w-[700px] px-4 mx-auto">
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
                      className={`w-full text-left py-1.5 text-sm leading-snug transition-colors duration-150 ${isH3Plus ? "pl-4 text-sm text-gray-500" : "pl-0 text-gray-700 font-medium"
                        } ${isAct ? "text-orange-500 font-semibold" : "hover:text-orange-500"}`}
                    >
                      {item.title}
                    </button>
                    {index < headings.length - 1 && (
                      <hr className="border-gray-100" />
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
    <div className="hidden lg:block sticky top-24 ml-4">
      {isList ? (
        // Fallback select for extremely long TOCs
        <div className="p-4">
          <p className="!text-[22px] font-bold uppercase tracking-widest text-gray-900 mb-2">
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
        </div>
      ) : (
        <nav ref={tocRef}>
          {/* ─── TOC Card ─────────────────────────────── */}
          <div className="w-66 rounded-2xl border border-gray-200 bg-gray-50 shadow-sm overflow-hidden pb-3">

            {/* Card header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-100">
              {/* ← "Table of Contents" title size — change 22px here */}
              <p className="!text-[20px] font-bold uppercase tracking-widest text-gray-900">
                Table of Contents
              </p>
            </div>

            {/* Scrollable items — height ≈ 1.4× the width (w-56=224px → ~320px) */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto"
              style={{ maxHeight: "420px" }}
            >
              {(() => {
                let h2Count = 0;
                let h3Count = 0;
                let h4Count = 0;

                return headings.map((item, index) => {
                  const sid = sanitizeStringForURL(item.id, true);
                  const isAct = sid === activeId;
                  const isH3Plus = item.type === "h3" || item.type === "h4";
                  const isH4 = item.type === "h4";

                  // Compute numbering
                  let number = "";
                  if (item.type === "h2" || item.type === "h1") {
                    h2Count++;
                    h3Count = 0;
                    h4Count = 0;
                    number = `${h2Count}.`;
                  } else if (item.type === "h3") {
                    h3Count++;
                    h4Count = 0;
                    number = `${h2Count}.${h3Count}`;
                  } else if (item.type === "h4") {
                    h4Count++;
                    number = `${h2Count}.${h3Count}.${h4Count}`;
                  }

                  return (
                    <div key={index} data-toc-id={sid}>
                      <button
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full text-left px-4 py-2 leading-snug transition-colors duration-150 ${isH4
                          ? "pl-12 !text-[16px] font-semibold text-gray-700"       /* ← H4 (sub-sub-heading) size */
                          : isH3Plus
                            ? "pl-9 !text-[16px] font-semibold text-gray-800"      /* ← H3 (sub-heading) size */
                            : "pl-6 !text-[18px] font-bold text-gray-900"          /* ← H2 (main heading) size */
                          } ${isAct
                            ? "!text-orange-500 font-semibold"
                            : "hover:text-orange-500"
                          }`}
                      >
                        <span className="flex items-start gap-2">
                          <span className="shrink-0">{number}</span>
                          {item.title}
                        </span>
                      </button>
                      {/* Separator between items */}
                      {index < headings.length - 1 && (
                        <hr className="border-gray-100 mx-4" />
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
