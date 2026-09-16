import Link from 'next/link'

export interface HeaderProps {
  title?: string;
  className?: string;
}

export default function Header({ title, className = '' }: HeaderProps) {
  return (
    <h2 className={	ext-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-20 mt-8 }>
      <Link href="/" className="hover:underline">
        {title || 'Blog'}
      </Link>
      .
    </h2>
  )
}
