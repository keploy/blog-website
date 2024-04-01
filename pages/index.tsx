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
            <div className="content ">
              <h2 className="heading1 font-bold 2xl:text-7xl text-6xl text-orange-400">
                Keploy Blog
              </h2>
              <p className="content-body body 2xl:text-2xl text-lg mt-6">
                Empowering your tech journey with expert advice and analysis
              </p>
              <div className="btn-wrapper flex flex-wrap gap-4 mt-6 ">
                <Link
                  href="/technology"
                  className="tech-blog cursor-pointer text-lg md:text-xl 2xl:text-2xl body px-4 py-1 md:px-8 md:py-2 border-2 border-black rounded-xl hover:bg-orange-400 hover:text-white hover:border-orange-400"
                >
                  Technology
                </Link>
                <Link
                  href="/community"
                  className="community-blog cursor-pointer text-lg md:text-xl 2xl:text-2xl body px-8 py-1 md:px-8 md:py-2 border-2 border-black rounded-xl hover:bg-orange-400 hover:text-white hover:border-orange-400 "
                >
                  Community
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
          <div className="open-source-vector-container bottom-9 mb-12 flex md:justify-start justify-center">
            <img
              src="/blog/images/open-source-vector.png"
              alt="vector"
              className=" spin-anim"
            />
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
