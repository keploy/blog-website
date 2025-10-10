import { GetStaticProps } from "next";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Head from "next/head";
import { getAllTags } from "../../lib/api";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaSearch } from 'react-icons/fa';

export default function Tags({ edgesAllTags, preview }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredTags = useMemo(() => {
    const query = (searchTerm || "").trim().toLowerCase();
    if (!query) return edgesAllTags || [];

    const withScores = (edgesAllTags || []).map(({ name }) => {
      const lower = (name || "").toLowerCase();
      const starts = lower.startsWith(query);
      const includes = lower.includes(query);
      const score = starts ? 2 : includes ? 1 : 0;
      return { name, score };
    });

    return withScores
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ name }) => ({ name }));
  }, [edgesAllTags, searchTerm]);

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
        <h1 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-5xl font-bold tracking-tighter leading-tight">
          Tags
        </h1>
        <div className="flex w-full mb-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {filteredTags.length > 0 ? (
            filteredTags.map(({ name }) => (
              <Link href={`/tag/${name}`} key={name}>
                <button className="bg-slate-200 hover:bg-slate-300 text-slate-500 font-bold py-2 px-4 rounded">
                  {name}
                </button>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">No tags found by the name &quot;{searchTerm}&quot;</p>
          )}
        </div>
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const edgesAllTags = await getAllTags();
  return {
    props: { edgesAllTags, preview },
    revalidate: 10,
  };
};
