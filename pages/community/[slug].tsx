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
import PostContentTitle from '../../components/post-content-table'
import Tags from '../../components/tags'
import { getAllPostsWithSlug, getPostAndMorePosts } from '../../lib/api'
import { CMS_NAME } from '../../lib/constants'

export default function Post({ post, posts, preview }) {
  const router = useRouter()
  const morePosts = posts?.edges
  console.log();

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
          <>
            <article>
              <Head>
                <title>
                  {`${post.title} | Next.js Blog Example with ${CMS_NAME}`}
                </title>
                <meta
                  property="og:image"
                  content={post.featuredImage?.node.sourceUrl}
                />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.ppmaAuthorName}
                categories={post.categories}
              />
              <div className="flex flex-wrap mx-auto">
                {/* Left side */}
                <PostContentTitle content={post.content} />
                {/* Right side */}
                <div
                  className="w-full md:w-3/5 lg:w-2/3 xl:w-3/4 min-h-screen">
                  <PostBody content={post.content} />
                  <footer>
                    {post.tags.edges.length > 0 && <Tags tags={post.tags} />}
                  </footer>
                </div>
              </div>
            </article>

            <SectionSeparator />
            {morePosts.length > 0 && <MoreStories posts={morePosts} isCommunity={true} />}
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
      post: data.post,
      posts: data.posts,
    },
    revalidate: 10,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug()

  return {
    paths: allPosts.edges.map(({ node }) => `/community/${node.slug}`) || [],
    fallback: true,
  }
}
