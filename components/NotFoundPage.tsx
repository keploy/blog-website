import React, { useState, useEffect } from "react";
import Header from "./header";
import Container from "./container";
import Image from "next/image";
import PostGrid from "./post-grid";
import PostCard from "./post-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import { FaSearch } from 'react-icons/fa';

interface NotFoundPageProps {
  latestPosts?: { edges: Array<{ node: Post }> };
  communityPosts?: { edges: Array<{ node: Post }> };
  technologyPosts?: { edges: Array<{ node: Post }> };
}

const NotFoundPage = ({ latestPosts, communityPosts, technologyPosts }: NotFoundPageProps) => {
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Combine all posts for search functionality and remove duplicates
  const allPosts = [
    ...(latestPosts?.edges || []),
    ...(communityPosts?.edges || []),
    ...(technologyPosts?.edges || [])
  ].filter((post, index, self) => 
    index === self.findIndex(p => p.node.slug === post.node.slug)
  );

  // Filter posts based on search term (search in title and content only, like more-stories)
  const filteredAllPosts = allPosts.filter(({ node }) => 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Background with Keploy theme - extends to navbar */}
      <div className="relative min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-orange-100/30 overflow-hidden">
        {/* Background elements that work with sticky navbar */}
        <div className="absolute inset-0">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          {/* Gradient orbs - more visible */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-orange-300/30 to-orange-400/25 rounded-full blur-2xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-orange-400/25 to-red-300/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-r from-orange-200/20 to-yellow-300/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-gradient-to-r from-orange-300/25 to-orange-500/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-r from-orange-200/30 to-orange-300/25 rounded-full blur-xl"></div>
          
          {/* More visible geometric shapes */}
          <div className="absolute top-32 right-1/4 w-20 h-20 border-2 border-orange-300/50 rotate-45 bg-orange-100/20"></div>
          <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-orange-200/30 rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-orange-400/60 rotate-12 bg-orange-100/25"></div>
          <div className="absolute top-1/4 left-1/2 w-14 h-14 border border-orange-300/40 rotate-45"></div>
          <div className="absolute bottom-1/4 right-10 w-10 h-10 bg-orange-300/40 rounded-full"></div>
          
          {/* Additional accent elements */}
          <div className="absolute top-16 right-1/2 w-6 h-6 bg-orange-400/40 rotate-45"></div>
          <div className="absolute bottom-16 left-1/2 w-8 h-8 border border-orange-300/50 rounded-full"></div>
        </div>
        
        <div className="relative z-20">
          <Header />
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          <Container>
        {/* Main 404 Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left side - Error message */}
          <div className="flex-1 lg:pr-12 mb-6 lg:mb-0">
            <h1 className="heading1 text-5xl lg:text-7xl font-bold text-black mb-6 leading-tight">
              Oops! <br />404, Not Found...
            </h1>
            <p className="body text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Looks like you've wandered off the beaten path. Our team is working to get you back on track and find what you're looking for.
            </p>
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="w-auto">
                  <Link href="/">
                    Back To Home
                  </Link>
                </Button>
                <Button 
                  onClick={() => window.history.back()}
                  className="w-auto bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  Back to Previous Page
                </Button>
              </div>
              <p className="text-sm text-gray-500 italic">
                Wait for {formatTime(countdown)} for automatic redirect or click the buttons above or explore our latest blog posts below.
              </p>
            </div>
          </div>

          {/* Right side - 404 Image */}
          <div className="flex-1 lg:pl-12">
            <div className="w-full h-96 lg:h-[600px] relative">
              <Image
                src="/blog/images/404-image.png"
                alt="404 Error Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="py-2">
          <div className="flex w-full mb-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Search Results Section */}
        {searchTerm ? (
          <section className="py-4">
            <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
              Search Results
            </h2>
            {filteredAllPosts.length === 0 ? (
              <p className="text-center text-gray-500">No posts found matching "{searchTerm}"</p>
            ) : (
              <PostGrid>
                {filteredAllPosts.map(({ node: post }) => (
                  <PostCard
                    key={post.slug}
                    title={post.title}
                    coverImage={post.featuredImage}
                    date={post.date}
                    excerpt={getExcerpt(post.excerpt, 20)}
                    author={post.ppmaAuthorName}
                    slug={post.slug}
                    isCommunity={post.categories?.edges?.some(edge => edge.node.name === 'community')}
                  />
                ))}
              </PostGrid>
            )}
          </section>
        ) : (
          <>
            {/* Latest Blog Section */}
            {latestPosts?.edges?.length > 0 && (
              <section className="py-4">
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
                  Latest from Our Blog
                </h2>
                <PostGrid>
                  {latestPosts.edges.slice(0, 6).map(({ node: post }) => (
                    <PostCard
                      key={post.slug}
                      title={post.title}
                      coverImage={post.featuredImage}
                      date={post.date}
                      excerpt={getExcerpt(post.excerpt, 20)}
                      author={post.ppmaAuthorName}
                      slug={post.slug}
                      isCommunity={post.categories?.edges?.some(edge => edge.node.name === 'community')}
                    />
                  ))}
                </PostGrid>
              </section>
            )}

            {/* Latest Community Blogs Section */}
            {communityPosts?.edges?.length > 0 && (
              <section className="py-4">
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
                  Latest Community Blogs
                </h2>
                <PostGrid>
                  {communityPosts.edges.slice(0, 6).map(({ node: post }) => (
                    <PostCard
                      key={post.slug}
                      title={post.title}
                      coverImage={post.featuredImage}
                      date={post.date}
                      excerpt={getExcerpt(post.excerpt, 20)}
                      author={post.ppmaAuthorName}
                      slug={post.slug}
                      isCommunity={true}
                    />
                  ))}
                </PostGrid>
              </section>
            )}

            {/* Latest Technology Blogs Section */}
            {technologyPosts?.edges?.length > 0 && (
              <section className="py-4">
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
                  Latest Technology Blogs
                </h2>
                <PostGrid>
                  {technologyPosts.edges.slice(0, 6).map(({ node: post }) => (
                    <PostCard
                      key={post.slug}
                      title={post.title}
                      coverImage={post.featuredImage}
                      date={post.date}
                      excerpt={getExcerpt(post.excerpt, 20)}
                      author={post.ppmaAuthorName}
                      slug={post.slug}
                      isCommunity={false}
                    />
                  ))}
                </PostGrid>
              </section>
            )}
          </>
        )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
