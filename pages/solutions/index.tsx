import Head from "next/head";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

const solutions = [
  {
    name: "Startups",
    summary: "Ship faster with automated API regression tests that fit lean engineering teams.",
  },
  {
    name: "Scaleups",
    summary: "Reduce release risk across microservices with behavior replay and test generation.",
  },
  {
    name: "Enterprise",
    summary: "Add governance-friendly API testing with auditability, dedicated support, and controls.",
  },
  {
    name: "Developer Platforms",
    summary: "Embed API quality gates into internal developer platforms and golden pipelines.",
  },
  {
    name: "Fintech and SaaS",
    summary: "Validate critical transaction workflows with deterministic, production-like API tests.",
  },
];

export default function SolutionsHub({ preview }) {
  const pageUrl = `${SITE_URL}/solutions`;
  const pageTitle = "Keploy Solutions";
  const pageDescription =
    "Discover Keploy solutions for startups, scaleups, and enterprise teams building reliable APIs and faster release pipelines.";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    url: pageUrl,
    description: pageDescription,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: solutions.length,
      itemListElement: solutions.map((solution, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: solution.name,
          description: solution.summary,
        },
      })),
    },
  };

  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={pageTitle}
      Description={pageDescription}
      structuredData={[
        getBreadcrumbListSchema([
          { name: "Home", url: SITE_URL },
          { name: "Solutions", url: pageUrl },
        ]),
        collectionSchema,
      ]}
      canonicalUrl={pageUrl}
    >
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Header />
      <Container>
        <section className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Solutions</h1>
          <p className="text-lg text-gray-700 mb-8">{pageDescription}</p>
          <ul className="space-y-5">
            {solutions.map((solution) => (
              <li key={solution.name} className="border border-gray-200 rounded-xl p-5 bg-white">
                <h2 className="text-2xl font-semibold mb-2">{solution.name}</h2>
                <p className="text-gray-700">{solution.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
    },
    revalidate: 600,
  };
}