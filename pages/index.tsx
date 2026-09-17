import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import MoreStories from '../components/more-stories'
import HeroPost from '../components/hero-post'
import Layout from '../components/layout'
import { getAllPostsForHome } from '../lib/api'
import Header from '../components/header'

export interface PostNode {
  title: string
  featuredImage?: {
    node?: {
      sourceUrl?: string
    }
  }
  date: string
  author?: {
    node?: {
      name: string
      picture?: {
        url?: string
      }
    }
  }
  slug: string
  excerpt?: string
}

export interface PostEdge {
  node: PostNode
}

export interface IndexProps {
  allPosts?: {
    edges?: PostEdge[]
  }
  preview?: boolean
}

export default function Index({ allPosts, preview = false }: IndexProps) {
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
        <title>Keploy Blog</title>
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
  const allPosts = await getAllPostsForHome(preview)

  return {
    props: { allPosts: allPosts ?? { edges: [] }, preview },
    revalidate: 10,
  }
}
