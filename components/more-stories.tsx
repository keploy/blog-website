import { useState, useEffect } from "react";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostCard from "./post-card";
import PostGrid from "./post-grid";
import { FaSearch } from 'react-icons/fa';
import { fetchMorePosts } from "../lib/api";

export default function MoreStories({
  posts: initialPosts,
  isCommunity,
  isIndex,
  initialPageInfo,
}: {
  posts: { node: Post }[];
  isCommunity: boolean;
  isIndex: boolean;
  initialPageInfo?: { hasNextPage: boolean; endCursor: string | null };
}) {
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize with 21 posts (22 - 1 hero post)
  const [allPosts, setAllPosts] = useState(initialPosts.slice(0, 21));
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPageInfo?.hasNextPage ?? true);
  const [error, setError] = useState(null);
  const [endCursor, setEndCursor] = useState(initialPageInfo?.endCursor ?? null);
  const [buffer, setBuffer] = useState<{ node: Post }[]>([]);

  // Set up initial buffer with remaining posts
  useEffect(() => {
    if (initialPosts.length > 21) {
      setBuffer(initialPosts.slice(21));
    }
    // Start background fetch if we have less than 9 posts in buffer
    if (isIndex && initialPageInfo?.hasNextPage && (!buffer.length || buffer.length < 9)) {
      loadMoreInBackground();
    }
  }, [initialPosts]);

  // Filter posts based on search term
  const filteredPosts = allPosts.filter(({ node }) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(12);
    setError(null);
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Fetch more posts in background
  const loadMoreInBackground = async () => {
    try {
      const category = isCommunity ? 'community' : 'technology';
      const result = await fetchMorePosts(category, endCursor);

      if (result.edges.length) {
        setBuffer(currentBuffer => [...currentBuffer, ...result.edges]);
        setEndCursor(result.pageInfo.endCursor);
        setHasMore(result.pageInfo.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
      setError('Failed to load more posts. Please try again later.');
    }
  };

  const loadMorePosts = async () => {
    if (loading) return;

    if (searchTerm) {
      setVisibleCount(prev => prev + 9);
      return;
    }

    setLoading(true);
    try {
      // First, show more posts from allPosts if available
      if (visibleCount < allPosts.length) {
        setVisibleCount(prev => Math.min(prev + 9, allPosts.length));
      }
      // Then, add posts from buffer if needed
      else if (buffer.length > 0) {
        const postsToAdd = buffer.slice(0, 9);
        setAllPosts(prev => [...prev, ...postsToAdd]);
        setBuffer(prev => prev.slice(9));
        setVisibleCount(prev => prev + postsToAdd.length);
      }

      // If buffer is getting low, fetch more posts
      if (buffer.length < 9 && hasMore) {
        const category = isCommunity ? 'community' : 'technology';
        const result = await fetchMorePosts(category, endCursor);

        if (result.edges.length > 0) {
          setBuffer(prev => [...prev, ...result.edges]);
          setEndCursor(result.pageInfo.endCursor);
          setHasMore(result.pageInfo.hasNextPage);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setError('Failed to load more posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Show load more button if there are more posts to show from allPosts,
  // or if there are posts in buffer, or if we can fetch more
  const showLoadMore = (
    visibleCount < allPosts.length ||
    buffer.length > 0 ||
    hasMore
  ) && isIndex;

  return (
    <section>
      <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
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
        <p className="text-center text-gray-500">No posts found by the name {`"${searchTerm}"`}</p>
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
                isCommunity={
                  node.categories.edges[0]?.node.name === "technology" ? false : true
                }
              />
            ))}
          </PostGrid>

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
                className={`px-6 py-2 rounded-full flex items-center justify-center gap-2 min-w-[180px] transition-all duration-200
      ${loading ? 'bg-orange-400 cursor-wait' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </button>
            )}


          </div>
        </>
      )}
    </section>
  );
}