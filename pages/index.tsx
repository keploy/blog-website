import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import MoreStories from '../components/more-stories'
import HeroPost from '../components/hero-post'
import Intro from '../components/intro'
import Layout from '../components/layout'
import { getAllPostsForHome } from '../lib/api'
import { CMS_NAME } from '../lib/constants'
import Header from '../components/header'
import Link from 'next/link'

export default function Index({ allPosts: { edges }, preview }) {
  
  return (
    <Layout preview={preview}>
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Container>
        <Header />
        <div className="">
          
        <div className="home-container md:mb-0 mb-4 flex lg:flex-nowrap flex-wrap-reverse justify-evenly items-center">
          <div className="content">
            <h2 className="heading1 font-bold 2xl:text-7xl text-6xl text-orange-400">Keploy's Blog</h2>
            <p className="content-body body 2xl:text-2xl text-lg w-max mt-6">Elevate Your Tech Insight. Navigating the <br />Frontiers of Innovation and Integration.</p>
            <div className="btn-wrapper flex gap-4 mt-6">
              <Link href="/technology" className="tech-blog cursor-pointer 2xl:text-xl text-lg body md:px-12 px-8 py-2 border-2 border-black rounded-xl hover:bg-orange-400 hover:text-white hover:border-orange-400 ">Technology</Link>
              <Link href="/community" className="community-blog cursor-pointer 2xl:text-xl text-lg body md:px-12 px-8 py-2 border-2 border-black rounded-xl hover:bg-orange-400 hover:text-white hover:border-orange-400 ">Community</Link>
            </div>
          </div>
          
          <div className="blog-hero-img">
              <img src="/blog/images/blog-bunny.png" alt="hero image" width={600} height={600} className='' />
            </div>
            
        </div>
        <div className="open-source-vector-container bottom-9 mb-12 flex md:justify-start justify-center">
              <img src="/blog/images/open-source-vector.png" alt="vector" className=' spin-anim' />
            </div>
        </div>
      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForHome(preview)

  return {
    props: { allPosts, preview },
    revalidate: 10,
  }
}
