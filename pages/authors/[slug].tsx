import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import {
  getAllAuthors,
  getContent,
  getPostsByAuthor,
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
  const { slug } = params;
  const postsByAuthor = await getPostsByAuthor();
  const filteredPosts = postsByAuthor.edges.filter(
    (item) => item.node.ppmaAuthorName === slug
  );
  const postId = (filteredPosts[0].node.postId);
  const content = await getContent(postId);

  return {
    props: { preview, filteredPosts , content},
    revalidate: 10,
  };
};
