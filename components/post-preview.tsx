import Avatar, { AvatarAuthor } from './avatar'
import DateComponent from './date'
import CoverImage, { CoverImageNode } from './cover-image'
import Link from 'next/link'

export interface PostPreviewProps {
  title: string
  coverImage?: {
    node?: CoverImageNode
  }
  date: string
  excerpt?: string
  author?: {
    node?: AvatarAuthor
  }
  slug: string
}

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: PostPreviewProps) {
  return (
    <article className="flex flex-col h-full">
      <div className="mb-5">
        <CoverImage title={title} coverImage={coverImage} slug={slug} />
      </div>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link
          href={`/posts/${slug}`}
          className="hover:underline"
          dangerouslySetInnerHTML={title ? { __html: title } : undefined}
        >
          {!title ? 'Untitled' : null}
        </Link>
      </h3>
      <div className="text-lg mb-4 text-accent-7">
        <DateComponent dateString={date} />
      </div>
      {excerpt && (
        <div
          className="text-lg leading-relaxed mb-4 flex-grow text-accent-8"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
      )}
      {author?.node && (
        <div className="mt-auto pt-2">
          <Avatar author={author.node} />
        </div>
      )}
    </article>
  )
}
