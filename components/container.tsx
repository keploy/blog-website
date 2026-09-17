import { ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
  className?: string
}

export default function Container({ children, className = '' }: ContainerProps) {
  return <div className={`container mx-auto px-5 ${className}`.trim()}>{children}</div>
}
