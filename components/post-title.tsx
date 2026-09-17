import cn from 'classnames'

export interface PostTitleProps {
  children: string;
  className?: string;
}

export default function PostTitle({ children, className }: PostTitleProps) {
  return (
    <h1
      className={cn("text-4xl md:text-4xl lg:text-5xl max-w-4xl mx-auto heading1 font-bold tracking-normal leading-normal md:leading-none mb-4 text-center", className)}
      dangerouslySetInnerHTML={{ __html: children }}
    />
  )
}
