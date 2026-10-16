import Link from 'next/link';

export default function Categories({ categories }: { categories?: any[] | { edges: any[] } }) {
  const categoryList = Array.isArray(categories) 
    ? categories 
    : categories?.edges || [];

  if (!categoryList || categoryList.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categoryList.map((category: any, index: number) => {
        const node = category?.node || category;
        const name = node?.name || (typeof category === 'string' ? category : '');
        if (!name) return null;
        return (
          <Link
            key={index}
            href={/category/}
            className="text-xs font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200 hover:bg-orange-100 transition-colors"
          >
            {name}
          </Link>
        );
      })}
    </div>
  );
}