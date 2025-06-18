import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types/post";

export default function AuthorMapping({
  AuthorArray,
  itemsPerPage = 8,
}: {
  AuthorArray: Pick<Post, "author" | "ppmaAuthorName" | "ppmaAuthorImage">[];
  itemsPerPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const authorData: {
    publishingAuthor: string;
    ppmaAuthorName: string;
    avatarUrl: string;
    slug: string;
  }[] = [];
  const seen: string[] = [];

  AuthorArray.forEach((item) => {
    const formattedNames = splitAndFormat(item.ppmaAuthorName);
    const publishingName = formatSingleName(item.author.node.name);
    const avatarUrl = item.ppmaAuthorImage;

    formattedNames.forEach((ppmaAuthorName) => {
      if (seen.includes(ppmaAuthorName)) return;
      seen.push(ppmaAuthorName);

      authorData.push({
        publishingAuthor: publishingName,
        ppmaAuthorName,
        avatarUrl,
        slug: ppmaAuthorName.replace(/\s+/g, "-").toLowerCase(),
      });
    });
  });

  const totalPages = Math.ceil(authorData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const visibleAuthors = authorData.slice(start, start + itemsPerPage);

  return (
    <div className="container mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-accent-1 m-4">
        {visibleAuthors.map((author, i) => (
          <Link href={`/authors/${author.slug}`} key={i}>
            <div className="p-5 rounded-lg mt-5 mb-5 flex flex-col justify-between border hover:scale-105 cursor-pointer">
              <div className="flex items-center mb-3 sm:mb-0">
                <Image
                  src={
                    author.avatarUrl && author.avatarUrl !== "image"
                      ? author.avatarUrl
                      : "/blog/images/author.png"
                  }
                  alt={`${author.ppmaAuthorName}'s Avatar`}
                  height={48}
                  width={48}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <h2 className="text-2xl font-bold">
                  {author.ppmaAuthorName}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <hr className="border-gray-200 my-4" />

      <div className="flex justify-center mb-4 sm:mt-4 sm:mb-3">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
        >
          Back
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={i + 1 === currentPage ? "font-bold" : ""}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Formats a single author name: capitalizes each word.
 */
function formatSingleName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Splits comma-separated author names and formats each one.
 */
function splitAndFormat(name: string): string[] {
  return name
    .split(",")
    .map((n) => formatSingleName(n));
}
