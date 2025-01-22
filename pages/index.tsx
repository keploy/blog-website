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
export default function Index({ communityPosts, technologyPosts, preview }) {
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Keploy Tech Blog`}
      Description={" Empowering your tech journey with expert advice and analysis"}>
      <Head>
        <title>{`Keploy Blog`}</title>
      </Head>
      <Header />
      <Container>
        <div className="">
          <div className="home-container md:mb-0 mb-4 flex lg:flex-nowrap flex-wrap-reverse justify-evenly items-center">
            <div className="content">
              <h2 className="heading1 font-bold 2xl:text-7xl text-6xl text-orange-400">
                Keploy Blog
              </h2>
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
    revalidate: 10,
  };
};