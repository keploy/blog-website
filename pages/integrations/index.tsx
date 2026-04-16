import Head from "next/head";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

const integrations = [
  {
    name: "GitHub Actions",
    summary: "Run Keploy API tests in CI with pull request checks and release pipelines.",
  },
  {
    name: "GitLab CI",
    summary: "Validate API behavior as part of merge request and deployment workflows.",
  },
  {
    name: "Jenkins",
    summary: "Integrate replay-based API regression tests into existing enterprise build jobs.",
  },
  {
    name: "Kubernetes",
    summary: "Run Keploy in staging clusters for environment-safe traffic replay testing.",
  },
  {
    name: "Postman",
    summary: "Bridge existing API collections with behavior-driven test generation.",
  },
  {
    name: "Docker",
    summary: "Containerize test capture and replay workflows for consistent team usage.",
  },
];

export default function IntegrationsHub({ preview }) {
  const pageUrl = `${SITE_URL}/integrations`;
  const pageTitle = "Keploy Integrations";
  const pageDescription =
    "Explore Keploy integrations for CI/CD, containers, cloud, and developer workflows to automate API testing at scale.";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    url: pageUrl,
    description: pageDescription,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: integrations.length,
      itemListElement: integrations.map((integration, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: integration.name,
          applicationCategory: "DeveloperApplication",
          description: integration.summary,
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
          { name: "Integrations", url: pageUrl },
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Integrations</h1>
          <p className="text-lg text-gray-700 mb-8">{pageDescription}</p>
          <ul className="space-y-5">
            {integrations.map((integration) => (
              <li key={integration.name} className="border border-gray-200 rounded-xl p-5 bg-white">
                <h2 className="text-2xl font-semibold mb-2">{integration.name}</h2>
                <p className="text-gray-700">{integration.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  return {
    props: {
      preview: false,
    },
    revalidate: 600,
  };
}