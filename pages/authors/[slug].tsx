import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import {
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
  try {
    const allPosts = await getAllPosts();
    const uniqueNames = new Set<string>();

    allPosts?.edges?.forEach(({ node }) => {
      const authorName = node?.ppmaAuthorName;
      if (typeof authorName === "string" && authorName.trim().length > 0) {
        uniqueNames.add(authorName);
      }
    });

    const paths = Array.from(uniqueNames).map((name) => `/authors/${sanitizeAuthorSlug(name)}`);

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error("authors/[slug] getStaticPaths error:", error);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const slugParam = params?.slug;

  if (typeof slugParam !== "string" || slugParam.trim().length === 0) {
    return {
      props: {
        preview,
        filteredPosts: [],
        content: null,
      },
      revalidate: 60,
    };
  }

  const normalizedSlug = slugParam.toLowerCase();
  const slugWords = normalizedSlug.split(/[-_\s]+/).filter(Boolean);
  const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
  const titleCaseName = slugWords.map(capitalise).join(" ");
  const spacedLower = slugWords.join(" ");
  const hyphenLower = slugWords.join("-");
  const titleHyphen = slugWords.map(capitalise).join("-");

  const candidateAuthorNames = new Set<string>();
  candidateAuthorNames.add(slugParam);
  candidateAuthorNames.add(normalizedSlug);
  if (spacedLower) candidateAuthorNames.add(spacedLower);
  if (hyphenLower) candidateAuthorNames.add(hyphenLower);
  if (titleCaseName) candidateAuthorNames.add(titleCaseName);
  if (titleHyphen) candidateAuthorNames.add(titleHyphen);
  if (slugWords.length) {
    candidateAuthorNames.add(capitalise(slugWords[0]));
    candidateAuthorNames.add(slugWords[0]);
  }

  let filteredPosts = [];

  for (const candidate of Array.from(candidateAuthorNames)) {
    if (!candidate) continue;
    try {
      const postsResponse = await getPostsByAuthorName(candidate);
      const edges = postsResponse?.edges || [];
      if (edges.length > 0) {
        filteredPosts = edges;
        break;
      }
    } catch (error) {
      console.error(`authors/[slug] failed to fetch posts for candidate "${candidate}":`, error);
    }
  }

  if (!filteredPosts.length) {
    try {
      const allPostsResponse = await getAllPosts();
      filteredPosts =
        allPostsResponse?.edges?.filter(({ node }) => {
          const candidateName = node?.ppmaAuthorName;
          if (!candidateName || Array.isArray(candidateName)) {
            return false;
          }
          return sanitizeAuthorSlug(candidateName) === sanitizeAuthorSlug(slugParam);
        }) || [];
    } catch (error) {
      console.error("authors/[slug] fallback to getAllPosts failed:", error);
      filteredPosts = [];
    }
  }

  let content = null;
  const postId = filteredPosts[0]?.node?.postId;
  if (postId) {
    try {
      content = await getContent(postId);
    } catch (error) {
      console.error(`authors/[slug] failed to fetch content for postId ${postId}:`, error);
    }
  }

  return {
    props: {
      preview,
      filteredPosts,
      content,
    },
    revalidate: 60,
  };
};
