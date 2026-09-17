import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import MoreStories from '../../components/more-stories'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import SectionSeparator from '../../components/section-separator'
import Layout from '../../components/layout'
import PostTitle from '../../components/post-title'
import Tags from '../../components/tags'
import { getAllPostsWithSlug, getPostAndMorePosts } from '../../lib/api'
import { CMS_NAME } from '../../lib/constants'

export interface PostDetails {
  title: string
  slug: string
  content: string
  date: string
  featuredImage?: {
    node?: {
      sourceUrl?: string
    }
  }
  author?: {
    node?: {
      name: string
      picture?: {
        url?: string
      }
    }
  }
  categories?: {
    edges?: {
      node: {
        name: string
      }
    }[]
  }
  tags?: {
    edges?: {
      node: {
        name: string
        slug?: string
      }
    }[]
  }
}

export interface PostPageProps {
  post?: PostDetails
  posts?: {
    edges?: any[]
  }
  preview?: boolean
}

export default function Post({ post, posts, preview = false }: PostPageProps) {
  const router = useRouter()
  const morePosts = posts?.edges ?? []

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          post && (
            <>
              <article>
                <Head>
                  <title>
                    {`${post.title} | ${CMS_NAME}`}
                  </title>
                  {post.featuredImage?.node?.sourceUrl && (
                    <meta
                      property="og:image"
                      content={post.featuredImage.node.sourceUrl}
                    />
                  )}
                </Head>
                <PostHeader
                  title={post.title}
                  coverImage={post.featuredImage}
                  date={post.date}
                  author={post.author}
                  categories={post.categories}
                />
                <PostBody content={post.content} />
                {post.tags?.edges && post.tags.edges.length > 0 && (
                  <footer>
                    <Tags tags={post.tags} />
                  </footer>
                )}
              </article>

              <SectionSeparator />
              {morePosts.length > 0 && <MoreStories posts={morePosts} />}
            </>
          )
        )}
      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const data = await getPostAndMorePosts(params?.slug, preview, previewData)

  return {
    props: {
      preview,
      post: data?.post ?? null,
      posts: data?.posts ?? null,
    },
    revalidate: 10,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug()
  const edges = allPosts?.edges ?? []

  return {
    paths: edges.map(({ node }: any) => `/posts/${node.slug}`),
    fallback: true,
  }
}
