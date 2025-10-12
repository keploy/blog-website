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
import FeaturedPosts from "@/components/FeaturedPosts"; // Adding FeaturedPosts Component
import LatestPosts from "@/components/LatestPosts"; // Adding LatestPosts component
export default function Index({ communityPosts, technologyPosts, preview }) {
  // Temporary demo posts (replace with real data later)
  const posts = [
    {
      id: 1,
      title: "Keploy v2: A Better Testing Experience",
      excerpt: "Learn how Keploy 2.0 enhances API test automation.",
      author: "Keploy Team",
      image: "/blog/images/keploy-v2.jpg",
      readTime: 5,
      featured: true,
    },
    {
      id: 2,
      title: "Open Source and You",
      excerpt: "Contribute to Keploy and make testing better for all developers.",
      author: "Keploy Team",
      image: "/blog/images/open-source.jpg",
      readTime: 4,
      featured: true,
    },
    {
      id: 3,
      title: "From Bugs to Insights: Using Keploy to Debug Faster in Local Environments",
      excerpt:
        "Discover how Keploy’s auto-generated mocks and test replays help developers trace API issues faster, enabling a smoother debugging experience without external dependencies.",
      image: "/blog/images/keploy-debugging.png",
      author: "Keploy Team",
      readTime: 4,
      featured: true,
    },
    {
      id: 4,
      title: "The Future of Mock Generation",
      excerpt: "How Keploy’s approach is redefining integration testing.",
      author: "Keploy Devs",
      image: "/blog/images/mock-gen.jpg",
      readTime: 6,
      featured: false,
    },
    {
      id: 5,
      title: "Integrate Keploy with Postman for Seamless Testing Workflows",
      excerpt: "Discover how to connect Keploy with Postman to record, replay, and validate APIs without writing a single line of test code.",
      author: "Keploy Team",
      image: "/blog/images/keploy-postman-integration.png",
      readTime: 5,
      featured: false,
    },
    // {
    // id: 5,
    // title: "Mocking Made Easy: How Keploy Improves Developer Velocity",
    // excerpt:
    //   "Explore how Keploy automatically records and mocks dependencies like databases and external APIs to make local development faster and more reliable.",
    // image: "/images/keploy-mocking.png",
    // author: "Ananya Sharma",
    // readTime: 3,
    // },
    
  ];

  const featured = posts.filter((p) => p.featured);
  const latest = posts.filter((p) => !p.featured);

  return (

    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Blog - Keploy`}
      Description={"The Keploy Blog offers in-depth articles and expert insights on software testing, automation, and quality assurance, empowering developers to enhance their testing strategies and deliver robust applications."}>
      <Head>
        <title>{`Engineering | Keploy Blog`}</title>
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
        {/* 🧱 Featured & Latest Posts Sections */}
        <div className="my-12">
          <FeaturedPosts posts={featured} />
          <LatestPosts posts={latest} />
        </div>

        {/* Existing Sections */}
        <TopBlogs
          communityPosts={communityPosts}
          technologyPosts={technologyPosts}
        />
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