import Head from "next/head";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

const caseStudies = [
  {
    company: "E-commerce API Platform",
    outcome: "Cut regression testing time by 68% and improved API release confidence.",
  },
  {
    company: "Developer Tools SaaS",
    outcome: "Reduced escaped API defects by adding behavior replay checks in CI.",
  },
  {
    company: "Fintech Engineering Team",
    outcome: "Stabilized critical payment flows with contract-aware test generation.",
  },
  {
    company: "B2B Integration Platform",
    outcome: "Improved integration reliability across partner APIs and webhook events.",
  },
  {
    company: "Cloud Infrastructure Startup",
    outcome: "Shortened test maintenance cycles through traffic-based test updates.",
  },
];

export default function CaseStudiesHub({ preview }) {
  const pageUrl = `${SITE_URL}/case-studies`;
  const pageTitle = "Keploy Case Studies";
  const pageDescription =
    "Read case studies on how engineering teams use Keploy to improve API quality, reduce regressions, and ship with confidence.";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    url: pageUrl,
    description: pageDescription,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: caseStudies.length,
      itemListElement: caseStudies.map((study, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: `${study.company} case study`,
          description: study.outcome,
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
          { name: "Case Studies", url: pageUrl },
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Case Studies</h1>
          <p className="text-lg text-gray-700 mb-8">{pageDescription}</p>
          <ul className="space-y-5">
            {caseStudies.map((study) => (
              <li key={study.company} className="border border-gray-200 rounded-xl p-5 bg-white">
                <h2 className="text-2xl font-semibold mb-2">{study.company}</h2>
                <p className="text-gray-700">{study.outcome}</p>
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