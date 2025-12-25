import { AppProps } from 'next/app';
import '../styles/index.css';
import Router from "next/router";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'
 
// PageLoader is no longer used in favor of Skeleton Loaders


import BlogPageSkeleton from '../components/skeletons/BlogPageSkeleton';
import PostPageSkeleton from '../components/skeletons/PostPageSkeleton';

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);
  const [targetPath, setTargetPath] = useState("");

  useEffect(() => {
    const startLoader = (url: string) => {
      setTargetPath(url);
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

  const getSkeleton = () => {
    if (targetPath.includes('/technology/') || targetPath.includes('/community/')) {
        if (targetPath === '/technology' || targetPath === '/community' || targetPath === '/technology/' || targetPath === '/community/') {
            return <BlogPageSkeleton />;
        }
        return <PostPageSkeleton />;
    }
    return <BlogPageSkeleton />; // Default to blog home skeleton
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
            <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {getSkeleton()}
            </motion.div>
        ) : (
            <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Component {...pageProps} />
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MyApp
