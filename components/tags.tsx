export interface TagItem {
  node?: {
    name?: string
  }
}

export interface TagsProps {
  tags?: {
    edges?: TagItem[]
  }
}

export default function Tags({ tags }: TagsProps) {
  const edges = tags?.edges
  if (!edges || edges.length === 0) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="mt-8 text-lg font-bold">
        Tagged
        {edges.map((tag, index) => (
          <span key={index} className="ml-4 font-normal">
            {tag?.node?.name || ''}
          </span>
        ))}
      </p>
    </div>
  )
}
