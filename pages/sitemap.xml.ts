import { GetServerSideProps } from "next";
import { generateSitemapXml } from "../lib/sitemap";

function SitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = await generateSitemapXml();

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SitemapXml;
