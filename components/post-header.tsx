import Avatar, { AvatarAuthor } from './avatar'
import DateComponent from './date'
import CoverImage, { CoverImageNode } from './cover-image'
import PostTitle from './post-title'
import Categories, { CategoriesProps } from './categories'

export interface PostHeaderProps {
  title: string
  coverImage?: {
    node?: CoverImageNode
  }
  date: string
  author?: {
    node?: AvatarAuthor
  } | AvatarAuthor
  categories?: CategoriesProps['categories']
}

export default function PostHeader({
  title,
  coverImage,
  date,
  author,
  categories,
}: PostHeaderProps) {
  const resolvedAuthor: AvatarAuthor | undefined = author
    ? 'node' in author && author.node
      ? author.node
      : (author as AvatarAuthor)
    : undefined

  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:flex flex-col items-center justify-center md:mb-12">
        {resolvedAuthor && <Avatar author={resolvedAuthor} />}
        <div className="mb-6 text-lg flex items-center gap-2 mt-3">
          <DateComponent dateString={date} />
          {categories && <Categories categories={categories} />}
        </div>
      </div>
      <div className="mb-8 md:mb-16 sm:mx-0 xl:w-2/3 md:w-4/5 w-full md:-translate-x-1/2 md:left-1/2 relative">
        <CoverImage title={title} coverImage={coverImage} priority={true} />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="block md:hidden mb-6">
          {resolvedAuthor && <Avatar author={resolvedAuthor} />}
        </div>
      </div>
    </>
  )
}
