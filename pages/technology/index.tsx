import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Container from "../../components/container";
import Layout from "../../components/layout";
import { getTechnologyPostsByPage } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import PostGrid from "../../components/post-grid";
import PostCard from "../../components/post-card";
import PostListRow from "../../components/post-list-row";
import CoverImage from "../../components/cover-image";
import DateComponent from "../../components/date";
import { FaSearch, FaTimes } from "react-icons/fa";
import Background from "../../components/background";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import Image from "next/image";
import { Post } from "../../types/post";

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

type ViewMode = "grid" | "list";

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type TechnologyPageProps = {
  posts: Post[];
  pageInfo: PageInfo;
  currentPage: number;
  pageSize: number;
  preview: boolean;
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
  pageSize,
  preview,
}: TechnologyPageProps) {
  const latestPost = posts[0];
  const featuredPosts = posts.slice(1, 5);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [gradientLoaded, setGradientLoaded] = useState(false);

  const authors = useMemo<string[]>(() => {
    const uniqueAuthors = new Set<string>(
      posts.map((post) => post.ppmaAuthorName || "Anonymous")
    );
    return ["all", ...Array.from(uniqueAuthors)];
  }, [posts]);

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

    const sorted = [...posts]
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
  }, [posts, searchTerm, selectedAuthor, dateFilter, sortOption]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAuthor("all");
    setDateFilter("all");
    setSortOption("newest");
    setViewMode("grid");
  };

  useEffect(() => {
    setGradientLoaded(true);
  }, []);


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
      featuredImage={latestPost?.featuredImage?.node.sourceUrl}
      Title={latestPost?.title}
      Description={`Blog from the Technology Page`}
    >
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Background />
      <Header />
      <section className="mt-0 w-full">
        <Container>
          <div className="relative">
            <div className="pt-6 pb-10 md:pt-8 md:pb-12">
              <div className="grid gap-10 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col gap-8 justify-center lg:justify-start lg:-translate-y-4 xl:-translate-y-6 lg:pt-10">
                <header className="space-y-5">
                  <h1 className="text-[2rem] md:text-[2.75rem] lg:text-[3.50rem] font-bold tracking-tight leading-tight text-left">
                    <span
                      className={`inline-block bg-clip-text text-transparent pb-1 ${
                        gradientLoaded
                          ? "gradient-text-animated opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <span className="whitespace-nowrap">Keploy Technology Blog</span>
                    </span>
                  </h1>
                  <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
                    Deep dives, release notes, and engineering stories straight from the Keploy team.
                  </p>
                </header>

                <div className="flex flex-col gap-6 mt-10">
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

              <div className="flex flex-col">
                <div className="flex flex-col md:flex-row gap-3 md:gap-3 items-start">
                  {latestPost && (
                    <article className="group relative w-full md:w-[44%] md:max-w-[44%] mt-12 md:mt-24 transition-all duration-300 hover:-translate-y-1">
                      <div className="rounded-[30px] p-[1.5px] bg-gradient-to-br from-orange-300/40 via-orange-200/20 to-orange-100/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-orange-200/40">
                        <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-orange-50/70 via-white to-white border border-white/60 shadow-lg flex flex-col gap-3 p-4">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 via-transparent to-transparent blur-3xl opacity-70 pointer-events-none" />
                          <div className="relative flex flex-col gap-4">
                            <div className="text-xs uppercase tracking-[0.35em] text-black flex items-center gap-2">
                              <span>Latest blog</span>
                              <span className="flex-1 h-px bg-gradient-to-r from-orange-300 via-orange-200/70 to-transparent rounded-full" />
                            </div>
                            <div className="overflow-hidden rounded-2xl ring-1 ring-orange-100/60 shadow-inner shadow-orange-200/30">
                              {latestPost.featuredImage && (
                                <CoverImage
                                  title={latestPost.title}
                                  coverImage={latestPost.featuredImage}
                                  slug={latestPost.slug}
                                  isCommunity={false}
                                  imgClassName="w-full h-24 object-cover"
                                />
                              )}
                            </div>
                            <div className="flex flex-col gap-3">
                              <h2
                                className="text-[1rem] font-semibold leading-snug group-hover:text-orange-600 line-clamp-2 transition-colors duration-200"
                                dangerouslySetInnerHTML={{ __html: latestPost.title }}
                              />
                              <p className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {latestPost.ppmaAuthorName || "Anonymous"}
                                </span>
                                <span>•</span>
                                <DateComponent dateString={latestPost.date} />
                              </p>
                              <p
                                className="text-gray-600 text-[0.75rem] line-clamp-2 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: getExcerpt(latestPost.excerpt, 18),
                                }}
                              />
                            </div>
                            <Link
                              href={`/technology/${latestPost.slug}`}
                              className="inline-flex items-center gap-1 text-orange-600 font-semibold text-xs hover:text-orange-700 hover:underline transition-colors duration-200 mt-1"
                            >
                              Read latest →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  )}

                  {!!featuredPosts.length && (
                    <div className="w-full md:w-[48%] md:max-w-[48%] md:ml-auto mt-6 md:mt-0 lg:-translate-y-16">
                      <div className="rounded-[25px] p-[1.5px] bg-gradient-to-br from-orange-200/35 via-orange-100/20 to-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-orange-200/35">
                        <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-white via-orange-50/45 to-white border border-white/60 shadow-lg p-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white via-orange-100/30 to-transparent opacity-70 blur-2xl pointer-events-none" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-semibold flex items-center gap-2">
                                Featured blogs
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-orange-400/80" />
                              </h3>
                              <span className="text-xs text-gray-500">
                                {featuredPosts.length} picks
                              </span>
                            </div>
                          <div className="mt-4 space-y-4">
                            {featuredPosts.map((post, index) => {
                              const authorName = formatAuthorName(post.ppmaAuthorName);
                              return (
                                <div key={post.slug}>
                                  <Link
                                    href={`/technology/${post.slug}`}
                                    className="group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 -m-1 min-h-[56px] transition-colors duration-300 hover:bg-orange-50/70"
                                  >
                                    {post.featuredImage?.node?.sourceUrl && (
                                      <div className="relative flex-shrink-0 w-[4.25rem] h-14 rounded-xl overflow-hidden ring-1 ring-orange-100/70 bg-orange-50/60">
                                        <Image
                                          src={post.featuredImage.node.sourceUrl}
                                          alt={post.title}
                                          fill
                                          sizes="68px"
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                      <h4
                                        className="text-[0.85rem] font-semibold text-gray-900 leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-orange-600"
                                        dangerouslySetInnerHTML={{ __html: post.title }}
                                      />
                                      <p className="text-[0.7rem] font-semibold text-gray-800 tracking-tight">
                                        {authorName}
                                      </p>
                                    </div>
                                  </Link>
                                  {index !== featuredPosts.length - 1 && (
                                    <div className="h-[1.5px] w-full bg-gradient-to-r from-orange-200 via-gray-200 to-transparent rounded-full mt-4" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </Container>
      </section>

      <Container>
        <section className="mt-16 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-orange-500 mb-2">
                Browse
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-left">{browseHeading}</h2>
            </div>
            <p className="text-gray-500 text-sm">
              Showing {filteredPosts.length} of {pageSize}{" "}
              {pageSize === 1 ? "post" : "posts"} on page {currentPage}
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-gray-500">
              No posts match your filters. Try adjusting the search or filters above.
            </div>
          ) : viewMode === "grid" ? (
            <PostGrid>
              {filteredPosts.map((post) => {
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
              {filteredPosts.map((post) => {
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

        <PaginationControls currentPage={currentPage} hasNextPage={pageInfo?.hasNextPage ?? false} />
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
}: {
  currentPage: number;
  hasNextPage: boolean;
}) {
  const prevDisabled = currentPage <= 1;
  const nextDisabled = !hasNextPage;
  const prevHref =
    currentPage - 1 <= 1 ? "/technology" : `/technology?page=${currentPage - 1}`;
  const nextHref = `/technology?page=${currentPage + 1}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-orange-100 pt-8 mt-8 pb-16">
      <PaginationButton href={prevHref} disabled={prevDisabled}>
        ← Previous
      </PaginationButton>
      <span className="text-sm font-semibold text-gray-600">Page {currentPage}</span>
      <PaginationButton href={nextHref} disabled={nextDisabled}>
        Next →
      </PaginationButton>
    </div>
  );
}

function PaginationButton({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-full text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
    >
      {children}
    </Link>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, preview = false }) => {
  const pageParam = Array.isArray(query.page) ? query.page[0] : query.page;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const pageSize = 21;

  try {
    const data = await getTechnologyPostsByPage(requestedPage, pageSize, preview);
    const lastAvailablePage = data.lastAvailablePage ?? requestedPage;

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
        pageSize,
        preview,
      },
    };
  } catch (error) {
    console.error("technology/index getServerSideProps error:", error);
    return {
      props: {
        posts: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        currentPage: 1,
        pageSize,
        preview,
      },
    };
  }
};
