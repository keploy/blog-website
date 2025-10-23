import { useState, useMemo, useCallback } from "react";
import { FaSearch, FaSortAlphaDown, FaSortAlphaDownAlt } from 'react-icons/fa';
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types/post";
import { normalizeName } from "../utils/calculateAuthorPostCounts";
import AuthorCard from "./AuthorCard";
import { getAuthorInfoByName } from "../lib/authorData";

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
      <div className="grid grid-cols-1 md:grid-cols-8 w-full mb-8 px-4 gap-3 items-center">
        <div className="relative w-full md:col-span-7">
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-4 pl-10 rounded-full border-2 border-white/70 bg-white/25 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_8px_30px_rgba(31,38,135,0.07)] focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300/50 text-sm hover:shadow-[0_12px_40px_rgba(31,38,135,0.12)] hover:bg-white/35 transition-all duration-300 placeholder-gray-600 text-gray-800"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
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
            className="w-full text-left p-4 pl-8 pr-8 rounded-full border-2 border-white/70 bg-white/25 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_8px_30px_rgba(31,38,135,0.07)] focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300/50 text-sm hover:shadow-[0_12px_40px_rgba(31,38,135,0.12)] hover:bg-white/35 transition-all duration-300 text-gray-800"
          >
            <span className="block truncate text-gray-700 font-medium">
              {sortOrder === 'desc' ? 'Z–A' : sortOrder === 'asc' ? 'A–Z' : 'Default'}
            </span>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-gray-700">▾</span>
          </button>
          {isSortOpen && (
            <div
              role="listbox"
              aria-label="Sort options"
              tabIndex={-1}
              className="absolute z-20 mt-2 right-0 w-full min-w-[9rem] rounded-xl bg-white/30 backdrop-blur-2xl shadow-2xl ring-2 ring-white/30 overflow-hidden border-2 border-white/60"
            >
              <button
                role="option"
                aria-selected={sortOrder === ''}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSortSelect('')}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-300 ${sortOrder === '' ? 'bg-white/30 font-semibold text-gray-800' : 'text-gray-700'} hover:bg-white/30 focus:bg-white/30`}
              >
                Default
              </button>
              <button
                role="option"
                aria-selected={sortOrder === 'asc'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSortSelect('asc')}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-300 ${sortOrder === 'asc' ? 'bg-white/30 font-semibold text-gray-800' : 'text-gray-700'} hover:bg-white/30 focus:bg-white/30`}
              >
                A–Z
              </button>
              <button
                role="option"
                aria-selected={sortOrder === 'desc'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSortSelect('desc')}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-300 ${sortOrder === 'desc' ? 'bg-white/30 font-semibold text-gray-800' : 'text-gray-700'} hover:bg-white/30 focus:bg-white/30`}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mx-4 mt-6 mb-10">
        {visibleAuthors.map((author, index) => {
          const countKey = normalizeName(author.ppmaAuthorName);
          const postCount = (typeof countKey === 'string' && countKey) ? (authorCounts?.[countKey] ?? 0) : 0;
          const info = getAuthorInfoByName(author.ppmaAuthorName);
          return (
            <AuthorCard
              key={index}
              name={author.ppmaAuthorName}
              avatarUrl={info?.image || author.avatarUrl}
              slug={author.slug}
              postCount={postCount}
              bio={info?.description}
              linkedin={info?.linkedin}
            />
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
