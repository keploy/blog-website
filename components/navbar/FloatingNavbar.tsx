"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import sideBySideSvg from "../../public/images/sidebyside-transparent.svg";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../../lib/api";
import { GitHubStars } from "./github-stars";
import { Vscode } from "./vscode-number";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// Tailwind glass helpers to match the reference look
const glassNav =
  "relative overflow-visible backdrop-blur-3xl bg-gradient-to-br from-white/70 via-white/55 to-white/35 shadow-[0_20px_60px_rgba(0,0,0,0.22)]";
const glassDropdown =
  "relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 shadow-[0_24px_72px_rgba(0,0,0,0.24)]";

const resourcesLinks = [
  { label: "Tags", href: "/tag" },
  { label: "Authors", href: "/authors" },
  { label: "All Posts", href: "/" },
];

export default function FloatingNavbar() {
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTechOpen, setMobileTechOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [techLatest, setTechLatest] = useState<any[]>([]);
  const [communityLatest, setCommunityLatest] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // fetch latest posts
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

  // Ctrl/Cmd + K to toggle search and Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll when search is open
  useEffect(() => {
    if (searchOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [searchOpen]);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className={`${glassNav} rounded-full px-8 py-4 overflow-visible`}>
        {/* sheen + vignette layers */}
        <div className="pointer-events-none absolute inset-0 rounded-full">
          <div className="absolute -top-8 -left-6 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
        </div>
        <div className="flex items-center justify-between overflow-visible">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src={sideBySideSvg} alt="Keploy Logo" className="h-[30px] w-[80px]" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10 overflow-visible">
            {/* Technology Dropdown */}
            <div
              className="relative overflow-visible"
              onMouseEnter={() => setShowTechDropdown(true)}
              onMouseLeave={() => setShowTechDropdown(false)}
            >
              <Link href="/technology" className="text-foreground hover:text-muted-foreground transition-colors text-[15px] font-medium py-2 inline-block">
                Technology
              </Link>
              {showTechDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[650px]">
                  <div className={`${glassDropdown} rounded-[28px] p-8 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    {/* inner glow */}
                    <div className="pointer-events-none absolute -top-14 -left-12 h-40 w-40 rounded-full bg-white/45 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-white/25 blur-3xl" />
                    <div className="relative z-10 grid grid-cols-2 gap-3">
                      {techLatest.map(({ node }) => (
                        <Link key={node.slug} href={`/technology/${node.slug}`} className="flex items-start gap-3 p-4 rounded-[18px] hover:bg-white/45 transition-colors">
                          <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                          <span className="text-sm text-foreground/90 line-clamp-2">{node.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Community Dropdown */}
            <div
              className="relative overflow-visible"
              onMouseEnter={() => setShowCommunityDropdown(true)}
              onMouseLeave={() => setShowCommunityDropdown(false)}
            >
              <Link href="/community" className="text-foreground hover:text-muted-foreground transition-colors text-[15px] font-medium py-2 inline-block">
                Community
              </Link>
              {showCommunityDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[680px]">
                  <div className={`${glassDropdown} rounded-[28px] p-8 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    {/* inner glow */}
                    <div className="pointer-events-none absolute -top-14 -left-12 h-40 w-40 rounded-full bg-white/45 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-white/25 blur-3xl" />
                    <div className="relative z-10 grid grid-cols-2 gap-3">
                      {communityLatest.map(({ node }) => (
                        <Link key={node.slug} href={`/community/${node.slug}`} className="p-4 rounded-[18px] hover:bg-white/45 transition-all text-left flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                          <div className="font-semibold text-foreground/90 text-[15px] line-clamp-2">
                            {node.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resources */}
            <div
              className="relative overflow-visible"
              onMouseEnter={() => setMobileResourcesOpen(true)}
              onMouseLeave={() => setMobileResourcesOpen(false)}
            >
              <button className="text-foreground hover:text-muted-foreground transition-colors text-[15px] font-medium py-2">
                Resources
              </button>
              {mobileResourcesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[520px]">
                  <div className={`${glassDropdown} rounded-[28px] p-6 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    <div className="relative z-10 grid grid-cols-2 gap-3">
                      {resourcesLinks.map((l) => (
                        <Link key={l.href} href={l.href} className="px-4 py-3 rounded-[16px] hover:bg-white/45 transition-colors text-sm">
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors text-[15px] font-medium"
            >
              Search
            </button>
            <Vscode />
            <GitHubStars />
            <Link
              href="https://app.keploy.io/signin"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-5 py-2 text-[15px] font-semibold border-2 border-orange-400/80 bg-orange-400/10 text-orange-600 hover:bg-orange-500 hover:text-white"
            >
              Sign in
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className={`w-full h-full p-0 ${glassDropdown} border-none`}>
              <div className="flex flex-col h-full pt-20 px-6 pb-8">
                {/* Mobile Logo */}
                <div className="flex items-center justify-between mb-10 -mt-10">
                  <div className="font-black text-2xl tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>CRAFT</div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {/* Technology Section (mobile - don't list latest posts) */}
                  <Collapsible open={mobileTechOpen} onOpenChange={setMobileTechOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-5 rounded-[20px] hover:bg-accent/40 transition-all duration-200">
                      <span className="font-semibold text-[17px]">Technology</span>
                      <ChevronDown
                        className={`transition-transform w-5 h-5 ${mobileTechOpen ? "rotate-180" : ""}`}
                        strokeWidth={2}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 ml-2 space-y-2">
                      <Link href="/technology" className="flex items-center justify-between w-full p-4 rounded-[16px] hover:bg-accent/40 transition-all">
                        <span className="font-medium text-[15px]">Browse Technology Blogs</span>
                        <ChevronRight className="w-5 h-5" strokeWidth={2} />
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Resources */}
                  <Collapsible open={mobileResourcesOpen} onOpenChange={setMobileResourcesOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-5 rounded-[20px] hover:bg-accent/40 transition-all duration-200">
                      <span className="font-semibold text-[17px]">Resources</span>
                      <ChevronDown className={`transition-transform w-5 h-5 ${mobileResourcesOpen ? "rotate-180" : ""}`} strokeWidth={2} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 ml-2 space-y-2">
                      {resourcesLinks.map((l) => (
                        <Link key={l.href} href={l.href} className="flex items-center justify-between w-full p-4 rounded-[16px] hover:bg-accent/40 transition-all">
                          <span className="font-medium text-[15px]">{l.label}</span>
                          <ChevronRight className="w-5 h-5" strokeWidth={2} />
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Community Section (mobile - don't list latest posts) */}
                  <Collapsible open={mobileCommunityOpen} onOpenChange={setMobileCommunityOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-5 rounded-[20px] hover:bg-accent/40 transition-all duration-200">
                      <span className="font-semibold text-[17px]">Community</span>
                      <ChevronDown
                        className={`transition-transform w-5 h-5 ${mobileCommunityOpen ? "rotate-180" : ""}`}
                        strokeWidth={2}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 ml-2 space-y-2">
                      <Link href="/community" className="flex items-center justify-between w-full p-4 rounded-[16px] hover:bg-accent/40 transition-all">
                        <span className="font-medium text-[15px]">Browse Community Blogs</span>
                        <ChevronRight className="w-5 h-5" strokeWidth={2} />
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Mobile CTA */}
                <div className="pt-8 border-t border-border/30 mt-6">
                  <Link href="https://app.keploy.io/signin" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-[17px] font-semibold shadow-lg">
                    Sign in
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/45 backdrop-blur-2xl"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-[min(780px,92vw)] rounded-2xl p-6 bg-white/85 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-end">
              <button
                aria-label="Close search"
                className="h-8 w-8 rounded-full text-neutral-600 hover:bg-black/5"
                onClick={() => setSearchOpen(false)}
              >
                ×
              </button>
            </div>
            <SearchBox onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}

function SearchBox({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
  };
  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search blogs..."
        className="flex-1 rounded-xl bg-white/80 outline-none px-4 py-3 text-[15px] text-neutral-800"
      />
      <button type="submit" className="rounded-lg bg-black text-white px-3 py-2 text-sm">Search</button>
      <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-neutral-600">Close</button>
    </form>
  );
}

