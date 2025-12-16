// ===============================
// LatestPosts.tsx
// ===============================
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function LatestPosts({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-12 bg-white dark:bg-neutral-950">
      <h2 className="text-3xl font-bold mb-10">Latest Posts</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[260px] gap-6">
        {posts.map((post, index) => (
          <Card
            key={post.id}
            className={`group overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition ${
              index % 5 === 0 ? "lg:col-span-2 lg:row-span-2" : ""
            }`}
          >
            <CardContent className="p-0 h-full">
              <div className="relative w-full h-full cursor-pointer">
                <Image
                  src={post.image || "/images/placeholder.png"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 flex flex-col justify-end">
                  <h3 className="text-white font-semibold text-lg line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-gray-200 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex justify-between mt-3 text-xs text-gray-300">
                    <span>{post.author}</span>
                    <span>{post.readTime} min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
