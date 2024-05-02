import { useState, useEffect } from "react";
import TOC from "./TableContents"; // Importing TOC component
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5"; // Importing icons
import styles from "./post-body.module.css";
import dynamic from "next/dynamic";

const AuthorDescription = dynamic(() => import("./author-description"), {
  ssr: false,
});
import SubscribeNewsletter from "./subscribe-newsletter";
import ReviewingAuthor from "./ReviewingAuthor";
import Link from "next/link";
export default function PostBody({ content, authorName, ReviewAuthorDetails }) {
  const [tocItems, setTocItems] = useState([]);
  const [copySuccessList, setCopySuccessList] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [replacedContent, setReplacedContent] = useState(content); // State to hold replaced content
  const [isList, setIsList] = useState(false);
  var sameAuthor =
    authorName.split(" ")[0].toLowerCase() ===
    ReviewAuthorDetails.edges[0].node.name.split(" ")[0].toLowerCase();

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4"));
    const tocItems = headings.map((heading, index) => {
      const id = `heading-${index}`;
      heading.setAttribute("id", id);
      return {
        id,
        title: heading.textContent,
        type: heading.tagName.toLowerCase(),
      };
    });
    tocItems.shift();
    const index = tocItems.findIndex((item) => item.title === "More Stories");
    if (index !== -1) {
      tocItems.splice(index + 1); // Remove elements starting from index + 1 to the end
    }
    setTocItems(tocItems);
    setCopySuccessList(Array(tocItems.length).fill(false));

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    // Remove the content inside the specified class
    var replacedContentWithAuthorDescription = replacedContent.replace(
      /<div class="post-toc-header">[\s\S]*?<\/div>/gm,
      "" // Replace with an empty string to remove the content
    );

    // Replace the content inside the specified class with a placeholder for AuthorDescription
    replacedContentWithAuthorDescription =
      replacedContentWithAuthorDescription.replace(
        /(<ul class="pp-multiple-authors-boxes-ul[\s\S]*?<\/ul>)/gm,
        '<div id="author-description-placeholder"></div>' // Placeholder for AuthorDescription
      );

    replacedContentWithAuthorDescription =
      replacedContentWithAuthorDescription.replace(
        /<h2 class="widget-title box-header-title">[\s\S]*?<\/h2>/gm,
        "" // Replace with an empty string to remove the content
      );
    // Set the updated replaced content
    setReplacedContent(replacedContentWithAuthorDescription);

    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [replacedContent]);

  const handleCopyClick = (code, index) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        const updatedList = [...copySuccessList];
        updatedList[index] = true;
        setCopySuccessList(updatedList);
        setTimeout(() => {
          updatedList[index] = false;
          setCopySuccessList(updatedList);
        }, 2000); // Reset copy success state after 2 seconds
      })
      .catch(() => {
        const updatedList = [...copySuccessList];
        updatedList[index] = false;
        setCopySuccessList(updatedList);
      });
  };

  const renderCodeBlocks = () => {
    const codeBlocks = replacedContent.match(/<pre[\s\S]*?<\/pre>/gm);

    if (!codeBlocks) {
      return (
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: replacedContent }}
          suppressHydrationWarning
        />
      );
    }

    return replacedContent
      .split(/(<pre[\s\S]*?<\/pre>)/gm)
      .map((part, index) => {
        if (/<pre[\s\S]*?<\/pre>/.test(part)) {
          const codeMatch = part.match(/<code[\s\S]*?>([\s\S]*?)<\/code>/);
          const code = codeMatch ? codeMatch[1] : ""; // Extract code if available
          const language =
            codeMatch && codeMatch[0].includes("language-")
              ? codeMatch[0].split("language-")[1].split('"')[0]
              : "bash"; // Extract language if available, otherwise default to 'bash'
          return (
            <div key={index} className="relative mx-auto mb-4">
              <pre
                dangerouslySetInnerHTML={{ __html: part }}
                className={`language-${language}`}
                suppressHydrationWarning
              />
              <button
                onClick={() => handleCopyClick(code, index)}
                className="absolute top-0 right-0 px-2 py-1 mt-2 mr-2 text-white bg-gray-700 rounded hover:bg-gray-600"
              >
                {copySuccessList[index] ? (
                  <IoCheckmarkOutline />
                ) : (
                  <IoCopyOutline />
                )}
              </button>
              <button
                disabled
                className="absolute flex flex-col px-2 text-orange-400 capitalize border-2 border-b-0 border-gray-400 rounded rounded-b-none top-1 left-1 gap-y-1"
              >
                {language}
                <span className="h-[1px] w-full border rounded-full border-gray-400"></span>
              </button>
            </div>
          );
        }
        return (
          <div
            key={index}
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: part }}
            suppressHydrationWarning
          />
        );
      });
  };

  return (
    <div
      className={`flex flex-col  ${
        isList ? "items-center" : "items-center lg:items-start lg:flex-row"
      } `}
    >
      {/* Table of Contents */}
      <div
        className={`flex items-center justify-center w-full mr-5 md:w-2/4 lg:w-1/4 top-20 lg:block ${
          isList ? "" : "lg:sticky"
        }`}
      >
        <TOC headings={tocItems} isList={isList} setIsList={setIsList} />
      </div>
      {/* Content */}
      <div className={`w-full p-4 ${isList ? "ml-10" : ""}  md:w-4/5 lg:w-3/5`}>
        <div className="prose lg:prose-xl">{renderCodeBlocks()}</div>
        <hr className=" border-gray-300 mt-10 mb-20" />

        <h1 className="text-2xl font-medium">Authored By:</h1>
        <div className="my-5">
          <AuthorDescription
            authorData={content}
            AuthorName={authorName}
            isPost={true}
          />
        </div>
        {!sameAuthor && (
          <div className=" my-20">
            <h1 className="text-2xl font-medium">Reviewed By:</h1>
            <div>
              <ReviewingAuthor
                name={ReviewAuthorDetails.edges[0].node.name}
                avatar={ReviewAuthorDetails.edges[0].node.avatar.url}
                description={ReviewAuthorDetails.edges[0].node.description}
              />
            </div>
          </div>
        )}
      </div>
      {/* Subscription */}
      <div className="sticky flex flex-col justify-center w-full h-auto p-4 lg:w-1/5 lg:ml-10 lg:top-20 ">
        <SubscribeNewsletter isSmallScreen={isSmallScreen} />
      </div>
    </div>
  );
}
