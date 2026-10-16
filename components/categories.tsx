import Link from "next/link";
import { Post } from "../types/post";

export interface CategoriesProps {
  categories?: Post["categories"] | null;
  className?: string;
}

export default function Categories({ categories, className }: CategoriesProps) {
  if (!categories?.edges?.length) return null;

  return (
    <div className={`flex flex-wrap gap-2${className ? ` ${className}` : ""}`}>
      {categories.edges.map((category, index) => {
        const name = category?.node?.name;
        if (!name) return null;
        return (
          <Link
            key={category?.node?.id || index}
            href={`/${name}`}
            className="text-orange-500 font-semibold text-sm uppercase tracking-wide hover:text-orange-600 transition-colors duration-200"
          >
            {formattingString(name)}
          </Link>
        );
      })}
    </div>
  );
}

const formattingString = (category?: string): string => {
  if (!category) return "";
  return category.charAt(0).toUpperCase() + category.slice(1);
};