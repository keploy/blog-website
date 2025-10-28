import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import { FaSearch } from 'react-icons/fa';
import { getAllAuthors, getAllPosts } from "../../lib/api";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import AuthorMapping from "../../components/AuthorMapping";
import Background from "../../components/Background";
import AuthorBackgroundOverlay from "../../components/AuthorBackgroundOverlay";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { Post } from "../../types/post";
import { calculateAuthorPostCounts } from "../../utils/calculateAuthorPostCounts";

export default function Authors({
  AllAuthors: { edges },
  preview,
  authorCounts,
}: {
  AllAuthors: {
    edges: {
      node: { author: Post["author"]; ppmaAuthorName: Post["ppmaAuthorName"],ppmaAuthorImage: Post["ppmaAuthorImage"] };
    }[];
  };
  preview;
  authorCounts: Record<string, number>;
}) {
  const authorArray = Array.from(new Set(edges.map((item) => item.node)));

  // Typing animation for buzz words
  const buzzWords = ["brilliant", "expert", "passionate", "creative", "talented"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedWord, setTypedWord] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"" | "asc" | "desc">("");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const currentWord = buzzWords[currentWordIndex];
    
    const typeInterval = setInterval(() => {
      setIsTyping(true);
      setCursorVisible(true); // Show cursor while typing
      
      if (!isDeleting) {
        setTypedWord(currentWord.slice(0, typedWord.length + 1));
        if (typedWord.length === currentWord.length) {
          setIsTyping(false);
          setTimeout(() => setIsDeleting(true), 3000); // Wait 3 seconds before deleting
        }
      } else {
        setTypedWord(currentWord.slice(0, typedWord.length - 1));
        if (typedWord.length === 0) {
          setIsDeleting(false);
          setIsTyping(false);
          setCurrentWordIndex((prev) => (prev + 1) % buzzWords.length);
        }
      }
    }, isDeleting ? 80 : 200); // Slower, more gradual typing

    // Cursor blinking - only when not typing
    const cursorInterval = setInterval(() => {
      if (!isTyping) {
      setCursorVisible((prev) => !prev);
      }
    }, 500); // 500ms blink interval

    return () => {
      clearInterval(typeInterval);
      clearInterval(cursorInterval);
    };
  }, [currentWordIndex, typedWord, isDeleting, isTyping, buzzWords]);

  // Search and filter handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    const raw = event.target.value;
    const value = raw === "desc" ? "desc" : raw === "asc" ? "asc" : "";
    setSortOrder(value);
  };

  const handleSortSelect = (value) => {
    const normalized = value === "desc" ? "desc" : value === "asc" ? "asc" : "";
    setSortOrder(normalized);
    setIsSortOpen(false);
  };

  return (
    <>
      <style jsx>{`
        @keyframes authorFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(1deg); }
          50% { transform: translateY(-4px) rotate(0deg); }
          75% { transform: translateY(-12px) rotate(-1deg); }
        }
        @keyframes wave {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(10px) rotate(1deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
      `}</style>
      
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`Authors Page`}
        Description={`Giving the List of all the Authors`}
      >
        {/* Network Background */}
        <Background />
        
        <div className="relative min-h-screen overflow-hidden">
          <Header />
          
          {/* Hero Section with Author Overlay */}
          <div className="relative px-4 overflow-visible">
            {/* Author Overlay for Hero Section Only */}
            <AuthorBackgroundOverlay 
              authors={authorArray.map(author => {
                const imageUrl = author.ppmaAuthorImage || '';
                // Log for debugging
                if (imageUrl) {
                  console.log('Author image URL:', imageUrl);
                }
                return imageUrl;
              })} 
            />
          <Container>
              <div className="relative max-w-7xl mx-auto z-20">
                {/* Centered heading */}
                <div className="text-center mb-16 pt-6">
                  <h1 className="text-center font-bold text-gray-900 mb-8 leading-tight tracking-wide animate-fade-up">
                    <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[6rem] mb-12">
                      Meet our{" "}
                        <span className="bg-gradient-to-r from-primary-300 to-primary-yellow-orange bg-clip-text text-transparent">
                  {typedWord}
                          <span
                            aria-hidden="true"
                            className={`inline-block ml-1 align-baseline bg-orange-500 w-[2px] h-[1.2em] rounded-sm transition-opacity duration-150 ${
                              cursorVisible ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                              borderRadius: '1px',
                              boxShadow: '0 0 4px rgba(249,115,22,0.6)',
                            }}
                          />
                        </span>
                    </span>
                    <span className="block italic font-bold text-gray-800 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[7rem] mb-12">
                      authors
                </span>
              </h1>
              
                  <p className="text-lg md:text-xl text-gray-700 pt-4 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-up animation-delay-200">
                Our authors bring together insights from testing, open source, and developer advocacy to help you build better software.
              </p>

                  {/* Glassmorphism Search and Filter Section */}
                   <div className="max-w-4xl mx-auto relative z-30">
                    <div className="bg-white/5 backdrop-blur-xs rounded-3xl p-6 shadow-2xl shadow-black/20">
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {/* Search Bar */}
                      <div className="relative flex-1 w-full">
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="Search authors..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-4 pl-12 pr-4 rounded-3xl border border-white/90 bg-white/80 backdrop-blur-lg hover:border-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300/50 text-base transition-all duration-300 placeholder-gray-600 text-gray-800"
                          />
                          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 group-hover:text-orange-500 transition-colors duration-300" />
                        </div>
                  </div>

                      {/* Filter Dropdown */}
                      <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                        <button
                          type="button"
                          aria-label="Sort authors"
                          aria-haspopup="listbox"
                          aria-expanded={isSortOpen}
                          onClick={() => setIsSortOpen((o) => !o)}
                          onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) setIsSortOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setIsSortOpen(false);
                          }}
                          className="group w-full p-4 pr-10 rounded-3xl border border-white/90 bg-white/80 backdrop-blur-lg hover:border-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300/50 text-base transition-all duration-300 text-gray-800 text-left"
                        >
                          <span className="block truncate">
                            {sortOrder === 'desc' ? 'Z–A' : sortOrder === 'asc' ? 'A–Z' : 'Default'}
                          </span>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isSortOpen && (
                          <div
                            role="listbox"
                            aria-label="Sort options"
                            tabIndex={-1}
                            className="absolute z-[9999] mt-2 right-0 w-full min-w-[9rem] rounded-3xl bg-white/80 backdrop-blur-lg border border-white/90 overflow-hidden"
                          >
                            <button
                              role="option"
                              aria-selected={sortOrder === ''}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSortSelect('')}
                              className={`w-full text-left px-4 py-3 text-sm transition-all duration-300 ${sortOrder === '' ? 'bg-orange-500/20 font-semibold text-gray-800' : 'text-gray-700 hover:bg-white/15'} focus:bg-white/15`}
                            >
                              Default
                            </button>
                            <button
                              role="option"
                              aria-selected={sortOrder === 'asc'}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSortSelect('asc')}
                              className={`w-full text-left px-4 py-3 text-sm transition-all duration-300 ${sortOrder === 'asc' ? 'bg-orange-500/20 font-semibold text-gray-800' : 'text-gray-700 hover:bg-white/15'} focus:bg-white/15`}
                            >
                              A–Z
                            </button>
                            <button
                              role="option"
                              aria-selected={sortOrder === 'desc'}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSortSelect('desc')}
                              className={`w-full text-left px-4 py-3 text-sm transition-all duration-300 ${sortOrder === 'desc' ? 'bg-orange-500/20 font-semibold text-gray-800' : 'text-gray-700 hover:bg-white/15'} focus:bg-white/15`}
                            >
                              Z–A
                            </button>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </Container>
        </div>

          <div className="relative">
          <Container>
               <AuthorMapping 
                 AuthorArray={authorArray} 
                 authorCounts={authorCounts}
                 searchTerm={searchTerm}
                 sortOrder={sortOrder}
               />
          </Container>
          </div>
        </div>
      </Layout>
    </>
  );
}


export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const AllAuthors = await getAllAuthors();
  // Use all posts to compute counts across the full dataset
  let authorCounts = {} as Record<string, number>;
  try {
    const all = await getAllPosts();
    const edges = all?.edges || [];
    authorCounts = calculateAuthorPostCounts(edges);
  } catch (e) {
    console.error('Failed to compute authorCounts:', e);
    authorCounts = {};
  }
  return {
    props: { AllAuthors, preview, authorCounts },
    revalidate: 10,
  };
};
