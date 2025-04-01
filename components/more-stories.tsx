import { useState, useEffect } from "react";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostPreview from "./post-preview";
import { FaSearch } from 'react-icons/fa';

export default function MoreStories({
  posts,
  isCommunity,
  isIndex,
}: {
  posts: { node: Post }[];
  isCommunity: boolean;
  isIndex: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [postsToShow, setPostsToShow] = useState(6); // Number of posts to display initially

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPostsToShow(6); // Reset to the initial number of posts when search term changes
  };

  const filteredPosts = posts.filter(({ node }) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentPosts = filteredPosts.slice(0, postsToShow);

  const loadMorePosts = () => {
    setPostsToShow(prev => prev + 6); // Load 6 more posts
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
              className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      )}

      {currentPosts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found by the name &quot;{searchTerm}&quot;</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-16">
          {currentPosts.map(({ node }) => (
            <div key={node.slug} className="post-card flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden shadow-md">
               <PostPreview
                title={node.title}
                coverImage={node.featuredImage}
                date={node.date}
                author={node.ppmaAuthorName}
                slug={node.slug}
                excerpt={getExcerpt(node.excerpt, 20)}
                isCommunity={
                  node.categories.edges[0].node.name === "technology" ? false : true
                }
              />
            </div>
          ))}
        </div>
      )}

      {postsToShow < filteredPosts.length && (
        <div className="flex justify-center m-8">
          <button
            onClick={loadMorePosts}
            className="px-4 py-2 rounded-full bg-primary-200 text-gray-700 hover:bg-primary-300"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
