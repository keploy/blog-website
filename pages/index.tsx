import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPostsForHome, getAllPostsForTechnology } from "../lib/api";
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
      <div className="relative bg-gradient-to-br from-white to-orange-50 py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-12">
          {/* Content Section */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-orange-500">Keploy</span> Blog
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0">
              Empowering developers with cutting-edge insights, practical guides, and innovative tech perspectives
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <a 
                href="/technology" 
                className="group relative px-6 py-3 overflow-hidden border-2 border-orange-500 text-orange-500 rounded-xl transition-all duration-300 hover:text-white"
              >
                <span className="absolute inset-0 bg-orange-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0"></span>
                <span className="relative z-10">Technology</span>
              </a>
              <a 
                href="/community" 
                className="group relative px-6 py-3 overflow-hidden border-2 border-gray-800 text-gray-800 rounded-xl transition-all duration-300 hover:text-white"
              >
                <span className="absolute inset-0 bg-gray-800 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0"></span>
                <span className="relative z-10">Community</span>
              </a>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src="/blog/images/blog-bunny.png" 
                alt="Keploy Blog Mascot" 
                className="w-[500px] h-[500px] transform transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute -bottom-12 -right-12 md:-bottom-16 md:-right-16 opacity-30">
                <img 
                  src="/blog/images/open-source-vector.png" 
                  alt="Open Source Vector" 
                  className="w-[200px] h-[200px] animate-spin-slow"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle Background Effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-orange-100 rounded-full blur-3xl"></div>
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
  const allCommunityPosts = await getAllPostsForHome(preview);
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
