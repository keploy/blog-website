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
// import OpenSourceVectorPng from "../public/images/open-source-vector.png";
import { getExcerpt } from "../utils/excerpt";
import LatestPost from "../components/latest-post";

export default function Index({ communityPosts, technologyPosts, mostRecentPost, preview }) {
  const excerpt = mostRecentPost ? getExcerpt(mostRecentPost.excerpt, 50) : null;
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
        <div>
          <div className="home-container md:mb-0 mb-4 flex lg:flex-row flex-col justify-between items-center">
            <div className =" w-full lg:w-1/2 flex flex-col items-center lg:items-start">
              <div className="blog-hero-img flex justify-center ">
                <Image
                  src="/blog/images/blog-bunny.png"
                  alt="hero image"
                  width={500}
                  height={500}
                  className="object-contain"
                />
              </div>

              <div className="content lg:w-full flex flex-col items-center lg:items-start">
                <h2 className="heading1 font-bold 2xl:text-7xl text-6xl text-orange-400 text-center lg:text-left">
                  Keploy Blog
                </h2>
                <p className="content-body body 2xl:text-2xl text-lg mt-4 text-center lg:text-left">
                  Empowering your tech journey with expert advice and analysis
                </p>
                <div className="btn-wrapper flex flex-wrap gap-4 mt-4 justify-center lg:justify-start">
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
            </div>

            <div className="card w-full lg:w-1/2 lg:mb-0 ">
              <LatestPost
                title={mostRecentPost.title}
                coverImage={mostRecentPost.featuredImage}
                date={mostRecentPost.date}
                author={mostRecentPost.ppmaAuthorName}
                slug={mostRecentPost.slug}
                excerpt={excerpt}
                isCommunity={mostRecentPost.categories.edges[0].node.name !== "community"}
              />
            </div>
          </div>

          {/* 
          <div className="open-source-vector-container bottom-9 mb-12 flex md:justify-start justify-center">
            <Image
              src={OpenSourceVectorPng}
              alt="vector"
              className="spin-anim"
            />
          </div> 
          */}
        </div>
        {/* Top Blogs and Testimonials */}
        <TopBlogs
          // TODO: need to show only the most viewed posts in each section
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
  const allTechnologyPosts = await getAllPostsForTechnology(preview);

  const recentPostCommunity = allCommunityPosts.edges[0].node;
  const recentPostTechnology = allTechnologyPosts.edges[0].node;

  const mostRecentPost =
    new Date(recentPostCommunity.date) > new Date(recentPostTechnology.date)
      ? recentPostCommunity
      : recentPostTechnology;

  return {
    props: {
      communityPosts:
        allCommunityPosts?.edges?.length > 3
          ? allCommunityPosts?.edges?.slice(0, 3)
          : allCommunityPosts?.edges,
      technologyPosts:
        allTechnologyPosts?.edges?.length > 3
          ? allTechnologyPosts?.edges?.slice(0, 3)
          : allTechnologyPosts.edges,
      mostRecentPost,
      preview,
    },
    revalidate: 10,
  };
};