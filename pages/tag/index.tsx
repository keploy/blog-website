import { GetStaticProps } from "next";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { HOME_OG_IMAGE_URL } from "../../lib/constants";
import Head from "next/head";
import { getAllTags } from "../../lib/api";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaSearch } from 'react-icons/fa';
import { useEffect, useRef } from "react";
import { getIconComponentForTag } from "../../utils/tagIcons";
import { getBreadcrumbListSchema, SITE_URL } from "../../lib/structured-data";
 
 export default function Tags({ edgesAllTags, preview }) {
   const [searchTerm, setSearchTerm] = useState("");
   const [visibleCount, setVisibleCount] = useState(60);
   const [isLoading, setIsLoading] = useState(false);
   const sentinelRef = useRef<HTMLDivElement | null>(null);
   const PAGE_SIZE = 60;
 
   const filteredTags = useMemo(() => {
     const query = (searchTerm || "").trim().toLowerCase();
     if (!query) return edgesAllTags || [];
 
     const withScores = (edgesAllTags || []).map(({ name }) => {
       const lower = (name || "").toLowerCase();
       const starts = lower.startsWith(query);
       const includes = lower.includes(query);
       const score = starts ? 2 : includes ? 1 : 0;
       return { name, score };
     });
 
     return withScores
       .filter(({ score }) => score > 0)
       .sort((a, b) => b.score - a.score)
       .map(({ name }) => ({ name }));
   }, [edgesAllTags, searchTerm]);
 
  // Fixed gray style for all tag buttons
  const renderTagButton = (name: string, prevIconName?: string) => {
    const IconCompPreferred = getIconComponentForTag(name, prevIconName);
    let IconComp = IconCompPreferred as any;
    const classes = `bg-slate-100 hover:bg-slate-200 text-slate-700`;
    return { IconComp, classes };
  };
 
   const hasMore = filteredTags.length > visibleCount;
   const visibleTags = useMemo(() => filteredTags.slice(0, visibleCount), [filteredTags, visibleCount]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current as unknown as Element;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setVisibleCount((c) => c + PAGE_SIZE);
          setIsLoading(false);
        }, 150);
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, isLoading]);

 return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Tags`}
      Description={`List of All the Tags`}
      structuredData={[
        getBreadcrumbListSchema([
          { name: "Home", url: SITE_URL },
          { name: "Tags", url: `${SITE_URL}/tag` },
        ]),
      ]}
    >
      <Head>
        <title>{`Tags`}</title>
      </Head>
      <Header />
      <Container>
        <h1 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-5xl font-bold tracking-tighter leading-tight">
          Tags
        </h1>
        <div className="flex w-full mb-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {visibleTags.length > 0 ? (
            visibleTags.map(({ name }, idx) => {
              const prev = idx > 0 ? visibleTags[idx - 1].name : undefined;
              const { IconComp, classes } = renderTagButton(name, prev as string | undefined);
              return (
                <Link href={`/tag/${name}`} key={name}>
                  <button
                    className={`inline-flex items-center ${classes} font-medium py-2 px-4 rounded transition-colors`}
                    aria-label={`Open tag ${name}`}
                  >
                    <IconComp className="mr-2" />
                    {name}
                  </button>
                </Link>
              );
            })
          ) : (
            <p className="text-center text-gray-500 w-full">No tags found by the name &quot;{searchTerm}&quot;</p>
          )}
          {isLoading && (
            <div className="flex items-center px-4 py-2 rounded bg-slate-100 text-slate-500 animate-pulse">
              Loading more…
            </div>
          )}
        </div>
        {hasMore && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <button
              onClick={() => {
                if (!isLoading) {
                  setIsLoading(true);
                  setTimeout(() => {
                    setVisibleCount((c) => c + PAGE_SIZE);
                    setIsLoading(false);
                  }, 150);
                }
              }}
              disabled={isLoading}
              className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                'Load More Tags'
              )}
            </button>
          </div>
        )}
        <div ref={sentinelRef} />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const edgesAllTags = await getAllTags();
  return {
    props: { edgesAllTags, preview },
    revalidate: 10,
  };
};
