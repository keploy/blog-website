import { useState, useMemo, useEffect } from "react";
import { Post } from "../types/post";
import { normalizeName } from "../utils/calculateAuthorPostCounts";
import AuthorCard from "./AuthorCard";
import { getAuthorInfoByName } from "../lib/authorData";

export default function AuthorMapping({
  AuthorArray,
  itemsPerPage = 9, // You can customize the number of items per page
  authorCounts,
  searchTerm,
  sortOrder,
}:{
  AuthorArray: Pick<Post, "author" | "ppmaAuthorName" | "ppmaAuthorImage">[],
  itemsPerPage?:number,
  authorCounts?: Record<string, number>,
  searchTerm: string,
  sortOrder: "" | "asc" | "desc",
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const authorData = useMemo(() => {
    // Use a map keyed by normalized display name to ensure strict de-duplication
    const normalizedNameToAuthor = new Map<string, {
      publishingAuthor: string;
      ppmaAuthorName: string;
      avatarUrl: string;
      slug: string;
    }>();

    AuthorArray.forEach((item) => {
      const formattedDisplay = formatAuthorName(item.ppmaAuthorName);
      if (Array.isArray(formattedDisplay)) return; // skip multi-name entries

      const normalizedKey = formattedDisplay.toLowerCase().trim();
      if (normalizedNameToAuthor.has(normalizedKey)) return; // already captured

      const publishingAuthor = formatAuthorName(item.author.node.name);
      const avatarUrl = item.ppmaAuthorImage;
      const slug = item.ppmaAuthorName;

      normalizedNameToAuthor.set(normalizedKey, {
        publishingAuthor,
        ppmaAuthorName: formattedDisplay,
        avatarUrl,
        slug,
      });
    });

    return Array.from(normalizedNameToAuthor.values());
  }, [AuthorArray]);

  const filteredAuthors = useMemo(() => {
    if (!searchTerm.trim()) return authorData;
    const query = searchTerm.toLowerCase();
    // Restrict search to ppmaAuthorName only (display name)
    return authorData.filter((a) => a.ppmaAuthorName.toLowerCase().includes(query));
  }, [authorData, searchTerm]);

  const sortedAuthors = useMemo(() => {
    if (!sortOrder) return filteredAuthors;
    const copied = [...filteredAuthors];
    copied.sort((a, b) => {
      const nameA = a.ppmaAuthorName.toLowerCase();
      const nameB = b.ppmaAuthorName.toLowerCase();
      if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
      if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
      
      const pubA = a.publishingAuthor.toLowerCase();
      const pubB = b.publishingAuthor.toLowerCase();
      if (pubA < pubB) return sortOrder === "asc" ? -1 : 1;
      if (pubA > pubB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return copied;
  }, [filteredAuthors, sortOrder]);

  const totalPages = Math.ceil(sortedAuthors.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleAuthors = sortedAuthors.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  return (
    <div className="container mx-auto mt-8">

      {sortedAuthors.length === 0 ? (
        <p className="text-center text-gray-500 mb-10">No authors found by the name {`"${searchTerm}"`}</p>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mx-4 mt-6 mb-10">
        {visibleAuthors.map((author, index) => {
          const countKey = normalizeName(author.ppmaAuthorName);
          const postCount = (typeof countKey === 'string' && countKey) ? (authorCounts?.[countKey] ?? 0) : 0;
          const info = getAuthorInfoByName(author.ppmaAuthorName);
          return (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-orange-300/40 hover:border-orange-400/70 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-transform duration-300 ease-out will-change-transform overflow-hidden hover:-translate-y-1"
            >
              <AuthorCard
                name={author.ppmaAuthorName}
                avatarUrl={info?.image || author.avatarUrl}
                slug={author.slug}
                postCount={postCount}
                bio={info?.description}
                linkedin={info?.linkedin}
              />
            </div>
          );
        })}
      </div>
      
      <div>
        <hr className="border-b-2 border-gray-300 my-6" />
      </div>
      <div className="flex justify-center mb-6 sm:mt-6 sm:mb-6 px-6 py-4">
        <button
          className={`mx-1 sm:mx-2 px-4 py-2 rounded-full border-2 border-white/60 bg-white/25 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
            currentPage <= 1
              ? "text-gray-500 cursor-not-allowed"
              : "text-gray-700 hover:bg-white/35 hover:text-gray-800"
          }`}
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
        >
          Back
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`mx-1 sm:mx-2 px-4 py-3 rounded-full border-2 text-sm shadow-xl hover:shadow-2xl transition-all duration-300 ${
                pageNumber === currentPage
                  ? "border-orange-300/70 bg-orange-200/40 text-orange-800"
                  : "border-white/60 bg-white/25 text-gray-700 hover:bg-white/35 hover:text-gray-800"
              }`}
            >
              {pageNumber}
            </button>
          )
        )}
        <button
          className={`mx-1 sm:mx-1 px-4 py-2 rounded-full border-2 border-white/60 bg-white/25 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
            currentPage >= totalPages
              ? "text-gray-500 cursor-not-allowed"
              : "text-gray-700 hover:bg-white/35 hover:text-gray-800"
          }`}
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
        </>
      )}
    </div>
  );
}

function formatAuthorName(name) {
  if (name.includes(",")) {
    const authors = name.split(",").map((author) =>
      author
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .trim()
    );
    return authors;
  } else {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .trim();
  }
}
