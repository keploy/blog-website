import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoLogoLinkedin } from "react-icons/io"; // Import LinkedIn icon from react-icons/io
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

const AuthorDescription = ({ authorData, AuthorName, isPost }) => {
  const { basePath } = useRouter();
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
    
      // Extract elements
      const avatarImgElement = tempDiv.querySelector(".pp-author-boxes-avatar img");
      const authorNameElement = tempDiv.querySelector(".pp-author-boxes-name a");
      const linkedinLink = tempDiv.querySelector(
        '.pp-author-boxes-avatar-details a[aria-label="Website"]'
      );
      const authorDescriptionElement = tempDiv.querySelector(
        ".pp-author-boxes-description.multiple-authors-description"
      );
    
      // Switch case for avatarImgElement
      switch (Boolean(avatarImgElement)) {
        case true:
          setAvatarImgSrc(avatarImgElement.getAttribute("src"));
          break;
        default:
          setAvatarImgSrc("n/a");
          break;
      }
    
      // Switch case for authorNameElement
      switch (Boolean(authorNameElement)) {
        case true:
          let NewName = authorNameElement.textContent;
          NewName =
            NewName.charAt(0).toUpperCase() + NewName.slice(1).toLowerCase();
          setAuthorName(NewName);
          break;
        default:
          // No action needed if authorNameElement is null
          break;
      }
    
      // Switch case for authorDescriptionElement
      switch (Boolean(authorDescriptionElement)) {
        case true:
          if (authorDescriptionElement.textContent) {
            switch (authorDescriptionElement.textContent.trim() === "") {
              case true:
                setAuthorDescription("n/a");
                break;
              default:
                setAuthorDescription(authorDescriptionElement.textContent.trim());
                break;
            }
          }
          break;
        default:
          setAuthorDescription("n/a");
          break;
      }
    
      // Switch case for linkedinLink
      switch (Boolean(linkedinLink)) {
        case true:
          setAuthorLinkedIn(linkedinLink.getAttribute("href"));
          break;
        default:
          setAuthorLinkedIn("n/a");
          break;
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
    <>
    <div className="max-w-9xl mx-auto bg-slate-000 shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row md:flex-row lg:flex-row">
      <div className="w-3/5 self-center sm:w-1/4 p-8 flex justify-center items-center">
        {avatarImgSrc !== "n/a" && (
          <Image
            src={/^https?:\/\//i.test(avatarImgSrc) ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatarImgSrc)}` : avatarImgSrc}
            alt="Author Avatar"
            width={200}
            height={200}
            className="object-cover rounded-full sm:h-30 sm:w-30 aspect-square"
            priority
          />
        )}
        {avatarImgSrc === "n/a" && (
          <Image
            src={"/blog/images/author.png"}
            alt="Author Avatar"
            width={200}
            height={200}
            className="object-cover rounded-full sm:h-30 sm:w-30 aspect-square"
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
          {authorDescription !== "n/a" && (
            <div>
              <span className="font-semibold">Author Description:</span>{" "}
              {length > 0 ? (
                <ul className="list-disc ml-5">
                  {newAuthorDescription.map((item, index) => (
                    <li
                      key={index}
                      className={!showMore && index >= 1 ? "hidden" : ""}
                    >
                      {item}.
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-600">n/a</span>
              )}
              {length > 2 && newAuthorDescription.length > 2 && (
                <button
                  onClick={toggleShowMore}
                  className="text-slate-500 hover:underline mt-1"
                >
                  {showMore ? "Show less" : "Show more"}
                </button>
              )}
            </div>
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
          {isPost && (
            <div className="mt-2  flex justify-end">
              <button className="text-slate-100 place-self-end focus:outline-none hover:bg-slate-800 hover:text-slate-50 bg-slate-500 p-2 rounded-lg mt-1">
                <Link href={`/authors/${sanitizeAuthorSlug(AuthorName)}`}>
                View All Posts
                </Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
  );
};

export default AuthorDescription;
