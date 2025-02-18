import { useState, useEffect } from "react";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import PostPreview from "./post-preview";
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
  const postsPerPage = 6; // Number of posts to display per page

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when search term changes
  };

  const filteredPosts = posts.filter(({ node }) =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 4;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    if (currentPage <= Math.ceil(maxPageNumbers / 2)) {
      endPage = Math.min(totalPages, maxPageNumbers);
    }

    if (currentPage >= totalPages - Math.floor(maxPageNumbers / 2)) {
      startPage = Math.max(1, totalPages - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`mx-1 px-3 py-2 rounded-full ${
            currentPage === i ? "bg-primary-400 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
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

      <div className="pagination flex justify-center m-8">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="mx-1 px-3 py-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          <FaChevronLeft />
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="mx-1 px-3 py-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}
