import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types/post";

export default function AuthorMapping({
  AuthorArray,
  itemsPerPage = 8, // You can customize the number of items per page
}:{
  AuthorArray: Pick<Post, "author" | "ppmaAuthorName" | "ppmaAuthorImage">[],
  itemsPerPage?:number
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const authorData = [];
  const ppmaAuthorNameArray = [];

  AuthorArray.forEach((item) => {
    const ppmaAuthorName = formatAuthorName(item.ppmaAuthorName);
    const avatarUrl = item.ppmaAuthorImage;
    const slug = item.ppmaAuthorName;
    const publishingAuthor = formatAuthorName(item.author.node.name);
    if (Array.isArray(ppmaAuthorName)) {
      return;
    }

    if (!ppmaAuthorNameArray.includes(ppmaAuthorName)) {
      ppmaAuthorNameArray.push(ppmaAuthorName);
    } else {
      return;
    }
    authorData.push({
      publishingAuthor,
      ppmaAuthorName,
      avatarUrl,
      slug,
    });
  });
  const totalPages = Math.ceil(authorData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleAuthors = authorData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
    <div className="container mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-accent-1 m-4">
        {visibleAuthors.map((author, index) => (
          <Link href={`/authors/${author.slug}`} key={index}>
            <div className="p-5 rounded-lg mt-5 mb-5 flex flex-col justify-between  border border-transparent transform transition-colors  hover:border-accent-2 hover:dark:bg-neutral-400/30 hover:scale-105 cursor-pointer">
              <div className="flex items-center mb-3 sm:mb-0">
                {author.avatarUrl != "imag1" &&  author.avatarUrl != "image" ? (
                  <Image
                    src={author.avatarUrl}
                    alt={`${author.ppmaAuthorName}'s Avatar`}
                    className="w-12 h-12 rounded-full mr-3 sm:mr-2 "
                    height={48}
                    width={48}
                  />
                ) : (
                  <Image
                    src={`/blog/images/author.png`}
                    alt={`${author.ppmaAuthorName}'s Avatar`}
                    className="w-12 h-12 rounded-full mr-3 sm:mr-2 "
                    height={48}
                    width={48}
                  />
                )}
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-2xl heading1 md:text-xl font-bold tracking-tighter leading-tight">
                  {author.ppmaAuthorName}
                </h2>
              </div>
            </div>
          </Link>
        ))}
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
          disabled={currentPage < 1}
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
