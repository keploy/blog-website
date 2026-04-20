import Head from "next/head";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

const glossaryTerms = [
  {
    name: "API Regression Testing",
    description:
      "A testing method that verifies API behavior remains stable after code changes, dependency updates, or infrastructure changes.",
  },
  {
    name: "Behavior Replay",
    description:
      "Reproducing recorded production API traffic in test environments to detect deviations before release.",
  },
  {
    name: "Test Generation",
    description:
      "Automatically creating test cases from observed API traffic, contracts, or source code context.",
  },
  {
    name: "Dependency Virtualization",
    description:
      "Simulating external services so APIs can be tested deterministically without brittle external dependencies.",
  },
  {
    name: "Flaky Test",
    description:
      "A non-deterministic test that passes or fails inconsistently without relevant code changes.",
  },
  {
    name: "Shift-Left Testing",
    description:
      "A practice of moving testing earlier into development and pull request workflows.",
  },
];

export default function GlossaryHub({ preview }) {
  const pageUrl = `${SITE_URL}/glossary`;
  const pageTitle = "Keploy API Testing Glossary";
  const pageDescription =
    "Definitions of key API testing and quality engineering terms used across the Keploy ecosystem.";

  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Keploy API Testing Glossary",
    url: pageUrl,
    hasDefinedTerm: glossaryTerms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.name,
      description: term.description,
      inDefinedTermSet: pageUrl,
    })),
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
          { name: "Glossary", url: pageUrl },
        ]),
        definedTermSetSchema,
      ]}
      canonicalUrl={pageUrl}
    >
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Header />
      <Container>
        <section className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Glossary</h1>
          <p className="text-lg text-gray-700 mb-8">{pageDescription}</p>
          <dl className="space-y-5">
            {glossaryTerms.map((term) => (
              <div key={term.name} className="border border-gray-200 rounded-xl p-5 bg-white">
                <dt className="text-2xl font-semibold mb-2">{term.name}</dt>
                <dd className="text-gray-700">{term.description}</dd>
              </div>
            ))}
          </dl>
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