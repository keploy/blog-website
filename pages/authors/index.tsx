import { GetStaticProps } from "next";
import { useState } from "react";
import { FaSearch } from 'react-icons/fa';
import { getAllAuthors, getAllPosts } from "../../lib/api";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import AuthorMapping from "../../components/AuthorMapping";
import Background from "../../components/Background";
import AuthorEdgesOverlay from "../../components/AuthorEdgesOverlay";
// import AuthorBackgroundOverlay from "../../components/AuthorBackgroundOverlay";
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

  // Static heading only (typewriter removed)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"" | "asc" | "desc">("");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // No typing effect

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
        {/* Author images overlay across whole page (side-only placement) */}
        <AuthorEdgesOverlay
          images={authorArray
            .map(a => (a.ppmaAuthorImage || '').trim())
            .filter(Boolean)}
        />
        
        <div className="relative min-h-screen overflow-hidden">
          <Header />
          
          <div className="relative px-4 overflow-visible">
          <Container>
              <div className="relative max-w-7xl mx-auto z-20">
                <div className="text-center mb-16 pt-6">
                  <h1 className="text-center font-bold text-gray-900 mb-8 leading-tight tracking-wide animate-fade-up">
                    <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[6rem] mb-12">
                      Meet our <span className="bg-gradient-to-r from-primary-300 to-primary-yellow-orange bg-clip-text text-transparent">brilliant</span>
                    </span>
                    <span className="block italic font-bold text-gray-800 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[7rem] mb-12">
                      authors
                    </span>
                  </h1>
              
                  <p className="text-lg md:text-xl text-gray-700 pt-4 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-up animation-delay-200">
                Our authors bring together insights from testing, open source, and developer advocacy to help you build better software.
              </p>

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-[800px] h-[800px] rounded-full blur-3xl opacity-55 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.20)_0%,rgba(251,191,36,0.14)_35%,transparent_75%)] transform translate-y-32 sm:translate-y-36"></div>
                  </div>

                   <div className="max-w-4xl mx-auto relative z-30 isolate">
                    <div className="relative z-20 border-white/30 bg-white/30 rounded-3xl p-6 border shadow-sm shadow-black/20 ">
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {/* Search Bar */}
                      <div className="relative flex-1 w-full">
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="Search authors..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-4 pl-12 pr-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/10 hover:border-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300/50 text-base transition-all duration-300 placeholder-gray-600 text-gray-800"
                          />
                          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 group-hover:text-orange-500 transition-colors duration-300" />
                          <button
                            type="button"
                            aria-label="Clear search"
                            title="Clear search"
                            onClick={() => setSearchTerm("")}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-700 hover:text-orange-600 transition-colors duration-300 leading-none flex items-center justify-center w-8 h-8 text-3xl font-semibold ${searchTerm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                          >
                            ×
                          </button>
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
                          className="group w-full p-4 pr-10 rounded-2xl bg-white/30 border border-white/10 shadow-lg shadow-black/10 hover:border-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300/50 text-base transition-all duration-300 text-gray-800 text-left"
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
                            className="absolute z-[9999] mt-2 right-0 w-full min-w-[9rem] rounded-2xl bg-white/30 border border-white/10 shadow-lg shadow-black/10 overflow-hidden"
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
