import { useState, useEffect } from "react";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostPreview from "./post-preview";
import { FaSearch } from 'react-icons/fa';
import { fetchMorePosts } from "../lib/api";

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface MoreStoriesProps {
  posts: { node: Post }[];
  isCommunity: boolean;
  isIndex: boolean;
  initialPageInfo?: PageInfo;
}

export default function MoreStories({
  posts: initialPosts,
  isCommunity,
  isIndex,
  initialPageInfo,
}: MoreStoriesProps) {
  const [allPosts, setAllPosts] = useState<{ node: Post }[]>(initialPosts.slice(0, 12));
  const [buffer, setBuffer] = useState<{ node: Post }[]>(initialPosts.length > 12 ? initialPosts.slice(12) : []);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(initialPageInfo?.hasNextPage ?? true);
  const [endCursor, setEndCursor] = useState<string | null>(initialPageInfo?.endCursor ?? null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setAllPosts(initialPosts.slice(0, 12));
    setBuffer(initialPosts.length > 12 ? initialPosts.slice(12) : []);
    setVisibleCount(12);
    setHasMore(initialPageInfo?.hasNextPage ?? true);
    setEndCursor(initialPageInfo?.endCursor ?? null);
    setError(null);
  }, [initialPosts, initialPageInfo]);

  const filteredPosts = allPosts.filter(({ node }) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setVisibleCount(12);
    setError(null);
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const loadMorePosts = async () => {
    if (loading || (!hasMore && buffer.length === 0)) return;

    if (searchTerm) {
      setVisibleCount((prev) => prev + 9);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (buffer.length > 0) {
        const postsToAdd = buffer.slice(0, 9);
        setAllPosts((prev) => [...prev, ...postsToAdd]);
        setBuffer((prev) => prev.slice(postsToAdd.length));
        setVisibleCount((prev) => prev + postsToAdd.length);
        return;
      }

      if (hasMore && endCursor) {
        const category = isCommunity ? 'community' : 'technology';
        const result = await fetchMorePosts(category, endCursor);

        if (result?.edges?.length > 0) {
          const postsToAdd = result.edges.slice(0, 9);
          const remaining = result.edges.slice(9);
          setAllPosts((prev) => [...prev, ...postsToAdd]);
          setBuffer(remaining);
          setVisibleCount((prev) => prev + postsToAdd.length);
          setEndCursor(result.pageInfo?.endCursor ?? null);
          setHasMore(result.pageInfo?.hasNextPage ?? false);
        } else {
          setHasMore(false);
          setEndCursor(null);
        }
      }
    } catch (err) {
      console.error("Load more error:", err);
      setError("Failed to load more posts. Please try again later.");
      setHasMore(false);
      setEndCursor(null);
    } finally {
      setLoading(false);
    }
  };

  const showLoadMore =
    !searchTerm &&
    (visibleCount < allPosts.length || buffer.length > 0 || hasMore) &&
    !loading &&
    !error &&
    isIndex;

  return (
    <section>
      <h2 className="
        text-gray-900 dark:text-gray-100
        bg-gradient-to-r from-orange-200 to-orange-100
        dark:from-orange-900 dark:to-orange-700
        bg-[length:100%_20px] bg-no-repeat bg-left-bottom
        w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight
      ">
        More Stories
      </h2>


      {isIndex && (
        <div className="flex w-full mb-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found matching "{searchTerm}"</p>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-16">
            {filteredPosts.slice(0, visibleCount).map(({ node }) => (
              <PostPreview
                key={node.slug}
                title={node.title}
                coverImage={node.featuredImage}
                date={node.date}
                author={node.ppmaAuthorName}
                slug={node.slug}
                excerpt={getExcerpt(node.excerpt, 20)}
                isCommunity={node.categories.edges[0]?.node.name !== "technology"}
              />
            ))}
          </div>

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
                aria-label="Load more posts"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  'Load More Posts'
                )}
              </button>
            )}

            {!hasMore && !error && (
              <p className="text-gray-500 text-center">No more posts to load.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
