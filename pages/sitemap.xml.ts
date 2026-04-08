import { GetServerSideProps } from "next";
import { generateSitemapXml } from "../lib/sitemap";

function SitemapXml() {
  // pages router still expects a component export even though we end the response manually.
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // generate a fresh sitemap xml if possible, or fall back to the latest successful snapshot.
  const sitemap = await generateSitemapXml();

  // tell clients and edge caches this response is xml, not html or json.
  res.setHeader("Content-Type", "application/xml");

  // force edge revalidation per request so refreshed sitemap content is served quickly,
  // while still allowing stale responses during background revalidation.
  res.setHeader("Cache-Control", "s-maxage=0, stale-while-revalidate=86400");

  // write the raw xml directly into the response body.
  res.write(sitemap);

  // finish the response manually because we are not rendering a normal page.
  res.end();

  return {
    // next.js still expects a props object from getServerSideProps.
    props: {},
  };
};

export default SitemapXml;
