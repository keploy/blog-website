import { useRouter } from "next/router";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useScroll, useSpringValue } from "@react-spring/web";

import Container from "../../components/container";
import MoreStories from "../../components/more-stories";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import SectionSeparator from "../../components/section-separator";
import Layout from "../../components/layout";
import PostTitle from "../../components/post-title";
import Tags from "../../components/tag";
import PrismLoader from "../../components/prism-loader";
import ContainerSlug from "../../components/containerSlug";
import BookmarkButton from "../../components/BookmarkButton";

import {
  getAllPostsForTechnology,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
  getReviewAuthorDetails,
} from "../../lib/api";

import { calculateReadingTime } from "../../utils/calculateReadingTime";
import { getRedirectSlug } from "../../config/redirect";
import {
  getBlogPostingSchema,
  getBreadcrumbListSchema,
  SITE_URL,
} from "../../lib/structured-data";

const PostBody = dynamic(() => import("../../components/post-body"), {
  ssr: false,
});

const postBody = ({ content, post }) => {
  const urlPattern = /https:\/\/keploy\.io\/wp\/author\/[^\/]+\//g;

  return content.replace(
    urlPattern,
    `/blog/authors/${post?.ppmaAuthorName || "Unknown Author"}/`
  );
};

export default function Post({ post, posts, reviewAuthorDetails, preview }) {
  const router = useRouter();
  const { slug } = router.query;

  const morePosts = posts?.edges;
  const time = 5 + calculateReadingTime(post?.content || "");

  const [avatarImgSrc, setAvatarImgSrc] = useState("");
  const [blogWriterDescription, setBlogWriterDescription] = useState("");
  const [reviewAuthorName, setreviewAuthorName] = useState("");
  const [reviewAuthorImageUrl, setreviewAuthorImageUrl] = useState("");
  const [reviewAuthorDescription, setreviewAuthorDescription] = useState("");
  const [postBodyReviewerAuthor, setpostBodyReviewerAuthor] = useState(0);

  const postBodyRef = useRef<HTMLDivElement>(null);
  const readProgress = useSpringValue(0);

  useScroll({
    onChange(v) {
      const topOffset = postBodyRef.current?.offsetTop || 0;
      const clientHeight = postBodyRef.current?.clientHeight || 0;

      if (v.value.scrollY < topOffset) v.value.scrollY = 0;
      else if (v.value.scrollY < clientHeight + topOffset) {
        v.value.scrollY =
          ((v.value.scrollY - topOffset) / clientHeight) * 100;
      } else {
        v.value.scrollY = 100;
      }
      readProgress.set(v.value.scrollY);
    },
  });

  useEffect(() => {
    if (reviewAuthorDetails?.length > 0) {
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

  useEffect(() => {
    if (post?.content) {
      const avatarMatch = post.content.match(
        /<div[^>]*class="pp-author-boxes-avatar"[^>]*>\s*<img[^>]*src='([^']*)'/
      );
      setAvatarImgSrc(
        avatarMatch?.[1] || "/blog/images/author.png"
      );

      const descMatch = post.content.match(
        /<p[^>]*class="[^"]*pp-author-boxes-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i
      );
      setBlogWriterDescription(
        descMatch?.[1]?.trim() || "An author for Keploy's blog."
      );
    }
  }, [post]);

  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404");
    }
  }, [router, router.isFallback, post]);

  const postUrl = post?.slug
    ? `${SITE_URL}/technology/${post.slug}`
    : `${SITE_URL}/technology`;

  const structuredData = post?.slug
    ? [
        getBreadcrumbListSchema([
          { name: "Home", url: SITE_URL },
          { name: "Technology", url: `${SITE_URL}/technology` },
          { name: post.title, url: postUrl },
        ]),
        getBlogPostingSchema({
          title: post.title,
          url: postUrl,
          datePublished: post.date,
          description: post.seo?.metaDesc,
          imageUrl: post.featuredImage?.node?.sourceUrl,
          authorName: post.ppmaAuthorName,
        }),
      ]
    : [];

  return (
    <Layout
      preview={preview}
      featuredImage={post?.featuredImage?.node?.sourceUrl || ""}
      Title={post?.seo?.title || "Loading..."}
      Description={post?.seo?.metaDesc || ""}
      structuredData={structuredData}
    >
      <Header readProgress={readProgress} />

      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <PrismLoader />
            <article>
              <Head>
                <title>{`${post?.title} | Keploy Blog`}</title>
              </Head>

              <PostHeader
                title={post?.title}
                coverImage={post?.featuredImage}
                date={post?.date}
                author={post?.ppmaAuthorName}
                categories={post?.categories || []}
                BlogWriter={[
                  {
                    name: post?.ppmaAuthorName,
                    ImageUrl: avatarImgSrc,
                    description: blogWriterDescription,
                  },
                ]}
                BlogReviewer={[
                  {
                    name: reviewAuthorName,
                    ImageUrl: reviewAuthorImageUrl,
                    description: reviewAuthorDescription,
                  },
                ]}
                TimeToRead={time}
              />

              {/* ✅ Bookmark button added */}
              <BookmarkButton slug={slug as string} />
            </article>
          </>
        )}
      </Container>

      <ContainerSlug>
        <div ref={postBodyRef}>
          <PostBody
            content={post?.content && postBody({ content: post.content, post })}
            authorName={post?.ppmaAuthorName}
            slug={slug}
            ReviewAuthorDetails={reviewAuthorDetails?.[postBodyReviewerAuthor]}
          />
        </div>
      </ContainerSlug>

      <Container>
        <article>
          <footer>
            {post?.tags?.edges?.length > 0 && <Tags tags={post.tags} />}
          </footer>
          <SectionSeparator />
          {morePosts?.length > 0 && (
            <MoreStories
              isIndex={false}
              posts={morePosts}
              isCommunity={false}
              showSearch
            />
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
  const slugParam = params?.slug;

  if (typeof slugParam !== "string") {
    return { notFound: true, revalidate: 60 };
  }

  let realSlug = slugParam;
  const redirectSlug = getRedirectSlug(realSlug);
  if (redirectSlug) realSlug = redirectSlug;

  try {
    const data = await getPostAndMorePosts(realSlug, preview, previewData);
    if (!data?.post) return { notFound: true, revalidate: 60 };

    const moreStories = await getMoreStoriesForSlugs(
      data.post.tags,
      data.post.slug
    );

    const authorDetails = await Promise.all([
      getReviewAuthorDetails("neha"),
      getReviewAuthorDetails("Jain"),
    ]);

    if (redirectSlug) {
      return {
        redirect: {
          destination: `/technology/${redirectSlug}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        preview,
        post: data.post,
        posts: moreStories?.techMoreStories || { edges: [] },
        reviewAuthorDetails: authorDetails,
      },
      revalidate: 10,
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsForTechnology(false);
  const paths =
    allPosts?.edges?.map(({ node }) => `/technology/${node.slug}`) || [];

  return { paths, fallback: true };
};
