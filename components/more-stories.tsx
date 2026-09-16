import PostPreview from './post-preview'
import { Post } from '../types/post'

export interface MoreStoriesProps {
  posts: Post[];
  title?: string;
  className?: string;
}

export default function MoreStories({ posts, title = 'More Stories', className = '' }: MoreStoriesProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className={mb-32 }>
      <h2 className="mb-8 text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-32 gap-y-20 md:gap-y-32 mb-32">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.featuredImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  )
}
