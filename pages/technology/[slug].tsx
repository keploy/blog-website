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
import { useRef, useState, useEffect } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { getReviewAuthorDetails } from "../../lib/api";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";

const PostBody = dynamic(() => import("../../components/post-body"), {
  ssr: false,
});

const postBody = ({ content, post }) => {
  // Define the regular expression pattern to match the entire URL structure
  const urlPattern = /https:\/\/keploy\.io\/wp\/author\/[^\/]+\//g;

  // Replace the URL in the content with the desired one using the regular expression
  const replacedContent = content.replace(
    urlPattern,
    `/blog/authors/${post?.ppmaAuthorName || "Unknown Author"}/`
  );

  return replacedContent;
};

export default function Post({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const morePosts = posts?.edges;
  const time = 10 + calculateReadingTime(post?.content || "");
  const [avatarImgSrc, setAvatarImgSrc] = useState("");
  const [blogWriterDescription, setBlogWriterDescription] = useState("");
  const [reviewAuthorName, setreviewAuthorName] = useState("");
  const [reviewAuthorImageUrl, setreviewAuthorImageUrl] = useState("");
  const [reviewAuthorDescription, setreviewAuthorDescription] = useState("");
  const [postBodyReviewerAuthor, setpostBodyReviewerAuthor] = useState(0);
  useEffect(() => {
    if (reviewAuthorDetails && reviewAuthorDetails.length > 0) {
      const authorIndex = post.ppmaAuthorName === "Neha" ? 1 : 0;
      const authorNode = reviewAuthorDetails[authorIndex]?.edges[0]?.node;
      if (authorNode) {
        setpostBodyReviewerAuthor(authorIndex);
        setreviewAuthorName(authorNode.name);
        setreviewAuthorImageUrl(authorNode.avatar.url);
        setreviewAuthorDescription(authorNode.description);
      }
    }
  }, [post, reviewAuthorDetails]);

  const blogwriter = [
    {
      name: post?.ppmaAuthorName || "Author",
      ImageUrl: avatarImgSrc || "/blog/images/author.png",
      description: blogWriterDescription || "An author for keploy's blog.",
    },
  ];
  const blogreviewer = [
    {
      name: reviewAuthorName || "Reviewer",
      ImageUrl: reviewAuthorImageUrl || "/blog/images/author.png",
      description: reviewAuthorDescription || "A Reviewer for keploy's blog",
    },
  ];
  const postBodyRef = useRef<HTMLDivElement>();
  const readProgress = useSpringValue(0);
  useScroll({
    onChange(v) {
      const topOffset = postBodyRef.current?.offsetTop || 0;
      const clientHeight = postBodyRef.current?.clientHeight || 0;
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
      const content = post.content;

      const avatarDivMatch = content.match(
        /<div[^>]*class="pp-author-boxes-avatar"[^>]*>\s*<img[^>]*src='([^']*)'[^>]*\/?>/
      );
      console.log(avatarDivMatch[1]);
      if (avatarDivMatch && avatarDivMatch[1]) {
        setAvatarImgSrc(avatarDivMatch[1]);
      } else {
        setAvatarImgSrc("/blog/images/author.png");
      }

      // Match the <p> with class pp-author-boxes-description and extract its content
      const authorDescriptionMatch = content.match(
        /<p[^>]*class="pp-author-boxes-description multiple-authors-description"[^>]*>(.*?)<\/p>/s
      );

      if (
        authorDescriptionMatch &&
        authorDescriptionMatch[1].trim().length > 0
      ) {
        setBlogWriterDescription(authorDescriptionMatch[1].trim());
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
      featuredImage={post?.featuredImage?.node?.sourceUrl || ""}
      Title={post?.title || "Loading..."}
      Description={`Blog About ${post?.title || "the Article"}`}
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
                <title>{`${post?.title || "Loading..."} | Keploy Blog`}</title>
              </Head>
              <PostHeader
                title={post?.title || "Loading..."}
                coverImage={post?.featuredImage}
                date={post?.date || ""}
                author={post?.ppmaAuthorName || ""}
                categories={post?.categories || []}
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
            content={
              post?.content && postBody({ content: post?.content, post })
            }
            authorName={post?.ppmaAuthorName || ""}
            ReviewAuthorDetails={
              reviewAuthorDetails &&
              reviewAuthorDetails.length > 0 &&
              reviewAuthorDetails[postBodyReviewerAuthor]
            }
          />
        </div>
      </ContainerSlug>
      <Container>
        <article>
          <footer>
            {post?.tags?.edges?.length > 0 && <Tags tags={post?.tags} />}
          </footer>
          <SectionSeparator />
          {morePosts?.length > 0 && (
            <MoreStories posts={morePosts} isCommunity={false} />
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
  const authorDetails = [];
  authorDetails.push(await getReviewAuthorDetails("neha"));
  authorDetails.push(await getReviewAuthorDetails("Jain"));
  return {
    props: {
      preview,
      post: data?.post || {},
      posts: techMoreStories || [],
      reviewAuthorDetails: authorDetails || {},
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug();
  const technologyPosts =
    allPosts?.edges
      ?.filter(({ node }) =>
        node?.categories?.edges?.some(({ node }) => node?.name === "technology")
      )
      ?.map(({ node }) => `/technology/${node?.slug}`) || [];
  return {
    paths: technologyPosts || [],
    fallback: true,
  };
};
