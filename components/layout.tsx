import { Post } from "../types/post";
import Alert from './alert'
import Footer from './footer'
import Meta from './meta'
import Script from 'next/script';
import { motion } from "framer-motion";
export default function Layout({ preview, children, featuredImage, Title, Description }:{
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
        className="min-h-screen"
      >
        {/* <Alert preview={preview} /> */}
        <main>{children}</main>
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
    </>
  );
}
