import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../lib/api";
import Header from "../components/header";
import Link from "next/link";
import { HOME_OG_IMAGE_URL, S3_ASSET_BASE } from "../lib/constants";
import dynamic from "next/dynamic";
import TopBlogs from "../components/topBlogs";
import Image from "next/image";
import {
  getWebSiteSchema,
  getCollectionPageSchema,
  SITE_URL,
} from "../lib/structured-data";
import { buildPageTitle } from "../utils/seo";
import { REVALIDATE_CONTENT } from "../lib/isr";

// Testimonials is the bottom-of-page marquee (below the fold) and animates
// continuously, which keeps the main thread busy. Lazy-load it so its JS +
// render stay off the critical path and don't delay first paint / LCP of the
// hero. The min-height placeholder reserves space so the deferred mount doesn't
// shift on-screen content (it's below the fold, so CLS impact is nil).
const Testimonials = dynamic(() => import("../components/testimonials"), {
  ssr: false,
  // Reserve the loaded section's real height (~760px: heading + the h-[700px]
  // marquee) so the footer doesn't shift down when the chunk mounts.
  loading: () => <div className="min-h-[760px]" aria-hidden="true" />,
});
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
  // No Review structured data here — deliberate. The "What our community thinks"
  // wall (components/testimonials.tsx) is loaded client-only in PR #410
  // (next/dynamic, ssr:false) to keep the animating marquee off the LCP path, so
  // those reviews are NOT in the server HTML a crawler reads. Emitting Review
  // markup for content that isn't server-rendered is markup for invisible
  // content, which Google penalizes. getReviewSchema stays available (and tested)
  // so this can be re-wired if the wall ever returns to SSR.
  //
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
        <title>{buildPageTitle(BLOG_TITLE)}</title>
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
                src={`${S3_ASSET_BASE}/images/blog-bunny.webp`}
                alt="hero image"
                width={600}
                height={600}
                priority
                sizes="(max-width: 768px) 80vw, 600px"
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
