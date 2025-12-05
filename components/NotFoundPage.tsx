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
  const [countdown, setCountdown] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/blog';
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

  const allPosts = [
    ...(latestPosts?.edges || []),
    ...(communityPosts?.edges || []),
    ...(technologyPosts?.edges || [])
  ].filter((post, index, self) => 
    index === self.findIndex(p => p.node.slug === post.node.slug)
  );

  const filteredAllPosts = allPosts.filter(({ node }) => 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-orange-50/15 via-orange-25/10 to-orange-100/12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.06)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
          
          <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-orange-300/18 to-orange-400/12 rounded-full blur-2xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-orange-400/15 to-red-300/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-r from-orange-200/12 to-yellow-300/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-gradient-to-r from-orange-300/15 to-orange-500/12 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-r from-orange-200/18 to-orange-300/12 rounded-full blur-xl"></div>
          
          <div className="absolute top-60 left-1/5 w-24 h-24 bg-gradient-to-br from-orange-200/10 to-orange-300/8 rounded-full blur-lg"></div>
          <div className="absolute top-80 right-1/5 w-20 h-20 bg-gradient-to-tl from-orange-400/12 to-orange-500/8 rounded-full blur-md"></div>
          <div className="absolute bottom-60 left-1/6 w-28 h-28 bg-gradient-to-bl from-orange-300/10 to-yellow-200/6 rounded-full blur-xl"></div>
          <div className="absolute bottom-80 right-1/6 w-22 h-22 bg-gradient-to-tr from-orange-400/8 to-red-200/6 rounded-full blur-lg"></div>
          <div className="absolute top-1/4 left-1/8 w-18 h-18 bg-gradient-to-r from-orange-200/12 to-orange-300/8 rounded-full blur-sm"></div>
          
          <div className="absolute top-32 right-1/4 w-20 h-20 border-2 border-orange-300/25 rotate-45 bg-orange-100/12"></div>
          <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-orange-200/18 rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-orange-400/22 rotate-12 bg-orange-100/10"></div>
          <div className="absolute top-1/4 left-1/2 w-14 h-14 border border-orange-300/20 rotate-45"></div>
          <div className="absolute bottom-1/4 right-10 w-10 h-10 bg-orange-300/18 rounded-full"></div>
          
          <div className="absolute top-24 left-1/4 w-8 h-8 bg-orange-400/20 rounded-sm rotate-12"></div>
          <div className="absolute top-48 right-1/3 w-6 h-6 bg-orange-500/15 rounded-full"></div>
          <div className="absolute bottom-48 left-1/5 w-10 h-10 bg-orange-300/18 rounded-lg rotate-45"></div>
          <div className="absolute top-1/2 right-1/5 w-12 h-12 border border-orange-400/20 rounded-full"></div>
          <div className="absolute bottom-1/3 left-2/3 w-14 h-14 bg-orange-200/12 rounded-sm rotate-30"></div>
          
          <div className="absolute top-16 left-1/6 w-18 h-18 bg-orange-300/15 rounded-lg rotate-60"></div>
          <div className="absolute top-56 right-1/6 w-22 h-22 border-2 border-orange-400/18 rounded-full"></div>
          <div className="absolute bottom-56 left-1/6 w-16 h-16 bg-orange-200/20 rounded-sm rotate-15"></div>
          <div className="absolute top-2/3 right-1/6 w-20 h-20 border border-orange-300/22 rounded-lg rotate-75"></div>
          <div className="absolute bottom-1/6 left-1/3 w-24 h-24 bg-orange-400/12 rounded-full"></div>
          <div className="absolute top-1/6 right-2/3 w-14 h-14 bg-orange-300/18 rounded-sm rotate-45"></div>
          <div className="absolute bottom-2/3 left-2/3 w-12 h-12 border-2 border-orange-500/15 rounded-full rotate-30"></div>
          <div className="absolute top-3/4 right-1/4 w-26 h-26 bg-orange-200/15 rounded-lg rotate-90"></div>
          
          <div className="absolute top-12 left-1/3 w-7 h-7 bg-orange-300/16 rounded-full rotate-20"></div>
          <div className="absolute top-36 right-1/4 w-9 h-9 border border-orange-400/18 rounded-sm rotate-55"></div>
          <div className="absolute bottom-12 left-1/4 w-11 h-11 bg-orange-200/14 rounded-lg rotate-35"></div>
          <div className="absolute bottom-36 right-1/3 w-8 h-8 border-2 border-orange-300/16 rounded-full rotate-70"></div>
          <div className="absolute top-2/5 left-1/7 w-13 h-13 bg-orange-400/12 rounded-sm rotate-25"></div>
          <div className="absolute top-3/5 right-1/7 w-15 h-15 border border-orange-500/14 rounded-lg rotate-80"></div>
          <div className="absolute bottom-2/5 left-2/5 w-10 h-10 bg-orange-300/16 rounded-full rotate-40"></div>
          <div className="absolute bottom-3/5 right-2/5 w-12 h-12 border-2 border-orange-400/15 rounded-sm rotate-65"></div>
          <div className="absolute top-1/6 left-3/4 w-6 h-6 bg-orange-200/18 rounded-full rotate-15"></div>
          <div className="absolute bottom-1/6 right-3/4 w-8 h-8 border border-orange-300/17 rounded-lg rotate-50"></div>
          
          <div className="absolute top-16 right-1/2 w-6 h-6 bg-orange-400/20 rotate-45"></div>
          <div className="absolute bottom-16 left-1/2 w-8 h-8 border border-orange-300/18 rounded-full"></div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/8 via-transparent to-orange-200/5"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-orange-200/6 via-transparent to-orange-100/4"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-orange-300/5 via-transparent to-orange-200/3"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/7 via-transparent to-orange-300/4"></div>
        </div>
        
        <div className="relative z-20">
          <Header />
        </div>
        
        <div className="relative z-10">
          <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex-1 lg:pr-12 mb-6 lg:mb-0">
            <h1 className="heading1 text-6xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                Oops! 404 Not Found...
              </span>
            </h1>
            <p className="body text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Looks like you&apos;ve wandered off the beaten path. Our team is working to get you back on track and find what you&apos;re looking for.
            </p>
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="w-auto">
                  <Link href="/">
                    Back To Home
                  </Link>
                </Button>
                <Button 
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      window.location.href = '/blog';
                    }
                  }}
                  className="w-auto bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  Back to Previous Page
                </Button>
              </div>
              <p className="text-sm text-gray-500 italic">
                Wait for <span className="text-orange-500 font-bold text-lg animate-pulse">{formatTime(countdown)}</span> for automatic redirect or click the buttons above or explore our latest blog posts below.
              </p>
            </div>
          </div>

          <div className="flex-1 lg:pl-12">
            <div className="w-full h-80 lg:h-[500px] relative">
              <Image
                src="/blog/images/error404.png"
                alt="404 Error Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <div className="pt-8 pb-2">
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

        {searchTerm ? (
          <section className="py-4">
            <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
              Search Results
            </h2>
            {filteredAllPosts.length === 0 ? (
              <p className="text-center text-gray-500">No posts found matching &quot;{searchTerm}&quot;</p>
            ) : (
              <PostGrid>
                {filteredAllPosts.map(({ node: post }) => (
                  <PostCard
                    key={post.slug}
                    title={post.title}
                    coverImage={post.featuredImage}
                    date={post.date}
                    excerpt={getExcerpt(post.excerpt, 36)}
                    author={post.ppmaAuthorName}
                    slug={post.slug}
                    isCommunity={post.categories?.edges?.some(edge => edge.node.name === 'community')}
                    variant="subtle"
                    hideAuthorImage={true}
                    hideReadingTime={true}
                  />
                ))}
              </PostGrid>
            )}
          </section>
        ) : (
          <>
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
                      excerpt={getExcerpt(post.excerpt, 36)}
                      author={post.ppmaAuthorName}
                      slug={post.slug}
                      isCommunity={post.categories?.edges?.some(edge => edge.node.name === 'community')}
                      variant="subtle"
                      hideAuthorImage={true}
                      hideReadingTime={true}
                    />
                  ))}
                </PostGrid>
              </section>
            )}

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
                      excerpt={getExcerpt(post.excerpt, 36)}
                      author={post.ppmaAuthorName}
                      slug={post.slug}
                      isCommunity={true}
                      variant="subtle"
                      hideAuthorImage={true}
                      hideReadingTime={true}
                    />
                  ))}
                </PostGrid>
              </section>
            )}

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
                      excerpt={getExcerpt(post.excerpt, 36)}
                      author={post.ppmaAuthorName}
                      slug={post.slug}
                      isCommunity={false}
                      variant="subtle"
                      hideAuthorImage={true}
                      hideReadingTime={true}
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
