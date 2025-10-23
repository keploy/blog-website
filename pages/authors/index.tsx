import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getAllAuthors, getAllPosts } from "../../lib/api";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import AuthorMapping from "../../components/AuthorMapping";
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

  // Typing animation for the word "brilliant"
  const targetWord = "brilliant";
  const [typedWord, setTypedWord] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let index = 0;
    const typeInterval = setInterval(() => {
      setTypedWord(targetWord.slice(0, index + 1));
      index += 1;
      if (index >= targetWord.length) {
        clearInterval(typeInterval);
      }
    }, 150);

    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typeInterval);
      clearInterval(cursorInterval);
    };
  }, []);

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
        {/* Background container - only for main content, not footer */}
        <div className="relative bg-gradient-to-br from-orange-50/40 via-white to-orange-100/30 overflow-hidden">
          {/* Background elements that work with sticky navbar */}
          <div className="absolute inset-0">
            {/* Subtle Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.03)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,200,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,200,0,0.015)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Main wavy gradients - seamless blending */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-200/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-orange-200/40 to-transparent"></div>
            <div className="absolute top-1/3 left-0 w-full h-48 bg-gradient-to-b from-orange-150/35 to-transparent"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-48 bg-gradient-to-t from-orange-150/35 to-transparent"></div>
            <div className="absolute top-1/2 left-0 w-full h-40 bg-gradient-to-b from-orange-100/30 to-transparent"></div>
            <div className="absolute bottom-1/2 left-0 w-full h-40 bg-gradient-to-t from-orange-100/30 to-transparent"></div>
            
            {/* Diagonal wave gradients */}
            <div className="absolute top-0 left-0 w-3/4 h-48 bg-gradient-to-br from-orange-200/30 to-transparent transform -skew-y-3 rounded-tl-full rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-3/4 h-48 bg-gradient-to-tl from-orange-200/30 to-transparent transform skew-y-3 rounded-tr-full rounded-bl-full"></div>
            <div className="absolute top-1/4 right-0 w-2/3 h-40 bg-gradient-to-bl from-orange-150/25 to-transparent transform skew-y-2 rounded-tl-full rounded-br-full"></div>
            <div className="absolute bottom-1/4 left-0 w-2/3 h-40 bg-gradient-to-tr from-orange-150/25 to-transparent transform -skew-y-2 rounded-tr-full rounded-bl-full"></div>
            
            {/* Large cloud formations */}
            <div className="absolute top-8 left-1/6 w-96 h-48 bg-gradient-to-r from-orange-200/35 to-orange-300/25 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 right-1/6 w-80 h-40 bg-gradient-to-l from-orange-300/30 to-orange-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-88 h-44 bg-gradient-to-r from-orange-250/28 to-orange-350/18 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-72 h-36 bg-gradient-to-l from-orange-200/32 to-orange-300/22 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/6 left-1/2 w-76 h-38 bg-gradient-to-r from-orange-300/25 to-orange-400/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/6 right-1/2 w-64 h-32 bg-gradient-to-l from-orange-250/28 to-orange-350/18 rounded-full blur-3xl"></div>
            
            {/* Atmospheric orbs */}
            <div className="absolute top-1/5 left-1/8 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-orange-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-4/5 right-1/8 w-56 h-56 bg-gradient-to-br from-orange-300/35 to-orange-500/25 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/5 left-1/3 w-72 h-72 bg-gradient-to-br from-orange-150/25 to-orange-350/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4/5 right-1/3 w-60 h-60 bg-gradient-to-br from-orange-250/30 to-orange-450/20 rounded-full blur-3xl"></div>
            
            {/* Center-focused elements */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-orange-200/25 to-orange-400/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-orange-300/30 to-orange-500/20 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-orange-400/35 to-orange-600/25 rounded-full blur-xl"></div>
            
            {/* Center cloud cluster */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-gradient-to-r from-orange-200/20 to-orange-300/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-gradient-to-l from-orange-250/18 to-orange-350/12 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-16 bg-gradient-to-r from-orange-300/22 to-orange-400/18 rounded-full blur-xl"></div>
            
            {/* Center geometric shapes */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-orange-300/40 rotate-45 bg-orange-100/20 rounded-lg blur-sm"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-orange-400/50 rotate-12 bg-orange-50/25 rounded-md blur-xs"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-orange-200/30 rounded-full blur-sm"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-orange-500/40 rotate-30 rounded-full blur-xs"></div>
            
            {/* Floating elements around center */}
            <div className="absolute top-1/3 left-1/5 w-32 h-32 bg-gradient-to-br from-orange-300/30 to-orange-500/20 rounded-full blur-2xl"></div>
            <div className="absolute top-2/3 right-1/5 w-28 h-28 bg-gradient-to-br from-orange-200/35 to-orange-400/25 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-gradient-to-br from-orange-250/25 to-orange-450/15 rounded-full blur-2xl"></div>
            <div className="absolute bottom-2/3 right-1/4 w-24 h-24 bg-gradient-to-br from-orange-300/40 to-orange-500/30 rounded-full blur-2xl"></div>
            
            {/* Additional floating elements */}
            <div className="absolute top-1/5 left-1/6 w-16 h-16 bg-gradient-to-br from-orange-200/30 to-orange-300/25 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute top-2/5 right-1/6 w-12 h-12 bg-gradient-to-br from-orange-300/35 to-orange-400/30 rounded-full blur-md"></div>
            <div className="absolute bottom-1/5 left-2/5 w-14 h-14 bg-gradient-to-br from-orange-150/25 to-orange-250/20 rounded-full blur-lg"></div>
            <div className="absolute bottom-2/5 right-2/5 w-10 h-10 bg-gradient-to-br from-orange-400/40 to-orange-500/35 rounded-full blur-sm"></div>
            
            {/* More cloud formations */}
            <div className="absolute top-1/6 left-1/3 w-40 h-20 bg-gradient-to-r from-orange-200/20 to-orange-300/15 rounded-full blur-xl"></div>
            <div className="absolute top-2/6 right-1/3 w-36 h-18 bg-gradient-to-l from-orange-300/22 to-orange-200/16 rounded-full blur-xl"></div>
            <div className="absolute bottom-1/6 left-2/3 w-44 h-22 bg-gradient-to-r from-orange-250/18 to-orange-350/12 rounded-full blur-xl"></div>
            <div className="absolute bottom-2/6 right-2/3 w-32 h-16 bg-gradient-to-l from-orange-200/24 to-orange-300/18 rounded-full blur-xl"></div>
            
            {/* Geometric shapes */}
            <div className="absolute top-32 right-1/4 w-20 h-20 border-2 border-orange-300/50 rotate-45 bg-orange-100/20 animate-wave"></div>
            <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-orange-200/30 rounded-full"></div>
            <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-orange-400/60 rotate-12 bg-orange-100/25"></div>
            <div className="absolute top-1/4 left-1/2 w-14 h-14 border border-orange-300/40 rotate-45"></div>
            <div className="absolute bottom-1/4 right-10 w-10 h-10 bg-orange-300/40 rounded-full"></div>
            <div className="absolute top-1/6 right-1/6 w-8 h-8 border border-orange-400/50 rotate-30"></div>
            <div className="absolute bottom-1/6 left-1/6 w-6 h-6 bg-orange-300/40 rounded-full"></div>
            <div className="absolute top-2/3 left-1/4 w-18 h-18 border-2 border-orange-200/40 rotate-60 bg-orange-50/30"></div>
            
            {/* More atmospheric elements */}
            <div className="absolute top-1/6 left-1/4 w-20 h-20 bg-gradient-to-br from-orange-100/15 to-orange-200/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-5/6 right-1/4 w-18 h-18 bg-gradient-to-br from-orange-200/18 to-orange-100/12 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-1/6 left-1/2 w-22 h-22 bg-gradient-to-br from-orange-150/20 to-orange-250/15 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-1/2 right-1/2 w-16 h-16 bg-gradient-to-br from-orange-100/22 to-orange-200/17 rounded-full blur-xl animate-pulse"></div>
            
            {/* Decorative shapes */}
            <div className="absolute top-1/8 left-1/3 w-14 h-14 bg-gradient-to-br from-orange-300/20 to-orange-400/15 rounded-full blur-lg"></div>
            <div className="absolute top-3/8 right-1/3 w-12 h-12 bg-gradient-to-br from-orange-200/25 to-orange-300/20 rounded-full blur-md"></div>
            <div className="absolute bottom-1/8 left-1/5 w-16 h-16 bg-gradient-to-br from-orange-250/18 to-orange-350/13 rounded-full blur-lg"></div>
            <div className="absolute bottom-3/8 right-1/5 w-10 h-10 bg-gradient-to-br from-orange-400/30 to-orange-500/25 rounded-full blur-sm"></div>
            
            {/* Diamond and triangle shapes */}
            <div className="absolute top-1/3 left-1/8 w-8 h-8 bg-gradient-to-br from-orange-300/25 to-orange-400/20 rotate-45 blur-sm"></div>
            <div className="absolute top-2/3 right-1/8 w-6 h-6 bg-gradient-to-br from-orange-200/30 to-orange-300/25 rotate-45 blur-xs"></div>
            <div className="absolute bottom-1/3 left-1/6 w-10 h-10 bg-gradient-to-br from-orange-350/20 to-orange-450/15 rotate-45 blur-sm"></div>
            <div className="absolute bottom-2/3 right-1/6 w-7 h-7 bg-gradient-to-br from-orange-150/25 to-orange-250/20 rotate-45 blur-xs"></div>
            
            {/* Hexagonal shapes */}
            <div className="absolute top-1/4 left-2/3 w-12 h-12 bg-gradient-to-br from-orange-100/20 to-orange-200/15 rounded-full blur-lg transform rotate-30"></div>
            <div className="absolute top-3/4 right-2/3 w-9 h-9 bg-gradient-to-br from-orange-300/25 to-orange-400/20 rounded-full blur-md transform rotate-60"></div>
            <div className="absolute bottom-1/4 left-1/2 w-11 h-11 bg-gradient-to-br from-orange-250/18 to-orange-350/13 rounded-full blur-lg transform rotate-45"></div>
            <div className="absolute bottom-3/4 right-1/2 w-8 h-8 bg-gradient-to-br from-orange-200/22 to-orange-300/17 rounded-full blur-md transform rotate-15"></div>
            
            {/* Curved wave elements */}
            <div className="absolute top-1/5 left-1/4 w-32 h-16 bg-gradient-to-r from-orange-100/15 to-orange-200/10 rounded-full blur-2xl transform rotate-12"></div>
            <div className="absolute top-4/5 right-1/4 w-28 h-14 bg-gradient-to-l from-orange-200/20 to-orange-100/15 rounded-full blur-2xl transform -rotate-12"></div>
            <div className="absolute bottom-1/5 left-1/3 w-36 h-18 bg-gradient-to-r from-orange-150/18 to-orange-250/13 rounded-full blur-2xl transform rotate-6"></div>
            <div className="absolute bottom-4/5 right-1/3 w-24 h-12 bg-gradient-to-l from-orange-100/25 to-orange-200/20 rounded-full blur-2xl transform -rotate-6"></div>
            
            {/* Spiral and swirl elements */}
            <div className="absolute top-1/7 left-1/7 w-18 h-18 bg-gradient-to-br from-orange-300/15 to-orange-400/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-6/7 right-1/7 w-15 h-15 bg-gradient-to-br from-orange-200/20 to-orange-300/15 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-1/7 left-1/4 w-20 h-20 bg-gradient-to-br from-orange-250/18 to-orange-350/13 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-6/7 right-1/4 w-13 h-13 bg-gradient-to-br from-orange-150/22 to-orange-250/17 rounded-full blur-lg animate-pulse"></div>
            
            {/* Wave-like decorative elements */}
            <div className="absolute top-1/3 left-0 w-24 h-24 border-2 border-orange-300/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 right-0 w-20 h-20 bg-orange-200/25 rounded-full animate-pulse"></div>
            <div className="absolute top-2/3 left-1/6 w-16 h-16 border border-orange-400/35 rotate-45 animate-wave"></div>
            
            {/* Additional accent elements */}
            <div className="absolute top-16 right-1/2 w-6 h-6 bg-orange-400/40 rotate-45"></div>
            <div className="absolute bottom-16 left-1/2 w-8 h-8 border border-orange-300/50 rounded-full"></div>
            <div className="absolute top-1/5 left-1/5 w-4 h-4 bg-orange-500/30 rounded-full"></div>
            <div className="absolute bottom-1/5 right-1/5 w-5 h-5 border border-orange-400/40 rotate-45"></div>
            
            {/* Blending overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/10 via-transparent to-orange-100/8"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-orange-100/8 via-transparent to-orange-50/6"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-75/6 via-transparent to-orange-125/4"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-orange-125/5 via-transparent to-orange-175/3"></div>
            
            {/* Subtle texture overlays */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #FF8C42 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}></div>
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #FFA500 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }}></div>
            
            {/* Extra soft waves */}
            <div className="absolute top-1/4 left-0 w-full h-28 bg-[radial-gradient(ellipse_at_center,rgba(255,173,51,0.18),transparent_60%)] opacity-60"></div>
            <div className="absolute top-2/4 left-0 w-full h-28 bg-[radial-gradient(ellipse_at_30%_60%,rgba(255,140,66,0.14),transparent_60%)]"></div>
            <div className="absolute top-3/4 left-0 w-full h-28 bg-[radial-gradient(ellipse_at_70%_40%,rgba(255,200,100,0.12),transparent_60%)]"></div>

            {/* Undulating ribbons */}
            <div className="absolute left-0 top-1/3 w-full h-24 bg-[linear-gradient(115deg,rgba(255,165,0,0.10),transparent_40%)] blur-xl"></div>
            <div className="absolute right-0 top-2/3 w-full h-24 bg-[linear-gradient(245deg,rgba(255,120,0,0.10),transparent_40%)] blur-xl"></div>
            <div className="absolute left-0 top-1/2 w-full h-20 bg-[linear-gradient(180deg,rgba(255,190,80,0.10),transparent_40%)] blur-xl"></div>
          </div>
          
          <Header />
          
          {/* Hero Section */}
          <div className="relative px-4 overflow-hidden">
          <Container>
              <div className="relative max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  {/* Left side - Text content */}
                  <div className="lg:col-span-7 text-left">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-bold text-gray-900 mb-10 leading-none tracking-wide animate-fade-up">
                <span className="block">Meet our</span>
                <span className="block bg-gradient-to-r from-primary-300 to-primary-yellow-orange bg-clip-text text-transparent">
                  {typedWord}
                  <span aria-hidden className="inline-block ml-0.5" style={{opacity: cursorVisible ? 1 : 0}}>|</span>
                </span>
                <span className="block italic">authors</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 mb-16 max-w-4xl leading-relaxed animate-fade-up animation-delay-200">
                Our authors bring together insights from testing, open source, and developer advocacy to help you build better software.
              </p>
                  </div>

                  {/* Right side - Author Image - Extreme right */}
                  <div className="lg:col-span-5 relative hidden lg:block">
                    <div className="relative w-[27.5rem] h-[27.5rem] xl:w-[35rem] xl:h-[35rem] ml-auto">
                      <div className="relative w-full h-full">
                  <Image
                          src="/blog/images/author-image.png"
                          alt="Author illustration"
                    fill
                          sizes="(min-width: 1024px) 320px, 288px"
                    priority={false}
                    className="object-contain"
                  />
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </Container>
        </div>

          <div className="relative">
          <Container>
            <AuthorMapping AuthorArray={authorArray} authorCounts={authorCounts} />
          </Container>
          </div>
        </div>
      </Layout>
    </>
  );
}

function formatAuthorName(name) {
  if (name.includes(",")) {
    const authors = name.split(",").map((author) =>
      author
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .trim()
    );
    return authors;
  } else {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .trim();
  }
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
