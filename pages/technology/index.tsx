import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../../components/container'
import MoreStories from '../../components/more-stories'
import HeroPost from '../../components/hero-post'
import Intro from '../../components/intro'
import Layout from '../../components/layout'
import { getAllPostsForTechnology } from '../../lib/api'
import { CMS_NAME } from '../../lib/constants'
import Header from '../../components/header'

export default function Index({ allPosts: { edges }, preview }) {
  const heroPost = edges[0]?.node
  const excerpt = edges[0] ? getExcerpt(edges[0].node.excerpt) : null; 
  const morePosts = edges.slice(1) 

  function getExcerpt(content) {
    const maxWords = 50;
    // Split the content into an array of words
    const words = content.split(' ');
  
    // Ensure the excerpt does not exceed the maximum number of words
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
  
    return content;
  }

  return (
    <Layout preview={preview}>
      <Head>
        <title>{`Keploy`}</title>
      </Head>
      <Container>
        {/* <Intro /> */}
        <Header />
        {heroPost && (
          <HeroPost
            title={heroPost.title}
            coverImage={heroPost.featuredImage}
            date={heroPost.date}
            author={heroPost.author}
            slug={heroPost.slug}
            excerpt={excerpt}
          />
        )}
        {morePosts.length > 0 && <MoreStories posts={morePosts} isCommunity={false} />}
      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForTechnology(preview)

  return {
    props: { allPosts, preview },
    revalidate: 10,
  }
}
