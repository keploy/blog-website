import Head from "next/head";
import { CMS_NAME, HOME_OG_IMAGE_URL } from "../lib/constants";

export default function Meta() {
  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="blog/favicon/Group.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="blog/favicon/Group.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="blog/favicon/Group.png"
      />
      <link rel="manifest" href="blog/favicon/site.webmanifest" />
      <link rel="mask-icon" href="blog/favicon/Group.svg" color="#000000" />
      <link rel="shortcut icon" href="blog/favicon/Group" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta
        name="msapplication-config"
        content="blog/favicon/browserconfig.xml"
      />
      <meta name="theme-color" content="#000" />
      <link rel="alternate" type="application/rss+xml" href="blog/feed.xml" />
      <meta name="description" content={`Kepoy Blog`} />
      <meta property="og:image" content='https://keploy.io/wp/wp-content/uploads/2023/11/thumbnil--e1701152864829.png' />
      <meta property="og:image:width" content='1200' />
      <meta property="og:image:height" content='627' />

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
