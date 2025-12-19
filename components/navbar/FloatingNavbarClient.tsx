"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import sideBySideSvg from "../../public/images/sidebyside-transparent.svg";
import { GitHubStars } from "./github-stars";
import { Vscode } from "./vscode-number";
import { Menu, X, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

const glassDropdown =
  "relative overflow-hidden backdrop-blur-[80px] bg-gradient-to-br from-gray-200/99 via-gray-200/95 to-gray-200/88 border border-gray-100/70 shadow-[0_22px_54px_rgba(15,23,42,0.22)]";

export default function FloatingNavbarClient({ techLatest = [], communityLatest = [] as any[], isScrolled = false }: { techLatest?: any[]; communityLatest?: any[]; isScrolled?: boolean }) {
  const router = useRouter();
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<null | 'tech' | 'community' | 'resources'>(null);
  const [linkHoverTech, setLinkHoverTech] = useState(false);
  const [linkHoverCommunity, setLinkHoverCommunity] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTechOpen, setMobileTechOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [techState, setTechState] = useState<any[]>(techLatest);
  const [communityState, setCommunityState] = useState<any[]>(communityLatest);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  useEffect(() => {
    if (searchOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalTop = document.body.style.top;
      const scrollY = window.scrollY;
      
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.top = originalTop;
        window.scrollTo(0, scrollY);
      };
    }
  }, [searchOpen]);
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (techState.length === 0 || communityState.length === 0) {
          const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string | undefined;
          if (!endpoint) {
            const res = await fetch(`${router.basePath || ''}/api/nav-latest`, { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch latest posts (no env, API 404)");
            const data = await res.json();
            if (!mounted) return;
            if (techState.length === 0) setTechState(data?.technology || []);
            if (communityState.length === 0) setCommunityState(data?.community || []);
            return;
          }

          const query = (categoryName: string) => `
            query Latest($first: Int!) {
              posts(first: $first, where: { orderby: { field: DATE, order: DESC }, categoryName: "${categoryName}" }) {
                edges { node { title slug date featuredImage { node { sourceUrl } } ppmaAuthorName } }
              }
            }
          `;

          const headers = { "Content-Type": "application/json" } as any;
          const [techRes, commRes] = await Promise.all([
            fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ query: query("technology"), variables: { first: 4 } }) }),
            fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ query: query("community"), variables: { first: 4 } }) }),
          ]);
          if (!mounted) return;
          const [techJson, commJson] = await Promise.all([techRes.json(), commRes.json()]);
          const techEdges = techJson?.data?.posts?.edges || [];
          const commEdges = commJson?.data?.posts?.edges || [];
          if (techState.length === 0) setTechState(techEdges);
          if (communityState.length === 0) setCommunityState(commEdges);
          if (techEdges.length === 0 && commEdges.length === 0) setLoadError("No posts from WP GraphQL");
        }
      } catch (e) {
        console.error("Navbar latest fetch failed", e);
        setLoadError("Failed to load latest posts");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex items-center justify-between overflow-visible">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 overflow-hidden">
        <div className={`transition-all duration-300 ${isScrolled ? 'w-[24px]' : 'w-[80px]'}`} style={{ height: '30px' }}>
          <div className={`transition-all duration-300 translate-x-0`} style={{ width: '80px', height: '30px' }}>
            <Image src={sideBySideSvg} alt="Keploy Logo" className="h-[30px] w-[80px]" />
          </div>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className={`hidden md:flex items-center overflow-visible transition-all duration-300 ${isScrolled ? 'md:gap-3 md:ml-2 lg:gap-5 lg:ml-3' : 'md:gap-4 md:ml-3 lg:gap-7 lg:ml-5'}`}>
        {/* Technology Dropdown */}
        <div className="relative">
          <div
            className="inline-block"
            onMouseEnter={() => { setShowTechDropdown(true); setHoveredNav('tech'); }}
            onMouseLeave={() => { setShowTechDropdown(false); setHoveredNav(null); setLinkHoverTech(false); }}
          >
            <Link
              href="/technology"
              onMouseEnter={() => { setHoveredNav('tech'); setLinkHoverTech(true); }}
              onMouseLeave={() => { setLinkHoverTech(false); setHoveredNav(null); }}
              className={`${(showTechDropdown || showCommunityDropdown || resourcesOpen) && !showTechDropdown ? 'text-black/50' : 'text-foreground'} transition-colors text-[15px] font-medium py-2 px-1 inline-flex items-center gap-1.5 align-middle ${linkHoverTech ? 'underline underline-offset-2 decoration-1 decoration-neutral-400' : ''}`}
            >
              <span>Technology</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </Link>
          </div>
          {showTechDropdown && (
            <div 
              className="absolute z-[100] top-full left-0 pt-7 transform -translate-x-[7%]"
              style={{ 
                width: '800px', 
                maxWidth: isScrolled ? 'min(800px, calc(82vw - 6rem), 896px)' : 'min(800px, calc(96vw - 6rem), 1152px)'
              }}
              onMouseEnter={() => { setShowTechDropdown(true); setHoveredNav('tech'); }}
              onMouseLeave={() => { setShowTechDropdown(false); setHoveredNav(null); setLinkHoverTech(false); }}
            >
              <div className={`${glassDropdown} rounded-[22px] p-6 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-200/60`}>
                <div className="pointer-events-none absolute -top-14 -left-12 h-40 w-40 rounded-full bg-gray-200/45 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-gray-200/25 blur-3xl" />
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  {(techState.length ? techState.slice(0,4) : new Array(4).fill(null)).map((edge, i) => {
                    if (!edge) {
                      return (
                        <div key={`tech-skel-${i}`} className="rounded-xl overflow-hidden ring-1 ring-neutral-200/60 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] animate-pulse flex">
                          <div className="basis-2/5 aspect-[16/12] bg-white/50" />
                          <div className="basis-3/5 p-3 space-y-2">
                            <div className="h-4 w-3/4 bg-white/60 rounded" />
                            <div className="h-3 w-2/3 bg-white/50 rounded" />
                            <div className="h-3 w-full bg-white/40 rounded" />
                          </div>
                        </div>
                      );
                    }
                    const { node } = edge;
                    return (
                      <div key={node.slug} className="rounded-xl p-[1.5px] hover:p-[2px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36] transition-all duration-200">
                        <Link href={`/technology/${node.slug}`} className="group flex rounded-[calc(0.75rem-3px)] overflow-hidden bg-white shadow-[0_6px_14px_rgba(0,0,0,0.10)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition-all">
                          <div className="relative basis-[38%] min-w-0">
                            <div className="relative w-full h-full min-h-[120px] aspect-[16/12]">
                            {node?.featuredImage?.node?.sourceUrl && (
                                <Image src={node.featuredImage.node.sourceUrl} alt={node.title} fill className="object-contain object-center bg-white/20" />
                              )}
                            </div>
                          </div>
                          <div className="basis-[62%] p-4 flex flex-col gap-1.5">
                            <h4 className="text-[14px] font-semibold leading-snug text-neutral-900 group-hover:text-orange-600 line-clamp-2">{node.title}</h4>
                            <p className="text-[12px] text-neutral-600">{new Date(node.date).toLocaleDateString()} • {node.ppmaAuthorName || "Keploy"}</p>
                            <p className="text-[12px] text-neutral-700/90 line-clamp-2">{(node.excerpt || "").replace(/<[^>]+>/g, "").slice(0,110)}{(node.excerpt||"").length>110?"…":""}</p>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Dropdown */}
        <div className="relative">
          <div
            className="inline-block"
            onMouseEnter={() => { setShowCommunityDropdown(true); setHoveredNav('community'); }}
            onMouseLeave={() => { setShowCommunityDropdown(false); setHoveredNav(null); setLinkHoverCommunity(false); }}
          >
            <Link
              href="/community"
              onMouseEnter={() => { setHoveredNav('community'); setLinkHoverCommunity(true); }}
              onMouseLeave={() => { setLinkHoverCommunity(false); setHoveredNav(null); }}
              className={`${(showTechDropdown || showCommunityDropdown || resourcesOpen) && !showCommunityDropdown ? 'text-black/50' : 'text-foreground'} transition-colors text-[15px] font-medium py-2 px-1 inline-flex items-center gap-1.5 align-middle ${linkHoverCommunity ? 'underline underline-offset-2 decoration-1 decoration-neutral-400' : ''}`}
            >
              <span>Community</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </Link>
          </div>
          {showCommunityDropdown && (
            <div 
              className="absolute z-[100] top-full left-0 pt-7 transform -translate-x-[12%]"
              style={{ 
                width: '800px', 
                maxWidth: isScrolled ? 'min(800px, calc(82vw - 6rem), 896px)' : 'min(800px, calc(96vw - 6rem), 1152px)'
              }}
              onMouseEnter={() => { setShowCommunityDropdown(true); setHoveredNav('community'); }}
              onMouseLeave={() => { setShowCommunityDropdown(false); setHoveredNav(null); setLinkHoverCommunity(false); }}
            >
              <div className={`${glassDropdown} rounded-[22px] p-6 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-200/60`}>
                <div className="pointer-events-none absolute -top-14 -left-12 h-40 w-40 rounded-full bg-gray-200/45 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-gray-200/25 blur-3xl" />
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  {(communityState.length ? communityState.slice(0,4) : new Array(4).fill(null)).map((edge, i) => {
                    if (!edge) {
                      return (
                        <div key={`comm-skel-${i}`} className="rounded-xl overflow-hidden ring-1 ring-neutral-200/60 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.10)] animate-pulse flex">
                          <div className="basis-2/5 aspect-[16/12] bg-white/50" />
                          <div className="basis-3/5 p-3 space-y-2">
                            <div className="h-4 w-3/4 bg-white/60 rounded" />
                            <div className="h-3 w-2/3 bg-white/50 rounded" />
                            <div className="h-3 w-full bg-white/40 rounded" />
                          </div>
                        </div>
                      );
                    }
                    const { node } = edge;
                    return (
                      <div key={node.slug} className="rounded-xl p-[1.5px] hover:p-[2px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36] transition-all duration-200">
                        <Link href={`/community/${node.slug}`} className="group flex rounded-[calc(0.75rem-3px)] overflow-hidden bg-white shadow-[0_6px_14px_rgba(0,0,0,0.10)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition-all">
                          <div className="relative basis-[38%] min-w-0">
                            <div className="relative w-full h-full min-h-[120px] aspect-[16/12]">
                            {node?.featuredImage?.node?.sourceUrl && (
                                <Image src={node.featuredImage.node.sourceUrl} alt={node.title} fill className="object-contain object-center bg-white/20" />
                              )}
                            </div>
                          </div>
                          <div className="basis-[62%] p-4 flex flex-col gap-1.5">
                            <h4 className="text-[14px] font-semibold leading-snug text-neutral-900 group-hover:text-orange-600 line-clamp-2">{node.title}</h4>
                            <p className="text-[12px] text-neutral-600">{new Date(node.date).toLocaleDateString()} • {node.ppmaAuthorName || "Keploy"}</p>
                            <p className="text-[12px] text-neutral-700/90 line-clamp-2">{(node.excerpt || "").replace(/<[^>]+>/g, "").slice(0,110)}{(node.excerpt||"").length>110?"…":""}</p>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="relative">
          <div
            className="inline-block"
            onMouseEnter={() => { setResourcesOpen(true); setHoveredNav('resources'); }}
            onMouseLeave={() => { setResourcesOpen(false); setHoveredNav(null); }}
          >
            <button
              onMouseEnter={() => { setHoveredNav('resources'); }}
              onMouseLeave={() => { if (!resourcesOpen) { setHoveredNav(null); } }}
              className={`${(showTechDropdown || showCommunityDropdown || resourcesOpen) && !resourcesOpen ? 'text-black/50' : 'text-foreground'} transition-colors text-[15px] font-medium py-2 px-1 inline-flex items-center gap-1.5 align-middle`}
            >
              <span>Resources</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
          {resourcesOpen && (
            <div 
              className={`absolute z-[100] top-full left-0 pt-7 transform ${isScrolled ? '-translate-x-[25%]' : '-translate-x-[12%]'}`}
              style={{ 
                width: '780px', 
                maxWidth: isScrolled ? 'min(780px, calc(82vw - 6rem), 960px)' : 'min(780px, calc(96vw - 6rem), 1024px)'
              }}
              onMouseEnter={() => { setResourcesOpen(true); setHoveredNav('resources'); }}
              onMouseLeave={() => { setResourcesOpen(false); setHoveredNav(null); }}
            >
              <div className={`${glassDropdown} rounded-[22px] p-6 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-200/60`}>
                <div className="relative z-10 grid grid-cols-2 gap-3">
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    {/* Grid items with thin gradient borders + subtle shadows */}
                    {[
                      { href: "/tag", title: "Tags", desc: "Explore blog posts by topics" },
                      { href: "/authors", title: "Authors", desc: "Browse articles from our writers" },
                      { href: "https://github.com/keploy", title: "Keploy Integration Testing", desc: "Open-source testing infrastructure" },
                      { href: "https://app.keploy.io", title: "Keploy API Testing Console", desc: "Run API tests in the cloud" },
                      { href: "https://keploy.io/unit-test-generator", title: "Keploy Unit Testing Extension", desc: "Generate unit tests with mocks" },
                      { href: "https://keploy.io/docs/concepts/what-is-keploy/#step-1--record-unique-network-interactions-as-test-case", title: "Keploy Test Recorder", desc: "Record and replay API calls" },
                      { href: "https://keploy.io/docs", title: "Keploy Documentation", desc: "Guides, references, tutorials" },
                      { href: "https://www.writers.keploy.io/", title: "Writers Program", desc: "Be a part of the blog writing for Keploy", cta: true },
                    ].map((item, idx) => (
                      <div key={idx} className="rounded-xl p-[1.5px] hover:p-[2px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36] transition-all">
                        <Link
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className={`group relative block rounded-[calc(0.75rem-3px)] p-4 transition-all ${
                            item.cta
                              ? 'overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 ring-2 ring-orange-400/70 hover:ring-orange-500/90 shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:shadow-[0_26px_54px_rgba(0,0,0,0.26)] hover:-translate-y-[1.5px]'
                              : 'bg-white shadow-[0_6px_14px_rgba(0,0,0,0.10)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)]'
                          }`}
                        >
                          {/* CTA wavy overlay */}
                          {item.cta && (
                            <>
                              <span className="pointer-events-none absolute inset-0 opacity-75 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]">
                                <span className="absolute -inset-16 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,138,76,0.14),rgba(255,71,87,0.12),rgba(255,138,76,0.14))] blur-3xl rounded-[inherit] animate-[spin_12s_linear_infinite]" />
                              </span>
                              {/* Hover sheen sweep */}
                              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            </>
                          )}
                          <div className="relative z-[1]">
                            <div className="text-[15px] font-semibold transition-colors group-hover:text-orange-600">{item.title}</div>
                            <div className={`${item.cta ? 'text-[12px] text-neutral-700' : 'text-[12px] text-neutral-600'} mt-1`}>{item.desc}</div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  {/* Bottom row: About/Security/Privacy/Careers as 1x4 under left two-column grid */}
                  <div className="col-span-2 grid grid-cols-4 gap-3">
                    {[
                      { href: "https://keploy.io/about", title: "About" },
                      { href: "https://keploy.io/security", title: "Security" },
                      { href: "https://keploy.io/privacy-policy", title: "Privacy Policy" },
                      { href: "https://keploy.io/about#careers", title: "Careers" },
                    ].map((link, idx) => (
                      <div key={idx} className="rounded-xl p-[1.25px] hover:p-[2px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36] transition-all">
                        <Link href={link.href} target="_blank" rel="noopener noreferrer" className="group block rounded-[calc(0.75rem-3px)] bg-white p-3 shadow-[0_4px_10px_rgba(0,0,0,0.10)] hover:shadow-[0_10px_22px_rgba(0,0,0,0.18)] transition-all">
                          <div className="text-[13px] font-semibold transition-colors group-hover:text-orange-600">{link.title}</div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop CTA */}
      <div className={`hidden md:flex items-center transition-all duration-300 ${isScrolled ? 'md:gap-2 md:ml-2 lg:gap-2.5 lg:ml-3' : 'md:gap-3 md:ml-3 lg:gap-4 lg:ml-6'}`}>
        {/* Oval search container */}
        <button
          onClick={() => setSearchOpen(true)}
          className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900 transition-all text-[12px] lg:text-[14px] font-medium rounded-full border border-neutral-300/80 bg-white/60 hover:bg-white/80 px-2.5 py-1 md:px-3 md:py-1.5 shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-neutral-300/90 whitespace-nowrap"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          {!isScrolled && <span className="hidden lg:inline">Search</span>}
          <span className="font-mono text-[10px] lg:text-[11px] bg-neutral-100 border border-neutral-300 rounded px-1 py-[1px] whitespace-nowrap">Ctrl + K</span>
        </button>
        <div className="flex items-center md:gap-1.5 lg:gap-3 md:ml-1 lg:ml-2">
          <div className="hidden xl:flex xl:border-2 xl:border-orange-400/80 rounded-full">
            <Vscode />
          </div>
          <div className="hidden md:flex lg:border-2 lg:border-orange-400/80 rounded-full">
            <GitHubStars />
          </div>
          <Button asChild>
          <Link href="https://app.keploy.io/signin" target="_blank" rel="noopener noreferrer">
            Sign in
          </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent/50 h-10 w-10 p-0"
          onClick={() => {
            setMobileMenuOpen(false);
            setSearchOpen(true);
          }}
          aria-label="Open search"
        >
          <Search className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-accent/50 h-10 w-10 p-0" 
          onClick={() => setMobileMenuOpen(o=>!o)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown - Extends from top bar */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed left-1/2 -translate-x-1/2 z-[1000] md:hidden transition-all duration-300 ease-in-out animate-in fade-in-0 slide-in-from-top-2 ${
            isScrolled ? 'w-[78%]' : 'w-[90%]'
          }`}
          style={{ 
            top: isScrolled ? 'calc(1.5rem + 2.25rem + 0.625rem + 1.25rem)' : 'calc(1.5rem + 3.5rem + 1rem + 0.75rem)'
          }}
        >
          <div 
            className={`${glassDropdown} flex flex-col rounded-3xl overflow-hidden backdrop-blur-2xl border-gray-200/50`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 10rem)' }}
          >
            {/* Sheen + Vignette layers matching desktop */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl">
              <div className="absolute -top-8 -left-6 h-24 w-24 rounded-full bg-gray-200/60 blur-2xl" />
              <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-gray-200/40 blur-3xl" />
            </div>

            {/* Scrollable Content Area */}
            <div className="relative z-10 flex flex-col flex-1 overflow-hidden min-h-0" style={{ maxHeight: 'calc(100vh - 18rem)' }}>
              <div className="overflow-y-auto overscroll-contain px-5 py-5 flex-1 min-h-0">
                <div className="space-y-2.5">
                  {/* Technology Link */}
                  <Link 
                  href="/technology" 
                  onClick={()=>setMobileMenuOpen(false)} 
                  className="flex items-center justify-between w-full px-5 py-3.5 rounded-2xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[52px]"
                >
                  <span className="font-semibold text-[15px] text-black/90">Technology</span>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </Link>

                  {/* Community Link */}
                  <Link 
                    href="/community" 
                    onClick={()=>setMobileMenuOpen(false)} 
                    className="flex items-center justify-between w-full px-5 py-3.5 rounded-2xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[52px]"
                  >
                    <span className="font-semibold text-[15px] text-black/90">Community</span>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </Link>

                  {/* Resources Collapsible */}
                  <Collapsible open={mobileResourcesOpen} onOpenChange={setMobileResourcesOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-3.5 rounded-2xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[52px]">
                      <span className="font-semibold text-[15px] text-black/90">Resources</span>
                      <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${mobileResourcesOpen ? 'rotate-180':''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2.5 space-y-2">
                      {/* Nested sub-items with visual hierarchy */}
                      <div className="space-y-2 border-l-2 border-neutral-200/40 pl-4 ml-2">
                      <Link 
                          href="/tag" 
                          onClick={()=>setMobileMenuOpen(false)} 
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
                        >
                          <span className="font-medium text-sm text-black/75">Tags</span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                        </Link>
                        <Link 
                          href="/authors" 
                          onClick={()=>setMobileMenuOpen(false)} 
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
                        >
                          <span className="font-medium text-sm text-black/75">Authors</span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                        </Link>
                      <Link 
                        href="https://github.com/keploy" 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={()=>setMobileMenuOpen(false)} 
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
                      >
                        <span className="font-medium text-sm text-black/75">Keploy Integration Testing</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </Link>
                      <Link 
                        href="https://app.keploy.io" 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={()=>setMobileMenuOpen(false)} 
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
                      >
                        <span className="font-medium text-sm text-black/75">Keploy API Testing Console</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </Link>
                      <Link 
                        href="https://keploy.io/unit-test-generator" 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={()=>setMobileMenuOpen(false)} 
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
                      >
                        <span className="font-medium text-sm text-black/75">Keploy Unit Testing Extension</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </Link>
                      <Link 
                        href="https://keploy.io/docs/concepts/what-is-keploy/#step-1--record-unique-network-interactions-as-test-case" 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={()=>setMobileMenuOpen(false)} 
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
                      >
                        <span className="font-medium text-sm text-black/75">Keploy Test Recorder</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </Link>
                      <Link 
                        href="https://keploy.io/docs" 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={()=>setMobileMenuOpen(false)} 
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 ring-1 ring-neutral-200/50 hover:bg-white/80 hover:ring-orange-400/60 transition-all duration-200 shadow-sm hover:shadow-md min-h-[48px]"
                      >
                        <span className="font-medium text-sm text-black/75">Keploy Documentation</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </Link>
                      {/* Writers Program CTA - desktop-like card styling */}
                      <div className="rounded-xl p-[1.5px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36] hover:p-[2px] transition-all">
                        <Link 
                          href="https://www.writers.keploy.io/" 
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={()=>setMobileMenuOpen(false)} 
                          className="group relative block rounded-[calc(0.75rem-3px)] overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 ring-2 ring-orange-400/70 hover:ring-orange-500/90 shadow-none hover:shadow-none transition-all"
                        >
                          <span className="pointer-events-none absolute inset-0 opacity-75 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]">
                            <span className="absolute -inset-16 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,138,76,0.14),rgba(255,71,87,0.12),rgba(255,138,76,0.14))] blur-3xl rounded-[inherit] animate-[spin_12s_linear_infinite]" />
                          </span>
                          <div className="relative z-[1] px-5 py-4">
                            <div className="text-[15px] font-semibold text-black/90">Writers Program</div>
                            <div className="text-[12px] text-neutral-700 mt-1">Be a part of the blog writing for Keploy</div>
                            <div className="mt-2 text-[12px] font-semibold text-orange-600">Enroll →</div>
                          </div>
                          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        </Link>
                      </div>
                      {/* Bottom compact 1x4 row */}
                      <div className="grid grid-cols-4 gap-2 pt-1 pb-2">
                        {[
                          { href: "https://keploy.io/about", label: "About" },
                          { href: "https://keploy.io/security", label: "Security" },
                          { href: "https://keploy.io/privacy-policy", label: "Privacy" },
                          { href: "https://keploy.io/about#careers", label: "Careers" },
                        ].map((l, i) => (
                          <Link
                            key={i}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={()=>setMobileMenuOpen(false)} 
                            className="text-center rounded-lg bg-white/60 ring-[0.5px] ring-neutral-300/60 px-2 py-2 text-[12px] font-medium text-black/75 hover:bg-white/80 hover:ring-[0.5px] hover:ring-orange-400/50 transition-all shadow-none hover:shadow-none"
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* VSCode and GitHub Stars */}
                  <div className="flex items-center justify-between px-2 py-2.5 gap-2">
                    <div className="border-2 border-orange-400/80 rounded-full">
                      <Vscode />
                    </div>
                    <div className="border-2 border-orange-400/80 rounded-full">
                      <GitHubStars />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Section - Sign In Button */}
              <div className="relative z-10 flex-shrink-0 px-5 py-4 border-t border-white/40 bg-white/30 backdrop-blur-sm">
                <Link 
                href="https://app.keploy.io/signin" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full py-3.5 text-[15px] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ring-1 ring-orange-300/50 min-h-[52px]"
              >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Backdrop overlay when menu is open - positioned below top bar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[999] bg-black/20 animate-in fade-in-0 duration-300 md:hidden"
          style={{
            top: isScrolled ? 'calc(1.5rem + 2.25rem + 0.625rem + 1.25rem)' : 'calc(1.5rem + 3.5rem + 1rem + 0.75rem)',
            backdropFilter: 'none'
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Search Modal */}
      {searchOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 backdrop-blur-2xl p-4" onClick={() => setSearchOpen(false)}>
          {/* Global top-right close */}
          <button
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
            className="fixed top-3 right-3 md:top-5 md:right-5 z-[95] inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-neutral-700 hover:text-neutral-900 hover:bg-white shadow"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-[min(90vw,720px)] rounded-2xl border border-white/50 p-5 md:p-6 bg-neutral-100/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.30)]" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search blogs">
            <div className="flex items-center justify-between mb-3 relative">
              <h3 className="text-base md:text-lg font-semibold text-neutral-800">Search blogs</h3>
            </div>
            <SearchBox onClose={() => setSearchOpen(false)} techLatest={techState} communityLatest={communityState} />
            {/* Hide scrollbar via styled-jsx (scoped) */}
            <style jsx>{`
              :global(#search-results) { -ms-overflow-style: none; scrollbar-width: none; }
              :global(#search-results::-webkit-scrollbar) { width: 0; height: 0; background: transparent; }
              :global(#search-results::-webkit-scrollbar-thumb) { background: transparent; }
              :global(#search-results::-webkit-scrollbar-track) { background: transparent; }
            `}</style>
          </div>
        </div>, document.body)
      }
    </div>
  );
}

function SearchBox({ onClose, techLatest = [], communityLatest = [] as any[] }: { onClose: () => void; techLatest?: any[]; communityLatest?: any[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const base = (router?.basePath as string) || "";
        const res = await fetch(`${base}/api/search-all`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        if (!mounted) return;
        setAllPosts(data?.results || []);
      } catch (e) {
        setAllPosts([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const pool = Array.isArray(allPosts) && allPosts.length
      ? allPosts
      : [...(techLatest || []), ...(communityLatest || [])];
    setLoading(false);
    setError(null);
    const filtered = pool.filter(({ node }) =>
      (node?.title || "").toLowerCase().includes(term) ||
      (node?.excerpt || "").toLowerCase().includes(term)
    );
    setResults(filtered.slice(0, 20));
  }, [q, allPosts]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const toPath = (node: any) => {
    const cat = node?.categories?.edges?.[0]?.node?.name || "";
    const isTech = String(cat).toLowerCase() === "technology";
    return `/${isTech ? 'technology' : 'community'}/${node.slug}`;
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search blogs..."
          className="w-full rounded-xl bg-white/90 outline-none pl-9 pr-9 py-3 text-[15px] text-neutral-800 shadow-sm"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-6 h-6 rounded-full text-neutral-500 hover:text-neutral-800 hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results - thin glass/white cards, instant filter */}
      <div id="search-results" className="max-h-[50vh] overflow-auto px-1 md:px-1.5">
        {q.trim().length < 2 && (
          <div className="text-xs text-neutral-500 px-1" />
        )}
        {!!error && (
          <div className="text-sm text-red-600 px-1">{error}</div>
        )}
        {!error && results?.length > 0 && (
          <ul className="space-y-2">
            {results.map(({ node }) => (
              <li key={node.slug}>
                <Link href={toPath(node)} className="group flex w-full items-center gap-3 p-2 rounded-xl ring-1 ring-neutral-200/60 hover:ring-orange-400/60 transition-all bg-white/80 backdrop-blur-sm">
                  <div className="relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden bg-white/40">
                    {node?.featuredImage?.node?.sourceUrl && (
                      <Image src={node.featuredImage.node.sourceUrl} alt={node.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-neutral-900 group-hover:text-orange-600 truncate">{node.title}</div>
                    <div className="text-[11px] text-neutral-600 truncate">{new Date(node.date).toLocaleDateString()} • {node.ppmaAuthorName || "Keploy"}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-orange-500 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!error && q.trim().length >= 2 && results?.length === 0 && (
          <div className="text-sm text-neutral-600 px-1">No results found.</div>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-black/5">Close</button>
      </div>
    </form>
  );
}
