import { GetStaticProps } from "next";
import { getAllAuthors } from "../../lib/api";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import AuthorMapping from "../../components/AuthorMapping";

export default function Authors({ AllAuthors: { edges }, preview }) {
  const authorArray = Array.from(new Set(edges.map((item) => item.node)));

  return (
    <div className="bg-accent-1">
      <Layout preview={preview}>
        <Header />
        <Container>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold font-mono text-slate-900 ">
            AUTHORS
          </h1>
          <AuthorMapping AuthorArray={authorArray} />
        </Container>
      </Layout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const AllAuthors = await getAllAuthors();
  return {
    props: { AllAuthors, preview },
    revalidate: 10,
  };
};
