import { Post } from "../types/post";
import Alert from './alert';
import Footer from './footer';
import Meta from './meta';
import Script from 'next/script';
import { motion } from "framer-motion";
import Header from './header';

export default function Layout({
  preview,
  children,
  featuredImage,
  Title,
  Description,
}: {
  preview: any;
  Description: any;
  featuredImage: Post["featuredImage"]["node"]["sourceUrl"];
  Title: Post["title"];
  children: React.ReactNode;
}) {
  return (
    <>
      <Meta featuredImage={featuredImage} Title={Title} Description={Description} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-500"
      >
        <Header />
        <main className="pt-24 md:pt-28 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </motion.div>
      <Footer />

      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-GYS09X6KHS" />
      <Script
        id="google-ga"
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GYS09X6KHS');
        `,
        }}
      />

      <Script
        id="msclarity"
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","jymj0ktwcp");
        `,
        }}
      />

      <Script async type="application/javascript"
        id="swg-basic"
        src="https://news.google.com/swg/js/v1/swg-basic.js">
      </Script>

      <Script
        id="publisher"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
                basicSubscriptions.init({
                  type: "NewsArticle",
                  isPartOfType: ["Product"],
                  isPartOfProductId: "CAowz4a6DA:openaccess",
                  clientOptions: { theme: "light", lang: "en" },
                });
              });
          `,
        }}
      />

      <Script
        id="apollo-tracker"
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
            function initApollo() {
              var n = Math.random().toString(36).substring(7);
              var o = document.createElement("script");
              o.src = "https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=" + n;
              o.async = true;
              o.defer = true;
              o.onload = function() {
                window.trackingFunctions.onLoad({ appId: "6644a0d6a54b5b0438c841cc" });
              };
              document.head.appendChild(o);
            }
            initApollo();
          `,
        }}
      />
    </>
  );
}

