import { Post } from "./post";

// Core shared types
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface TagNode {
  name: string;
}

export interface PostEdge {
  node: Post;
}

export interface PostsConnection {
  edges: PostEdge[];
  pageInfo?: PageInfo;
}

// Preview post used in getPreviewPost and getPostAndMorePosts
export interface PreviewPost {
  databaseId?: number;
  id?: number;
  slug: string;
  status: string;
}

// Review author details
export interface ReviewAuthor {
  name: string;
  email: string;
  avatar: {
    url: string;
  };
  description: string;
}

export interface ReviewAuthorEdge {
  node: ReviewAuthor;
}

export interface ReviewAuthorResult {
  edges: ReviewAuthorEdge[];
}

// Authors
export interface AuthorInfo {
  ppmaAuthorName: string;
  ppmaAuthorImage: string;
  author: {
    node: {
      name: string;
      firstName: string;
      lastName: string;
      avatar: {
        url: string;
      };
    };
  };
}

export interface AuthorEdge {
  node: AuthorInfo;
}

export interface AuthorConnection {
  edges: AuthorEdge[];
}

// getPostAndMorePosts return type
export interface PostAndMorePostsResponse {
  post: Post & { content: string };
  posts: {
    edges: PostEdge[];
  };
}
