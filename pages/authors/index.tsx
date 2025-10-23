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
    <div className="bg-accent-1 min-h-screen">
      <style jsx>{`
        @keyframes bunnyFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(1deg); }
          50% { transform: translateY(-4px) rotate(0deg); }
          75% { transform: translateY(-12px) rotate(-1deg); }
        }
      `}</style>
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`Authors Page`}
        Description={`Giving the List of all the Authors`}
      >
        <Header />
        
        {/* Hero Section */}
        <div className="relative bg-accent-1 px-4 overflow-hidden">

          <div className="absolute inset-0">

            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-white/30 to-primary-100/50"></div>

            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-accent-1 pointer-events-none"></div>
            
            <div className="absolute top-16 right-16 w-40 h-40 bg-gradient-to-br from-primary-200/30 to-primary-300/25 rounded-full blur-2xl"></div>
            <div className="absolute bottom-24 right-32 w-28 h-28 bg-gradient-to-br from-primary-300/25 to-primary-yellow-orange/20 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-48 w-20 h-20 bg-gradient-to-br from-primary-400/20 to-primary-300/15 rounded-full blur-lg"></div>
            <div className="absolute top-48 left-1/4 w-24 h-24 bg-gradient-to-br from-primary-100/25 to-primary-200/20 rounded-full blur-xl"></div>
            

            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #F6734A 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          

          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-accent-1 to-transparent pointer-events-none"></div>
          
          <Container>
            <div className="relative max-w-6xl mx-auto text-left">

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
              

              <div className="absolute bottom-0 right-0 translate-x-36 translate-y-12 hidden lg:block select-none pointer-events-none">
                <div className="absolute inset-0 w-80 h-80 bg-gradient-to-br from-primary-200/25 to-primary-300/20 rounded-full blur-2xl"></div>
                

                <div className="relative w-80 h-80 xl:w-96 xl:h-96 opacity-30 animate-[bunnyFloat_6s_ease-in-out_infinite] motion-reduce:animate-none">
                  <Image
                    src="/blog/images/blog-bunny.png"
                    alt="Blog Bunny illustration"
                    fill
                    sizes="(min-width: 1280px) 384px, 320px"
                    priority={false}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>

        <div className="bg-accent-1">
          <Container>
            <AuthorMapping AuthorArray={authorArray} authorCounts={authorCounts} />
          </Container>
        </div>
      </Layout>
    </div>
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
