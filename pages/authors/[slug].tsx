import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import {
  getAllAuthors,
  getContent,
  getAllPosts,
} from "../../lib/api";
import { GetStaticPaths, GetStaticProps } from "next";
import PostByAuthorMapping from "../../components/postByAuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";

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
  const names = (AllAuthors.edges || []).flatMap(({ node }) => {
    const raw = node.ppmaAuthorName || "";
    return raw.includes(",") ? raw.split(",").map((s) => s.trim()) : [raw.trim()];
  });
  const unique = Array.from(new Set(names.filter(Boolean)));
  return {
    paths: unique.map((n) => `/authors/${n}`),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const { slug } = params as { slug: string };

  let allEdges: any[] = [];
  try {
    const all = await getAllPosts();
    allEdges = all?.edges || [];
  } catch (error) {
    console.error('Error in getStaticProps getAllPosts:', error);
    allEdges = [];
  }

  const normalized = decodeURIComponent(slug).trim().toLowerCase();
  const matches = allEdges.filter(({ node }) => {
    const raw = (node?.ppmaAuthorName || "").toLowerCase();
    if (!raw) return false;
    if (raw.includes(",")) {
      return raw.split(",").map((s) => s.trim()).includes(normalized);
    }
    return raw.trim() === normalized;
  });
  const allPosts = matches;

  let content: string | null = null;
  try {
    const postId = allPosts.length > 0 ? allPosts[0]?.node?.postId : null;
    content = postId ? await getContent(postId) : null;
  } catch (error) {
    console.error('Error in getStaticProps getContent:', error);
    content = null;
  }

  return {
    props: {
      preview,
      filteredPosts: allPosts,
      content,
    },
    revalidate: 10,
  };
};
