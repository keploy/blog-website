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
  getAllPostsWithSlug,
  getMoreStoriesForSlugs,
  getPostAndMorePosts,
  getReviewAuthorDetails,
} from "../../lib/api";
import PrismLoader from "../../components/prism-loader";
import ContainerSlug from "../../components/containerSlug";
import { useRef, useState, useEffect } from "react";
import { useScroll, useSpringValue } from "@react-spring/web";
import { calculateReadingTime } from "../../utils/calculateReadingTime";
import dynamic from "next/dynamic";

const PostBody = dynamic(() => import("../../components/post-body"), {
  ssr: false,
});

interface PostProps {
  preview: boolean;
  post: any;
  posts: any;
  reviewAuthorDetails: any;
}

export default function Post({ post, posts, reviewAuthorDetails, preview }: PostProps){
  const router = useRouter();
  const { slug } = router.query;
  const morePosts = posts?.edges;
  const [avatarImgSrc, setAvatarImgSrc] = useState("");
  const time = 10 + calculateReadingTime(post?.content);
  const [blogWriterDescription, setBlogWriterDescription] = useState("");
  const [reviewAuthorName, setreviewAuthorName] = useState("");
  const [reviewAuthorImageUrl, setreviewAuthorImageUrl] = useState("");
  const [reviewAuthorDescription, setreviewAuthorDescription] = useState("");
  const [postBodyReviewerAuthor, setpostBodyReviewerAuthor] = useState(0);
  const [updatedContent, setUpdatedContent] = useState("");

  const postBodyRef = useRef<HTMLDivElement>(null);
  const readProgress = useSpringValue(0);

  useEffect(() => {
    if (reviewAuthorDetails && reviewAuthorDetails.length > 0) {
      const authorIndex = post.ppmaAuthorName === "Neha" ? 1 : 0;
      const authorNode = reviewAuthorDetails[authorIndex]?.edges?.[0]?.node;
      if (authorNode) {
        setpostBodyReviewerAuthor(authorIndex);
        setreviewAuthorName(authorNode.name);
        setreviewAuthorImageUrl(authorNode.avatar.url);
        setreviewAuthorDescription(authorNode.description);
      }
    }
  }, [post, reviewAuthorDetails]);

  const blogWriter = [
    {
      name: post?.ppmaAuthorName || "Author",
      ImageUrl: avatarImgSrc || "/blog/images/author.png",
      description: blogWriterDescription || "An author for Keploy's blog.",
    },
  ];

  const blogReviewer = [
    {
      name: reviewAuthorName || "Reviewer",
      ImageUrl: reviewAuthorImageUrl || "/blog/images/author.png",
      description: reviewAuthorDescription || "A Reviewer for Keploy's blog",
    },
  ];

  useScroll({
    onChange(v) {
      const topOffset = postBodyRef.current?.offsetTop || 0;
      const clientHeight = postBodyRef.current?.clientHeight || 0;

      if (v.value.scrollY < topOffset) {
        v.value.scrollY = 0;
      } else if (v.value.scrollY > topOffset && v.value.scrollY < clientHeight + topOffset) {
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
      console.log(avatarDivMatch ? avatarDivMatch[1] : "No avatar match");
      if (avatarDivMatch && avatarDivMatch[1]) {
        setAvatarImgSrc(avatarDivMatch[1]);
      } else {
        setAvatarImgSrc("/blog/images/author.png");
      }

      // Match the <p> with class pp-author-boxes-description and extract its content
      const authorDescriptionMatch = content.match(
        /<p[^>]*class="pp-author-boxes-description multiple-authors-description"[^>]*>(.*?)<\/p>/
      );

      const newContent = content.replace(
        /<table[^>]*>[\s\S]*?<\/table>/gm,
        (table) => `<div class="overflow-x-auto">${table}</div>`
      );

      setUpdatedContent(newContent);

      if (authorDescriptionMatch && authorDescriptionMatch[1].trim()?.length > 0) {
        setBlogWriterDescription(authorDescriptionMatch[1].trim());
      } else {
        setBlogWriterDescription("n/a");
      }
    }
  }, [post]);

  return (
    <Layout
      preview={preview}
      featuredImage={post?.featuredImage?.node?.sourceUrl || ""}
      Title={post?.seo.title || "Loading..."}
      Description={`${post?.seo.metaDesc || "Blog About " + `${post?.title}`}`}
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
                BlogWriter={blogWriter}
                BlogReviewer={blogReviewer}
                TimeToRead={time}
              />
            </article>
          </>
        )}
      </Container>
      <ContainerSlug>
        {/* PostBody component placed outside the Container */}
        <div ref={postBodyRef}>
          {!router.isFallback && post ? (
            <PostBody
              content={updatedContent} // Use the updated content with responsive tables
              authorName={post?.ppmaAuthorName || ""}
              ReviewAuthorDetails={
                reviewAuthorDetails &&
                reviewAuthorDetails.length > 0 &&
                reviewAuthorDetails[postBodyReviewerAuthor]
              }
              slug={slug as string}
            />
          ) : null}
        </div>
      </ContainerSlug>
      <Container>
        <article>
          <footer>
            {post?.tags?.edges?.length > 0 && <Tags tags={post?.tags} />}
          </footer>
          <SectionSeparator />
          {morePosts?.length > 0 && (
            <MoreStories isIndex={false} posts={morePosts} isCommunity={true} />
          )}
        </article>
      </Container>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const slug = params?.slug as string;

  try {
    const data = await getPostAndMorePosts(slug, preview, previewData);

    if (!data?.post) {
      return {
        notFound: true, 
      };
    }

    const { communityMoreStories } = await getMoreStoriesForSlugs(
      data.post.tags,
      data.post.slug
    );

    const authorDetails = await Promise.all([
      getReviewAuthorDetails("neha"),
      getReviewAuthorDetails("Jain"),
    ]);

    return {
      props: {
        preview,
        post: data.post,
        posts: communityMoreStories || [],
        reviewAuthorDetails: authorDetails || [],
      },
      revalidate: 10, // Revalidate every 10 seconds
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      notFound: true, // Redirect to 404 on error
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const allPosts = await getAllPostsWithSlug();

    const communityPosts =
      allPosts?.edges
        ?.filter(({ node }) =>
          node?.categories?.edges?.some(({ node }) => node?.name === "technology")
        )
        ?.map(({ node }) => ({
          params: { slug: node?.slug },
        })) || [];

    return {
      paths: communityPosts,
      fallback: true, 
    };
  } catch (error) {
    console.error("Error fetching posts for static paths:", error);
    return {
      paths: [],
      fallback: true,
    };
  }
};