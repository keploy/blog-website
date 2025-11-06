"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import sideBySideSvg from "../../public/images/sidebyside-transparent.svg";
import { GitHubStars } from "./github-stars";
import { Vscode } from "./vscode-number";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
// We'll use our API route instead of importing server-only libs in the client

const glassDropdown =
  "relative overflow-hidden backdrop-blur-none bg-gradient-to-br from-neutral-100/99 via-neutral-100/98 to-neutral-100/97 border border-neutral-200/70 shadow-[0_8px_20px_rgba(0,0,0,0.10)]";

const resourcesLinks = [
  { label: "Tags", href: "/tag" },
  { label: "Authors", href: "/authors" },
];

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
    if (searchOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [searchOpen]);

  

  // Client-side fetch directly from WP GraphQL if API route not available
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (techState.length === 0 || communityState.length === 0) {
          const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string | undefined;
          if (!endpoint) {
            // Fallback to API route if env missing
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
      <div className={`hidden md:flex items-center overflow-visible transition-all duration-300 ${isScrolled ? 'gap-5 ml-3' : 'gap-7 ml-5'}`}>
        {/* Technology Dropdown */}
        <div
          className="relative overflow-visible"
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
          {showTechDropdown && (
            <div className="absolute z-[100] top-full left-1/2 -translate-x-1/2 pt-7 w-[800px] max-w-[90vw]">
              <div className={`${glassDropdown} rounded-[22px] p-6 animate-in fade-in slide-in-from-top-2 duration-200 border border-white/60`}>
                <div className="pointer-events-none absolute -top-14 -left-12 h-40 w-40 rounded-full bg-white/45 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-white/25 blur-3xl" />
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
                      <Link key={node.slug} href={`/technology/${node.slug}`} className="group flex rounded-xl overflow-hidden ring-1 ring-neutral-200/60 hover:ring-orange-400/60 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-all bg-white">
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
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Dropdown */}
        <div
          className="relative overflow-visible"
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
          {showCommunityDropdown && (
            <div className="absolute z-[100] top-full left-1/2 -translate-x-1/2 pt-7 w-[800px] max-w-[90vw]">
              <div className={`${glassDropdown} rounded-[22px] p-6 animate-in fade-in slide-in-from-top-2 duration-200 border border-white/60`}>
                <div className="pointer-events-none absolute -top-14 -left-12 h-40 w-40 rounded-full bg-white/45 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-white/25 blur-3xl" />
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
                      <Link key={node.slug} href={`/community/${node.slug}`} className="group flex rounded-xl overflow-hidden ring-1 ring-neutral-200/60 hover:ring-orange-400/60 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-all bg-white">
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
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resources */}
        <div
          className="relative overflow-visible"
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
          {resourcesOpen && (
            <div className="absolute z-[100] top-full left-1/2 -translate-x-1/2 pt-7 w-[520px]">
              <div className={`${glassDropdown} rounded-[22px] p-6 animate-in fade-in slide-in-from-top-2 duration-200 border border-white/60`}>
                <div className="relative z-10 grid grid-cols-2 gap-2.5">
                  <Link href="/tag" className="group p-5 rounded-[18px] bg-white ring-1 ring-neutral-200/60 hover:ring-orange-400/60 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-all text-left">
                    <div className="text-[15px] font-semibold transition-colors group-hover:text-orange-600">Tags</div>
                    <div className="text-[12px] text-neutral-600 mt-1">Explore our blog posts via tags</div>
                  </Link>
                  <Link href="/authors" className="group p-5 rounded-[18px] bg-white ring-1 ring-neutral-200/60 hover:ring-orange-400/60 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-all text-left">
                    <div className="text-[15px] font-semibold transition-colors group-hover:text-orange-600">Authors</div>
                    <div className="text-[12px] text-neutral-600 mt-1">Browse articles from our writers</div>
                  </Link>
                  <div className="col-span-2 my-1 border-t border-white/40" />
                  <Link href="/authors" className="col-span-2 group flex items-center gap-5 px-6 py-4 rounded-full bg-orange-500 text-white hover:bg-orange-500/90 transition-all ring-1 ring-orange-300/50 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">W</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Writers Program</div>
                      <div className="text-xs opacity-95">Share your expertise on Keploy. Get featured and paid.</div>
                      <div className="text-xs font-semibold text-right mt-1">Enroll now →</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop CTA */}
      <div className={`hidden md:flex items-center transition-all duration-300 ${isScrolled ? 'gap-2.5 ml-3' : 'gap-4 ml-6'}`}>
        {/* Oval search container */}
        <button
          onClick={() => setSearchOpen(true)}
          className="inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition-all text-[14px] font-medium rounded-full border border-neutral-300/80 bg-white/60 hover:bg-white/80 px-3 py-1.5 shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-neutral-300/90"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          {!isScrolled && <span>Search /</span>}
          <span className="font-mono text-[11px] bg-neutral-100 border border-neutral-300 rounded px-1 py-[1px]">Ctrl + K</span>
        </button>
        <div className="flex items-center gap-3 ml-2">
          <Vscode />
          <GitHubStars />
          <Button asChild>
          <Link href="https://app.keploy.io/signin" target="_blank" rel="noopener noreferrer">
            Sign in
          </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      {/* Mobile expand panel (no overlay), extends the bar */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50" onClick={() => setMobileMenuOpen(o=>!o)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className={`overflow-hidden transition-[max-height] duration-300 absolute left-1/2 -translate-x-1/2 top-full w-[95%] ${mobileMenuOpen ? 'max-h-[80vh] pt-3' : 'max-h-0'} z-[1000]`}>
          <div className="rounded-3xl backdrop-blur-3xl bg-gradient-to-br from-white/95 via-white/85 to-white/75 ring-1 ring-white/80 shadow-[0_18px_56px_rgba(0,0,0,0.24)] p-4 space-y-3">
            <Link href="/technology" onClick={()=>setMobileMenuOpen(false)} className="flex items-center justify-between w-full p-5 rounded-2xl bg-white/80 ring-1 ring-neutral-200 hover:bg-white/90 transition-all">
              <span className="font-semibold text-[16px]">Technology</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/community" onClick={()=>setMobileMenuOpen(false)} className="flex items-center justify-between w-full p-5 rounded-2xl bg-white/80 ring-1 ring-neutral-200 hover:bg-white/90 transition-all">
              <span className="font-semibold text-[16px]">Community</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Collapsible open={mobileResourcesOpen} onOpenChange={setMobileResourcesOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-5 rounded-2xl bg-white/80 ring-1 ring-neutral-200 hover:bg-white/90 transition-all duration-200">
                <span className="font-semibold text-[16px]">Resources</span>
                <ChevronDown className={`transition-transform w-5 h-5 ${mobileResourcesOpen ? 'rotate-180':''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3 pl-1">
                <Link href="/tag" onClick={()=>setMobileMenuOpen(false)} className="flex items-center justify-between w-full p-4 rounded-xl bg-white ring-1 ring-neutral-200/60 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)] hover:ring-orange-400/60 transition-all">
                  <span className="font-semibold text-[15px]">Tags</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/authors" onClick={()=>setMobileMenuOpen(false)} className="flex items-center justify-between w-full p-4 rounded-xl bg-white ring-1 ring-neutral-200/60 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)] hover:ring-orange-400/60 transition-all">
                  <span className="font-semibold text-[15px]">Authors</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/authors" onClick={()=>setMobileMenuOpen(false)} className="w-full inline-flex items-center justify-center bg-orange-500 text-white hover:bg-orange-500/90 rounded-full py-4 text-[16px] font-semibold ring-1 ring-orange-300/50 shadow-[0_8px_22px_rgba(0,0,0,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                  Writers Program – Enroll now →
                </Link>
              </CollapsibleContent>
            </Collapsible>
            <button onClick={()=>{setSearchOpen(true);}} className="inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition-all text-[14px] font-medium rounded-full border border-neutral-300/80 bg-white/80 px-3 py-1.5 shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-neutral-300/90 w-full justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span className="font-mono text-[11px] bg-neutral-100 border border-neutral-300 rounded px-1 py-[1px]">Ctrl + K</span>
            </button>
            <div className="flex items-center justify-between px-1">
              <Vscode />
              <GitHubStars />
            </div>
            <Link href="https://app.keploy.io/signin" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5 text-[17px] font-semibold shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
              Sign in
            </Link>
          </div>
        </div>
      </div>

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

  // Preload all posts once for instant local filtering
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
        // Fallback: we'll still try on-demand API search if needed
        setAllPosts([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Instant local filtering like MoreStories (fallback to latest posts until preload completes)
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
    if (!q.trim()) return;
    const base = (router?.basePath as string) || "";
    router.push(`${base}/search?q=${encodeURIComponent(q.trim())}`);
  };

  const toPath = (node: any) => {
    const cat = node?.categories?.edges?.[0]?.node?.name || "";
    const isTech = String(cat).toLowerCase() === "technology";
    const base = (router?.basePath as string) || "";
    return `${base}/${isTech ? 'technology' : 'community'}/${node.slug}`;
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

      <div className="flex items-center justify-between">
        <span />
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-black/5">Close</button>
          <button type="submit" className="rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-black/90">Open full results</button>
        </div>
      </div>
    </form>
  );
}
