import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import { Post } from "../types/post";

interface MetaProps {
  featuredImage: Post["featuredImage"]["node"]["sourceUrl"];
  Title: Post["title"];
  Description: string;
}

export default function Meta({
  featuredImage,
  Title,
  Description,
}: MetaProps): JSX.Element {
  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/blog/favicon/Group.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/blog/favicon/Group.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/blog/favicon/Group.png"
      />
      <link rel="manifest" href="blog/favicon/site.webmanifest" />
      <link rel="mask-icon" href="blog/favicon/Group.svg" color="#000000" />
      <link rel="shortcut icon" href="blog/favicon/Group" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={Title} />
      <meta name="twitter:description" content={Description} />
      <meta name="twitter:image" content={featuredImage} />

      <meta name="msapplication-TileColor" content="#000000" />
      <meta
        name="msapplication-config"
        content="blog/favicon/browserconfig.xml"
      />
      <meta name="theme-color" content="#000" />
      <link rel="alternate" type="application/rss+xml" href="blog/feed.xml" />
      <meta name="description" content={Description} />
      <meta property="og:title" content={Title} />
      <meta property="og:description" content={Description} />

      {featuredImage ? (
        <>
          <meta property="og:image" content={featuredImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="627" />
          <meta name="twitter:image" content={featuredImage} />
        </>
      ) : (
        <>
          <meta property="og:image" content={HOME_OG_IMAGE_URL} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="627" />
          <meta name="twitter:image" content={HOME_OG_IMAGE_URL} />
        </>
      )}
    </Head>
  );
}
