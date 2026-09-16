import styles from './post-body.module.css'

export interface PostBodyProps {
  content?: string;
  className?: string;
}

export default function PostBody({ content = '', className = '' }: PostBodyProps) {
  if (!content) return null;
  return (
    <div className={max-w-2xl mx-auto }>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
