import Link from "next/link";

interface Category {
  node: {
    name: string;
  };
}

interface CategoriesProps {
  categories: {
    edges: Category[];
  };
}

export default function Categories({ categories }: CategoriesProps): JSX.Element {
  return (
    <span className="ml-1">
      .
      {categories.edges.length > 0 ? (
        categories.edges.map((category, index) => (
          <span key={index} className="ml-1 hover:underline font-medium">
            <Link href={`/${category.node.name}`}>
              {formatCategory(category.node.name)}
            </Link>
          </span>
        ))
      ) : (
        <span className="ml-1">{categories.edges[0]?.node.name}</span>
      )}
    </span>
  );
}

function formatCategory(category: string): string {
  return category[0].toUpperCase() + category.slice(1);
}
