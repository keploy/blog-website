import { useState, useEffect } from "react";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostPreview from "./post-preview";
import { FaSearch } from 'react-icons/fa';
import { getAllPostsForCommunity } from "../lib/api";

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
  const [page, setPage] = useState(1);

  // Filter posts based on search term
  const filteredPosts = allPosts.filter(({ node }) => 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determine which posts to display based on the current visible count
  const displayedPosts = filteredPosts.slice(0, visibleCount);

  // Update hasMore whenever filtered posts or visible count changes
  useEffect(() => {
    setHasMore(filteredPosts.length > visibleCount);
  }, [filteredPosts, visibleCount]);

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset pagination when searching
  };

  const loadMorePosts = async () => {
    if (loading) return;
    
    if (searchTerm) {
      // If searching, just show more of the already filtered posts
      setLoading(true);
      setVisibleCount(prev => prev + 12);
      setLoading(false);
    } else {
      // If not searching and need more posts from API
      if (filteredPosts.length <= visibleCount && hasMore) {
        // Need to fetch more posts from the API
        setLoading(true);
        try {
          const morePosts = await getAllPostsForCommunity({
            preview: false,
            limit: 12,
            offset: page * 12
          });
          
          if (!morePosts?.edges?.length) {
            setHasMore(false);
          } else {
            setAllPosts(currentPosts => [...currentPosts, ...morePosts.edges]);
            setVisibleCount(prev => prev + 12);
            setPage(p => p + 1);
          }
        } catch (error) {
          console.error('Error loading more posts:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Already have enough posts loaded, just show more
        setLoading(true);
        setVisibleCount(prev => prev + 12);
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

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found by the name {`"${searchTerm}"`}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-16">
            {displayedPosts.map(({ node }) => (
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
                className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
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