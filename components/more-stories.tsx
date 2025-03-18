import { useState, useEffect } from "react";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostPreview from "./post-preview";
import { FaSearch } from 'react-icons/fa';
import { API_URL, getAllPostsForCommunity } from "../lib/api";

export default function MoreStories({
  posts: initialPosts,
  isCommunity,
  isIndex,
}: {
  posts: { node: Post }[];
  isCommunity: boolean;
  isIndex: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [endCursor, setEndCursor] = useState(null);

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

  const loadMorePosts = async () => {
    if (loading) return;
    
    if (searchTerm) {
      // If searching, just show more of the already filtered posts
      setLoading(true);
      setVisibleCount(prev => prev + 12);
      setLoading(false);
    } else {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllPostsForCommunity(false, endCursor);
        
        if (!result.edges.length || !result.pageInfo.hasNextPage) {
          setHasMore(false);
        } else {
          // Add new posts to our state
          setAllPosts(currentPosts => [...currentPosts, ...result.edges]);
          
          // Update endCursor for next request
          setEndCursor(result.pageInfo.endCursor);
          
          // Update hasMore based on pageInfo
          setHasMore(result.pageInfo.hasNextPage);
          
          // Increase visible count
          setVisibleCount(prev => prev + 12);
        }
      } catch (error) {
        console.error('Error loading more posts:', error);
        setError('Failed to load more posts. Please try again later.');
      } finally {
        setLoading(false);
      }
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

      {error && (
        <div className="text-red-500 text-center mb-8 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found by the name {`"${searchTerm}"`}</p>
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
                isCommunity={
                  node.categories.edges[0]?.node.name === "technology" ? false : true
                }
              />
            ))}
          </div>
          
          {isIndex && hasMore && (
            <div className="flex justify-center mb-8">
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
            </div>
          )}
        </>
      )}
    </section>
  );
}