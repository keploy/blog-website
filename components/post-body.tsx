import { useState, useEffect, useRef } from "react";
import TOC from "./TableContents";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
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
import ReviewingAuthor from "./ReviewingAuthor";
import WaitlistBanner from "./waitlistBanner";
import { Post } from "../types/post";
import JsonDiffViewer from "./json-diff-viewer";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";
import AdSlot from "./Adslot";
export default function PostBody({
  content,
  authorName,
  ReviewAuthorDetails,
  slug,
}: {
  content: Post["content"];
  authorName: Post["ppmaAuthorName"];
  ReviewAuthorDetails: {
    edges: {
      node: { name: string; avatar: { url: string }; description: string };
    }[];
  };
  slug: string | string[] | undefined;
}) {
  const [tocItems, setTocItems] = useState([]);
  const [copySuccessList, setCopySuccessList] = useState([]);
  const [headingCopySuccessList, setHeadingCopySuccessList] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [replacedContent, setReplacedContent] = useState(content);
  const [isList, setIsList] = useState(false);
  const [isUserEnteredURL, setIsUserEnteredURL] = useState(false);
  const sameAuthor =
    authorName.split(" ")[0].toLowerCase() ===
    ReviewAuthorDetails.edges[0].node.name.split(" ")[0].toLowerCase();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize(); // Initial screen size check
    window.addEventListener("resize", checkScreenSize);

    // Separate effect for initial content replacement
    let initialReplacedContent = content.replace(
      /<div class="post-toc-header">[\s\S]*?<\/div>/gm,
      ""
    );

    initialReplacedContent = initialReplacedContent.replace(
      /(<ul class="pp-multiple-authors-boxes-ul[\s\S]*?<\/ul>)/gm,
      '<div id="author-description-placeholder"></div>'
    );

    initialReplacedContent = initialReplacedContent.replace(
      /<h2 class="widget-title box-header-title">[\s\S]*?<\/h2>/gm,
      ""
    );

    setReplacedContent(initialReplacedContent);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [content]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const headings = Array.from(
        document
          .getElementById("post-body-check")
          .querySelectorAll("h1, h2, h3, h4")
      );

      const tocItems = headings.map((heading) => {
        const id = `${heading.textContent}`;
        heading.setAttribute("id", sanitizeStringForURL(id, true));

        return {
          id,
          title: heading.textContent,
          type: heading.tagName.toLowerCase(),
        };
      });

      const index = tocItems.findIndex((item) => item.title === "More Stories");
      if (index !== -1) {
        tocItems.splice(index + 1);
      }
      setTocItems(tocItems);
      setCopySuccessList(Array(tocItems.length).fill(false));
      setHeadingCopySuccessList(Array(tocItems.length).fill(false));
    }, 500);

    return () => clearTimeout(timeout);
  }, [content]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = decodeURIComponent(hash.slice(1));
        const el = document.getElementById(targetId);
        if (el) {
          setIsUserEnteredURL(true);

          const yOffset = -80;
          const y =
            el.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [tocItems]);

  useEffect(() => {
    const scrollObserverOptions = {
      root: null,
      rootMargin: "0px 0px -80% 0px",
      threshold: 0,
    };

    const scrollObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");

        if (id) {
          window.history.replaceState(null, "", `#${id}`);
        }
      }
    }, scrollObserverOptions);

    if (!isUserEnteredURL) {
      tocItems.forEach(({ id }) => {
        const ele = document.getElementById(sanitizeStringForURL(id, true));
        if (ele) {
          scrollObserver.observe(ele);
        }
      });
      return () => scrollObserver.disconnect();
    }
  }, [tocItems]);

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
        }, 2000);
      })
      .catch(() => {
        const updatedList = [...copySuccessList];
        updatedList[index] = false;
        setCopySuccessList(updatedList);
      });
  };

  const handleHeadingCopyClick = (id: string, index: number) => {
    const url = sanitizeStringForURL(id, true);
    const copyUrl = `${window.location.origin}${window.location.pathname}#${url}`;
    navigator.clipboard
      .writeText(copyUrl)
      .then(() => {
        const updatedList = [...headingCopySuccessList];
        updatedList[index] = true;
        setHeadingCopySuccessList(updatedList);
        setTimeout(() => {
          updatedList[index] = false;
          setHeadingCopySuccessList([...updatedList]);
        }, 2000);
      })
      .catch(() => {
        console.error("Failed to copy the URL.");
      });
  };

  useEffect(() => {
    const headings = Array.from(
      document.getElementById("post-body-check").querySelectorAll("h1, h2")
    );
    headings.forEach((heading, index) => {
      if (heading.querySelector(".copy-url-button")) return;

      const button = document.createElement("button");
      button.className = "copy-url-button";
      button.style.marginLeft = "8px";
      button.style.cursor = "pointer";
      button.style.border = "none";
      button.style.background = "none";
      button.style.padding = "0";
      button.style.fontSize = "1rem";
      button.style.color = "#555";
      button.textContent = headingCopySuccessList[index] ? "✔️" : "#"; // // Copy Button
      button.addEventListener("click", () => {
        handleHeadingCopyClick(heading.innerHTML, index);

        const yOffset = -80;
        const y =
          document.getElementById(heading.id).getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
        window.history.replaceState(null, "", `#${heading.id}`);
      });

      // Dark mode styling for copy button
      if (document.documentElement.classList.contains("dark")) {
        button.style.color = "#d1d5db"; // gray-300 equivalent
      }

      heading.appendChild(button);
    });
  }, [tocItems, headingCopySuccessList]);

  useEffect(() => {
    const headings = Array.from(
      document
        .getElementById("post-body-check")
        .querySelectorAll("h1, h2, h3, h4")
    );
    headings.forEach((heading, index) => {
      const button = heading.querySelector(
        ".copy-url-button"
      ) as HTMLButtonElement;
      if (button) {
        // button.textContent = headingCopySuccessList[index] ? '✔️' : '🔗'; // // Copy Button
        const isDark = document.documentElement.classList.contains("dark");
        button.style.color = headingCopySuccessList[index]
          ? "#28a745"
          : isDark
          ? "#d1d5db"
          : "#555";
      }
    });
  }, [headingCopySuccessList]);

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
          const code = codeMatch ? decodeHtmlEntities(codeMatch[1]) : "";
          const language =
            codeMatch && codeMatch[0].includes("language-")
              ? codeMatch[0].split("language-")[1].split('"')[0]
              : "bash";
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
                return javascript();
            }
          };
          return (
            <div key={index} className="relative mx-auto mb-4">
              <CodeMirror
                value={code}
                extensions={[getLanguageExtension(language)]}
                theme={dracula}
                basicSetup={{
                  lineNumbers: false,
                  highlightActiveLine: true,
                  tabSize: 4,
                }}
                editable={false}
                readOnly={true}
                indentWithTab={true}
              />
              <button
                onClick={() => handleCopyClick(code, index)}
                className="absolute top-0 right-0 px-2 py-1 mr-2 text-white bg-gray-700 rounded hover:bg-gray-600"
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

  const oldJson = {
    name: "John",
    age: 25,
    location: "New York",
    hobbies: ["Reading", "Cycling", "Hiking"],
  };

  const newJson = {
    name: "John",
    age: 26,
    location: "San Francisco",
    hobbies: ["Reading", "Traveling"],
    job: "Software Developer",
  };

  return (
    <div
      className={`flex flex-col ${
        isList ? "items-center" : "items-center lg:items-start lg:flex-row"
      } `}
    >
      <div
        className={`flex items-center justify-center w-full md:w-[80%] lg:w-1/4 top-20 lg:block ${
          isList ? "" : "lg:sticky"
        }`}
      >
        <TOC headings={tocItems} isList={isList} setIsList={setIsList} />
      </div>
      <div
        className={`w-full p-4 ${isList ? "ml-10" : ""}  md:w-4/5 lg:w-3/5`}
        id="post-body-check"
      >
        {slug === "how-to-compare-two-json-files" && <JsonDiffViewer />}
        <div className="prose lg:prose-xl post-content-wrapper">
          {renderCodeBlocks()}
        </div>
        <hr className="border-gray-300 dark:border-gray-600 mt-10 mb-20" />
        <div></div>

        <h1 className="text-2xl font-medium dark:text-white">Authored By:</h1>
        <div className="my-5">
          <AuthorDescription
            authorData={content}
            AuthorName={authorName}
            isPost={true}
          />
        </div>
        {!sameAuthor && (
          <div className="my-20">
            <h1 className="text-2xl font-medium dark:text-white">
              Reviewed By:
            </h1>
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

      <aside className="w-full lg:w-1/5 lg:ml-10 p-4 flex flex-col gap-6 sticky  lg:top-20">
        {/* 1. Waitlist banner (always shown) */}
        <div className="flex justify-center">
          <WaitlistBanner />
        </div>

        {/* 2. Ad slot (hidden on <lg) */}
        <div className="hidden lg:flex justify-center rounded-xl p-4">
          <AdSlot slotId="3356716061" className="w-full h-60" />
        </div>
      </aside>
    </div>
  );
}
