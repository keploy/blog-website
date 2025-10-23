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
