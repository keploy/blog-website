export default function PostTitle({ children }: { children: string }) {
  function toTitleCase(str: string) {
    return str
      .toLowerCase()
      .replace(/\b\w/g, (word) => word.toUpperCase());
  }
  const finalString = toTitleCase(children);
  return (
    <h1
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(1.375rem, 5vw, 2.625rem)",   /* 22px → 42px, smooth across all screens */
        lineHeight: "1.25",
        letterSpacing: "-0.011em",
        color: "#111827",
        margin: "0.5rem 0 1.25rem 0",
      }}
    >
      {finalString}
    </h1>
  );
}
