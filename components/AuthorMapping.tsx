import { useState } from "react";
import Link from "next/link";

export default function AuthorMapping({
  AuthorArray,
  itemsPerPage = 5 // You can customize the number of items per page
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const authorData = [];
  const ppmaAuthorNameArray = [];

  AuthorArray.forEach((item) => {
    const ppmaAuthorName = formatAuthorName(item.ppmaAuthorName);
    const avatarUrl = item.author.node.avatar.url;
    const slug = item.ppmaAuthorName;

    if (Array.isArray(ppmaAuthorName)) {
      return;
    }

    if (!ppmaAuthorNameArray.includes(ppmaAuthorName)) {
      ppmaAuthorNameArray.push(ppmaAuthorName);
    } else {
      return;
    }

    authorData.push({
      ppmaAuthorName,
      avatarUrl,
      slug
    });
  });

  const totalPages = Math.ceil(authorData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleAuthors = authorData.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div>
      {visibleAuthors.map((author, index) => (
        <div
          key={index}
          className="p-5 rounded-lg ml-2 md:ml-4 lg:ml-8 xl:ml-12 mt-5 mb-5 flex flex-col sm:flex-row justify-between hover:shadow-md hover:shadow-white-600"
        >
          <div className="flex items-center mb-3 sm:mb-0">
            <img
              src={author.avatarUrl}
              alt={`${author.ppmaAuthorName}'s Avatar`}
              className="w-15 h-15 rounded-full mr-3 sm:mr-6"
            />
            <h2 className="text-xl font-medium  text-slate-300">{author.ppmaAuthorName}</h2>
          </div>
          <Link href={`/authors/${author.slug}`}>
            <button className="bg-gradient-to-r from-blue-200 to-purple-100 text-purple px-4 py-3 rounded-2xl shadow-md mt-2 sm:mt-0 hover:bg-gradient-to-r hover:from-purple-200 hover:to-blue-100 hover:ease-in duration-500 text-sm text-blue-800">
              View Posts
            </button>
          </Link>
        </div>
      ))}
      <div>
        <hr className="border-b border-gray-700 my-4" />
      </div>

      <div className="flex justify-center mt-4 sm:mt-8">
        <button
          className={`mx-1 sm:mx-2 px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-300 hover:text-gray-800`}
          onClick={handlePrevPage}
        >
          Back
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`mx-1 sm:mx-2 px-4 py-3 rounded-md text-sm ${
              pageNumber === currentPage ? "bg-gray-800 text-white" : "bg-gray-300 text-gray-800"
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          className={`mx-1 sm:mx-2 px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-300 hover:text-gray-800`}
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatAuthorName(name) {
  if (name.includes(',')) {
    const authors = name
      .split(',')
      .map((author) =>
        author
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .trim()
      );
    return authors;
  } else {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }
}
