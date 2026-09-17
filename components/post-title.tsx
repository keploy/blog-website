import { ReactNode } from 'react'

export interface PostTitleProps {
  children?: ReactNode
  className?: string
}

export default function PostTitle({ children, className = '' }: PostTitleProps) {
  return (
    <h1
      className={`text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left ${className}`.trim()}
      dangerouslySetInnerHTML={
        typeof children === 'string' ? { __html: children } : undefined
      }
    >
      {typeof children !== 'string' ? children : null}
    </h1>
  )
}
