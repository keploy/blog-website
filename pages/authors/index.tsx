import { GetStaticProps } from "next";
import { getAllAuthors } from "../../lib/api";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import AuthorMapping from "../../components/AuthorMapping";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import { Post } from "../../types/post";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";

export default function Authors({
  AllAuthors: { edges },
  preview,
}: {
  AllAuthors: {
    edges: {
      node: { author: Post["author"]; ppmaAuthorName: Post["ppmaAuthorName"],ppmaAuthorImage: Post["ppmaAuthorImage"] };
    }[];
  };
  preview;
}) {
  const authorArray = Array.from(new Set(edges.map((item) => item.node)));

  return (
    <div className="bg-accent-1">
      <Layout
        preview={preview}
        featuredImage={HOME_OG_IMAGE_URL}
        Title={`Authors Page`}
        Description={`Giving the List of all the Authors`}
        structuredData={[
          getBreadcrumbListSchema([
            { name: "Home", url: SITE_URL },
            { name: "Authors", url: `${SITE_URL}/authors` },
          ]),
        ]}
      >
        <Header />
        <Container>
          <h1 className="bg-gradient-to-r ml-10 from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
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
