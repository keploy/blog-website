import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { getAllAuthors, getContent, getPostsByAuthorName } from "../../lib/api";
import { GetStaticPaths, GetStaticProps as GetStaticPropsType } from "next";
import PostByAuthorMapping from "../../components/postByAuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Head from "next/head";
import { Post } from "../../types/post";

export default function AuthorPage({
  preview,
  filteredPosts,
  content,
}: {
  preview: boolean;
  filteredPosts: { node: Post }[];
  content: string | null;
}) {
  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`Author Not Found`}
        Description={`No posts found for this author`}
      >
        <Head>
          <title>{`Author Not Found | Keploy Blog`}</title>
        </Head>
        <Header />
        <Container>
          <p>No posts found for this author.</p>
        </Container>
      </Layout>
    );
  }

  const authorName = filteredPosts[0]?.node?.ppmaAuthorName || "Unknown Author";

  return (
    <div className="bg-accent-1">
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`${authorName} Page`}
        Description={`Posts by ${authorName}`}
      >
        <Head>
          <title>{`${authorName} | Keploy Blog`}</title>
          <link rel="preload" href={HOME_OG_IMAGE_URL} as="image" />
          <style>{`
            .heading1 { font-size: 2.25rem; font-weight: bold; background: linear-gradient(to right, #fed7aa, #f97316); -webkit-background-clip: text; color: transparent; }
            @media (min-width: 768px) { .heading1 { font-size: 3rem; } }
          `}</style>
        </Head>
        <Header />
        <Container>
          <h1 className="heading1 w-max mb-8">Author Details</h1>
          <PostByAuthorMapping filteredPosts={filteredPosts} Content={content} />
        </Container>
      </Layout>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const AllAuthors = await getAllAuthors();
  const paths = AllAuthors.edges.map(({ node }) => `/authors/${node.ppmaAuthorName}`) || [];
  return {
    paths: paths.slice(0, 50),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticPropsType = async ({ preview = false, params }) => {
  const { slug } = params as { slug: string };
  const usersMappedByFirstName = ["Animesh Pathak", "Shubham Jain", "Yash Khare"];
  const userName = usersMappedByFirstName.includes(slug) ? slug.split(" ")[0] : slug;

  const [posts, content] = await Promise.all([
    getPostsByAuthorName(userName),
    getPostsByAuthorName(userName).then((posts) =>
      posts?.edges?.[0]?.node?.postId ? getContent(posts.edges[0].node.postId) : null
    ),
  ]);

  const allPosts: { node: Post }[] = posts?.edges || []; 

  return {
    props: {
      preview,
      filteredPosts: allPosts,
      content,
    },
    revalidate: 300,
  };
};