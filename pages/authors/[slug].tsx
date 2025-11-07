import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import {
  getAllAuthors,
  getAllPosts,
  getContent,
  getPostsByAuthorName,
} from "../../lib/api";
import { GetStaticPaths, GetStaticProps } from "next";
import PostByAuthorMapping from "../../components/postByAuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { sanitizeAuthorSlug } from "../../utils/sanitizeAuthorSlug";

export default function AuthorPage({ preview, filteredPosts ,content }) {
  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div>
        <p>No posts found for this author.</p>
      </div>
    );
  }

  const authorName  =  filteredPosts[0]?.node?.ppmaAuthorName;

  return (
    <div className="bg-accent-1">
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`${authorName} Page`}
        Description={`Posts by ${authorName}`}
      >
        <Header />
        <Container>
          <h1 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-6xl sm:xl font-bold tracking-tighter leading-tight">
            Author Details
          </h1>

          <PostByAuthorMapping filteredPosts={filteredPosts} Content={content}/>
        </Container>
      </Layout>
    </div>
  );
}
export const getStaticPaths: GetStaticPaths = async ({}) => {
  const AllAuthors = await getAllAuthors();
  // Create a Set to get unique author names
  const uniqueAuthors = new Set<string>();
  AllAuthors.edges.forEach(({ node }) => {
    if (node.ppmaAuthorName) {
      uniqueAuthors.add(node.ppmaAuthorName);
    }
  });
  
  return {
    paths:
      Array.from(uniqueAuthors).map((authorName) => `/authors/${sanitizeAuthorSlug(authorName)}`) ||
      [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const { slug } = params as { slug: string };

  // Get all authors to find the original author name from the sanitized slug
  const AllAuthors = await getAllAuthors();
  const uniqueAuthors = new Set<string>();
  AllAuthors.edges.forEach(({ node }) => {
    if (node.ppmaAuthorName) {
      uniqueAuthors.add(node.ppmaAuthorName);
    }
  });

  // Find the original author name by matching sanitized slugs
  let originalAuthorName = null;
  for (const authorName of Array.from(uniqueAuthors)) {
    if (sanitizeAuthorSlug(authorName) === slug) {
      originalAuthorName = authorName;
      break;
    }
  }

  if (!originalAuthorName) {
    return {
      notFound: true,
    };
  }

  // Build a list of candidate author names to try when querying posts
  const candidateAuthorNames = new Set<string>();
  candidateAuthorNames.add(originalAuthorName);
  candidateAuthorNames.add(originalAuthorName.toLowerCase());
  candidateAuthorNames.add(originalAuthorName.trim());
  candidateAuthorNames.add(originalAuthorName.replace(/-/g, " "));

  const nameParts = originalAuthorName.split(/\s+|-/).filter(Boolean);
  if (nameParts.length) {
    candidateAuthorNames.add(nameParts[0]);
  }

  let filteredPosts = [];
  for (const candidate of Array.from(candidateAuthorNames)) {
    const postsResponse = await getPostsByAuthorName(candidate);
    const edges = postsResponse?.edges || [];
    if (edges.length > 0) {
      filteredPosts = edges;
      break;
    }
  }

  // Fallback: pull all posts and filter by ppmaAuthorName when direct lookup fails
  if (!filteredPosts.length) {
    const allPostsResponse = await getAllPosts();
    filteredPosts =
      allPostsResponse?.edges?.filter(({ node }) => {
        const candidateName = node?.ppmaAuthorName;
        if (!candidateName || Array.isArray(candidateName)) {
          return false;
        }
        return sanitizeAuthorSlug(candidateName) === slug;
      }) || [];
  }

  if (!filteredPosts.length) {
    return {
      notFound: true,
      revalidate: 10,
    };
  }

  // Extract postId from the first matching post (if any)
  const postId = filteredPosts[0]?.node?.postId;

  // Fetch content using postId (if available)
  const content = postId ? await getContent(postId) : null;

  return {
    props: {
      preview,
      filteredPosts,
      content,
    },
    revalidate: 10, // ISR with 10 seconds revalidation
  };
};
