import { useState, useEffect, useRef } from "react";
import TOC from "./TableContents";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import styles from "./post-body.module.css";
import dynamic from "next/dynamic";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";
import { Post } from "../types/post";

/* ── Heavy components: lazy-loaded to reduce initial JS bundle ── */
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <div className="bg-[#1e1e2e] rounded-lg p-4 mb-6 min-h-[60px]" />,
});

const AuthorCard = dynamic(() => import("./AuthorCard"), {
  ssr: false,
});
const BlogSidebar = dynamic(() => import("./BlogSidebar"), {
  ssr: false,
});
const JsonDiffViewer = dynamic(() => import("./json-diff-viewer"), {
  ssr: false,
});
/* Language extensions and theme are static imports within PostBody, but
   PostBody itself is dynamically imported (next/dynamic) in page files.
   This means these are code-split into the PostBody chunk, not the main bundle. */
import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { go } from "@codemirror/lang-go";
import { dracula } from "@uiw/codemirror-theme-dracula";

export default function PostBody({
  content,
  authorName,
  authorImageUrl,
  authorDescription,
  ReviewAuthorDetails,
  slug,
  categories,
}: {
  content: Post["content"];
  authorName: Post["ppmaAuthorName"];
  authorImageUrl: string;
  authorDescription: string;
  ReviewAuthorDetails: { edges: { node: { name: string; avatar: { url: string }; description: string } }[] };
  slug: string | string[] | undefined;
  categories?: Post["categories"];
}) {
  const [tocItems, setTocItems] = useState([]);
  const [copySuccessList, setCopySuccessList] = useState([]);
  const [headingCopySuccessList, setHeadingCopySuccessList] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [replacedContent, setReplacedContent] = useState(content || "");
  const [isList, setIsList] = useState(false);
  const [isUserEnteredURL, setIsUserEnteredURL] = useState(false);
  // Optional safety: handle malformed ReviewAuthorDetails gracefully
  const reviewer = ReviewAuthorDetails?.edges?.[0]?.node || null;
  const sameAuthor =
    reviewer &&
    authorName.split(" ")[0].toLowerCase() ===
    reviewer.name.split(" ")[0].toLowerCase();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize(); // Initial screen size check
    window.addEventListener("resize", checkScreenSize);

    if (!content) return;

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

    // Strip ALL inline styles from heading tags so our CSS module styles apply
    initialReplacedContent = initialReplacedContent.replace(
      /<(h[1-6])\b([^>]*?)\s*style\s*=\s*(['"])[^'"]*\3([^>]*?)>/gi,
      '<$1$2$4>'
    );

    setReplacedContent(initialReplacedContent);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [content]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const postBodyEl = document.getElementById('post-body-check');
      if (!postBodyEl) return;
      const headings = Array.from(postBodyEl.querySelectorAll("h1, h2, h3, h4"));

      // Force font-weight 700 on every heading — overrides any WP inline styles
      headings.forEach((heading: HTMLElement) => {
        heading.style.setProperty("font-weight", "700", "important");
      });

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
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

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



  const renderCodeBlocks = () => {
    const safeContent = replacedContent || "";
    const codeBlocks = safeContent.match(/<pre[\s\S]*?<\/pre>/gm);

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
      // document.createElement is browser-only; use a pure-JS fallback during SSR
      if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = str;
        return textarea.value;
      }
      return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, "\u00A0");
    };

    return safeContent
      .split(/(<pre[\s\S]*?<\/pre>)/gm)
      .map((part, index) => {
        if (/<pre[\s\S]*?<\/pre>/.test(part)) {
          const codeMatch = part.match(/<code[\s\S]*?>([\s\S]*?)<\/code>/);
          const code = codeMatch ? decodeHtmlEntities(codeMatch[1]) : "";

          // 1. Try language from <code class="language-X"> attribute
          const langFromClass =
            codeMatch && codeMatch[0].includes("language-")
              ? codeMatch[0].split("language-")[1].split('"')[0]
              : "";

          // 2. If no class, check if the first line is a known language keyword (WP pattern)
          const knownLanguages = [
            "go", "javascript", "js", "typescript", "ts",
            "python", "bash", "sh", "java", "rust", "cpp",
            "c", "yaml", "json", "markdown", "sql", "html", "css",
          ];
          const firstLine = code.trimStart().split("\n")[0].trim().toLowerCase();
          const langFromFirstLine = knownLanguages.includes(firstLine) ? firstLine : "";

          const language = langFromClass || langFromFirstLine || "bash";

          // Strip language name from code if it was the first line
          const cleanCode =
            langFromFirstLine && !langFromClass
              ? code.trimStart().slice(firstLine.length + 1)
              : langFromClass && code.trimStart().startsWith(langFromClass + "\n")
                ? code.trimStart().slice(langFromClass.length + 1)
                : code;

          const getLanguageExtension = (lang: string) => {
            switch (lang) {
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
            <div key={index} data-testid="code-block" className="rounded-lg overflow-hidden mb-6 border border-[#313244] shadow-md">
              {/* Header bar: language badge + copy button */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244]">
                <span className="text-xs font-mono text-[#6c7086] uppercase tracking-widest select-none">
                  {language}
                </span>
                <button
                  data-testid="copy-button"
                  onClick={() => handleCopyClick(cleanCode, index)}
                  className="flex items-center gap-1 text-xs text-[#cdd6f4] bg-[#313244] hover:bg-[#45475a] px-2 py-1 rounded transition-colors duration-150"
                >
                  {copySuccessList[index] ? (
                    <><IoCheckmarkOutline /> <span>Copied!</span></>
                  ) : (
                    <><IoCopyOutline /> <span>Copy</span></>
                  )}
                </button>
              </div>
              <CodeMirror
                value={cleanCode}
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
    <div className="w-full">
      {/* ── TOC: collapsible dropdown on screens < 1440px ── */}
      <div data-testid="mobile-toc" className="min-[1440px]:hidden mb-6">
        <TOC headings={tocItems} isList={isList} setIsList={setIsList} />
      </div>

      {/* ── Main layout: 3-col grid on wide screens, single centered column otherwise ── */}
      <div className="grid grid-cols-1 min-[1440px]:grid-cols-[minmax(200px,1fr)_minmax(0,780px)_minmax(200px,1fr)] gap-0">
        {/* Left — TOC (wide desktop only, ≥1440px) */}
        <div data-testid="desktop-toc" className={`hidden min-[1440px]:flex justify-end pr-6 ${isList ? "" : "sticky top-24 self-start"}`}>
          <TOC headings={tocItems} isList={isList} setIsList={setIsList} />
        </div>

        {/* Center — Article content (900px max, matching PostHeader) */}
        <div data-testid="post-content" className="max-w-[780px] w-full mx-auto px-4 sm:px-6 min-w-0" id="post-body-check">
          {slug === "how-to-compare-two-json-files" && <JsonDiffViewer />}
          <div className="post-content-wrapper">{renderCodeBlocks()}</div>
          <hr className="border-gray-300 mt-10 mb-10" />

          {/* Author card — Writer */}
          <div className="mb-8">
            <AuthorCard
              name={authorName}
              imageUrl={authorImageUrl}
              description={authorDescription}
              role="Writer"
            />
          </div>

          {/* Author card — Reviewer */}
          {reviewer && !sameAuthor && (
            <div className="mb-8">
              <AuthorCard
                name={reviewer.name}
                imageUrl={reviewer.avatar.url}
                description={reviewer.description}
                role="Reviewer"
              />
            </div>
          )}
        </div>

        {/* Right — Sidebar (wide desktop only, ≥1440px) */}
        <aside className="hidden min-[1440px]:flex pl-6 sticky top-24 self-start justify-start">
          <BlogSidebar />
        </aside>
      </div>

      {/* ── Sidebar for screens < 1440px ── */}
      <div className="min-[1440px]:hidden flex justify-center mt-8 px-4">
        <BlogSidebar />
      </div>
    </div>
  );
}
