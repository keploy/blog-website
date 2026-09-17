import cn from 'classnames'
import Image from 'next/image'
import Link from 'next/link'

export interface CoverImageNode {
  sourceUrl?: string
}

export interface CoverImageProps {
  title: string
  coverImage?: {
    node?: CoverImageNode
  }
  slug?: string
  priority?: boolean
}

export default function CoverImage({
  title,
  coverImage,
  slug,
  priority = false,
}: CoverImageProps) {
  const imageUrl = coverImage?.node?.sourceUrl

  if (!imageUrl) {
    return null
  }

  const image = (
    <Image
      width={2000}
      height={1000}
      alt={title ? `Cover Image for ${title}` : 'Cover Image'}
      src={imageUrl}
      priority={priority}
      className={cn('shadow-small rounded-xl hover:rounded-3xl transition-border duration-300', {
        'hover:scale-105 transition-scale duration-300': slug,
      })}
    />
  )

  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/posts/${slug}`} aria-label={title || 'Post link'}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  )
}
