import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import SectionSeparator from "../../components/section-separator";
import Layout from "../../components/layout";
import PostTitle from "../../components/post-title";
import Tags from "../../components/tag";
import {
  getAllPostsWithSlug,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
} from "../../lib/api";
import PrismLoader from "../../components/prism-loader";
import ContainerSlug from "../../components/containerSlug";
import { useRef } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import dynamic from "next/dynamic";


const PostBody = dynamic(()=>import("../../components/post-body"),{ssr:false}) ;

const postBody = ({ content, post }) => {
  // Define the regular expression pattern to match the entire URL structure
  const urlPattern = /https:\/\/keploy\.io\/wp\/author\/[^\/]+\//g;

  // Replace the URL in the content with the desired one using the regular expression
  const replacedContent = content.replace(
    urlPattern,
    `/blog/authors/${post.ppmaAuthorName}/`
  );

  return replacedContent;
};
export default function Post({ post, posts, preview }) {
  const router = useRouter();
  const morePosts = posts?.edges;
  const postBodyRef = useRef<HTMLDivElement>();
  const readProgress = useSpringValue(0);
  useScroll({
    onChange(v) {
      const topOffset = postBodyRef.current.offsetTop;
      const clientHeight = postBodyRef.current.clientHeight;
      if (v.value.scrollY < topOffset) v.value.scrollY = 0;
      else if (
        v.value.scrollY > topOffset &&
        v.value.scrollY < clientHeight + topOffset
      ) {
        v.value.scrollY = ((v.value.scrollY - topOffset) / clientHeight) * 100;
      } else {
        v.value.scrollY = 100;
      }
      readProgress.set(v.value.scrollY);
    },
  });
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  if (!post || !post.content) {
    return ""; // or handle this case differently based on your requirements
  }
  // console.log(post.content);
  return (
    <Layout
      preview={preview}
      featuredImage={post?.featuredImage?.node.sourceUrl}
      Title={post?.title}
      Description={`Blog About ${post?.title}`}
    >
      <Header readProgress={readProgress} />
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <PrismLoader /> {/* Load Prism.js here */}
            <article>
              <Head>
                <title>{`${post.title} | Keploy Blog`}</title>
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.ppmaAuthorName}
                categories={post.categories}
              />
            </article>
          </>
        )}
      </Container>
      <ContainerSlug>
        {/* PostBody component placed outside the Container */}
        <div ref={postBodyRef}>
          <PostBody
            content={postBody({ content: post.content, post })}
            authorName={post.ppmaAuthorName}
          />
        </div>
      </ContainerSlug>
      <Container>
        <article>
          <footer>
            {post.tags.edges.length > 0 && <Tags tags={post.tags} />}
          </footer>
          <SectionSeparator />
          {morePosts.length > 0 && (
            <MoreStories isIndex={false} posts={morePosts} isCommunity={false} />
          )}
        </article>
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const data = await getPostAndMorePosts(params?.slug, preview, previewData);
  const { techMoreStories } = await getMoreStoriesForSlugs();

  return {
    props: {
      preview,
      post: data.post,
      posts: techMoreStories,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug();
  const technologyPosts = allPosts.edges
  .filter(({ node }) =>
    node.categories.edges.some(({ node }) => node.name === 'technology')
  )
  .map(({ node }) => `/technology/${node.slug}`) || [];
  return {
    paths: technologyPosts,
    fallback: true,
  };
};
