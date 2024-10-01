import { Author } from "./author";
import { Tag } from "./tag";

export interface Post {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage: {
    node: {
      sourceUrl: string;
    };
  };
  author: {
    node: Author;
  };
  postAuthor: string;
  categories: {
    edges: {
      node: {
        name: string;
      };
    }[];
  };
  tags: {
    edges: Tag[];
  };
  content: string;
}

export interface PostAndMorePosts extends Post {
  posts: {
    edges: {
      node: Post;
    }[];
  };
}
