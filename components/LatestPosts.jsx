"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

/**
 * LatestPosts Component
 * Displays a responsive grid of the latest blog posts with optimized images,
 * smooth hover animations, and clear content hierarchy.
 */
export default function LatestPosts({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-12 bg-white dark:bg-neutral-950">
      {/* Section Title */}
      <h2 className="text-3xl font-bold mb-8 text-center sm:text-left">
        Latest Posts
      </h2>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="group overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-sm 
                       hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-0 flex flex-col h-full">
              {/* Blog Image */}
              <div className="relative w-full h-48 sm:h-56 lg:h-60">
                <Image
                  src={post.image || "/images/placeholder.png"}
                  alt={post.title || "Blog post image"}
                  fill
                  className="object-cover cursor-pointer rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw,
                         (max-width: 1200px) 50vw,
                         33vw"
                  placeholder="blur"
                  blurDataURL="/images/placeholder.png"
                  priority={false}
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between flex-grow p-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author and Read Time */}
                <div className="flex items-center justify-between mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{post.author}</span>
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
