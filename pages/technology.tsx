import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import MoreStories from '../components/more-stories'
import HeroPost from '../components/hero-post'
import Layout from '../components/layout'
import { getAllPostsForTechnology } from '../lib/api'
import Header from '../components/header'
import { IndexProps } from './index'

export interface TechnologyProps extends IndexProps {}

export default function Technology({ allPosts, preview = false }: TechnologyProps) {
  const edges = allPosts?.edges ?? []
  const heroPost = edges[0]?.node
  const excerpt = getExcerpt(heroPost?.excerpt)
  const morePosts = edges.slice(1)

  function getExcerpt(content?: string) {
    if (!content) return ''
    const maxWords = 50
    const words = content.split(' ')
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...'
    }
    return content
  }

  return (
    <Layout preview={preview}>
      <Head>
        <title>Keploy Technology Blog</title>
      </Head>
      <Container>
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
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForTechnology(preview)

  return {
    props: { allPosts: allPosts ?? { edges: [] }, preview },
    revalidate: 10,
  }
}
