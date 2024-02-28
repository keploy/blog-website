import { useRouter } from "next/router";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import {
  fetchDataUsingShortcodes,
  getAllAuthors,
  getPostsByAuthor,
} from "../../lib/api";
import { GetStaticPaths, GetStaticProps } from "next";
import { isStringLiteral } from "typescript";
import PostByAuthorMapping from "../../components/postByAuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { changeName } from "../../utils/changeName";

export default function authorPage({ preview, filteredPosts, authorData }) {
  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div>
        <p>No posts found for this author.</p>
      </div>
    );
  }
  const router = useRouter();
  const { slug } = router.query;
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
          <h1 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-6xl sm:xl font-bold tracking-tighter leading-tight">
            Author Details
          </h1>

          <PostByAuthorMapping filteredPosts={filteredPosts} authorData={authorData}/>
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
  const authorName = changeName(filteredPosts[0].node.ppmaAuthorName);
  // console.log(authorName);
  let authorData = null;
  // console.log(authorData)
  for (let i = 0; i < authorName.length; i++) {
    const authorHtmlContent = await fetchDataUsingShortcodes(authorName[i]);
    if (authorHtmlContent !== "No Content") {
      authorData = authorHtmlContent;
      break; // Break the loop after finding the first valid content
    }
  }
  // // console.log(authorData);
  return {
    props: { preview, filteredPosts, authorData },
    revalidate: 10,
  };
};
