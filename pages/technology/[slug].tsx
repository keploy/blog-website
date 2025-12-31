import { useRouter } from "next/router";
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
  getAllPostsForTechnology,
  getPostAndMorePosts,
} from "../../lib/api";
import PrismLoader from "../../components/prism-loader";
import ContainerSlug from "../../components/containerSlug";
import { useRef, useState, useEffect } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { getReviewAuthorDetails } from "../../lib/api";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";
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

  const replacedContent = content.replace(
    urlPattern,
    `/blog/authors/${post?.ppmaAuthorName || "Unknown Author"}/`
  );

  return replacedContent;
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
  useEffect(() => {
    if (reviewAuthorDetails && reviewAuthorDetails?.length > 0) {
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
      if (avatarDivMatch && avatarDivMatch[1]) {
        setAvatarImgSrc(avatarDivMatch[1]);
      } else {
        setAvatarImgSrc("/blog/images/author.png");
      }

      // Match the <p> with class pp-author-boxes-description and extract its content
      const authorDescriptionMatch = content.match(
        /<p[^>]*class="[^"]*pp-author-boxes-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i
      );

      if (
        authorDescriptionMatch &&
        authorDescriptionMatch[1].trim()?.length > 0
      ) {
        setBlogWriterDescription(authorDescriptionMatch[1].trim());
      } else {
        setBlogWriterDescription("An author for Keploy's blog.");
      }
    }
  }, [post]);

  useEffect(() => {
    if (!router.isFallback && !post?.slug) {
      router.push("/404"); 
    }
  }, [router, router.isFallback, post]);

  const postUrl = post?.slug ? `${SITE_URL}/technology/${post.slug}` : `${SITE_URL}/technology`;
  const structuredData = [];
  if (post?.slug) {
    structuredData.push(
      getBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Technology", url: `${SITE_URL}/technology` },
        { name: post?.title || "Post", url: postUrl },
      ]),
      getBlogPostingSchema({
        title: post?.title || "Keploy Blog Post",
        url: postUrl,
        datePublished: post?.date,
        description: post?.seo?.metaDesc,
        imageUrl: post?.featuredImage?.node?.sourceUrl,
        authorName: post?.ppmaAuthorName,
      })
    );
  } else {
    structuredData.push(
      getBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Technology", url: `${SITE_URL}/technology` },
      ])
    );
  }

  return (
    <Layout
      preview={preview}
      featuredImage={post?.featuredImage?.node?.sourceUrl || ""}
      Title={post?.seo.title || "Loading..."}
      Description={`${post?.seo.metaDesc || "Blog About " + `${post?.title}`}`}
      structuredData={structuredData}
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
        <div ref={postBodyRef}>
          <PostBody
            content={
              post?.content && postBody({ content: post?.content, post })
            }
            authorName={post?.ppmaAuthorName || ""}
            slug={slug}
            ReviewAuthorDetails={
              reviewAuthorDetails &&
              reviewAuthorDetails?.length > 0 &&
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
            <MoreStories 
              isIndex={true} 
              posts={morePosts} 
              isCommunity={false} 
              initialPageInfo={posts?.pageInfo}
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
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  let realSlug = slugParam;
  const redirectSlug = getRedirectSlug(realSlug);

  if (redirectSlug) {
    realSlug = redirectSlug;
  }

  try {
    const data = await getPostAndMorePosts(realSlug, preview, previewData);

    if (!data?.post) {
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    // Fetch technology posts with pagination info (similar to index page)
    const allTechPosts = await getAllPostsForTechnology(preview);
    
    // Filter out the current post from the results
    const filteredPosts = allTechPosts.edges.filter(
      ({ node }) => node.slug !== data.post?.slug
    );
    
    // Get pageInfo for pagination
    const pageInfo = allTechPosts.pageInfo;
    
    const authorDetails = await Promise.all([
      getReviewAuthorDetails("neha"),
      getReviewAuthorDetails("Jain"),
    ]);

    // If we resolved a redirect slug, send a proper redirect response
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
        posts: { edges: filteredPosts, pageInfo },
        reviewAuthorDetails: authorDetails,
      },
      revalidate: 10,
    };
  } catch (error) {
    console.error("technology/[slug] getStaticProps error:", error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsForTechnology(false);
  const technologyPosts =
    allPosts?.edges
      ?.map(({ node }) => `/technology/${node?.slug}`) || [];
  return {
    paths: technologyPosts || [],
    fallback: true,
  };
};
