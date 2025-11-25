import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Container from "../../components/container";
import Layout from "../../components/layout";
import { getAllTechnologyPosts, getTechnologyPostsByPage } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import PostGrid from "../../components/post-grid";
import PostCard from "../../components/post-card";
import PostListRow from "../../components/post-list-row";
import CoverImage from "../../components/cover-image";
import DateComponent from "../../components/date";
import { FaSearch, FaTimes } from "react-icons/fa";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import Image from "next/image";
import { Post } from "../../types/post";
import HeroLatestCard from "../../components/hero-latest-card";
import HeroFeaturedCard from "../../components/hero-featured-card";
import { CheckCircle2, Eye } from "lucide-react";

const DATE_FILTERS = [
  { value: "all", label: "All dates" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "365", label: "Last year" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "Title A → Z" },
  { value: "za", label: "Title Z → A" },
];

const TECHNOLOGY_PAGE_SIZE = 18;

const dedupePosts = (posts: Post[] = []) => {
  const seen = new Set<string>();
  return posts.filter((post) => {
    if (!post?.slug) return false;
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  });
};

type ViewMode = "grid" | "list";

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type TechnologyPageProps = {
  posts: Post[];
  pageInfo: PageInfo;
  currentPage: number;
  preview: boolean;
  latestPost: Post | null;
  featuredPosts: Post[];
  allPosts: Post[];
  totalPages: number;
};

