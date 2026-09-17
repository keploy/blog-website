export interface CategoryNode {
  name: string
  slug?: string
}

export interface CategoriesEdge {
  node: CategoryNode
}

export interface CategoriesProps {
  categories: {
    edges?: CategoriesEdge[]
  }
}

export default function Categories({ categories }: CategoriesProps) {
  const edges = categories?.edges ?? []

  return (
    <span className="ml-1">
      under
      {edges.length > 0 ? (
        edges.map((category, index) => (
          <span key={category.node?.slug || index} className="ml-1">
            {category.node?.name}
          </span>
        ))
      ) : (
        <span className="ml-1">General</span>
      )}
    </span>
  )
}
