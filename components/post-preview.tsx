import Avatar from './avatar'
import Date from './date'
import CoverImage from './cover-image'
import Link from 'next/link'

export interface PostPreviewProps {
  title: string;
  coverImage?: any;
  date?: string;
  excerpt?: string;
  author?: any;
  slug: string;
  className?: string;
}

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  className = '',
}: PostPreviewProps) {
  return (
    <div className={className}>
      <div className="mb-5">
        <CoverImage title={title} coverImage={coverImage} slug={slug} />
      </div>
      <h3 className="text-3xl mb-3 leading-snug font-bold">
        <Link
          href={/posts/}
          className="hover:underline"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </h3>
      <div className="text-lg mb-4">
        {date && <Date dateString={date} />}
      </div>
      {excerpt && (
        <div
          className="text-lg leading-relaxed mb-4 text-gray-600"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
      )}
      {author && <Avatar author={author} />}
    </div>
  )
}
