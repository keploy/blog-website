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
 
   // Much wider palette; low-opacity backgrounds, non-white, minimal
   const colorChoices = useMemo(() => {
     return [
       { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' },
       { bg: 'bg-sky-100', text: 'text-sky-700', hover: 'hover:bg-sky-200' },
       { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-200' },
       { bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-200' },
       { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200' },
       { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-200' },
       { bg: 'bg-lime-100', text: 'text-lime-700', hover: 'hover:bg-lime-200' },
       { bg: 'bg-yellow-100', text: 'text-yellow-700', hover: 'hover:bg-yellow-200' },
       { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200' },
       { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200' },
       { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:bg-red-200' },
       { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-200' },
       { bg: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200' },
       { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', hover: 'hover:bg-fuchsia-200' },
       { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200' },
       { bg: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:bg-violet-200' },
       { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200' },
       { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100' },
       { bg: 'bg-sky-50', text: 'text-sky-700', hover: 'hover:bg-sky-100' },
       { bg: 'bg-cyan-50', text: 'text-cyan-700', hover: 'hover:bg-cyan-100' },
       { bg: 'bg-teal-50', text: 'text-teal-700', hover: 'hover:bg-teal-100' },
       { bg: 'bg-emerald-50', text: 'text-emerald-700', hover: 'hover:bg-emerald-100' },
       { bg: 'bg-green-50', text: 'text-green-700', hover: 'hover:bg-green-100' },
       { bg: 'bg-lime-50', text: 'text-lime-700', hover: 'hover:bg-lime-100' },
       { bg: 'bg-yellow-50', text: 'text-yellow-700', hover: 'hover:bg-yellow-100' },
       { bg: 'bg-amber-50', text: 'text-amber-700', hover: 'hover:bg-amber-100' },
       { bg: 'bg-orange-50', text: 'text-orange-700', hover: 'hover:bg-orange-100' },
       { bg: 'bg-red-50', text: 'text-red-700', hover: 'hover:bg-red-100' },
       { bg: 'bg-rose-50', text: 'text-rose-700', hover: 'hover:bg-rose-100' },
       { bg: 'bg-pink-50', text: 'text-pink-700', hover: 'hover:bg-pink-100' },
       { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', hover: 'hover:bg-fuchsia-100' },
       { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100' },
       { bg: 'bg-violet-50', text: 'text-violet-700', hover: 'hover:bg-violet-100' },
       { bg: 'bg-indigo-50', text: 'text-indigo-700', hover: 'hover:bg-indigo-100' },
       { bg: 'bg-slate-100', text: 'text-slate-700', hover: 'hover:bg-slate-200' },
       { bg: 'bg-neutral-100', text: 'text-neutral-700', hover: 'hover:bg-neutral-200' },
       { bg: 'bg-stone-100', text: 'text-stone-700', hover: 'hover:bg-stone-200' },
     ];
   }, []);
 
   const getColorForTag = (name: string) => {
     let hash = 0;
     for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
     const idx = Math.abs(hash) % colorChoices.length;
     return colorChoices[idx];
   };
 
   // Avoid adjacent duplicate icons by checking previous tag's chosen icon
   const renderTagButton = (name: string, prevIconName?: string) => {
     const IconCompPreferred = getIconComponentForTag(name, prevIconName);
     let IconComp = IconCompPreferred as any;
     const { bg, text, hover } = getColorForTag(name);
     return { IconComp, classes: `${bg} ${hover} ${text}` };
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
