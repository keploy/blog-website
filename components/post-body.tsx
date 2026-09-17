import styles from './post-body.module.css'

export interface PostBodyProps {
  content?: string
}

export default function PostBody({ content = '' }: PostBodyProps) {
  return (
    <div className="2xl:max-w-4xl lg:max-w-3xl max-w-xl body mx-auto">
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
