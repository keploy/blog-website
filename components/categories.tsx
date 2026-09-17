export interface CategoryNode {
  name: string
  slug?: string
}

export interface CategoryEdge {
  node: CategoryNode
}

export interface CategoriesProps {
  categories?: {
    edges?: CategoryEdge[]
  }
  className?: string
}

export default function Categories({ categories, className }: CategoriesProps) {
  const edges = categories?.edges || []
  if (edges.length === 0) {
    return null
  }

  return (
    <span className={`ml-1 ${className || ''}`}>
      under
      {edges.map((category, index) => (
        <span key={index} className="ml-1">
          {category?.node?.name}
        </span>
      ))}
    </span>
  )
}

