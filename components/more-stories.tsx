import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostCard from "./post-card";
import PostGrid from "./post-grid";
import { FaSearch } from "react-icons/fa";
import { fetchMorePosts } from "../lib/api";

interface MoreStoriesProps {
  posts: { node: Post }[];
  isCommunity: boolean;
  isIndex: boolean;
  isSearchPage?: boolean;
  initialPageInfo?: { hasNextPage: boolean; endCursor: string | null };
  externalSearchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export default function MoreStories({
  posts: initialPosts,
  isCommunity,
  isIndex,
  isSearchPage = false,
  initialPageInfo,
  externalSearchTerm,
  onSearchChange,
}: MoreStoriesProps) {
  const router = useRouter();

  // Internal search state if parent does not control it
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;

  const [allPosts, setAllPosts] = useState<{ node: Post }[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPageInfo?.hasNextPage ?? true);
  const [error, setError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState(initialPageInfo?.endCursor ?? null);
  const [buffer, setBuffer] = useState<{ node: Post }[]>([]);

  // Initialize posts
  useEffect(() => {
    setAllPosts(initialPosts);
  }, [initialPosts]);

  // Sync search from URL if not controlled externally
  useEffect(() => {
    if (!router.isReady || externalSearchTerm !== undefined) return;
    const q = router.query.q as string;
    if (q && !localSearchTerm) {
      setLocalSearchTerm(q);
    }
  }, [router.isReady, router.query, externalSearchTerm]);

  // Handle input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearchTerm(value);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (value) url.searchParams.set("q", value);
        else url.searchParams.delete("q");
        window.history.replaceState({ path: url.href }, "", url.toString());
      }
    }
  };

  // Handle Enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (isCommunity && !isSearchPage && searchTerm.trim()) {
        event.preventDefault();
        router.push(`/community/search?q=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  // Filtered posts
  const filteredPosts = allPosts.filter(
    ({ node }) =>
      node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset visible count on search change
  useEffect(() => {
    setVisibleCount(12);
    setError(null);
  }, [searchTerm]);

  // Load more posts background buffer
  useEffect(() => {
    if (!isSearchPage && initialPosts.length > 21) {
      setBuffer(initialPosts.slice(21));
    }
    if (isIndex && initialPageInfo?.hasNextPage && (!buffer.length || buffer.length < 9)) {
      loadMoreInBackground();
    }
  }, [initialPosts, isIndex, isSearchPage]);

  const loadMoreInBackground = async () => {
    try {
      const category = isCommunity ? "community" : "technology";
      const result = await fetchMorePosts(category, endCursor);
      if (result.edges.length) {
        setBuffer((prev) => [...prev, ...result.edges]);
        setEndCursor(result.pageInfo.endCursor);
        setHasMore(result.pageInfo.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching more posts:", err);
    }
  };

  const loadMorePosts = async () => {
    if (loading) return;

    if (searchTerm || isSearchPage) {
      setVisibleCount((prev) => prev + 9);
      return;
    }

    setLoading(true);
    try {
      if (visibleCount < allPosts.length) {
        setVisibleCount((prev) => Math.min(prev + 9, allPosts.length));
      } else if (buffer.length > 0) {
        const postsToAdd = buffer.slice(0, 9);
        setAllPosts((prev) => [...prev, ...postsToAdd]);
        setBuffer((prev) => prev.slice(9));
        setVisibleCount((prev) => prev + postsToAdd.length);
      }

      if (buffer.length < 9 && hasMore) {
        const category = isCommunity ? "community" : "technology";
        const result = await fetchMorePosts(category, endCursor);
        if (result.edges.length > 0) {
          setBuffer((prev) => [...prev, ...result.edges]);
          setEndCursor(result.pageInfo.endCursor);
          setHasMore(result.pageInfo.hasNextPage);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
      setError("Failed to load more posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const showLoadMore =
    isSearchPage || searchTerm
      ? visibleCount < filteredPosts.length
      : (visibleCount < allPosts.length || buffer.length > 0 || hasMore) && !loading && !error && isIndex;

  return (
    <section>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4">
        <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max text-4xl heading1 font-bold tracking-tighter leading-tight">
          {isSearchPage ? (searchTerm ? `Results for "${searchTerm}"` : "Search Results") : "More Stories"}
        </h2>

        {/* Search Bar */}
        {(true || isSearchPage) && (
          <div className="relative w-full mt-4">
            <input
              type="text"
              placeholder={`Search ${isCommunity ? "Community" : "Technology"} posts...`}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full rounded-full border border-gray-300 p-3 pl-10 text-sm
                        transition focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-blue-500"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        )}
      </div>

      {/* Posts / Empty State */}
      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500">
          No posts found matching {`"${searchTerm}"`}
        </p>
      ) : (
        <>
          <PostGrid>
            {filteredPosts.slice(0, visibleCount).map(({ node }) => (
              <PostCard
                key={node.slug}
                title={node.title}
                coverImage={node.featuredImage}
                date={node.date}
                author={node.ppmaAuthorName}
                slug={node.slug}
                excerpt={getExcerpt(node.excerpt, 20)}
                isCommunity={node.categories?.edges?.[0]?.node?.name !== "technology"}
              />
            ))}
          </PostGrid>

          {/* Load More + Error */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg w-full max-w-md">
                {error}
              </div>
            )}

            {showLoadMore && (
              <button
                onClick={loadMorePosts}
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  "Load More Posts"
                )}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
