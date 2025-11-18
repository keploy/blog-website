import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { GetStaticProps } from "next";
import Link from "next/link";
import Container from "../../components/container";
import Layout from "../../components/layout";
import { getAllPostsForTechnology } from "../../lib/api";
import Header from "../../components/header";
import { getExcerpt } from "../../utils/excerpt";
import PostGrid from "../../components/post-grid";
import PostCard from "../../components/post-card";
import PostListRow from "../../components/post-list-row";
import CoverImage from "../../components/cover-image";
import DateComponent from "../../components/date";
import { FaSearch, FaTimes } from "react-icons/fa";

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

export default function Index({ allPosts: { edges }, preview }) {
  const posts = edges.map((edge) => edge.node);
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
      return `Filtered stories (${filterParts.join(", ")})`;
    }

    return "All technology stories";
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
      <Header />
      <section className="mt-0 w-full">
        <Container>
          <div className="pt-8 pb-12 md:pt-10 md:pb-16">
            <div className="grid gap-10 lg:gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col gap-8 justify-center lg:justify-start lg:pt-20">
                <header className="space-y-5">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight text-left">
                    <span
                      className={`inline-block bg-clip-text text-transparent pb-1 ${
                        gradientLoaded
                          ? "gradient-text-animated opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <span className="whitespace-nowrap">Keploy Technology</span> Blog
                    </span>
                  </h1>
                  <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
                    Deep dives, release notes, and engineering stories straight from the Keploy team.
                  </p>
                </header>

                <div className="flex flex-col gap-6 mt-12">
                  <div className="flex flex-row gap-4 items-center">
                    <div className="relative flex-[0.95]">
                      <input
                        type="text"
                        placeholder="Search technology posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-12 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-sm font-semibold shadow-sm"
                      />
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
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
                      className="px-4 py-2 h-11 text-sm font-semibold text-orange-600 border border-orange-200 rounded-full bg-white hover:bg-orange-50 transition-colors whitespace-nowrap"
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
                        <div className="flex rounded-full border border-gray-200 bg-white p-1 h-11 shadow-sm">
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
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {latestPost && (
                    <article className="bg-white border border-gray-100 rounded-3xl shadow-lg p-4 flex flex-col gap-3 w-full md:w-[44%] md:max-w-[44%] mt-8 md:mt-20 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] group">
                      <div className="text-xs uppercase tracking-[0.3em] text-orange-500">
                        Latest blog
                      </div>
                      <div className="overflow-hidden rounded-2xl">
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
                      <h2
                        className="text-base font-semibold leading-snug group-hover:text-orange-600 line-clamp-2 transition-colors duration-200"
                        dangerouslySetInnerHTML={{ __html: latestPost.title }}
                      />
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{latestPost.ppmaAuthorName || "Anonymous"}</span>
                        <span>•</span>
                        <DateComponent dateString={latestPost.date} />
                      </p>
                      <p
                        className="text-gray-600 text-xs line-clamp-4 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: getExcerpt(latestPost.excerpt, 30),
                        }}
                      />
                      <Link
                        href={`/technology/${latestPost.slug}`}
                        className="text-orange-600 font-semibold text-xs hover:text-orange-700 hover:underline transition-colors duration-200"
                      >
                        Read latest →
                      </Link>
                    </article>
                  )}

                  {!!featuredPosts.length && (
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-lg p-4 transform lg:-translate-y-10 w-full md:w-[48%] md:max-w-[48%] md:ml-auto mt-6 md:mt-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Featured blogs</h3>
                        <span className="text-xs text-gray-500">
                          {featuredPosts.length} picks
                        </span>
                      </div>
                      <div className="mt-3 space-y-3">
                        {featuredPosts.map((post) => (
                          <Link
                            key={post.slug}
                            href={`/technology/${post.slug}`}
                            className="flex gap-3 items-stretch group transition-all duration-300 hover:-translate-y-1 rounded-xl p-2 -m-2 hover:bg-orange-50/50"
                          >
                            <div className="w-[28%] min-w-[60px] rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                              {post.featuredImage ? (
                                <CoverImage
                                  title={post.title}
                                  coverImage={post.featuredImage}
                                  slug={post.slug}
                                  isCommunity={false}
                                  imgClassName="w-full h-14 object-cover"
                                />
                              ) : (
                                <div className="w-full h-14 flex items-center justify-center text-xs font-semibold text-orange-500 bg-orange-50">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="w-[72%] flex flex-col justify-center gap-2">
                              <h4
                                className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 line-clamp-2 transition-colors duration-200"
                                dangerouslySetInnerHTML={{ __html: post.title }}
                              />
                              <p className="text-xs text-gray-500">
                                {post.ppmaAuthorName || "Anonymous"}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
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
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-gray-500">
              No posts match your filters. Try adjusting the search or filters above.
            </div>
          ) : viewMode === "grid" ? (
            <PostGrid>
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.slug}
                  title={post.title}
                  coverImage={post.featuredImage}
                  date={post.date}
                  author={post.ppmaAuthorName}
                  slug={post.slug}
                  excerpt={getExcerpt(post.excerpt, 20)}
                  isCommunity={false}
                />
              ))}
            </PostGrid>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <PostListRow
                  key={post.slug}
                  post={post}
                  excerptOverride={getExcerpt(post.excerpt, 32)}
                />
              ))}
            </div>
          )}
        </section>
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
          isOpen ? "border-orange-300 shadow-lg" : "border-orange-100 shadow-sm"
        } bg-white/90 text-gray-800 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200`}
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
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const emptyData = { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };

  try {
    const allPosts = await getAllPostsForTechnology(preview);

    return {
      props: { allPosts: allPosts ?? emptyData, preview },
      revalidate: 10,
    };
  } catch (error) {
    console.error("technology/index getStaticProps error:", error);
    return {
      props: { allPosts: emptyData, preview },
      revalidate: 60,
    };
  }
};
