import Head from "next/head";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../../lib/api";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";

export default function SearchPage({ q, results }) {
  return (
    <Layout
      preview={false}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Search: ${q || ""}`}
      Description={`Search results for ${q || ""}`}
    >
      <Head>
        <title>{`Search: ${q || ""}`}</title>
      </Head>
      <Header />
      <Container>
        <h1 className="text-3xl font-semibold mb-6">Search results for &quot;{q}&quot;</h1>
        {(!results || results.length === 0) ? (
          <p className="text-gray-600">No results found.</p>
        ) : (
          <ul className="space-y-4">
            {results.map(({ node }) => (
              <li key={node.slug} className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-200">
                <Link href={`/${node.categories?.edges?.[0]?.node?.name === "Community" ? "community" : "technology"}/${node.slug}`} className="text-lg font-medium hover:underline">
                  {node.title}
                </Link>
                {node.excerpt && (
                  <p className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: node.excerpt }} />
                )}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const q = String(ctx.query.q || "").toLowerCase();
  const [community, technology] = await Promise.all([
    getAllPostsForCommunity(false),
    getAllPostsForTechnology(false),
  ]);

  const combined = [
    ...(community?.edges || []),
    ...(technology?.edges || []),
  ];

  const results = q
    ? combined.filter(({ node }) =>
        (node?.title || "").toLowerCase().includes(q) ||
        (node?.excerpt || "").toLowerCase().includes(q)
      )
    : [];

  return { props: { q, results } };
};
