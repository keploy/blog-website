import { useState, useEffect } from "react";
import TOC from "./TableContents"; // Importing TOC component
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5"; // Importing icons
import styles from "./post-body.module.css";
import dynamic from "next/dynamic";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { go } from "@codemirror/lang-go";
import { dracula } from "@uiw/codemirror-theme-dracula";

const AuthorDescription = dynamic(() => import("./author-description"), {
  ssr: false,
});
import SubscribeNewsletter from "./subscribe-newsletter";
import ReviewingAuthor from "./ReviewingAuthor";
import Link from "next/link";
import WaitlistBanner from "./waitlistBanner";
import { Post } from "../types/post";

export default function PostBody({
  content,
  authorName,
  ReviewAuthorDetails,
}: {
  content: Post["content"];
  authorName: Post["ppmaAuthorName"];
  ReviewAuthorDetails: { edges: { node: { name: string; avatar: { url: string }; description: string } }[] };
}) {
  const [tocItems, setTocItems] = useState([]);
  const [copySuccessList, setCopySuccessList] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [replacedContent, setReplacedContent] = useState(content); // State to hold replaced content
  const [isList, setIsList] = useState(false);

  const sameAuthor =
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
    let replacedContentWithAuthorDescription = replacedContent.replace(
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

    const decodeHtmlEntities = (str: string): string => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = str;
      return textarea.value;
    };
  
    return replacedContent
      .split(/(<pre[\s\S]*?<\/pre>)/gm)
      .map((part, index) => {
        if (/<pre[\s\S]*?<\/pre>/.test(part)) {
          const codeMatch = part.match(/<code[\s\S]*?>([\s\S]*?)<\/code>/);
          const code = codeMatch ? decodeHtmlEntities(codeMatch[1]) : ""; // Extract code if available
          const language =
            codeMatch && codeMatch[0].includes("language-")
              ? codeMatch[0].split("language-")[1].split('"')[0]
              : "bash"; // Extract language if available, otherwise default to 'bash'
          const getLanguageExtension = (language: string) => {
            switch (language) {
              case "javascript":
              case "js":
                return javascript();
              case "python":
                return python();
              case "markdown":
                return markdown();
              case "go":
                return go();
              default:
                return javascript(); // Default to JavaScript if language not recognized
            }
          };
          return (
            <div key={index} className="relative mx-auto mb-4">
              <CodeMirror
                value={code}
                extensions={[getLanguageExtension(language)]}
                theme={dracula}
                basicSetup={{
                  lineNumbers:false,
                  highlightActiveLine:true,
                  tabSize:4
                }}
                editable={false}
                readOnly={true}
                indentWithTab={true}
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
      className={`flex flex-col ${
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
        <hr className="border-gray-300 mt-10 mb-20" />

        <h1 className="text-2xl font-medium">Authored By:</h1>
        <div className="my-5">
          <AuthorDescription
            authorData={content}
            AuthorName={authorName}
            isPost={true}
          />
        </div>
        {!sameAuthor && (
          <div className="my-20">
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
      {/* Waitlist */}
      <div className="w-full lg:w-1/5 lg:ml-10 p-4 h-auto flex flex-col justify-center sticky lg:top-20">
        <WaitlistBanner />
      </div>
    </div>
  );
}
