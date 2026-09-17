import PostPreview, { PostPreviewProps } from './post-preview'

export interface MoreStoriesProps {
  posts: {
    node: {
      title: string
      featuredImage?: any
      date: string
      excerpt?: string
      author?: any
      slug: string
    }
  }[]
  title?: string
}

export default function MoreStories({ posts, title = 'More Stories' }: MoreStoriesProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="mb-8 text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-32 gap-y-20 md:gap-y-32 mb-32">
        {posts.map(({ node }) => (
          <PostPreview
            key={node.slug}
            title={node.title}
            coverImage={node.featuredImage}
            date={node.date}
            author={node.author}
            slug={node.slug}
            excerpt={node.excerpt}
          />
        ))}
      </div>
    </section>
  )
}
