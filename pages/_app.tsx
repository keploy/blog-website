import { AppProps } from 'next/app';
import '../styles/index.css';
import Router from "next/router";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import { ThemeProvider } from 'next-themes';

 
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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <AnimatePresence>
        {loading ? <PageLoader /> : <Component {...pageProps} />}
      </AnimatePresence>
    </ThemeProvider>
  );

}

export default MyApp
