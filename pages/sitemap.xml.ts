import { GetServerSideProps } from "next";
import { generateSitemapXml, getStaticFallbackXml } from "../lib/sitemap";

function SitemapXml() {
  // pages router still expects a component export even though we end the response manually.
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let sitemap: string;
  let statusCode = 200;

  try {
    // generate a fresh sitemap xml if possible, or fall back to the latest successful snapshot.
    sitemap = await generateSitemapXml();
  } catch (error) {
    // all three generation tiers failed (fresh, in-memory snapshot, /tmp snapshot).
    // this only happens on a cold start when wordpress is completely unreachable.
    // serve the static-only fallback so crawlers always receive valid xml here
    // instead of next.js's default html error page.
    console.error(
      "Sitemap generation failed with no snapshot available; serving static-routes-only fallback. " +
      "Verify WordPress reachability and run the cron refresh endpoint once connectivity is restored.",
      error,
    );
    sitemap = getStaticFallbackXml();
    statusCode = 503;
  }

  // tell clients and edge caches this response is xml, not html or json.
  res.setHeader("Content-Type", "application/xml");

  // cache at the edge for one day to reduce request-time load, while allowing stale
  // responses during background revalidation.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400");

  res.statusCode = statusCode;

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
