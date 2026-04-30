import Head from "next/head";
import { CMS_NAME, HOME_OG_IMAGE_URL } from "../lib/constants";
import { Post } from "../types/post";

export default function Meta({
  featuredImage,
  Title,
  Description,
  structuredData = [],
  canonicalUrl,
  ogType = "article",
  publishedDate,
}: {
  featuredImage: Post["featuredImage"]["node"]["sourceUrl"];
  Title: Post["title"];
  Description: string;
  structuredData?: Record<string, unknown>[];
  canonicalUrl?: string;
  ogType?: "article" | "website";
  publishedDate?: string;
}) {
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
      {/* Twitter Summary card images must be at least 120x120px */}
      <meta name="twitter:image" content={featuredImage} />

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
      {featuredImage && (
        <>
          <meta property="og:image" content={featuredImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="627" />
          <meta name="twitter:image" content={featuredImage} />
        </>
      )}
      {!featuredImage && (
        <>
          <meta property="og:image" content={HOME_OG_IMAGE_URL} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="627" />
          <meta name="twitter:image" content={HOME_OG_IMAGE_URL} />
        </>
      )}
      {structuredData.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
