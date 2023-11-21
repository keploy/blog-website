'use client'
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { useState } from 'react';
import Container from '../components/container';
import MoreStories from '../components/more-stories';
import HeroPost from '../components/hero-post';
import Intro from '../components/intro';
import Layout from '../components/layout';
import { getAllPostsForHome } from '../lib/api';
import { CMS_NAME } from '../lib/constants';
import Header from '../components/header';

export default function Community({ allPosts: { edges, pageInfo }, preview }) {
  const [endCursor, setEndCursor] = useState(pageInfo?.endCursor || null);
  const limit = 5; // Adjust as needed
  const heroPost = edges[0]?.node;
  const excerpt = getExcerpt(heroPost?.excerpt);

  const [morePosts, setMorePosts] = useState(edges.slice(1, limit + 1));

  const loadMore = async () => {
    try {
      const newPosts = await getAllPostsForHome(preview, limit, endCursor);

      if (newPosts?.edges && newPosts.edges.length > 0) {
        setMorePosts((prevPosts) => [...prevPosts, ...newPosts.edges]);
        setEndCursor(newPosts.pageInfo?.endCursor || null);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  };

  function getExcerpt(content) {
    const maxWords = 50;
    // Split the content into an array of words
    const words = content.split(' ');

    // Ensure the excerpt does not exceed the maximum number of words
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }

    return content;
  }

  return (
    <Layout preview={preview}>
      <Head>
        <title>{`Keploy`}</title>
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
        {pageInfo?.hasNextPage && (
          <button onClick={loadMore}>
            Load More
          </button>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const limit = 10; // Adjust as needed
  const offset = null; // Initial offset set to null

  try {
    const allPosts = await getAllPostsForHome(preview, limit, offset);
    return {
      props: { allPosts, preview },
      revalidate: 10,
    };
  } catch (error) {
    console.error('Error fetching initial posts:', error);
    return {
      props: { allPosts: { edges: [], pageInfo: {} }, preview },
      revalidate: 10,
    };
  }
};