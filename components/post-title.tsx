import { ReactNode } from 'react'

export interface PostTitleProps {
  children?: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export default function PostTitle({ children, className = '', as: Component = 'h1' }: PostTitleProps) {
  if (!children) return null;

  return (
    <Component
      className={	ext-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight md:leading-none mb-6 text-center md:text-left }
      dangerouslySetInnerHTML={typeof children === 'string' ? { __html: children } : undefined}
    >
      {typeof children !== 'string' ? children : null}
    </Component>
  )
}
