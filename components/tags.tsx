export interface TagNode {
  name: string
  slug?: string
}

export interface TagsEdge {
  node: TagNode
}

export interface TagsProps {
  tags: {
    edges?: TagsEdge[]
  }
}

export default function Tags({ tags }: TagsProps) {
  const edges = tags?.edges ?? []

  if (edges.length === 0) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="mt-8 text-lg font-bold">
        Tagged
        {edges.map((tag, index) => (
          <span
            key={tag.node?.slug || index}
            className="ml-4 font-normal bg-accent-1 text-accent-7 px-3 py-1 rounded-full text-sm inline-block my-1"
          >
            {tag.node?.name}
          </span>
        ))}
      </p>
    </div>
  )
}
