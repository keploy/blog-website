import React, { useEffect, useState } from "react";
import { FaEnvelope } from 'react-icons/fa'; // Import Font Awesome icon for email
import { IoLogoLinkedin } from 'react-icons/io'; // Import LinkedIn icon from react-icons/io

const AuthorDescription = ({ authorData }) => {
  const [avatarImgSrc, setAvatarImgSrc] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorLinkedIn, setAuthorLinkedIn] = useState("");
  const [authorDescription, setAuthorDescription] = useState("");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Create a temporary div element to parse the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = authorData;

    // Extract classes and data related to pp-author-boxes-avatar
    const avatarImgElement = tempDiv.querySelector(
      ".pp-author-boxes-avatar img"
    );
    const authorNameElement = tempDiv.querySelector(".pp-author-boxes-name a");
    const emailLink = tempDiv.querySelector(
      '.pp-author-boxes-meta.multiple-authors-links a[aria-label="Email"]'
    );
    const linkedinLink = tempDiv.querySelector(
      '.pp-author-boxes-meta.multiple-authors-links a[aria-label="Website"]'
    );
    const authorDescriptionElement = tempDiv.querySelector(
      ".pp-author-boxes-description.multiple-authors-description"
    );
    if (avatarImgElement) {
      setAvatarImgSrc(avatarImgElement.getAttribute("src"));
    }
    if (authorNameElement) {
      setAuthorName(authorNameElement.textContent);
    }
    if (authorDescriptionElement) {
      setAuthorDescription(authorDescriptionElement.textContent.trim());
    }
    if (emailLink) {
      setAuthorEmail(emailLink.getAttribute("href").replace("mailto:", ""));
    }
    if (linkedinLink) {
      setAuthorLinkedIn(linkedinLink.getAttribute("href"));
    }
  }, [authorData]);

  // Function to toggle show more
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  // Render the extracted information
  return (
    <div className="max-w-9xl mx-auto bg-slate-000 shadow-md rounded-lg overflow-hidden flex">
      <div className="w-1/5 p-8 flex justify-center items-center">
        {avatarImgSrc && (
          <img
            src={avatarImgSrc}
            alt="Author Avatar"
            className="object-cover rounded-full sm:h-30 sm:w-30"
          />
        )}
      </div>

      <div className="w-2/3 p-8">
        <div className="heading1 uppercase tracking-wide text-base text-black font-semibold">
          Author Details
        </div>
        <p className="mt-2 text-gray-600 heading1">
          <span className="font-semibold">Author Name:</span> {authorName}
        </p>
        <p className="heading1 mt-2 text-gray-600">
          <span className="font-semibold">Author Description:</span>{" "}
          {showMore
            ? authorDescription
            : `${authorDescription.split(" ").slice(0, 20).join(" ")}...`}
          {!showMore && authorDescription.split(" ").length > 20 && (
            <button
              onClick={toggleShowMore}
              className="text-slate-500 hover:underline focus:outline-none"
            >
              Show more
            </button>
          )}
          {showMore && (
            <div className="mt-0">
              <br />
              <button
                onClick={toggleShowMore}
                className="heading1 text-slate-500 hover:underline focus:outline-none"
              >
                Show less
              </button>
            </div>
          )}
        </p>
        {authorEmail && (
          <p className="hedaing1 mt-2 text-gray-600">
            <FaEnvelope className="h-5 w-5 inline mr-2" /> {/* Replace SVG with FaEnvelope */}
            <a
              href={`mailto:${authorEmail}`}
              className="heading1 text-slate-500 hover:underline"
            >
              Email
            </a>
          </p>
        )}
        {authorLinkedIn && (
          <p className="mt-2 text-gray-600">
            <IoLogoLinkedin className="h-5 w-5 inline mr-2" /> {/* Replace SVG with IoLogoLinkedin */}
            <a
              href={authorLinkedIn}
              className="heading1 text-slate-500 hover:underline"
            >
              LinkedIn
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthorDescription;
