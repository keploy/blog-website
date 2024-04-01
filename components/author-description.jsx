import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoLogoLinkedin } from "react-icons/io"; // Import LinkedIn icon from react-icons/io

const AuthorDescription = ({ authorData, AuthorName, isPost }) => {
  const [avatarImgSrc, setAvatarImgSrc] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorLinkedIn, setAuthorLinkedIn] = useState("");
  const [authorDescription, setAuthorDescription] = useState("");
  const [showMore, setShowMore] = useState(false);
  const AuthorNameNew =
    AuthorName[0].toUpperCase() + AuthorName.slice(1).toLowerCase();

  useEffect(() => {
    // Create a temporary div element to parse the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = authorData;

    // Extract classes and data related to pp-author-boxes-avatar
    const avatarImgElement = tempDiv.querySelector(
      ".pp-author-boxes-avatar img"
    );
    const authorNameElement = tempDiv.querySelector(".pp-author-boxes-name a");
    const linkedinLink = tempDiv.querySelector(
      '.pp-author-boxes-meta.multiple-authors-links a[aria-label="Website"]'
    );
    const authorDescriptionElement = tempDiv.querySelector(
      ".pp-author-boxes-description.multiple-authors-description"
    );
    if (avatarImgElement) {
      setAvatarImgSrc(avatarImgElement.getAttribute("src"));
    } else {
      setAvatarImgSrc("n/a");
    }
    if (authorNameElement) {
      var NewName = authorNameElement.textContent;
      NewName =
        NewName.charAt(0).toUpperCase() + NewName.slice(1).toLowerCase();
      setAuthorName(NewName);
    }
    if (authorDescriptionElement.textContent.trim().length > 0) {
      setAuthorDescription(authorDescriptionElement.textContent.trim());
    } else {
      setAuthorDescription("n/a");
    }
    if (linkedinLink) {
      setAuthorLinkedIn(linkedinLink.getAttribute("href"));
    } else {
      setAuthorLinkedIn("n/a");
    }
  }, [authorData]);

  // Function to toggle show more
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const FormatDescription = (description) => {
    const des = description.split(". ");
    const len = des.length;
    return {
      newAuthorDescription: des,
      length: len,
    };
  };

  const { newAuthorDescription, length } = FormatDescription(authorDescription);
  // Render the extracted information
  return (
    <div className="max-w-9xl mx-auto bg-slate-000 shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row md:flex-row lg:flex-row">
      <div className="w-3/5 self-center sm:w-1/4 p-8 flex justify-center items-center">
        {avatarImgSrc !== "n/a" && (
          <Image
            src={avatarImgSrc}
            alt="Author Avatar"
            width={200}
            height={200}
            className="object-cover rounded-full sm:h-30 sm:w-30"
            priority
          />
        )}
        {avatarImgSrc === "n/a" && (
          <Image
            src={"/blog/images/author.png"}
            alt="Author Avatar"
            width={200}
            height={200}
            className="object-cover rounded-full sm:h-30 sm:w-30"
            priority
          />
        )}
      </div>

      <div className="w-full sm:w-2/3 p-8">
        <div className="heading1 uppercase tracking-wide text-base text-black font-semibold">
          Author Details
        </div>
        <div className="list-disc mt-2 text-gray-600 heading1">
          <div className="mb-2">
            <span className="font-semibold">Author Name:</span>{" "}
            {authorName.length > 0 ? authorName : AuthorNameNew}
          </div>
          <div>
            <span className="font-semibold">Author Description:</span>{" "}
            {length > 0 ? (
              newAuthorDescription.map((item, index) => (
                <li
                  key={index}
                  className={!showMore && index >= 1 ? " ml-5 hidden" : "ml-5"}
                >
                  {item}
                </li>
              ))
            ) : (
              <span className="text-gray-600">n/a</span>
            )}
            {!showMore && length > 2 && newAuthorDescription.length && (
              <button
                onClick={toggleShowMore}
                className=" text-slate-500 hover:underline mt-1"
              >
                Show more
              </button>
            )}
            {showMore && (
              <button
                onClick={toggleShowMore}
                className="text-slate-400 focus:outline-none hover:underline  mt-1"
              >
                Show less
              </button>
            )}
          </div>
          {authorLinkedIn !== "n/a" && (
            <div className="mt-2">
              <IoLogoLinkedin className="h-5 w-5 inline mr-1" />
              <Link
                href={authorLinkedIn}
                className="heading1 text-slate-500 hover:underline"
              >
                LinkedIn
              </Link>
            </div>
          )}
          {authorLinkedIn === "n/a" && (
            <div className="mt-2">
              <IoLogoLinkedin className="h-5 w-5 inline mr-2" />
              <span className="text-gray-600">n/a</span>
            </div>
          )}
          {isPost && (
            <div className="mt-2  flex justify-end">
              <button className="text-slate-100 place-self-end focus:outline-none hover:bg-slate-800 hover:text-slate-50 bg-slate-500 p-2 rounded-lg mt-1">
                <Link href={`/authors/${AuthorName}`}>
                View All Posts
                </Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorDescription;
