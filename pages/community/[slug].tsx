// slug.tsx
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
import Tag from "../../components/tag";
import {
  getAllPostsWithSlug,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
} from "../../lib/api";
import PrismLoader from "../../components/prism-loader";
import ContainerSlug from "../../components/containerSlug";
import { useEffect, useRef, useState } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { getReviewAuthorDetails } from "../../lib/api";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";

const PostBody = dynamic(()=>import("../../components/post-body"),{ssr:false}) ;
// Define formatAuthor function before the Post component




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

export default function Post({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const morePosts = posts?.edges;
  const [avatarImgSrc, setAvatarImgSrc] = useState("");
  const time = 10 + calculateReadingTime(post.content);
  const [blogWriterDescription, setBlogWriterDescription] = useState("");
  const blogwriter = [
    {
      name: post.ppmaAuthorName,
      ImageUrl: avatarImgSrc,
      description: blogWriterDescription,
    },
  ];
  const blogreviewer = [
    {
      name: post.author.node.name,
      ImageUrl: post.author.node.avatar.url,
      description: reviewAuthorDetails.edges[0].node.description,
    },
  ];

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
  useEffect(() => {
    if (post && post.content) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = post.content;
      const avatarImgElement = tempDiv.querySelector(
        ".pp-author-boxes-avatar img"
      );
      if (avatarImgElement) {
        setAvatarImgSrc(avatarImgElement.getAttribute("src"));
      } else {
        setAvatarImgSrc("n/a");
      }
      const authorDescriptionElement = tempDiv.querySelector(
        ".pp-author-boxes-description.multiple-authors-description"
      );
      if (authorDescriptionElement.textContent.trim().length > 0) {
        setBlogWriterDescription(authorDescriptionElement.textContent.trim());
      } else {
        setBlogWriterDescription("n/a");
      }
    }
  }, [post]);

  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404"); // Redirect to 404 page if slug is not available
    }
  }, [router, router.isFallback, post]);

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
                BlogWriter={blogwriter}
                BlogReviewer={blogreviewer}
                TimeToRead={time}
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
            ReviewAuthorDetails={reviewAuthorDetails}
          />
        </div>
      </ContainerSlug>
      <Container>
        <article>
          <footer>
            {post.tags.edges.length > 0 && <Tag tags={post.tags} />}
          </footer>
          <SectionSeparator />
          {morePosts.length > 0 && (
            <MoreStories posts={morePosts} isCommunity={true} />
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
  const { communityMoreStories } = await getMoreStoriesForSlugs();
  const authorDetails = await getReviewAuthorDetails(
    data.post.author.node.name
  );
  return {
    props: {  
      preview,
      post: data.post,
      posts: communityMoreStories,
      reviewAuthorDetails: authorDetails,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug();
  const communtiyPosts =
    allPosts.edges
      .filter(({ node }) =>
        node.categories.edges.some(({ node }) => node.name === "community")
      )
      .map(({ node }) => `/community/${node.slug}`) || [];
  return {
    paths: communtiyPosts,
    fallback: true,
  };
};
