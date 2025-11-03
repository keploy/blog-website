"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../../lib/api";
import sideBySideSvg from "../../public/images/sidebyside-transparent.svg";
import { GitHubStars } from "./github-stars";
import { Vscode } from "./vscode-number";

// Glassmorphism styles
const glass =
  "backdrop-blur-2xl bg-white/75 dark:bg-neutral-950/60 border border-white/60 dark:border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.20)]";
const glassPanel =
  "backdrop-blur-2xl bg-white/80 dark:bg-neutral-950/70 border border-white/70 dark:border-white/20 shadow-[0_20px_64px_rgba(0,0,0,0.25)]";

type MenuItem = {
  label: string;
  href: string;
};

const navItems: MenuItem[] = [
  { label: "Technology Blogs", href: "/technology" },
  { label: "Community Blogs", href: "/community" },
];

export default function FloatingNavbar() {
  const ref = useRef<HTMLDivElement>(null);
  const [shrink, setShrink] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [techLatest, setTechLatest] = useState<any[]>([]);
  const [communityLatest, setCommunityLatest] = useState<any[]>([]);

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ctrl/Cmd + K to toggle search and Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Prevent body scroll when search modal is open
  useEffect(() => {
    if (searchOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [searchOpen]);

  const resourcesLinks = useMemo(
    () => [
      { label: "Tags", href: "/tag" },
      { label: "Authors", href: "/authors" },
      { label: "All Posts", href: "/" },
    ],
    []
  );

  // Fetch latest posts for hover menus
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [tech, comm] = await Promise.all([
          getAllPostsForTechnology(false),
          getAllPostsForCommunity(false),
        ]);
        if (!mounted) return;
        setTechLatest((tech?.edges || []).slice(0, 4));
        setCommunityLatest((comm?.edges || []).slice(0, 4));
      } catch (e) {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div ref={ref} className={`${searchOpen ? "pointer-events-auto" : "pointer-events-none"} fixed inset-x-0 top-6 z-40 flex w-full justify-center px-3`}>
      <div
        aria-label="Site navigation"
        className={`${glass} pointer-events-auto flex items-center justify-between gap-3 rounded-full transition-all duration-300 ease-out`}
        style={{
          width: "min(1180px, 92vw)",
          paddingLeft: shrink ? 14 : 20,
          paddingRight: shrink ? 14 : 20,
          paddingTop: shrink ? 10 : 14,
          paddingBottom: shrink ? 10 : 14,
          borderRadius: shrink ? 24 : 999,
          transform: "translateY(0px)",
          backdropFilter: shrink ? "blur(14px)" : "blur(18px)",
        }}
      >
        {/* Left: Logo (only logo when shrink) */}
        <Link href="https://keploy.io/" className="flex items-center gap-2">
          <Image src={sideBySideSvg} alt="Keploy Logo" className="h-[30px] w-[80px]" />
          {/* {!shrink && (
            <span className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-100">Keploy</span>
          )} */}
        </Link>

        {/* Center: primary links (always visible) */}
        <div className="hidden md:flex items-center gap-2 transition-opacity duration-200">
          {/* Technology hover */}
          <div
            className="relative"
            onMouseEnter={() => setTechOpen(true)}
            onMouseLeave={() => setTechOpen(false)}
          >
            <Link href="/technology" className="relative px-4 py-2 text-[0.95rem] text-neutral-700 dark:text-neutral-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10">Technology Blogs</Link>
            {techOpen && (
              <div className="absolute left-1/2 z-50 -translate-x-1/2 mt-1 w-[520px]">
                <div className={`${glassPanel} rounded-2xl p-6 transition-transform duration-200 ease-out translate-y-3`}>
                  <ul className="space-y-2">
                    {techLatest.map(({ node }) => (
                      <li key={node.slug}>
                        <Link href={`/technology/${node.slug}`} className="flex gap-2 items-start rounded-xl hover:bg-black/5 dark:hover:bg-white/10 p-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400" />
                          <span className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{node.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Community hover */}
          <div
            className="relative"
            onMouseEnter={() => setCommunityOpen(true)}
            onMouseLeave={() => setCommunityOpen(false)}
          >
            <Link href="/community" className="relative px-4 py-2 text-[0.95rem] text-neutral-700 dark:text-neutral-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10">Community Blogs</Link>
            {communityOpen && (
              <div className="absolute left-1/2 z-50 -translate-x-1/2 mt-1 w-[520px]">
                <div className={`${glassPanel} rounded-2xl p-6 transition-transform duration-200 ease-out translate-y-3`}>
                  <ul className="space-y-2">
                    {communityLatest.map(({ node }) => (
                      <li key={node.slug}>
                        <Link href={`/community/${node.slug}`} className="flex gap-2 items-start rounded-xl hover:bg-black/5 dark:hover:bg-white/10 p-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400" />
                          <span className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{node.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Resources dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button className="px-4 py-2 text-[0.95rem] text-neutral-700 dark:text-neutral-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              Resources
            </button>
            {resourcesOpen && (
              <div className="absolute left-1/2 z-50 -translate-x-1/2 mt-1 w-[520px]">
                <div className={`${glassPanel} rounded-2xl p-6 transition-transform duration-200 ease-out translate-y-3`}>
                  <div className="grid grid-cols-2 gap-3">
                    {resourcesLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="px-3 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-sm text-neutral-700 dark:text-neutral-200"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2">
          {/* Search pill */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Search (Ctrl+K)"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-500" />
            <span>Search</span>
            <kbd className="ml-1 rounded border px-1 text-[10px] text-neutral-500 border-neutral-300/80 dark:border-white/20">Ctrl K</kbd>
          </button>

          <Vscode />
          <GitHubStars />
          <Link
            href="https://app.keploy.io/signin"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors border-2 border-orange-400/80 bg-orange-400/10 text-orange-600 hover:bg-orange-500 hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Search Modal */}
       {searchOpen && (
         <div
           className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/45 backdrop-blur-2xl pointer-events-auto"
           onClick={() => setSearchOpen(false)}
         >
           <div
             className="w-[min(780px,92vw)] rounded-2xl p-6 bg-white/85 dark:bg-neutral-950/75 backdrop-blur-2xl border border-white/70 dark:border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transform transition-transform duration-200 ease-out"
             onClick={(e) => e.stopPropagation()}
             role="dialog"
             aria-modal="true"
           >
             <div className="flex justify-end">
               <button
                 aria-label="Close search"
                 className="h-8 w-8 rounded-full text-neutral-600 hover:bg-black/5 dark:text-neutral-300"
                 onClick={() => setSearchOpen(false)}
               >
                 ×
               </button>
             </div>
             <SearchBox onClose={() => setSearchOpen(false)} />
           </div>
         </div>
       )}
    </div>
  );
}

function SearchBox({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    // Navigate to dedicated search page
    window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search blogs..."
        className="flex-1 rounded-xl bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 outline-none text-[15px] text-neutral-800 dark:text-neutral-100"
      />
      <button type="submit" className="rounded-lg bg-black text-white px-3 py-2 text-sm">Search</button>
      <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">Close</button>
    </form>
  );
}


