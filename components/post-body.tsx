import styles from './post-body.module.css'

export interface PostBodyProps {
  content: string
  className?: string
}

export default function PostBody({ content, className = '' }: PostBodyProps) {
  if (!content) {
    return null
  }

  return (
    <div className={`2xl:max-w-4xl lg:max-w-3xl max-w-xl body mx-auto ${className}`.trim()}>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
