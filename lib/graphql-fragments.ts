
// Fragment library for WPGraphQL queries
// Reusable field definitions to keep queries DRY and consistent

export const AUTHOR_FIELDS_FRAGMENT = `
  fragment AuthorFields on User {
    name
    firstName
    lastName
    avatar {
      url
    }
  }
`;

export const FEATURED_IMAGE_FRAGMENT = `
  fragment FeaturedImageFields on Post {
    featuredImage {
      node {
        sourceUrl
      }
    }
  }
`;

export const CATEGORY_FIELDS_FRAGMENT = `
  fragment CategoryFields on Post {
    categories {
      edges {
        node {
          name
        }
      }
    }
  }
`;

export const SEO_FIELDS_FRAGMENT = `
  fragment SEOFields on Post {
    seo {
      metaDesc
      title
    }
  }
`;

export const POST_PREVIEW_FRAGMENT = `
  ${AUTHOR_FIELDS_FRAGMENT}
  
  fragment PostPreviewFields on Post {
    title
    excerpt
    slug
    date
    postId
    ppmaAuthorName
    ...FeaturedImageFields
    author {
      node {
        ...AuthorFields
      }
    }
    ...CategoryFields
    ...SEOFields
  }
  
  ${FEATURED_IMAGE_FRAGMENT}
  ${CATEGORY_FIELDS_FRAGMENT}
  ${SEO_FIELDS_FRAGMENT}
`;

export const TAG_FIELDS_FRAGMENT = `
  fragment TagFields on Post {
    tags {
      edges {
        node {
          name
        }
      }
    }
  }
`;

export const FULL_POST_FRAGMENT = `
  ${AUTHOR_FIELDS_FRAGMENT}
  ${FEATURED_IMAGE_FRAGMENT}
  ${CATEGORY_FIELDS_FRAGMENT}
  ${TAG_FIELDS_FRAGMENT}
  ${SEO_FIELDS_FRAGMENT}
  
  fragment FullPostFields on Post {
    title
    excerpt
    slug
    date
    content
    ppmaAuthorName
    ...FeaturedImageFields
    author {
      node {
        ...AuthorFields
      }
    }
    ...CategoryFields
    ...TagFields
    ...SEOFields
  }
`;

export const PAGINATION_INFO_FRAGMENT = `
  fragment PaginationInfo on WPPageInfo {
    hasNextPage
    endCursor
  }
`;
