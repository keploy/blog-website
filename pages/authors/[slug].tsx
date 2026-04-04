import Layout from "../../components/layout";
import Head from "next/head";
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
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

export default function AuthorPage({ preview, filteredPosts, content }) {
  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div>
        <p>No posts found for this author.</p>
      </div>
    );
  }

  const authorName = filteredPosts[0]?.node?.ppmaAuthorName;

  return (
    <div className="bg-accent-1">
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`${authorName} Page`}
        Description={`Read all articles by ${authorName} on the Keploy blog — covering software testing, API development, automation, and engineering best practices.`}
        structuredData={[
          getBreadcrumbListSchema([
            { name: "Home", url: SITE_URL },
            { name: "Authors", url: `${SITE_URL}/authors` },
            {
              name: authorName || "Author",
              url: `${SITE_URL}/authors/${sanitizeAuthorSlug(authorName || "")}`,
            },
          ]),
        ]}
      >
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Header />
        <Container>
          <PostByAuthorMapping filteredPosts={filteredPosts} Content={content} />
        </Container>
      </Layout>
    </div>
  );
}
export const getStaticPaths: GetStaticPaths = async ({ }) => {
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

