import { GetStaticProps as GetStaticPropsType } from "next"; // Type-only import
import { getAllAuthors } from "../../lib/api";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import AuthorMapping from "../../components/AuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { Post } from "../../types/post";
import Head from "next/head"; // Added missing import

export default function Authors({
  AllAuthors: { edges },
  preview,
}: {
  AllAuthors: {
    edges: {
      node: { author: Post["author"]; ppmaAuthorName: Post["ppmaAuthorName"]; ppmaAuthorImage: Post["ppmaAuthorImage"] };
    }[];
  };
  preview: boolean;
}) {
  // Use a Set to deduplicate authors by ppmaAuthorName for efficiency
  const uniqueAuthors = Array.from(
    new Map(edges.map((item) => [item.node.ppmaAuthorName, item.node])).values()
  );

  return (
    <div className="bg-accent-1">
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`Authors Page`}
        Description={`Giving the List of all the Authors`}
      >
        <Head>
          <title>{`Authors | Keploy Blog`}</title>
          <link rel="preload" href={HOME_OG_IMAGE_URL} as="image" />
          <style>{`
            .heading1 { font-size: 2.25rem; font-weight: bold; background: linear-gradient(to right, #fed7aa, #f97316); -webkit-background-clip: text; color: transparent; }
            @media (min-width: 768px) { .heading1 { font-size: 2.5rem; } }
          `}</style>
        </Head>
        <Header />
        <Container>
          <h1 className="heading1 ml-10 w-max mb-8">AUTHORS</h1>
          <AuthorMapping AuthorArray={uniqueAuthors} />
        </Container>
      </Layout>
    </div>
  );
}

export const getStaticProps: GetStaticPropsType = async ({ preview = false }) => {
  const AllAuthors = await getAllAuthors();
  return {
    props: { AllAuthors, preview },
    revalidate: 3600, // Increased to 1 hour since authors rarely change
  };
};