import React, { useMemo, useState } from "react";
import Image from "next/image";
import React from "react";
import { Post } from "../types/post";
import dynamic from "next/dynamic";
import PostCard from "./post-card";
import PostGrid from "./post-grid";
 
const AuthorDescription = dynamic(() => import("./author-description"), {
  ssr: false,
})

const PostByAuthorMapping = ({
  filteredPosts,
  Content,
}: {
  filteredPosts: { node: Post }[];
  Content: string;
}) => {
  const AuthorName = filteredPosts[0].node.ppmaAuthorName;
  const [visibleCount, setVisibleCount] = useState(12);
  const visiblePosts = useMemo(() => filteredPosts.slice(0, visibleCount), [filteredPosts, visibleCount]);
  const canLoadMore = visibleCount < filteredPosts.length;
  const handleLoadMore = () => setVisibleCount((prev) => Math.min(prev + 12, filteredPosts.length));
  return (
    <div className="container mx-auto mt-8">
      <div className="mb-5">
        <AuthorDescription
          authorData={Content}
          AuthorName={AuthorName}
          isPost={false}
        />
      </div>
      <h1 className="text-xl sm:text-3xl lg:text-4xl mt-10 font-bold mb-8 text-slate-900 bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom  tracking-tighter leading-tight w-max">
        Posts by {AuthorName}
      </h1>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visiblePosts.map(({ node }) => {
          return <Node node={node} key={node.slug} />;
        })}
      </ul>
      {canLoadMore && (
        <div className="flex justify-center mt-8 mb-10">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
          >
            Load More Posts
          </button>
        </div>
      )}
      <PostGrid>
        {filteredPosts.map(({ node }) => (
          <PostCard
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            date={node.date}
            author={node.ppmaAuthorName}
            slug={node.slug}
            excerpt={node.excerpt}
            isCommunity={
              node.categories.edges[0]?.node.name === "community" ? true : false
            }
          />
        ))}
      </PostGrid>
    </div>
  );
};

export default PostByAuthorMapping;
