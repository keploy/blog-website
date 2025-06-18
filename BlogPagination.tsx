// components/BlogPagination.tsx
import { useState } from 'react';
import styles from './BlogPagination.module.css';

interface Post {
  id?: string;
  title: string;
  excerpt: string;
  date: string;
  author?: string;
  slug: string;
  categories: Array<{ name: string }>;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
}

interface BlogPaginationProps {
  posts: Post[];
  postsPerPage?: number;
  category?: string;
}

const BlogPagination: React.FC<BlogPaginationProps> = ({ 
  posts, 
  postsPerPage = 6, 
  category = 'all' 
}) => {
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>(
    posts.slice(0, postsPerPage)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const hasMorePosts = currentPage < totalPages;

  const loadMorePosts = () => {
    setLoading(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * postsPerPage;
      
      setDisplayedPosts(posts.slice(startIndex, endIndex));
      setCurrentPage(nextPage);
      setLoading(false);
    }, 500);
  };

  return (
    <div className={styles.blogPaginationContainer}>
      {/* Display current posts */}
      <div className={styles.postsGrid}>
        {displayedPosts.map((post, index) => (
          <div key={post.id || post.slug || index} className={styles.postCard}>
            {/* Featured Image */}
            {post.featuredImage && (
              <div className={styles.postImage}>
                <img 
                  src={post.featuredImage.node.sourceUrl} 
                  alt={post.featuredImage.node.altText || post.title}
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Post Content */}
            <div className={styles.postContent}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className={styles.postMeta}>
                <span>{new Date(post.date).toLocaleDateString()}</span>
                {post.author && <span>By {post.author}</span>}
              </div>
              
              {/* Categories */}
              <div className={styles.postCategories}>
                {post.categories.map((cat, idx) => (
                  <span key={idx} className={styles.categoryTag}>
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMorePosts && (
        <div className={styles.loadMoreContainer}>
          <button 
            onClick={loadMorePosts}
            disabled={loading}
            className={styles.loadMoreBtn}
            type="button"
          >
            {loading ? (
              <span className={styles.loadingSpinner}>
                <svg className={styles.animateSpin} width="20" height="20" viewBox="0 0 24 24">
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none"
                    strokeDasharray="31.416"
                    strokeDashoffset="15.708"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              `Load More Posts (${posts.length - displayedPosts.length} remaining)`
            )}
          </button>
        </div>
      )}

      {/* Posts counter */}
      <div className={styles.postsCounter}>
        Showing {displayedPosts.length} of {posts.length} posts
      </div>
    </div>
  );
};

export default BlogPagination;