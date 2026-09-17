import PostPreview from './post-preview'

export interface PostNode {
  node: {
    title: string
    featuredImage?: {
      node?: {
        sourceUrl?: string
      }
    }
    date?: string
    author?: {
      node?: {
        name?: string
        firstName?: string
        lastName?: string
        avatar?: {
          url?: string
        }
      }
    }
    slug: string
    excerpt?: string
  }
}

export interface MoreStoriesProps {
  posts?: PostNode[]
}

export default function MoreStories({ posts }: MoreStoriesProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
        More Stories
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16 md:gap-y-16 mb-16">
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
