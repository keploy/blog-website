import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPostsForHome, getAllPostsForTechnology } from "../lib/api";
import { CMS_NAME } from "../lib/constants";
import Header from "../components/header";
import Link from "next/link";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import TopBlogs from "../components/topBlogs";
import Testimonials from "../components/testimonials";
import Image from "next/image";

import spinImage from "../public/images/open-source-vector.png";

export default function Index({ communityPosts, technologyPosts, preview }) {
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Keploy Tech Blog`}
      Description={
        " Empowering your tech journey with expert advice and analysis"
      }
    >
      <Head>
        <title>{`Keploy Blog`}</title>
      </Head>
      <Header />
      <Container>
        <div className="">
          <div className="flex flex-wrap-reverse items-center mb-4 home-container md:mb-0 lg:flex-nowrap justify-evenly">
            <div className="content ">
              <h2 className="text-6xl font-bold text-orange-400 heading1 2xl:text-7xl">
                Keploy Blog
              </h2>
              <p className="mt-6 text-lg content-body body 2xl:text-2xl">
                Empowering your tech journey with expert advice and analysis
              </p>
              <div className="flex flex-wrap gap-4 mt-6 btn-wrapper ">
                <Link
                  href="/technology"
                  className="px-4 py-1 text-lg border-2 border-black cursor-pointer tech-blog md:text-xl 2xl:text-2xl body md:px-8 md:py-2 rounded-xl hover:bg-orange-400 hover:text-white hover:border-orange-400"
                >
                  Technology
                </Link>
                <Link
                  href="/community"
                  className="px-8 py-1 text-lg border-2 border-black cursor-pointer community-blog md:text-xl 2xl:text-2xl body md:px-8 md:py-2 rounded-xl hover:bg-orange-400 hover:text-white hover:border-orange-400 "
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
          <div className="flex justify-center mb-12 open-source-vector-container bottom-9 md:justify-start">
            <Image
              src={spinImage}
              alt="vector"
              className=" spin-anim"
              // width={300}
              // height={300}
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
