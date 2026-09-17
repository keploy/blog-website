import Image from 'next/image'

export interface AvatarAuthor {
  name: string
  picture?: {
    url?: string
  }
}

export interface AvatarProps {
  author: AvatarAuthor
}

export default function Avatar({ author }: AvatarProps) {
  const isAuthorValid = Boolean(author && author.name)
  const name = isAuthorValid ? author.name : 'Anonymous'
  const url = author?.picture?.url ?? ''

  return (
    <div className="flex items-center">
      <div className="w-12 h-12 relative mr-4 rounded-full overflow-hidden bg-accent-2 flex-shrink-0">
        {url ? (
          <Image
            src={url}
            layout="fill"
            className="rounded-full object-cover"
            alt={name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-accent-7">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-xl font-bold">{name}</div>
    </div>
  )
}
