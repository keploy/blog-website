import { AppProps } from "next/app";
import "../styles/index.css";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

const PageLoadingSkeleton = dynamic(
  () => import("../components/blog-page-loading-state"),
  { ssr: false }
);
const HeroOnlySkeleton = dynamic(
  () => import("../components/category-page-loading-skeleton"),
  { ssr: false }
);

function SkeletonWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skeletonType, setSkeletonType] = useState<"post" | "category" | null>(
    null
  );

  useEffect(() => {
    const handleStart = (url: string) => {
      const isPostPage = /^\/blog\/[^/]+\/[^/]+$/.test(url);
      const isCategoryPage = /^\/blog\/(technology|community)$/.test(url);

      if (isPostPage) {
        setSkeletonType("post");
        setLoading(true);
      } else if (isCategoryPage) {
        setSkeletonType("category");
        setLoading(true);
      }
    };

    const handleStop = () => {
      setLoading(false);
      setSkeletonType(null);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  const renderSkeleton = () => {
    if (skeletonType === "post") return <PageLoadingSkeleton />;
    if (skeletonType === "category") return <HeroOnlySkeleton />;
    return null;
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? renderSkeleton() : children}
    </AnimatePresence>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SkeletonWrapper>
      <Component {...pageProps} />
    </SkeletonWrapper>
  );
}

export default MyApp;
