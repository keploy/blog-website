import { useState, useEffect } from "react";
import TOC from "./TableContents"; // Importing TOC component
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5"; // Importing icons
import styles from "./post-body.module.css";

export default function PostBody({ content }) {
  const [tocItems, setTocItems] = useState([]);
  const [copySuccessList, setCopySuccessList] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

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
    // change style of view all post link
    const viewAllPost: HTMLAnchorElement = Object.assign(
      [],
      document.querySelectorAll("a")
    ).filter((v) => v.innerText == "View all posts")[0];
    viewAllPost.style.setProperty("background-color", "orange", "important");
    viewAllPost.style.setProperty("color", "black", "important");
    viewAllPost.style.setProperty("text-decoration-line", "none", "important");
    viewAllPost.style.setProperty("padding", "0.5rem 1rem", "important");
    viewAllPost.style.setProperty("border-radius", "0.5rem", "important");

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 1100);
    };

    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [content]);

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
    const codeBlocks = content.match(/<pre[\s\S]*?<\/pre>/gm);

    if (!codeBlocks) {
      return (
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: content }}
          suppressHydrationWarning
        />
      );
    }

    return content.split(/(<pre[\s\S]*?<\/pre>)/gm).map((part, index) => {
      if (/<pre[\s\S]*?<\/pre>/.test(part)) {
        const codeMatch = part.match(/<code[\s\S]*?>([\s\S]*?)<\/code>/);
        const code = codeMatch ? codeMatch[1] : ""; // Extract code if available
        const language =
          codeMatch && codeMatch[0].includes("language-")
            ? codeMatch[0].split("language-")[1].split('"')[0]
            : "bash"; // Extract language if available, otherwise default to 'bash'
        return (
          <div key={index} className="relative mb-4">
            <pre
              dangerouslySetInnerHTML={{ __html: part }}
              className={`language-${language}`}
              suppressHydrationWarning
            />
            <button
              onClick={() => handleCopyClick(code, index)}
              className="absolute top-0 right-0 mt-2 mr-2 px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
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
    <div className="flex flex-col lg:flex-row">
      {/* Table of Contents */}
      <div
        className={`w-full lg:w-1/4 mr-5 top-20 ${
          isSmallScreen ? "flex items-center justify-center" : "sticky"
        }`}
      >
        <TOC headings={tocItems} />
      </div>
      {/* Content */}
      <div className="w-full lg:w-3/5 ml-10 p-4">
        <div className="prose lg:prose-xl">{renderCodeBlocks()}</div>
      </div>
    </div>
  );
}
