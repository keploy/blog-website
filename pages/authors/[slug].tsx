import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { getAllAuthors, getContent, getPostsByAuthorName } from "../../lib/api";
import { GetStaticPaths, GetStaticProps } from "next";
import PostByAuthorMapping from "../../components/postByAuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";

export default function AuthorPage({ preview, filteredPosts, content }) {
  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div className="dark:text-white">
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
        Description={`Posts by ${authorName}`}
      >
        <Header />
        <Container>
          <h1 className="bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-600 dark:to-orange-500 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-6xl sm:xl font-bold tracking-tighter leading-tight dark:text-white">
            Author Details
          </h1>

          <PostByAuthorMapping
            filteredPosts={filteredPosts}
            Content={content}
          />
        </Container>
      </Layout>
    </div>
  );
}
export const getStaticPaths: GetStaticPaths = async ({}) => {
  const AllAuthors = await getAllAuthors();
  return {
    paths:
      AllAuthors.edges.map(({ node }) => `/authors/${node.ppmaAuthorName}`) ||
      [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const { slug } = params as { slug: string };

  // Users mapped by first name
  const usersMappedByFirstName = [
    "Animesh Pathak",
    "Shubham Jain",
    "Yash Khare",
  ];

  // Determine the userName based on the slug
  let userName = slug;
  if (usersMappedByFirstName.includes(slug)) {
    userName = slug.split(" ")[0];
  }

  // Fetch posts by author name
  const posts = await getPostsByAuthorName(userName);

  // Safely extract edges from posts
  const allPosts = posts?.edges || [];

  // Extract postId from the first matching post (if any)
  const postId = allPosts.length > 0 ? allPosts[0]?.node?.postId : null;

  // Fetch content using postId (if available)
  const content = postId ? await getContent(postId) : null;

  return {
    props: {
      preview,
      filteredPosts: allPosts, // Ensure filteredPosts is always an array
      content,
    },
    revalidate: 10, // ISR with 10 seconds revalidation
  };
};
