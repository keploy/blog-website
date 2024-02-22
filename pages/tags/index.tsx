import { GetStaticProps } from "next";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Head from "next/head";
import { getAllTags } from "../../lib/api";
import Link from "next/link";

function removeDuplicates(edges) {
  let tagsArray = [];
  edges?.forEach(({ node }) => {
    node?.tags.edges.forEach(({ node: tagNode }) => {
      const { name } = tagNode;
      const trimmedName = name.trim(); // Trim whitespace
      if (!tagsArray.some(item => item?.name.trim() === trimmedName)) {
        tagsArray.push(tagNode);
      }
    });
  });
  return tagsArray;
}


export default function Tags({ allTags: { edges }, preview }) {
  const uniqueEdges = removeDuplicates(edges);
    
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Tags`}
      Description={`List of All the Tags`}
    >
      <Head>
        <title>{`Tags`}</title>
      </Head>
      <Header />
      <Container>
        <h1 className="text-4xl font-semibold mb-4">Tags</h1>
        <div className="flex flex-wrap gap-2 mb-10">
          {uniqueEdges.map(({ name }) => (
            <Link href={`/tags/${name}`} key={name}>
              <button
                className="bg-slate-200 hover:bg-slate-300 text-slate-500 font-bold py-2 px-4 rounded"
              >
                {name}
              </button>
            </Link>
          ))}
        </div>
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allTags = await getAllTags();
  return {
    props: { allTags, preview },
    revalidate: 10,
  };
};
