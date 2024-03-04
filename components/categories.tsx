export default function Categories({ categories, className =""}) {
  return (
    <div className={"flex items-center gap-x-2" + " " + className}>
      {categories.edges.length > 0 ? (
        categories.edges.map((category, index) => (
          <span
            key={index}
            className="ml-1 font-bold rounded-full uppercase bg-gradient-to-b from-orange-600 to-orange-300 text-clip text-transparent bg-clip-text text-base"
          >
            {category.node.name}
          </span>
        ))
      ) : (
        <span className="ml-1">{categories.edges.node.name}</span>
      )}
    </div>
  );
}
