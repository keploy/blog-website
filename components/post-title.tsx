export default function PostTitle({ children }: { children: string }) {
  function toTitleCase(str) {
    return str
      .toLowerCase()
      .replace(/\b\w/g, (word) => word.toUpperCase());
  }
  const finalString = toTitleCase(children);
  return (
    <h1 className="type-post-title text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto text-center mb-4 sm:mb-6">
      {finalString}
    </h1>
  );
}
