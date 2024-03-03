const API_URL = process.env.WORDPRESS_API_URL;

async function fetchAPI(query = "", { variables }: Record<string, any> = {}) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      "Authorization"
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }
  // WPGraphQL Plugin must be enabled
  const res = await fetch(API_URL, {
    headers,
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return json.data;
}

async function fetchContentWithShortcodes(contentId: string) {
  const headers = { 'Content-Type': 'application/json' };

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      'Authorization'
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }

  // Fetch the content by its ID
  const res = await fetch(`https://keploy.io/wp/author/${contentId}`, {
    headers,
    method: 'GET',
  });

  const htmlContent = await res.text(); // Get the response as text (HTML)

  return htmlContent; // Return the HTML content
}

// Example usage
export async function fetchDataUsingShortcodes(contentId: string) {
  try {
    const htmlContent = await fetchContentWithShortcodes(contentId);
    // Parse the HTML content to extract data using DOM manipulation or regular expressions
    // Example: const authorData = parseAuthorDataFromHTML(htmlContent);
    if (!htmlContent.includes('<meta property="og:title" content="Page not found - Keploy CMS" />')) {
      // If the content contains the specified meta tag, reject it
      return htmlContent;
    } // Return the parsed data
    return "No Content";
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch data using shortcodes');
  }
}


export async function getPreviewPost(id, idType = "DATABASE_ID") {
  const data = await fetchAPI(
    `
    query PreviewPost($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        databaseId
        slug
        status
      }
    }`,
    {
      variables: { id, idType },
    }
  );
  return data.post;
}

export async function getAllPostsWithSlug() {
  const data = await fetchAPI(`
    {
      posts(first: 10000) {
        edges {
          node {
            slug
          }
        }
      }
    }
  `);
  return data?.posts;
}

export async function getAllPostsForHome(preview) {
  const data = await fetchAPI(
    `
    query AllPosts {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC } categoryName: "community" }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
              }
            }
            ppmaAuthorName
            categories {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      variables: {
        onlyEnabled: !preview,
        preview,
      },
    }
  );

  return data?.posts;
}

// Fnction for fetching post with technology category

export async function getAllPostsForTechnology(preview) {
  const data = await fetchAPI(
    `
    query AllPostsForCategory{
      posts(first: 20, where: { orderby: { field: DATE, order: DESC } categoryName: "technology" }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
            ppmaAuthorName
            categories {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      variables: {
        preview,
      },
    }
  );

  return data?.posts;
}

export async function getAllAuthors() {
  const data = await fetchAPI(
    `query getAllAuthors{
      posts(first:1000){
        edges{
          node{
            ppmaAuthorName
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }`
  );

  return data?.posts;
}

export async function getPostsByAuthor() {
  const data = await fetchAPI(
    `query getPostsByAuthor{
      posts(first: 10000) 
      {
        edges {
          node {
           title
           ppmaAuthorName
           slug
           featuredImage {
            node {
              sourceUrl
            }
          }
           categories {
            edges {
              node {
                name
              }
            }
          }
          }
        }
      }
    }
    `
  );

  return data?.posts;
}

export async function getPostAndMorePosts(slug, preview, previewData) {
  const postPreview = preview && previewData?.post;
  // The slug may be the id of an unpublished post
  const isId = Number.isInteger(Number(slug));
  const isSamePost = isId
    ? Number(slug) === postPreview.id
    : slug === postPreview.slug;
  const isDraft = isSamePost && postPreview?.status === "draft";
  const isRevision = isSamePost && postPreview?.status === "publish";
  const data = await fetchAPI(
    `
    fragment AuthorFields on User {
      name
      firstName
      lastName
      avatar {
        url
      }
    }
    fragment PostFields on Post {
      title
      excerpt
      slug
      date
      ppmaAuthorName
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          ...AuthorFields
        }
      }
      categories {
        edges {
          node {
            name
          }
        }
      }
      tags {
        edges {
          node {
            name
          }
        }
      }
    }
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        ${
          // Only some of the fields of a revision are considered as there are some inconsistencies
          isRevision
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
              author {
                node {
                  ...AuthorFields
                }
              }
              ppmaAuthorName
            }
          }
        }
        `
            : ""
        }
      }
      posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
            
          }
        }
      }
    }
  `,
    {
      variables: {
        id: isDraft ? postPreview.id : slug,
        idType: isDraft ? "DATABASE_ID" : "SLUG",
      },
    }
  );

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id;
  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node;

    if (revision) Object.assign(data.post, revision);
    delete data.post.revisions;
  }

  // Filter out the main post
  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug);
  // If there are still 3 posts, remove the last one
  if (data.posts.edges.length > 2) data.posts.edges.pop();

  return data;
}
