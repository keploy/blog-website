import { useState, useMemo, useCallback } from "react";
import { FaSearch, FaSortAlphaDown, FaSortAlphaDownAlt } from 'react-icons/fa';
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types/post";
import { normalizeName } from "../utils/calculateAuthorPostCounts";
import AuthorCard from "./AuthorCard";

export default function AuthorMapping({
  AuthorArray,
  itemsPerPage = 9, // You can customize the number of items per page
  authorCounts,
}:{
  AuthorArray: Pick<Post, "author" | "ppmaAuthorName" | "ppmaAuthorImage">[],
  itemsPerPage?:number,
  authorCounts?: Record<string, number>
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"" | "asc" | "desc">("");
  const [isSortOpen, setIsSortOpen] = useState(false);

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

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((event) => {
    const raw = event.target.value;
    const value = raw === "desc" ? "desc" : raw === "asc" ? "asc" : "";
    setSortOrder(value);
    setCurrentPage(1);
  }, []);

  const handleSortSelect = useCallback((value) => {
    const normalized = value === "desc" ? "desc" : value === "asc" ? "asc" : "";
    setSortOrder(normalized);
    setCurrentPage(1);
    setIsSortOpen(false);
  }, []);

  return (
    <div className="container mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-8 w-full mb-4 px-4 gap-3 items-center">
        <div className="relative w-full md:col-span-7">
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <div className="relative w-full md:col-span-1 md:w-34 md:justify-self-end">
          <button
            type="button"
            aria-label="Sort authors"
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            onClick={() => setIsSortOpen((o) => !o)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setIsSortOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsSortOpen(false);
            }}
            className="w-full text-left p-4 pl-10 pr-8 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
          >
            <span className="block truncate text-gray-700 font-medium">
              {sortOrder === 'desc' ? 'Z–A' : sortOrder === 'asc' ? 'A–Z' : 'Default'}
            </span>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </button>
          {isSortOpen && (
            <div
              role="listbox"
              aria-label="Sort options"
              tabIndex={-1}
              className="absolute z-20 mt-2 right-0 w-full min-w-[9rem] rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden"
            >
              <button
                role="option"
                aria-selected={sortOrder === ''}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSortSelect('')}
                className={`w-full text-left px-4 py-2.5 text-sm ${sortOrder === '' ? 'bg-gray-50 font-semibold text-gray-800' : 'text-gray-700'} hover:bg-gray-50 focus:bg-gray-50`}
              >
                Default
              </button>
              <button
                role="option"
                aria-selected={sortOrder === 'asc'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSortSelect('asc')}
                className={`w-full text-left px-4 py-2.5 text-sm ${sortOrder === 'asc' ? 'bg-gray-50 font-semibold text-gray-800' : 'text-gray-700'} hover:bg-gray-50 focus:bg-gray-50`}
              >
                A–Z
              </button>
              <button
                role="option"
                aria-selected={sortOrder === 'desc'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSortSelect('desc')}
                className={`w-full text-left px-4 py-2.5 text-sm ${sortOrder === 'desc' ? 'bg-gray-50 font-semibold text-gray-800' : 'text-gray-700'} hover:bg-gray-50 focus:bg-gray-50`}
              >
                Z–A
              </button>
            </div>
          )}
        </div>

      </div>

      {sortedAuthors.length === 0 ? (
        <p className="text-center text-gray-500">No authors found by the name {`"${searchTerm}"`}</p>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 bg-accent-1 mx-4 mt-6 mb-10">
        {visibleAuthors.map((author, index) => {
          const countKey = normalizeName(author.ppmaAuthorName);
          const postCount = (typeof countKey === 'string' && countKey) ? (authorCounts?.[countKey] ?? 0) : 0;
          return (
            <AuthorCard
              key={index}
              name={author.ppmaAuthorName}
              avatarUrl={author.avatarUrl}
              slug={author.slug}
              postCount={postCount}
            />
          );
        })}
      </div>
      <div>
        <hr className="border-b border-gray-200 my-4" />
      </div>
      <div className="flex justify-center mb-4 sm:mt-4 sm:mb-3">
        <button
          className={`mx-1 sm:mx-2 px-4 py-2 rounded-md ${
            currentPage <= 1
              ? "bg-gray-300 text-gray-600"
              : "bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
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
              className={`mx-1 sm:mx-2 px-4 py-3 rounded-md text-sm ${
                pageNumber === currentPage
                  ? "bg-gray-300 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {pageNumber}
            </button>
          )
        )}
        <button
          className={`mx-1 sm:mx-1 px-4 py-2 rounded-md ${
            currentPage >= totalPages
              ? "bg-gray-300 text-gray-600"
              : "bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
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
