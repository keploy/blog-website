import Image from 'next/image'

export interface AuthorNode {
  name?: string
  firstName?: string
  lastName?: string
  avatar?: {
    url?: string
  }
}

export interface AvatarProps {
  author?: {
    node?: AuthorNode
  }
  className?: string
}

export default function Avatar({ author, className }: AvatarProps) {
  const isAuthorHaveFullName =
    author?.node?.firstName && author?.node?.lastName
  const name = isAuthorHaveFullName
    ? `${author.node.firstName} ${author.node.lastName}`
    : author?.node?.name || ''

  if (!name) return null

  return (
    <div className={`flex items-center ${className || ''}`}>
      {/* <div className="w-8 h-8 relative mr-4">
        <Image
          src={author?.node?.avatar?.url}
          layout="fill"
          className="rounded-full"
          alt={name}
        />
      </div> */}
      <div className="text-md font-medium heading1">{name}</div>
    </div>
  )
}

