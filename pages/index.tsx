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
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import TopPosts from "@/components/topPost";
const Skeleton = dynamic(() => import("../components/skeleton-main"), {
  ssr: false,
});

// set of demo and temporary data just for the testing purpose :
export const posts = [
  {
    key: "post-1",
    title: "Understanding React Hooks",
    coverImage: "/images/react-hooks.jpg",
    excerpt: "React Hooks revolutionized how we write components, enabling state and lifecycle features in functional components...",
    author: "Harsh Kumar",
    slug: "understanding-react-hooks",
    readTime: 5,
  },
  {
    key: "post-2",
    title: "Getting Started with Next.js",
    coverImage: "/images/nextjs-intro.jpg",
    excerpt: "Next.js makes server-side rendering in React seamless. Learn how to set up a project and create your first page...",
    author: "Jane Doe",
    slug: "getting-started-with-nextjs",
    readTime: 4,
  },
  {
    key: "post-3",
    title: "Tailwind CSS for Beginners",
    coverImage: "/images/tailwind-css.jpg",
    excerpt: "Tailwind CSS allows you to build modern websites quickly using utility-first classes. This guide covers the basics...",
    author: "John Smith",
    slug: "tailwind-css-for-beginners",
    readTime: 3,
  },
  {
    key: "post-4",
    title: "Framer Motion Animations",
    coverImage: "/images/framer-motion.jpg",
    excerpt: "Animate your React apps effortlessly using Framer Motion. Learn how to use props like 'whileInView' and 'initial'...",
    author: "Harsh Kumar",
    slug: "framer-motion-animations",
    readTime: 6,
  },
  {
    key: "post-5",
    title: "JavaScript ES2025 Features",
    coverImage: "/images/js-es2025.jpg",
    excerpt: "ES2025 brings exciting new features to JavaScript. Stay ahead by learning about new syntax and APIs...",
    author: "Jane Doe",
    slug: "javascript-es2025-features",
    readTime: 4,
  },
  {
    key: "post-5",
    title: "JavaScript ES2025 Features",
    coverImage: "/images/js-es2025.jpg",
    excerpt: "ES2025 brings exciting new features to JavaScript. Stay ahead by learning about new syntax and APIs...",
    author: "Jane Doe",
    slug: "javascript-es2025-features",
    readTime: 4,
  }
];


export default function Index({ communityPosts, technologyPosts, preview }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // artificially wait for hydration + minimal delay
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Skeleton />;
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Blog - Keploy`}
      Description={
        "The Keploy Blog offers in-depth articles and expert insights on software testing, automation, and quality assurance, empowering developers to enhance their testing strategies and deliver robust applications."
      }
    >
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
        <TopBlogs
          communityPosts={communityPosts}
          technologyPosts={technologyPosts}
        />

        <TopPosts
          featuredPosts={posts}
          latestPosts={posts}
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
