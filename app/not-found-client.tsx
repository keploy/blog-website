"use client";

// App Router 404 page — no header, just the 404 content.
// Cannot import Header/FloatingNavbar — they use useRouter() from next/router
// which throws in App Router context. Header intentionally omitted.
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import PostGrid from "../components/post-grid";
import PostCard from "../components/post-card";
import { Post } from "../types/post";
import { getExcerpt } from "../utils/excerpt";
import { FaSearch } from "react-icons/fa";

interface Props {
  latestPosts?: { edges: Array<{ node: Post }> };
  communityPosts?: { edges: Array<{ node: Post }> };
  technologyPosts?: { edges: Array<{ node: Post }> };
}

export default function NotFoundClient({ latestPosts, communityPosts, technologyPosts }: Props) {
  const [countdown, setCountdown] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); window.location.href = "/blog"; return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  const allPosts = useMemo(() =>
    [...(latestPosts?.edges || []), ...(communityPosts?.edges || []), ...(technologyPosts?.edges || [])]
      .filter((p, i, self) => i === self.findIndex((x) => x.node.slug === p.node.slug)),
    [latestPosts, communityPosts, technologyPosts]
  );

  const filteredPosts = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return allPosts.filter(({ node }) =>
      (node.title || "").toLowerCase().includes(t) || (node.excerpt || "").toLowerCase().includes(t)
    );
  }, [allPosts, searchTerm]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50/15 via-orange-25/10 to-orange-100/12 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.06)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-orange-300/18 to-orange-400/12 rounded-full blur-2xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-orange-400/15 to-red-300/10 rounded-full blur-xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-r from-orange-200/12 to-yellow-300/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-gradient-to-r from-orange-300/15 to-orange-500/12 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-r from-orange-200/18 to-orange-300/12 rounded-full blur-xl" />
        <div className="absolute top-32 right-1/4 w-20 h-20 border-2 border-orange-300/25 rotate-45 bg-orange-100/12" />
        <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-orange-200/18 rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/8 via-transparent to-orange-200/5" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-16">
        <div className="flex flex-col lg:flex-row items-center justify-between pt-8 pb-8">
          <div className="flex-1 lg:pr-12 mb-6 lg:mb-0">
            <h1 className="heading1 text-6xl lg:text-7xl font-bold mb-6 leading-tight max-w-lg">
              <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                Oops! 404 Not Found...
              </span>
            </h1>
            <p className="body text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Looks like you have wandered off the beaten path. Our team is working to get you back on track and find what you are looking for.
            </p>
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Back To Home
                </Link>
                <button
                  onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = "/blog"; }}
                  className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                >
                  Back to Previous Page
                </button>
              </div>
              <p className="text-sm text-gray-500 italic">
                Wait for <span className="text-orange-500 font-bold text-lg animate-pulse">{formatTime(countdown)}</span> for automatic redirect or click the buttons above or explore our latest blog posts below.
              </p>
            </div>
          </div>
          <div className="flex-1 lg:pl-12">
            <div className="w-full h-64 sm:h-80 lg:h-[500px] relative mt-8 lg:mt-0">
              <Image src="/blog/images/error404.png" alt="404 Error Illustration" fill className="object-contain" priority />
            </div>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <div className="relative w-full mb-6">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {searchTerm ? (
          <section className="py-4">
            <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">Search Results</h2>
            {filteredPosts.length === 0
              ? <p className="text-center text-gray-500">No posts found matching that search</p>
              : <PostGrid>{filteredPosts.map(({ node: post }) => <PostCard key={post.slug} title={post.title} coverImage={post.featuredImage} date={post.date} excerpt={getExcerpt(post.excerpt, 20)} author={post.ppmaAuthorName} slug={post.slug} isCommunity={post.categories?.edges?.some((e) => e.node.name === "community")} />)}</PostGrid>
            }
          </section>
        ) : (
          <>
            {(latestPosts?.edges?.length ?? 0) > 0 && (
              <section className="py-4">
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">Latest from Our Blog</h2>
                <PostGrid>{(latestPosts?.edges ?? []).slice(0, 6).map(({ node: post }) => <PostCard key={post.slug} title={post.title} coverImage={post.featuredImage} date={post.date} excerpt={getExcerpt(post.excerpt, 20)} author={post.ppmaAuthorName} slug={post.slug} isCommunity={post.categories?.edges?.some((e) => e.node.name === "community")} />)}</PostGrid>
              </section>
            )}
            {(communityPosts?.edges?.length ?? 0) > 0 && (
              <section className="py-4">
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">Latest Community Blogs</h2>
                <PostGrid>{(communityPosts?.edges ?? []).slice(0, 6).map(({ node: post }) => <PostCard key={post.slug} title={post.title} coverImage={post.featuredImage} date={post.date} excerpt={getExcerpt(post.excerpt, 20)} author={post.ppmaAuthorName} slug={post.slug} isCommunity={true} />)}</PostGrid>
              </section>
            )}
            {(technologyPosts?.edges?.length ?? 0) > 0 && (
              <section className="py-4">
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">Latest Technology Blogs</h2>
                <PostGrid>{(technologyPosts?.edges ?? []).slice(0, 6).map(({ node: post }) => <PostCard key={post.slug} title={post.title} coverImage={post.featuredImage} date={post.date} excerpt={getExcerpt(post.excerpt, 20)} author={post.ppmaAuthorName} slug={post.slug} isCommunity={false} />)}</PostGrid>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
