"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

/**
 * FeaturedPosts Component
 * Displays a grid of equally sized featured blog post cards.
 * Optimized for responsiveness, performance, and clean visual consistency.
 */
export default function FeaturedPosts({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-neutral-950">
      {/* Section Title */}
      <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
        Featured Posts
      </h2>

      {/* Responsive Grid (All cards same size) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {posts.slice(0, 8).map((post, index) => (
          <Card
            key={post.id || index}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 
                       shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <CardContent className="p-0 flex flex-col h-full">
              {/* Post Image */}
              <div className="relative w-full h-56 sm:h-60 lg:h-64">
                <Image
                  src={post.image || "/images/placeholder.png"}
                  alt={post.title || "Featured Post"}
                  fill
                  className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 
                         (max-width: 1200px) 50vw, 
                         25vw"
                  priority={index === 0}
                  placeholder="blur"
                  blurDataURL="/images/placeholder.png"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between flex-grow p-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

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
