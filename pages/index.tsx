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
import { useState, useEffect } from "react";
import {
  getBreadcrumbListSchema,
  getOrganizationSchema,
  getWebSiteSchema,
  SITE_URL,
} from "../lib/structured-data";

export default function Index({ communityPosts, technologyPosts, preview }) {
  const structuredData = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getBreadcrumbListSchema([{ name: "Home", url: SITE_URL }]),
  ];
  
  // Start with false - skeleton shows by default
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Only runs on client after hydration
    setIsHydrated(true);
  }, []);

  return (
    <>
      <Layout preview={preview} structuredData={structuredData}>
        <Head>
          <title>
            {
              "Keploy Blog: API Testing, Unit Testing, and Automation Testing Best Practices"
            }
          </title>
        </Head>
        <Container>
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-tight md:pr-8">
              Keploy Blog
            </h1>
            <p className="text-center text-lg mt-5 md:pl-8">
              Learn about API Testing, Unit Testing, and Automation Testing Best
              Practices
            </p>
          </div>
          <TopBlogs 
            posts={technologyPosts.edges} 
            isCommunity={false} 
            isLoading={!isHydrated}
          />
          <TopBlogs 
            posts={communityPosts.edges} 
            isCommunity={true} 
            isLoading={!isHydrated}
          />
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const communityPosts = await getAllPostsForCommunity(preview);
  const technologyPosts = await getAllPostsForTechnology(preview);

  return {
    props: { communityPosts, technologyPosts, preview },
    revalidate: 10,
  };
};
