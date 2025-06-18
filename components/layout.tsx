import { ReactNode } from 'react';
import { Post } from "../types/post";
import Alert from './alert';
import Footer from './footer';
import Meta from './meta';
import Script from 'next/script';
import { motion } from "framer-motion";
import { useDarkMode } from './DarkModeContext';

interface LayoutProps {
  preview?: boolean;
  Description: string;
  featuredImage: Post["featuredImage"]["node"]["sourceUrl"];
  Title: string;
  children: ReactNode;
}

export default function Layout({
  preview,
  children,
  featuredImage,
  Title,
  Description
}: LayoutProps) {
  const { isDark } = useDarkMode();

  return (
    <>
      <Meta 
        featuredImage={featuredImage} 
        Title={Title} 
        Description={Description} 
      />
      
      {/* 
        This wrapper ensures all text and backgrounds 
        transition automatically based on theme.
      */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300"
      >
        {/* <Alert preview={preview} /> */}
        <main role="main" className="relative">
          {children}
        </main>
        <Footer />
      </motion.div>

      {/* Analytics Scripts */}
      <Script 
        src="https://www.googletagmanager.com/gtag/js?id=G-GYS09X6KHS" 
        strategy="afterInteractive" 
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GYS09X6KHS');
        `}
      </Script>
      <Script 
        id="ms-clarity" 
        strategy="afterInteractive"
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
      {/* Google News Script */}
      <Script 
        src="https://news.google.com/swg/js/v1/swg-basic.js" 
        strategy="afterInteractive"
        id="swg-basic"
      />
      <Script id="publisher-script" strategy="afterInteractive">
        {`
          (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
            basicSubscriptions.init({
              type: "NewsArticle",
              isPartOfType: ["Product"],
              isPartOfProductId: "CAowz4a6DA:openaccess",
              clientOptions: { theme: "${isDark ? 'dark' : 'light'}", lang: "en" },
            });
          });
        `}
      </Script>
      {/* Apollo Tracking */}
      <Script id="apollo-tracker" strategy="afterInteractive">
        {`
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
        `}
      </Script>
    </>
  );
}
