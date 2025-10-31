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
  const [allPosts, setAllPosts] = useState(initialPosts.slice(0, 21));
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPageInfo?.hasNextPage ?? true);
  const [error, setError] = useState<null | string>(null);
  const [endCursor, setEndCursor] = useState(initialPageInfo?.endCursor ?? null);
  const [buffer, setBuffer] = useState<{ node: Post }[]>([]);

  useEffect(() => {
    if (initialPosts.length > 21) {
      setBuffer(initialPosts.slice(21));
    }
    if (isIndex && initialPageInfo?.hasNextPage && (!buffer.length || buffer.length < 9)) {
      loadMoreInBackground();
    }

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        loadMorePosts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialPosts, loading, hasMore, buffer.length, isIndex, initialPageInfo]);

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
      if (visibleCount < allPosts.length) {
        setVisibleCount(prev => Math.min(prev + 9, allPosts.length));
      } else if (buffer.length > 0) {
        const postsToAdd = buffer.slice(0, 9);
        setAllPosts(prev => [...prev, ...postsToAdd]);
        setBuffer(prev => prev.slice(9));
        setVisibleCount(prev => prev + postsToAdd.length);
      }

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
            <button
              className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 flex items-center justify-center min-w-[150px] transition-all duration-200"
              onClick={loadMorePosts}
              disabled={loading}
              aria-label="Load more posts"
            >
              {loading && (
                <div className="w-5 h-5 border-4 border-white border-t-orange-500 rounded-full animate-spin mr-2" />
              )}
              {loading ? 'Loading...' : hasMore ? 'Load More Posts' : 'No More Posts'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}