import { AppProps } from 'next/app';
import '../styles/index.css';
import Router from "next/router";
import { Inter } from 'next/font/google';

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
 
const PageLoader = dynamic(() => import('../components/PageLoader'), {
  ssr: false,
})

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Used for page transition
    const startLoader = () => {
      setLoading(true);
    };
    const stopLoader = () => {
      setLoading(false);
    };
    Router.events.on("routeChangeStart", startLoader);
    Router.events.on("routeChangeComplete", stopLoader);
    Router.events.on("routeChangeError", stopLoader);
    return () => {
      Router.events.off("routeChangeStart", startLoader);
      Router.events.off("routeChangeComplete", stopLoader);
      Router.events.off("routeChangeError", stopLoader);
    };
  }, []);

  return (
    <div className={inter.variable}>
      <AnimatePresence>
        {loading ? <PageLoader /> : <Component {...pageProps} />}
      </AnimatePresence>
    </div>
  );
}

export default MyApp
