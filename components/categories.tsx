import Link from "next/link";

export default function Categories({ categories }) {
  return (
    <span className="ml-1">
      .
      {categories.edges.length > 0 ? (
        categories.edges.map((category, index) => (
          <span key={index} className="ml-1 hover:underline font-medium ">
          <Link href={`/${category.node.name}`} >
            {formatingString(category.node.name)}
          </Link>
          </span>
        ))
      ) : (
        <span className="ml-1">{categories.edges.node.name}</span>
      )}
    </span>
  )
}

const formatingString=(Category)=>{
  var newCategory = Category[0].toUpperCase() + Category.slice(1);
  return newCategory
}