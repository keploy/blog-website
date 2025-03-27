import { useState } from "react";
import { Post } from "../types/post";
import PostPreview from "./post-preview";
import { FaSearch } from 'react-icons/fa';
import { getExcerpt } from "../utils/excerpt";

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
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredPosts = posts.filter(({ node }) => 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Always show last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add the page numbers with dots
    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <section>
      <h2 className="bg-gradient-to-r from-[#FF914D] to-[#FFB38A] bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
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
              className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF914D] focus:border-[#FF914D] transition-all duration-200"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      )}

      {currentPosts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found by the name {`"${searchTerm}"`}</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-16">
          {currentPosts.map(({ node }) => (
            <PostPreview
              key={node.slug}
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
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-[#00163D] hover:text-[#FF914D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Previous
          </button>

          {getVisiblePageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`dots-${idx}`} className="px-2">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  currentPage === pageNum
                    ? "bg-[#00163D] text-white hover:bg-[#001F52]"
                    : "text-[#00163D] hover:text-[#FF914D]"
                }`}
              >
                {pageNum}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 my-2 text-[#00163D] hover:text-[#FF914D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}