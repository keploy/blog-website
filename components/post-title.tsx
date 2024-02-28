export default function PostTitle({ children }: { children: string }) {
  function toTitleCase(str) {
    return str
      .toLowerCase()
      .replace(/\b\w/g, (word) => word.toUpperCase());
  }
  const finalString = toTitleCase(children);
  return (
    <h1 className="text-4xl md:text-4xl lg:text-5xl max-w-4xl mx-auto heading1 font-bold tracking-normal leading-normal md:leading-none mb-4 text-center">
      {finalString}
    </h1>
  );
}
