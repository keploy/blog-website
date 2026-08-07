import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../lib/api";
import Header from "../components/header";
import Link from "next/link";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import TopBlogs from "../components/topBlogs";
import Testimonials from "../components/testimonials";
import Image from "next/image";
import OpenSourceVectorPng from "../public/images/open-source-vector.png";
import {
  getWebSiteSchema,
  getCollectionPageSchema,
  SITE_URL,
} from "../lib/structured-data";
import { REVALIDATE_CONTENT } from "../lib/isr";
// Canonical /blog title. Shared by Layout's `Title` prop (which Meta.tsx
// turns into og:title / twitter:title) and the <Head><title>, so the
// document title and social metadata can't drift apart.
const BLOG_TITLE =
  "Keploy Blog — API Testing, Test Automation & eBPF Deep-Dives";
// Shared by Layout's `Description` prop and the CollectionPage schema below so
// the rendered meta description and the structured data can't drift apart.
const BLOG_DESCRIPTION =
  "The Keploy Blog offers in-depth articles and expert insights on software testing, automation, and quality assurance, empowering developers to enhance their testing strategies and deliver robust applications.";

export default function Index({ communityPosts, technologyPosts, preview }) {
  // Organization schema is in _document.tsx (global) — not duplicated here.
  // No BreadcrumbList: a single "Home" item is a no-op that SEMrush/Google flag,
  // so the home route carries WebSite plus the CollectionPage below.
  const featuredItems = [
    ...(communityPosts || []).map(({ node }: any) => ({
      url: `${SITE_URL}/community/${node.slug}`,
      name: node.title,
      image: node.featuredImage?.node?.sourceUrl,
    })),
    ...(technologyPosts || []).map(({ node }: any) => ({
      url: `${SITE_URL}/technology/${node.slug}`,
      name: node.title,
      image: node.featuredImage?.node?.sourceUrl,
    })),
  ];
  // The home route is a listing like /technology and /tag/{slug}, so it gets the
  // same CollectionPage treatment. That also gives it a page-type node, which it
  // previously lacked: WebSite describes the site and ItemList the cards, but
  // neither says what this page is. The featured ItemList is the mainEntity.
  const structuredData = [
    getWebSiteSchema(),
    getCollectionPageSchema({
      name: BLOG_TITLE,
      url: SITE_URL,
      description: BLOG_DESCRIPTION,
      items: featuredItems,
    }),
  ];

  return (

    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={BLOG_TITLE}
      Description={BLOG_DESCRIPTION}
      structuredData={structuredData}
      canonicalUrl={SITE_URL}
      ogType="website"
    >
      <Head>
        {/* Meta.tsx renders og:title / twitter:title from Layout's `Title`
            prop but does NOT emit a <title> tag (see LIVE-11 note in
            authors/[slug].tsx). Without this <Head><title>, /blog ships
            with no document title — same regression that hit author pages. */}
        <title>{BLOG_TITLE}</title>
      </Head>
      <Header />
      <Container>
        <div className="">
          <div className="home-container md:mb-0 mb-4 flex lg:flex-nowrap flex-wrap-reverse justify-evenly items-center">
            <div className="content">
              <h1 className="heading1 font-bold 2xl:text-7xl text-6xl text-orange-400">
                Keploy Engineering Blog
              </h1>
              <p className="content-body body 2xl:text-2xl text-lg mt-6">
                Empowering your tech journey with expert advice and analysis
              </p>
              <div className="btn-wrapper flex flex-wrap gap-4 mt-6 ">
                <Link
                  href="/technology"
                  className="relative px-4 py-1 overflow-hidden transition-all border border-black md:text-xl 2xl:text-2xl md:px-8 md:py-2 hover:border-orange-400 before:absolute before:bottom-0 before:left-0 before:top-0 before:z-0 before:h-full before:w-0 before:bg-orange-400 before:transition-all before:duration-250 rounded-xl hover:text-white hover:before:left-0 hover:before:w-full"
                >
                  <span className="relative z-10">Technology</span>
                </Link>
                <Link
                  href="/community"
                  className="relative px-4 py-1 overflow-hidden transition-all border border-black active:scale-95 md:text-xl 2xl:text-2xl md:px-8 md:py-2 hover:border-orange-400 before:absolute before:bottom-0 before:left-0 before:top-0 before:z-0 before:h-full before:w-0 before:bg-orange-400 before:transition-all before:duration-250 rounded-xl hover:text-white hover:before:left-0 hover:before:w-full"
                >
                  <span className="relative z-10">Community</span>
                </Link>
              </div>
            </div>

            <div className="blog-hero-img">
              <Image
                src="/blog/images/blog-bunny.png"
                alt="hero image"
                width={600}
                height={600}
              />
            </div>
          </div>
        </div>
        <TopBlogs
          communityPosts={communityPosts}
          technologyPosts={technologyPosts}
        />
        <Testimonials />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allCommunityPosts = await getAllPostsForCommunity(preview);
  const allTehcnologyPosts = await getAllPostsForTechnology(preview);

  return {
    props: {
      communityPosts:
        allCommunityPosts?.edges?.length > 3
          ? allCommunityPosts?.edges?.slice(0, 3)
          : allCommunityPosts?.edges,
      technologyPosts:
        allTehcnologyPosts?.edges?.length > 3
          ? allTehcnologyPosts?.edges?.slice(0, 3)
          : allTehcnologyPosts.edges,
      preview,
    },
    revalidate: REVALIDATE_CONTENT,
  };
};
