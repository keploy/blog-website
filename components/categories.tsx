import Link from "next/link";

export default function Categories({ categories }) {
  if (!categories?.edges?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.edges.map((category, index) => (
        <Link
          key={index}
          href={`/${category.node.name}`}
          className="text-orange-500 font-semibold text-sm uppercase tracking-wide hover:text-orange-600 transition-colors duration-200"
        >
          {formattingString(category.node.name)}
        </Link>
      ))}
    </div>
  );
}

const formattingString = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};