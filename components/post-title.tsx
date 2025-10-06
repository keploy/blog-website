export default function PostTitle({ children }: { children: string }) {
  function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, (word) => word.toUpperCase());
  }
  const finalString = toTitleCase(children);
  return (
    <h1 className="text-4xl md:text-4xl lg:text-5xl max-w-4xl mx-auto heading1 leading-tight font-bold tracking-normal mb-2 sm:mb-0 lg:mb-0 sm:text-center dark:text-white">
      {finalString}
    </h1>
  );
}
