import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import { Post } from "../types/post";
import { safeJsonLdStringify } from "../utils/seo";

export interface MetaProps {
  featuredImage?: string;
  Title?: string;
  Description?: string;
  structuredData?: Record<string, unknown>[];
  canonicalUrl?: string;
  ogType?: "article" | "website";
  publishedDate?: string;
}

export default function Meta({
  featuredImage,
  Title = "",
  Description = "",
  structuredData = [],
  canonicalUrl,
  ogType = "article",
  publishedDate,
}: MetaProps) {
  const ogImageUrl = featuredImage || HOME_OG_IMAGE_URL;

  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/blog/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/blog/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/blog/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/blog/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/blog/favicon/safari-pinned-tab.svg"
        color="#000000"
      />
      <link rel="shortcut icon" href="/blog/favicon/favicon.ico" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={Title} />
      <meta name="twitter:description" content={Description} />
      <meta name="twitter:image" content={ogImageUrl} />

      <meta name="msapplication-TileColor" content="#FF914D" />
      <meta
        name="msapplication-config"
        content="/blog/favicon/browserconfig.xml"
      />
      <meta name="theme-color" content="#FF914D" />
      <link rel="alternate" type="application/rss+xml" href="/blog/feed.xml" />
      <meta name="description" content={Description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Keploy Blog" />
      <meta property="og:locale" content="en_US" />
      {publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
      <meta property="og:title" content={Title} />
      <meta property="og:description" content={Description} />
      {canonicalUrl && (
        <>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:url" content={canonicalUrl} />
        </>
      )}
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="627" />
      {structuredData.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          // Use safeJsonLdStringify (not raw JSON.stringify) so that field
          // values containing `<`/`>`/`&`/U+2028/U+2029 (e.g. a WP title
          // decoded through sanitizeTitle, or an inline-code paragraph in
          // HowTo step text) can't terminate this <script> tag or trip
          // JSONP/inline-JS parsers.
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(schema) }}
        />
      ))}
      {/* <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
      <script>hljs.highlightAll();</script> */}
    </Head>
  );
}
