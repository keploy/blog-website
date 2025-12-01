import { useEffect, useMemo, useRef, useState } from "react";
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
import { Sparkles, Star } from "lucide-react";
import TechnologyBackground from "../../components/technology-background";

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

type ViewMode = "grid" | "list" | "featured" | "compact";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "grid", label: "Detailed view" },
  { value: "list", label: "List view" },
  { value: "featured", label: "Highlight view" },
  { value: "compact", label: "Compact view" },
];

const dedupePosts = (posts: Post[] = []) => {
  const seen = new Set<string>();
  return posts.filter((post) => {
    if (!post?.slug) return false;
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  });
};

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

const resolveAuthorImage = (image?: string | null) => {
  if (!image || image === "imag1" || image === "image") {
    return "/blog/images/author.png";
  }
  return image;
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
  const [viewMode, setViewMode] = useState<ViewMode>("featured");
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
  
  // Get latest 4 posts and featured 4 posts (consistent across pages)
  const latestPosts = useMemo(() => {
    if (latestPost) {
      // Always build carousel from the hero + its companion featured posts
      return dedupePosts([latestPost, ...featuredPosts]).slice(0, 4);
    }
    return dedupePosts(posts).slice(0, 4);
  }, [latestPost, featuredPosts, posts]);
  
  const featuredPostsList = useMemo(() => {
    return dedupePosts(featuredPosts).slice(0, 4);
  }, [featuredPosts]);

  const maxRotationIndex = useMemo(
    () => Math.max(latestPosts.length, featuredPostsList.length),
    [latestPosts.length, featuredPostsList.length]
  );

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

  const postsWithMeta = useMemo(
    () =>
      visiblePosts.map((post) => ({
        post,
        readingTime: post.content ? 5 + calculateReadingTime(post.content) : undefined,
      })),
    [visiblePosts]
  );

  const showEmptyState =
    visiblePosts.length === 0 && !(filtersActive && isGlobalLoading && !hasGlobalPosts);
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAuthor("all");
    setDateFilter("all");
    setSortOption("newest");
    setViewMode("featured");
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

  // Hero cards auto-rotation (mirroring contract-testing hero logic)
  useEffect(() => {
    if (!isVisible || maxRotationIndex <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setSelectedIndex((prev) => (prev + 1) % maxRotationIndex);
        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, maxRotationIndex]);

  const handleManualSelection = (index: number) => {
    if (index < 0 || index >= maxRotationIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedIndex(index);
      setIsAnimating(false);
    }, 300);
  };

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
      <TechnologyBackground />
      <Header />
      {/* Hero Section */}
      <div
        ref={heroSectionRef}
        className="px-4 sm:px-6 pt-10 pb-10 md:pt-14 md:pb-12 relative"
      >
        <div className="container mx-auto relative z-10 max-w-6xl">
              {/* Hero Header */}
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="type-hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl p-2 leading-wide tracking-wider bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Keploy Technology Blog
            </h1>
            <p className="type-hero-body mt-4 mb-8 pb-2 text-base sm:text-xl max-w-3xl mx-auto px-4">
              Keploy’s latest engineering stories, product updates, architecture breakdowns, and
              practical guides to building reliable software at scale.
            </p>
          </div>

          {/* Main Cards Viewer */}
          <div className="max-w-6xl mx-auto mt-8 mb-16 px-2 md:px-4">
              <div
                className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                {latestPosts.length > 0 && selectedIndex < latestPosts.length ? (
                  <HeroLatestCard
                    variant="visual"
                    heading="Latest Blogs"
                    headingIcon={<Sparkles className="w-4 h-4 text-white" />}
                    post={latestPosts[selectedIndex]}
                    className={`transition-all duration-500 ${
                      isAnimating ? "scale-[0.97] opacity-80" : "scale-100 opacity-100"
                    }`}
                  />
                ) : null}

                {featuredPostsList.length > 0 && selectedIndex < featuredPostsList.length ? (
                  <HeroFeaturedCard
                    variant="visual"
                    heading="Featured Blogs"
                    headingIcon={<Star className="w-4 h-4 text-white" />}
                    post={featuredPostsList[selectedIndex]}
                    className={`transition-all duration-500 ${
                      isAnimating ? "scale-[0.97] opacity-80" : "scale-100 opacity-100"
                    }`}
                  />
                ) : null}
              </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: Math.max(latestPosts.length, featuredPostsList.length) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleManualSelection(i)}
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

        <Container>
          <section className="mt-10 mb-14">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10 lg:gap-12">
              <div className="flex-[1.1] min-w-[260px] lg:pr-6">
                <h2 className="type-section-title relative inline-block whitespace-nowrap text-3xl md:text-4xl lg:text-[2.25rem] tracking-[-0.01em] leading-snug text-gray-700 text-left">
                  <span className="relative z-10">Technology Blogs</span>
                  <span className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-orange-200/80 to-orange-100/80 -z-0" />
                </h2>
                <span className="sr-only" aria-live="polite">
                  {filtersActive
                    ? `${browseHeading}. ${filteredPosts.length} global results match your filters`
                    : `${browseHeading}. ${visiblePosts.length} results available on this page`}
                </span>
              </div>

              <div className="w-full lg:flex-[1] mt-4 lg:mt-0">
                <div className="rounded-2xl border border-slate-200/70 bg-white px-3.5 py-3.5 shadow-[0_14px_45px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-wrap gap-2.5 lg:gap-3 items-center lg:flex-nowrap lg:justify-end">
                <div className="relative flex-1 min-w-[200px] lg:max-w-[240px]">
                  <div className="relative h-11 rounded-2xl border border-slate-200 bg-white transition-all focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-full pl-9 pr-8 rounded-2xl bg-transparent text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400/80 pointer-events-none w-[16px] h-[16px]" />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                        aria-label="Clear search"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 w-full lg:w-auto lg:flex-nowrap">
                  <div className="flex-[0.9] min-w-[110px]">
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

                  <div className="flex-[0.9] min-w-[110px]">
                    <FilterSelect
                      label="Published"
                      value={dateFilter}
                      onChange={setDateFilter}
                      options={DATE_FILTERS}
                    />
                  </div>

                  <div className="flex-[0.9] min-w-[110px]">
                    <FilterSelect
                      label="Sort"
                      value={sortOption}
                      onChange={setSortOption}
                      options={SORT_OPTIONS}
                    />
                  </div>

                  <div className="flex-[0.9] min-w-[110px]">
                    <FilterSelect
                      label="View mode"
                      value={viewMode}
                      onChange={(value) => setViewMode(value as ViewMode)}
                      options={VIEW_OPTIONS}
                    />
                  </div>
                </div>

                <div className="w-full lg:w-auto lg:ml-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full lg:w-auto h-11 px-5 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-200 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                  >
                    Reset
                  </button>
                  </div>
                </div>
              </div>
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
              {postsWithMeta.map(({ post, readingTime }) => (
                <PostCard
                  key={post.slug}
                  variant="subtle"
                  title={post.title}
                  coverImage={post.featuredImage}
                  date={post.date}
                  author={post.ppmaAuthorName}
                  slug={post.slug}
                  excerpt={getExcerpt(post.excerpt, 36)}
                  isCommunity={false}
                  authorImage={post.ppmaAuthorImage}
                  readingTime={readingTime}
                />
              ))}
            </PostGrid>
          ) : viewMode === "list" ? (
            <div className="space-y-6">
              {postsWithMeta.map(({ post, readingTime }) => (
                <PostListRow
                  key={post.slug}
                  post={post}
                  excerptOverride={getExcerpt(post.excerpt, 60)}
                  readingTime={readingTime}
                />
              ))}
            </div>
          ) : viewMode === "featured" ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {postsWithMeta.map(({ post, readingTime }) => (
                <FeaturedBlogCard key={post.slug} post={post} readingTime={readingTime} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {postsWithMeta.map(({ post, readingTime }) => (
                <CompactBlogCard key={post.slug} post={post} readingTime={readingTime} />
              ))}
            </div>
          )}
        </section>

        <PaginationControls
          currentPage={currentPage}
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

function FeaturedBlogCard({ post, readingTime }: { post: Post; readingTime?: number }) {
  const authorName = formatAuthorName(post.ppmaAuthorName);
  const authorImage = resolveAuthorImage(post.ppmaAuthorImage);
  const coverSrc = post.featuredImage?.node?.sourceUrl;
  const readingLabel = typeof readingTime === "number" && readingTime > 0 ? `${readingTime} min read` : null;
  const href = `/technology/${post.slug}`;
  const plainTitle = post.title?.replace(/<[^>]*>/g, "") ?? "Technology blog cover";
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  return (
    <Link href={href} className="group block h-full">
      <article className="h-full rounded-2xl bg-white/95 border border-orange-100 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 overflow-hidden hover:border-orange-300 hover:-translate-y-1.5 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)] flex flex-col">
        <div className="relative w-full aspect-video overflow-hidden">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={plainTitle}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100" />
          )}
        </div>
        <div className="p-6 flex flex-col flex-1 gap-4">
          <h3 className="type-card-title text-xl md:text-2xl text-gray-900">
            <span
              className="line-clamp-2 group-hover:text-orange-600 transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />
          </h3>
          <div className="mt-auto flex items-center gap-2 text-[0.8rem] md:text-[0.9rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden">
            <Image
              src={authorImage}
              alt={`${authorName} avatar`}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <span className="font-heading font-semibold text-slate-900 tracking-tight truncate max-w-[150px] md:max-w-none text-[0.98rem] md:text-[1.02rem]">
              {authorName}
            </span>
            <span className="text-slate-300 flex-shrink-0">•</span>
            <span className="whitespace-nowrap flex-shrink-0 text-[0.72rem] md:text-[0.8rem]">
              <DateComponent dateString={post.date} />
            </span>
            {readingLabel && (
              <>
                <span className="text-slate-300 flex-shrink-0">•</span>
                <span className="whitespace-nowrap flex-shrink-0 type-meta text-slate-500 text-[0.72rem] md:text-[0.8rem]">
                  {readingLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function CompactBlogCard({ post, readingTime }: { post: Post; readingTime?: number }) {
  const authorName = formatAuthorName(post.ppmaAuthorName);
  const authorImage = resolveAuthorImage(post.ppmaAuthorImage);
  const readingLabel = typeof readingTime === "number" && readingTime > 0 ? `${readingTime} min read` : null;
  const href = `/technology/${post.slug}`;
  const cleanedExcerpt = (post.excerpt || "").replace("Table of Contents", "");

  return (
    <Link href={href} className="group block h-full">
      <article className="h-full rounded-2xl bg-white/95 border border-orange-100 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 overflow-hidden hover:border-orange-300 hover:-translate-y-1.5 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)] flex flex-col">
        <div className="p-6 flex flex-col flex-1 gap-4">
          <h3 className="type-card-title text-xl md:text-2xl text-gray-900">
            <span
              className="line-clamp-2 group-hover:text-orange-600 transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />
          </h3>
          <div
            className="type-card-excerpt text-[0.88rem] md:text-[0.95rem] line-clamp-2"
            dangerouslySetInnerHTML={{ __html: getExcerpt(cleanedExcerpt, 34) }}
          />
          <div className="mt-auto flex items-center gap-2 text-[0.8rem] md:text-[0.9rem] text-slate-600 min-w-0 whitespace-nowrap overflow-hidden">
            <Image
              src={authorImage}
              alt={`${authorName} avatar`}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <span className="font-heading font-semibold text-slate-900 tracking-tight truncate max-w-[150px] md:max-w-none text-[0.98rem] md:text-[1.02rem]">
              {authorName}
            </span>
            <span className="text-slate-300 flex-shrink-0">•</span>
            <span className="whitespace-nowrap flex-shrink-0 text-[0.72rem] md:text-[0.8rem]">
              <DateComponent dateString={post.date} />
            </span>
            {readingLabel && (
              <>
                <span className="text-slate-300 flex-shrink-0">•</span>
                <span className="whitespace-nowrap flex-shrink-0 type-meta text-slate-500 text-[0.72rem] md:text-[0.8rem]">
                  {readingLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
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
    <div className="w-full relative" ref={containerRef}>
      <button
        type="button"
        className={`relative w-full h-11 rounded-xl border text-left px-3.5 pr-9 text-sm font-medium flex items-center min-w-0 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-200 transition-colors ${
          isOpen ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate flex-1 min-w-0 tracking-tight">
          {activeOption?.label ?? label}
        </span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-sm z-20 overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium tracking-tight transition-colors truncate ${
                    isActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  title={option.label}
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
  filtersActive,
  clientPage,
  onClientPageChange,
  totalFilteredPosts,
  pageSize,
  totalPages,
}: {
  currentPage: number;
  filtersActive: boolean;
  clientPage: number;
  onClientPageChange: (page: number) => void;
  totalFilteredPosts: number;
  pageSize: number;
  totalPages: number;
}) {
  const filteredTotalPages = Math.max(1, Math.ceil(totalFilteredPosts / pageSize) || 1);
  const totalPageCount = filtersActive ? filteredTotalPages : Math.max(1, totalPages || 1);
  const activePage = filtersActive ? clientPage : currentPage;
  const MAX_VISIBLE = 6;
  const [windowStart, setWindowStart] = useState(1);
  const maxWindowStart = Math.max(1, totalPageCount - MAX_VISIBLE + 1);

  useEffect(() => {
    const halfWindow = Math.floor(MAX_VISIBLE / 2);
    let nextStart = Math.max(1, activePage - halfWindow);
    let nextEnd = Math.min(totalPageCount, nextStart + MAX_VISIBLE - 1);
    nextStart = Math.max(1, nextEnd - MAX_VISIBLE + 1);
    setWindowStart((prev) => (prev === nextStart ? prev : nextStart));
  }, [activePage, totalPageCount]);

  if (totalPageCount <= 1) {
    return null;
  }

  const windowEnd = Math.min(totalPageCount, windowStart + MAX_VISIBLE - 1);
  const pageRange = Array.from({ length: windowEnd - windowStart + 1 }, (_, idx) => windowStart + idx);
  const showLeadingFirst = windowStart > 1;
  const showTrailingLast = windowEnd < totalPageCount;
  const showLeftEllipsis = windowStart > 2;
  const showRightEllipsis = windowEnd < totalPageCount - 1;

  const shiftWindow = (direction: "prev" | "next") => {
    setWindowStart((prev) => {
      if (direction === "prev") {
        return Math.max(1, prev - MAX_VISIBLE);
      }
      return Math.min(maxWindowStart, prev + MAX_VISIBLE);
    });
  };

  const createHref = (page: number) => (page <= 1 ? "/technology" : `/technology?page=${page}`);

  const baseButtonStyles =
    "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-xs font-semibold transition-colors";
  const pageButtonClasses = (isActive: boolean) =>
    `${baseButtonStyles} ${
      isActive
        ? "bg-orange-500 text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
    }`;

  const renderPageNode = (page: number) => {
    const isActive = page === activePage;
    if (filtersActive) {
      return (
        <button
          type="button"
          key={`page-${page}`}
          className={pageButtonClasses(isActive)}
          onClick={() => onClientPageChange(page)}
          disabled={isActive}
          aria-current={isActive ? "page" : undefined}
        >
          {page}
        </button>
      );
    }
    return (
      <Link
        key={`page-${page}`}
        href={createHref(page)}
        className={pageButtonClasses(isActive)}
        aria-current={isActive ? "page" : undefined}
      >
        {page}
      </Link>
    );
  };

  const arrowClasses = (disabled: boolean) =>
    `${baseButtonStyles} ${
      disabled
        ? "border border-slate-100 text-slate-300 cursor-not-allowed bg-white"
        : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
    }`;

  const renderArrow = (direction: "prev" | "next") => {
    const isPrev = direction === "prev";
    const targetPage = isPrev ? activePage - 1 : activePage + 1;
    const isDisabled = isPrev ? activePage <= 1 : activePage >= totalPageCount;
    const label = isPrev ? "Previous page" : "Next page";
    const symbol = isPrev ? "←" : "→";

    if (filtersActive) {
      return (
        <button
          type="button"
          key={direction}
          className={arrowClasses(isDisabled)}
          disabled={isDisabled}
          onClick={() => onClientPageChange(Math.min(totalPageCount, Math.max(1, targetPage)))}
          aria-label={label}
        >
          {symbol}
        </button>
      );
    }

    if (isDisabled) {
      return (
        <span key={direction} className={arrowClasses(true)} aria-label={label}>
          {symbol}
        </span>
      );
    }

    return (
      <Link
        key={direction}
        href={createHref(targetPage)}
        className={arrowClasses(false)}
        aria-label={label}
      >
        {symbol}
      </Link>
    );
  };

  const EllipsisButton = ({ direction }: { direction: "prev" | "next" }) => (
    <button
      type="button"
      className={`${baseButtonStyles} border border-transparent px-1 text-base text-slate-400 hover:text-orange-600`}
      onClick={() => shiftWindow(direction)}
      aria-label={direction === "prev" ? "Show previous pages" : "Show next pages"}
    >
      …
    </button>
  );

  return (
    <nav className="mt-12 mb-12 flex justify-center" aria-label="Pagination">
      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
        {renderArrow("prev")}
        {showLeadingFirst && renderPageNode(1)}
        {showLeftEllipsis && <EllipsisButton direction="prev" />}
        {pageRange.map(renderPageNode)}
        {showRightEllipsis && <EllipsisButton direction="next" />}
        {showTrailingLast && renderPageNode(totalPageCount)}
        {renderArrow("next")}
      </div>
    </nav>
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
