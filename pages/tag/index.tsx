import { GetStaticProps } from "next";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Head from "next/head";
import { getAllTags } from "../../lib/api";
import Link from "next/link";

export default function Tags({ edgesAllTags, preview }) {
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Tags`}
      Description={`List of All the Tags`}
    >
      <Head>
        <title>{`Tags`}</title>
        <link rel="preload" href={HOME_OG_IMAGE_URL} as="image" />
        <style>{`
          .tag-title { font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; }
          .tag-button { background-color: #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.25rem; }
          .tag-button:hover { background-color: #cbd5e1; }
        `}</style>
      </Head>
      <Header />
      <Container>
        <h1 className="tag-title">Tags</h1>
        <div className="flex flex-wrap gap-2 mb-10">
          {edgesAllTags.map(({ name }) => (
            <Link href={`/tag/${name}`} key={name}>
              <button className="tag-button text-slate-500 font-bold">
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
  const edgesAllTags = await getAllTags();
  return {
    props: { edgesAllTags, preview },
    revalidate: 3600,
  };
};