const formatAuthorName = (name?: string) => {
  if (!name) return "Anonymous";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export default function Index({
  posts,
  pageInfo,
  currentPage,
  preview,
  latestPost,
  featuredPosts,
  allPosts,
  totalPages,
}: TechnologyPageProps) {
  const heroPost = latestPost ?? posts[0];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const initialGlobalPosts = allPosts?.length ? dedupePosts(allPosts) : dedupePosts(posts);
  const [globalPosts, setGlobalPosts] = useState<Post[]>(initialGlobalPosts);
  const [hasGlobalPosts, setHasGlobalPosts] = useState(Boolean(initialGlobalPosts.length));
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [clientPage, setClientPage] = useState(currentPage);
  
  // Hero card rotation state
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  
  // Get latest 4 posts and featured 4 posts
  const latestPosts = useMemo(() => {
    const allLatest = latestPost ? [latestPost, ...posts.filter(p => p.slug !== latestPost.slug)] : posts;
    return dedupePosts(allLatest).slice(0, 4);
  }, [latestPost, posts]);
  
  const featuredPostsList = useMemo(() => {
    return dedupePosts(featuredPosts).slice(0, 4);
  }, [featuredPosts]);

  const authors = useMemo<string[]>(() => {
    const uniqueAuthors = new Set<string>(
      globalPosts.map((post) => post.ppmaAuthorName || "Anonymous")
    );
    return ["all", ...Array.from(uniqueAuthors)];
  }, [globalPosts]);

  const filtersActive = useMemo(() => {
    return (
      searchTerm.trim().length > 0 ||
      selectedAuthor !== "all" ||
      dateFilter !== "all" ||
      sortOption !== "newest"
    );
  }, [searchTerm, selectedAuthor, dateFilter, sortOption]);

  const filterablePosts = useMemo(() => {
    const basePosts = filtersActive
      ? hasGlobalPosts
        ? globalPosts
        : []
      : posts;

    return dedupePosts(basePosts);
  }, [filtersActive, hasGlobalPosts, globalPosts, posts]);

  const filteredPosts = useMemo(() => {
    const normalize = (value?: string) =>
      value?.replace(/<[^>]*>/g, "").toLowerCase() ?? "";

    const matchesDateFilter = (postDate: string) => {
      if (dateFilter === "all") return true;
      const days = Number(dateFilter);
      const now = new Date();
      const date = new Date(postDate);
      const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffInDays <= days;
    };

    const sorted = [...filterablePosts]
      .filter((post) => {
        const titleMatch = normalize(post.title).includes(searchTerm.toLowerCase());
        const excerptMatch = normalize(post.excerpt).includes(searchTerm.toLowerCase());
        return titleMatch || excerptMatch;
      })
      .filter((post) =>
        selectedAuthor === "all"
          ? true
          : (post.ppmaAuthorName || "Anonymous") === selectedAuthor
      )
      .filter((post) => matchesDateFilter(post.date));

    sorted.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOption === "az") {
        return a.title.localeCompare(b.title);
      }
      return b.title.localeCompare(a.title);
    });

    return sorted;
  }, [filterablePosts, searchTerm, selectedAuthor, dateFilter, sortOption]);

  const visiblePosts = useMemo(() => {
    if (filtersActive) {
      const start = (clientPage - 1) * TECHNOLOGY_PAGE_SIZE;
      return filteredPosts.slice(start, start + TECHNOLOGY_PAGE_SIZE);
    }
    return filteredPosts;
  }, [filtersActive, filteredPosts, clientPage]);

  const showEmptyState =
    visiblePosts.length === 0 && !(filtersActive && isGlobalLoading && !hasGlobalPosts);
  const showHeroSection = !filtersActive && currentPage === 1;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAuthor("all");
    setDateFilter("all");
    setSortOption("newest");
    setViewMode("grid");
  };

  // Hero section intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (heroSectionRef.current) {
      observer.observe(heroSectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Auto-rotate cards
  useEffect(() => {
    if (isVisible && (latestPosts.length > 0 || featuredPostsList.length > 0)) {
      const maxIndex = Math.max(latestPosts.length, featuredPostsList.length);
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setSelectedIndex((prev) => (prev + 1) % maxIndex);
          setIsAnimating(false);
        }, 500);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVisible, latestPosts.length, featuredPostsList.length]);

  useEffect(() => {
    if (hasGlobalPosts || isGlobalLoading) return;

    let isCancelled = false;
    const controller = new AbortController();

    const fetchAllPosts = async () => {
      try {
        setIsGlobalLoading(true);
        const response = await fetch("/api/technology-posts?mode=all", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load technology posts");
        }
        const data = await response.json();
        if (!isCancelled && Array.isArray(data?.posts)) {
          setGlobalPosts(dedupePosts(data.posts));
          setHasGlobalPosts(true);
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("Failed to fetch full technology posts", error);
      } finally {
        if (!isCancelled) {
          setIsGlobalLoading(false);
        }
      }
    };

    fetchAllPosts();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [hasGlobalPosts, isGlobalLoading]);

  useEffect(() => {
    if (filtersActive) {
      setClientPage(1);
    } else {
      setClientPage(currentPage);
    }
  }, [filtersActive, currentPage]);

  useEffect(() => {
    if (!filtersActive) return;
    const totalPages = Math.max(
      1,
      Math.ceil(filteredPosts.length / TECHNOLOGY_PAGE_SIZE) || 1
    );
    if (clientPage > totalPages) {
      setClientPage(totalPages);
    }
  }, [filtersActive, filteredPosts.length, clientPage]);


  const browseHeading = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    const filterParts: string[] = [];

    if (selectedAuthor !== "all") {
      filterParts.push(`author: ${selectedAuthor}`);
    }

    if (dateFilter !== "all") {
      const dateLabel = DATE_FILTERS.find((filter) => filter.value === dateFilter)?.label;
      if (dateLabel) {
        filterParts.push(`date: ${dateLabel.toLowerCase()}`);
      }
    }

    if (sortOption !== "newest") {
      const sortLabel = SORT_OPTIONS.find((sort) => sort.value === sortOption)?.label;
      if (sortLabel) {
        filterParts.push(`sorted ${sortLabel.toLowerCase()}`);
      }
    }

    if (trimmedSearch.length > 0) {
      return filterParts.length
        ? `Search results for “${trimmedSearch}” (${filterParts.join(", ")})`
        : `Search results for “${trimmedSearch}”`;
    }

    if (filterParts.length > 0) {
      return `Filtered blogs (${filterParts.join(", ")})`;
    }

    return "All technology blogs";
  }, [searchTerm, selectedAuthor, dateFilter, sortOption]);

  return (
    <Layout
      preview={preview}
      featuredImage={heroPost?.featuredImage?.node.sourceUrl}
      Title={heroPost?.title}
      Description={`Blog from the Technology Page`}
    >
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Header />
      {/* Hero Section */}
      {showHeroSection && (
        <div
          ref={heroSectionRef}
          className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 py-12 px-4 sm:px-6 relative overflow-hidden"
        >
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
            {Array.from({ length: 40 }, (_, i) => ({
              id: i,
              top: (i * 2.5) % 100,
              left: (i * 2.5) % 100,
              size: 2 + (i % 3),
              delay: (i * 0.1) % 5,
              duration: 5 + (i % 10),
            })).map((element) => (
              <div
                key={element.id}
                className="absolute rounded-full bg-gradient-to-br from-primary to-secondary animate-float"
                style={{
                  top: `${element.top}%`,
                  left: `${element.left}%`,
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  animationDelay: `${element.delay}s`,
                  animationDuration: `${element.duration}s`,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto relative z-10 max-w-6xl">
            {/* Hero Header */}
            <div
              className={`text-center mb-12 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight px-2">
                Keploy Technology Blog
                <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Deep dives, release notes, and engineering stories.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 px-4">
                Deep dives, release notes, and engineering stories straight from the Keploy team.
              </p>
            </div>

            {/* Main Cards Viewer */}
            <div className="max-w-5xl mx-auto mb-12">
              <div
                className={`grid lg:grid-cols-2 gap-6 transition-all duration-1000 delay-200 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                {/* Latest Blogs Card */}
                <div className="bg-card rounded-2xl shadow-lg overflow-hidden border-2 border-green-500/30">
                  <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold">
                        Latest Blogs
                      </span>
                    </div>
                    <span className="text-white/80 text-sm">Consumer</span>
                  </div>
                  <div className="p-6">
                    {latestPosts.length > 0 && selectedIndex < latestPosts.length ? (
                      <HeroLatestCard
                        post={latestPosts[selectedIndex]}
                        isAnimating={isAnimating}
                      />
                    ) : null}
                  </div>
                </div>

                {/* Featured Blogs Card */}
                <div className="bg-card rounded-2xl shadow-lg overflow-hidden border-2 border-orange-500/30">
                  <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold">
                        Featured Blogs
                      </span>
                    </div>
                    <span className="text-white/80 text-sm">Provider</span>
                  </div>
                  <div className="p-6">
                    {featuredPostsList.length > 0 && selectedIndex < featuredPostsList.length ? (
                      <HeroFeaturedCard
                        post={featuredPostsList[selectedIndex]}
                        isAnimating={isAnimating}
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.max(latestPosts.length, featuredPostsList.length) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setSelectedIndex(i);
                        setIsAnimating(false);
                      }, 300);
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      selectedIndex === i ? "bg-orange-500" : "bg-orange-500/30 hover:bg-orange-500/50"
                    }`}
                    style={{
                      width: selectedIndex === i ? "2rem" : "0.75rem",
                      height: "0.75rem",
                    }}
                    aria-label={`View blog ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <section className="mt-0 w-full">
        <Container>
          <div className="relative">
            <div className="pt-6 pb-10 md:pt-8 md:pb-12">
              <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-4 items-center">
                  <div className="relative flex-[0.95]">
                    <input
                      type="text"
                      placeholder="Search technology posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-11 pl-12 pr-10 rounded-full border border-orange-100/80 bg-white/95 text-sm font-semibold shadow-[0_10px_30px_rgba(254,144,92,0.12)] focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-shadow placeholder:text-gray-400"
                    />
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/80" />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 h-11 text-sm font-semibold text-orange-600 border border-orange-200/80 rounded-full bg-white/95 hover:bg-orange-50 transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                  >
                    Reset filter
                  </button>
                </div>

                <div className="flex flex-nowrap gap-3 items-end">
                  <div className="flex-1 min-w-0">
                    <FilterSelect
                      label="Author"
                      value={selectedAuthor}
                      onChange={setSelectedAuthor}
                      options={authors.map((author) => ({
                        value: author,
                        label: author === "all" ? "All authors" : author,
                      }))}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <FilterSelect
                      label="Published"
                      value={dateFilter}
                      onChange={setDateFilter}
                      options={DATE_FILTERS}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <FilterSelect
                      label="Sort"
                      value={sortOption}
                      onChange={setSortOption}
                      options={SORT_OPTIONS}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1 uppercase tracking-[0.2em]">
                        View
                      </span>
                      <div className="flex rounded-full border border-orange-100/80 bg-white/95 p-1 h-11 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                        <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          className={`flex-1 px-3 text-sm font-semibold rounded-full transition-colors ${
                            viewMode === "grid"
                              ? "bg-orange-500 text-white shadow"
                              : "text-gray-600"
                          }`}
                        >
                          Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          className={`flex-1 px-3 text-sm font-semibold rounded-full transition-colors ${
                            viewMode === "list"
                              ? "bg-orange-500 text-white shadow"
                              : "text-gray-600"
                          }`}
                        >
                          List
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <section className="mt-16 mb-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-orange-500 mb-2">
                Browse
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-left">{browseHeading}</h2>
              <span className="sr-only" aria-live="polite">
                {filtersActive
                  ? `${filteredPosts.length} global results match your filters`
                  : `${visiblePosts.length} results available on this page`}
              </span>
            </div>
          </div>

          {filtersActive && isGlobalLoading && !hasGlobalPosts && (
            <div className="flex items-center gap-2 text-sm text-orange-500 mb-6">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <span>Loading all technology blogs…</span>
            </div>
          )}

          {showEmptyState ? (
            <div className="text-center bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-gray-500">
              No posts match your filters. Try adjusting the search or filters above.
            </div>
          ) : viewMode === "grid" ? (
            <PostGrid>
              {visiblePosts.map((post) => {
                const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
                return (
                  <PostCard
                    key={post.slug}
                    title={post.title}
                    coverImage={post.featuredImage}
                    date={post.date}
                    author={post.ppmaAuthorName}
                    slug={post.slug}
                    excerpt={getExcerpt(post.excerpt, 20)}
                    isCommunity={false}
                    authorImage={post.ppmaAuthorImage}
                    readingTime={readingTime}
                  />
                );
              })}
            </PostGrid>
          ) : (
            <div className="space-y-6">
              {visiblePosts.map((post) => {
                const readingTime = post.content ? 5 + calculateReadingTime(post.content) : undefined;
                return (
                  <PostListRow
                    key={post.slug}
                    post={post}
                    excerptOverride={getExcerpt(post.excerpt, 42)}
                    readingTime={readingTime}
                  />
                );
              })}
            </div>
          )}
        </section>

        <PaginationControls
          currentPage={currentPage}
          hasNextPage={pageInfo?.hasNextPage ?? false}
          filtersActive={filtersActive}
          clientPage={clientPage}
          onClientPageChange={setClientPage}
          totalFilteredPosts={filteredPosts.length}
          pageSize={TECHNOLOGY_PAGE_SIZE}
          totalPages={totalPages}
        />
      </Container>
    </Layout>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>
      <span className="text-xs text-gray-500 uppercase tracking-[0.25em]">
        {label}
      </span>
      <button
        type="button"
        className={`relative w-full h-11 rounded-full border text-left px-4 pr-10 text-sm font-semibold transition-all flex items-center ${
          isOpen
            ? "border-orange-300 shadow-[0_10px_30px_rgba(254,144,92,0.12)]"
            : "border-orange-100/80 shadow-[0_10px_30px_rgba(254,144,92,0.12)]"
        } bg-white/95 text-gray-800 hover:border-orange-300 hover:shadow-[0_10px_30px_rgba(254,144,92,0.12)] focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{activeOption?.label ?? "Select"}</span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-100 rounded-2xl shadow-2xl z-10 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationControls({
  currentPage,
  hasNextPage,
  filtersActive,
  clientPage,
  onClientPageChange,
  totalFilteredPosts,
  pageSize,
  totalPages,
}: {
  currentPage: number;
  hasNextPage: boolean;
  filtersActive: boolean;
  clientPage: number;
  onClientPageChange: (page: number) => void;
  totalFilteredPosts: number;
  pageSize: number;
  totalPages: number;
}) {
  const filteredTotalPages = Math.max(1, Math.ceil(totalFilteredPosts / pageSize) || 1);

  if (filtersActive) {
    const prevDisabled = clientPage <= 1;
    const nextDisabled = clientPage >= totalPages;
    return (
      <div className="flex justify-center border-t border-orange-50 pt-10 mt-10 pb-16">
        <div className="inline-flex items-center gap-6 rounded-full border border-orange-100/70 bg-gradient-to-r from-white via-orange-50/50 to-white px-5 py-2.5 shadow-[0_10px_30px_rgba(249,115,22,0.15)]">
          <PaginationButton
            disabled={prevDisabled}
            ariaLabel="Previous filtered page"
            onClick={() => onClientPageChange(Math.max(1, clientPage - 1))}
          >
            ←
          </PaginationButton>
          <div className="flex flex-col items-center text-gray-500">
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.4em]">
              Page
            </span>
            <span className="text-lg font-semibold text-gray-900">{clientPage}</span>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-400 mt-0.5">
              of {filteredTotalPages}
            </span>
          </div>
          <PaginationButton
            disabled={nextDisabled}
            ariaLabel="Next filtered page"
            onClick={() => onClientPageChange(Math.min(totalPages, clientPage + 1))}
          >
            →
          </PaginationButton>
        </div>
      </div>
    );
  }

  const prevDisabled = currentPage <= 1;
  const nextDisabled = !hasNextPage;
  const prevHref =
    currentPage - 1 <= 1 ? "/technology" : `/technology?page=${currentPage - 1}`;
  const nextHref = `/technology?page=${currentPage + 1}`;
  const displayTotalPages = Math.max(1, totalPages || (hasNextPage ? currentPage + 1 : currentPage));

  return (
    <div className="flex justify-center border-t border-orange-50 pt-10 mt-10 pb-16">
      <div className="inline-flex items-center gap-6 rounded-full border border-orange-100/70 bg-gradient-to-r from-white via-orange-50/50 to-white px-5 py-2.5 shadow-[0_10px_30px_rgba(249,115,22,0.15)]">
        <PaginationButton href={prevHref} disabled={prevDisabled} ariaLabel="Previous page">
          ←
        </PaginationButton>
        <div className="flex flex-col items-center text-gray-500">
          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.4em]">
            Page
          </span>
          <span className="text-lg font-semibold text-gray-900">{currentPage}</span>
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-400 mt-0.5">
            of {displayTotalPages}
          </span>
        </div>
        <PaginationButton href={nextHref} disabled={nextDisabled} ariaLabel="Next page">
          →
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({
  href,
  disabled,
  children,
  ariaLabel,
  onClick,
}: {
  href?: string;
  disabled: boolean;
  children: ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const label = ariaLabel ?? "Pagination button";

  const baseClasses =
    "inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-semibold transition-all duration-200";

  if (disabled) {
    return (
      <span
        aria-label={label}
        className={`${baseClasses} border border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed`}
      >
        <span aria-hidden="true">{children}</span>
      </span>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={`${baseClasses} border border-transparent text-white bg-gradient-to-br from-orange-500 to-orange-400 shadow-[0_8px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.45)] focus:outline-none focus:ring-2 focus:ring-orange-200`}
      >
        <span aria-hidden="true">{children}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${baseClasses} border border-transparent text-white bg-gradient-to-br from-orange-500 to-orange-400 shadow-[0_8px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.45)] focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60 disabled:cursor-not-allowed`}
      disabled={disabled}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, preview = false }) => {
  const pageParam = Array.isArray(query.page) ? query.page[0] : query.page;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const pageSize = TECHNOLOGY_PAGE_SIZE;

  try {
    const latestData = await getTechnologyPostsByPage(1, 5, preview);
    const heroPost = latestData.posts[0] ?? null;
    const [data, allPostsData] = await Promise.all([
      getTechnologyPostsByPage(requestedPage, pageSize, preview),
      getAllTechnologyPosts(preview),
    ]);
    const uniqueAllPosts = dedupePosts(allPostsData);
    const totalPages = Math.max(1, Math.ceil(uniqueAllPosts.length / pageSize) || 1);
    const lastAvailablePage = totalPages;
    const featuredPosts = heroPost
      ? latestData.posts.filter((post) => post.slug !== heroPost.slug).slice(0, 4)
      : latestData.posts.slice(0, 4);

    if (!data.posts.length && requestedPage > lastAvailablePage) {
      const destination =
        lastAvailablePage <= 1 ? "/technology" : `/technology?page=${lastAvailablePage}`;
      return {
        redirect: { destination, permanent: false },
      };
    }

    return {
      props: {
        posts: data.posts,
        pageInfo: data.pageInfo,
        currentPage: requestedPage,
        preview,
        latestPost: heroPost ?? null,
        featuredPosts,
        allPosts: uniqueAllPosts,
        totalPages,
      },
    };
  } catch (error) {
    console.error("technology/index getServerSideProps error:", error);
    return {
      props: {
        posts: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        currentPage: 1,
        preview,
        latestPost: null,
        featuredPosts: [],
        allPosts: [],
        totalPages: 1,
      },
    };
  }
};
