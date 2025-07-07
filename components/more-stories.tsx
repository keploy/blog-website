import { useState, useEffect } from "react";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostPreview from "./post-preview";
import { FaSearch } from "react-icons/fa";
import { fetchMorePosts, getAllPostsFromTags, getAllTags } from "../lib/api";
import { IoClose } from "react-icons/io5";

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
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  // Initialize with 21 posts (22 - 1 hero post)
  const [allPosts, setAllPosts] = useState(initialPosts.slice(0, 21));
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPageInfo?.hasNextPage ?? true);
  const [error, setError] = useState(null);
  const [endCursor, setEndCursor] = useState(
    initialPageInfo?.endCursor ?? null
  );
  const [buffer, setBuffer] = useState<{ node: Post }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagFilteredPosts, setTagFilteredPosts] = useState<
    { node: Post }[] | null
  >(null);
  const [tagLoading, setTagLoading] = useState(false);
  const [allTags, setAllTags] = useState([]);

  // Set up initial buffer with remaining posts
  useEffect(() => {
    if (initialPosts.length > 21) {
      setBuffer(initialPosts.slice(21));
    }
    // Start background fetch if we have less than 9 posts in buffer
    if (
      isIndex &&
      initialPageInfo?.hasNextPage &&
      (!buffer.length || buffer.length < 9)
    ) {
      loadMoreInBackground();
    }
  }, [initialPosts]);

  useEffect(() => {
    const fetchAllTags = async () => {
      const allTags = await getAllTags();
      setAllTags(allTags);
    };

    fetchAllTags();
  }, []);

  const handleTagClick = async (tagName: string) => {
    if (tagName === selectedTag) {
      setSelectedTag(null);
      setTagFilteredPosts(null);
      return;
    }

    setSelectedTag(tagName);
    setTagLoading(true);
    try {
      const result = await getAllPostsFromTags(tagName, false);
      setTagFilteredPosts(result.edges || []);
    } catch (err) {
      console.error("Failed to fetch posts for tag", tagName, err);
      setTagFilteredPosts([]);
    } finally {
      setTagLoading(false);
    }
  };

  // Filter posts based on search term
  const filteredOverlayPosts = allPosts.filter(
    ({ node }) =>
      node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Fetch more posts in background
  const loadMoreInBackground = async () => {
    try {
      const category = isCommunity ? "community" : "technology";
      const result = await fetchMorePosts(category, endCursor);

      if (result.edges.length) {
        setBuffer((currentBuffer) => [...currentBuffer, ...result.edges]);
        setEndCursor(result.pageInfo.endCursor);
        setHasMore(result.pageInfo.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more posts:", error);
      setError("Failed to load more posts. Please try again later.");
    }
  };

  const loadMorePosts = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // First, show more posts from allPosts if available
      if (visibleCount < allPosts.length) {
        setVisibleCount((prev) => Math.min(prev + 9, allPosts.length));
      }
      // Then, add posts from buffer if needed
      else if (buffer.length > 0) {
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
    } catch (error) {
      console.error("Error loading more posts:", error);
      setError("Failed to load more posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Show load more button if there are more posts to show from allPosts,
  // or if there are posts in buffer, or if we can fetch more
  const showLoadMore =
    (visibleCount < allPosts.length || buffer.length > 0 || hasMore) &&
    !loading &&
    !error &&
    isIndex;

  return (
    <section className="flex flex-col md:flex-row w-full gap-8">
      <div className="hidden md:block w-[260px]">
        <div className="sticky top-[6rem] z-10">
          <button
            onClick={() => setSearchOverlayOpen(true)}
            className="w-full border rounded-3xl text-center flex items-center justify-center hover:border-orange-600 cursor-pointer duration-200 transition-all p-2 gap-2 font-medium"
          >
            <FaSearch />
            Search Posts
          </button>

          <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3">
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <span
                  key={tag.name}
                  onClick={async () => {
                    const formattedTag = tag.name.replace(/\s+/g, "-");
                    await handleTagClick(formattedTag);
                  }}
                  className={`text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                    selectedTag === tag.name.replace(/\s+/g, "-")
                      ? "bg-orange-100 text-orange-700 font-semibold"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden w-full mb-6">
        <button
          onClick={() => setSearchOverlayOpen(true)}
          className="w-full flex items-center justify-center gap-2 p-3 border rounded-full hover:border-orange-500 transition"
        >
          <FaSearch />
          <span className="font-medium">Search Posts</span>
        </button>

        <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span
                key={tag.name}
                onClick={async () => {
                  const formattedTag = tag.name.replace(/\s+/g, "-");
                  await handleTagClick(formattedTag);
                }}
                className={`text-xs px-3 py-1 rounded-full cursor-pointer transition ${
                  selectedTag === tag.name.replace(/\s+/g, "-")
                    ? "bg-orange-100 text-orange-700 font-semibold"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-16">
          {tagLoading ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : tagFilteredPosts ? (
            tagFilteredPosts.length > 0 ? (
              tagFilteredPosts.map(({ node }) => (
                <PostPreview
                  key={node.slug}
                  title={node.title}
                  coverImage={node.featuredImage}
                  date={node.date}
                  author={node.ppmaAuthorName}
                  slug={node.slug}
                  excerpt={getExcerpt(node.excerpt, 20)}
                  isCommunity={
                    node.categories.edges[0]?.node.name === "technology"
                      ? false
                      : true
                  }
                />
              ))
            ) : (
              <p className="text-center text-gray-500">
                No posts found for this tag.
              </p>
            )
          ) : (
            allPosts
              .slice(0, visibleCount)
              .map(({ node }) => (
                <PostPreview
                  key={node.slug}
                  title={node.title}
                  coverImage={node.featuredImage}
                  date={node.date}
                  author={node.ppmaAuthorName}
                  slug={node.slug}
                  excerpt={getExcerpt(node.excerpt, 20)}
                  isCommunity={
                    node.categories.edges[0]?.node.name === "technology"
                      ? false
                      : true
                  }
                />
              ))
          )}
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
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                "Load More Posts"
              )}
            </button>
          )}
        </div>
      </div>

      {searchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-xl px-4 py-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-12 relative transition-all duration-300">
            <button
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => {
                setSearchOverlayOpen(false);
                setSearchTerm("");
              }}
            >
              <IoClose />
            </button>

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
                className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {searchTerm.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                Start typing to search posts...
              </div>
            ) : filteredOverlayPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOverlayPosts.map(({ node }) => (
                  <PostPreview
                    key={node.slug}
                    title={node.title}
                    coverImage={node.featuredImage}
                    date={node.date}
                    author={node.ppmaAuthorName}
                    slug={node.slug}
                    excerpt={getExcerpt(node.excerpt, 20)}
                    isCommunity={
                      node.categories.edges[0]?.node.name === "technology"
                        ? false
                        : true
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No posts found.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
