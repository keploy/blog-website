import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostCard from "./post-card";
import PostGrid from "./post-grid";
import { FaSearch } from 'react-icons/fa';
import { fetchMorePosts } from "../lib/api";
import { PostGridSkeleton } from "./skeletons";

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
  
  //Internal state for search if not controlled by parent
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  // Determine which search term to use (Parent's or Local)
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;
  
  const [allPosts, setAllPosts] = useState<{ node: Post }[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPageInfo?.hasNextPage ?? true);
  const [error, setError] = useState(null);
  const [endCursor, setEndCursor] = useState(initialPageInfo?.endCursor ?? null);
  const [buffer, setBuffer] = useState<{ node: Post }[]>([]);

  // Initialize posts based on page type
  useEffect(() => {
    if (isSearchPage) {
      setAllPosts(initialPosts); // Search page usually has all posts passed
    } else {
      setAllPosts(initialPosts); // Index pages now also need all posts to filter locally
    }
  }, [initialPosts, isSearchPage]);

  // 1. Sync Input from URL on Load
  useEffect(() => {
    if (!router.isReady || externalSearchTerm !== undefined) return;
    const q = router.query.q as string;
    if (q && !localSearchTerm) {
      setLocalSearchTerm(q);
    }
  }, [router.isReady, router.query, externalSearchTerm]);

  // 2. Handle Search Input (Universal URL Sync + Local State)
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // If Parent controls input (Search Page), let parent handle it
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      // Listing Page Logic (Community or Tech)
      setLocalSearchTerm(value);
      
      // Update URL instantly for ALL pages (Community & Tech)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (value) {
          url.searchParams.set("q", value);
        } else {
          url.searchParams.delete("q");
        }
        // Use replaceState to update URL without reloading
        window.history.replaceState({ path: url.href }, "", url.toString());
      }
    }
  };

  // 3. Handle Enter Key (Conditional Logic)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // ONLY redirect if we are on Community AND NOT already on the search page
      if (isCommunity && !isSearchPage && searchTerm.trim()) {
        event.preventDefault();
        router.push(`/community/search?q=${encodeURIComponent(searchTerm)}`);
      }
      // For Technology (!isCommunity), do nothing. The local filter is already active.
    }
  };

  // 4. Filtering Logic
  // We filter locally for BOTH Community and Tech to give the "Then and There" experience.
  const postsToDisplay = allPosts; 
  
  const filteredPosts = postsToDisplay.filter(({ node }) => 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset visible count when search changes
  useEffect(() => {
    // If searching, show standard amount. If search cleared, revert.
    setVisibleCount(12);
    setError(null);
  }, [searchTerm]);

  // Buffer Logic (Mostly for infinite scroll on standard feed)
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
    }
  };

  const loadMorePosts = async () => {
    if (loading) return;
    
    // If we are searching, we just show more from the filtered list (pagination)
    if (searchTerm || isSearchPage) {
      setVisibleCount(prev => prev + 9);
      return;
    }

    setLoading(true);
    try {
      // Calculate how many more posts we need to show
      const newVisibleCount = visibleCount + 9;
      
      // If we have enough in allPosts, just show more
      if (newVisibleCount <= allPosts.length) {
        setVisibleCount(newVisibleCount);
      } 
      // If we need posts from buffer
      else if (buffer.length > 0) {
        const postsNeeded = newVisibleCount - allPosts.length;
        const postsToAdd = buffer.slice(0, Math.max(postsNeeded, 9));
        setAllPosts(prev => [...prev, ...postsToAdd]);
        setBuffer(prev => prev.slice(postsToAdd.length));
        setVisibleCount(allPosts.length + postsToAdd.length);
      }
      // If buffer is empty but we have more posts to fetch
      else if (hasMore) {
        const category = isCommunity ? 'community' : 'technology';
        const result = await fetchMorePosts(category, endCursor);
        
        if (result.edges.length > 0) {
          const postsToAdd = result.edges.slice(0, 9);
          setAllPosts(prev => [...prev, ...postsToAdd]);
          setBuffer(result.edges.slice(9));
          setEndCursor(result.pageInfo.endCursor);
          setHasMore(result.pageInfo.hasNextPage);
          setVisibleCount(allPosts.length + postsToAdd.length);
        } else {
          setHasMore(false);
        }
      }

      // Replenish buffer if running low (but not if we just fetched above)
      if (buffer.length < 9 && buffer.length > 0 && hasMore) {
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

  const showLoadMore = isSearchPage || searchTerm
    ? visibleCount < filteredPosts.length 
    : (visibleCount < allPosts.length || buffer.length > 0 || hasMore) && !error;

  return (
    <section>
      <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
        {isSearchPage ? (
            searchTerm ? `Results for "${searchTerm}"` : "Search Results"
        ) : (
            "More Stories"
        )}
      </h2>
      
      {(isIndex || isSearchPage) && (
        <div className="flex w-full mb-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={`Search ${isCommunity ? 'Community' : 'Technology'} posts...`}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found matching {`"${searchTerm}"`}</p>
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
                  node.categories?.edges?.[0]?.node?.name === "technology" ? false : true
                }
              />
            ))}
          </PostGrid>

          {loading && <PostGridSkeleton count={3} />}

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
