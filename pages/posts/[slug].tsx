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

export interface PostSlugProps {
  post: any
  posts?: {
    edges?: any[]
  }
  preview?: boolean
}

export default function Post({ post, posts, preview }: PostSlugProps) {
  const router = useRouter()
  const morePosts = posts?.edges || []

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  const tagsEdges = post?.tags?.edges || []

  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <title>
                  {`${post?.title || ''} | Next.js Blog Example with ${CMS_NAME}`}
                </title>
                <meta
                  property="og:image"
                  content={post?.featuredImage?.node?.sourceUrl}
                />
              </Head>
              <PostHeader
                title={post?.title}
                coverImage={post?.featuredImage}
                date={post?.date}
                author={post?.author}
                categories={post?.categories}
              />
              <PostBody content={post?.content} />
              <footer>
                {tagsEdges.length > 0 && <Tags tags={post.tags} />}
              </footer>
            </article>

            <SectionSeparator />
            {morePosts.length > 0 && <MoreStories posts={morePosts} />}
          </>
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
      post: data?.post || null,
      posts: data?.posts || null,
    },
    revalidate: 10,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug()
  const edges = allPosts?.edges || []

  return {
    paths: edges.map(({ node }: any) => `/posts/${node.slug}`) || [],
    fallback: true,
  }
}

