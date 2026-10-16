import Image from 'next/image'

export interface AuthorProps {
  author?: {
    name?: string;
    node?: {
      name?: string;
      avatar?: {
        url?: string;
      };
    };
  };
  className?: string;
}

export default function Author({ author, className = '' }: AuthorProps) {
  const name = author?.name || author?.node?.name || 'Keploy Team';
  const avatarUrl = author?.node?.avatar?.url;

  return (
    <div className={lex items-center }>
      {avatarUrl && (
        <div className="w-12 h-12 relative mr-4">
          <Image
            src={avatarUrl}
            alt={name}
            fill
            sizes="48px"
            className="rounded-full object-cover"
          />
        </div>
      )}
      <div className="text-xl font-bold">{name}</div>
    </div>
  )
}
