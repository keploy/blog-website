import React, { useEffect, useState } from "react";
import { Post } from "../types/post";
import PostCard from "./post-card";
import PostGrid from "./post-grid";
import AuthorHero from "./AuthorHero";
import { extractAuthorData, AuthorData } from "../utils/extractAuthorData";

const PostByAuthorMapping = ({
  filteredPosts,
  Content,
}: {
  filteredPosts: { node: Post }[];
  Content: string;
}) => {
  const [authorInfo, setAuthorInfo] = useState<AuthorData | null>(null);

  useEffect(() => {
    if (Content) {
      setAuthorInfo(extractAuthorData(Content));
    }
  }, [Content]);

  const authorNameFromPosts = filteredPosts[0]?.node?.ppmaAuthorName;

  return (
    <div className="container mx-auto  md:px-20">
      {/* Hero Section */}
      <div className="mb-12">
        <AuthorHero
          name={authorInfo?.name || authorNameFromPosts}
          avatarUrl={authorInfo?.avatarUrl || "n/a"}
          description={authorInfo?.description || ""}
          linkedIn={authorInfo?.linkedIn}
        />
      </div>

      <div className="px-4">
        <h2
          className="mb-10 tracking-tight leading-tight"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "36px",
            fontWeight: 700,
            color: "rgb(29, 32, 34)",
          }}
        >
          Latest Posts by {authorInfo?.name || authorNameFromPosts}
          <span style={{ color: "#FF914D" }}>.</span>
        </h2>

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
                node.categories?.edges?.[0]?.node?.name === "community"
              }
            />
          ))}
        </PostGrid>
      </div>
    </div>
  );
};

export default PostByAuthorMapping;
