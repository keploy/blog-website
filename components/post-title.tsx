import { ReactNode } from "react";

interface PostTitleProps {
  children?: ReactNode;
}

export default function PostTitle({ children }: PostTitleProps) {
  function formatTitle(val: ReactNode): ReactNode {
    if (typeof val !== "string") {
      return val;
    }
    return val
      .toLowerCase()
      .replace(/\b\w/g, (word) => word.toUpperCase());
  }

  const content = formatTitle(children);

  return (
    <h1
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontWeight: 800,
        fontSize: "clamp(1.375rem, 5vw, 2.625rem)", /* 22px → 42px, smooth across all screens */
        lineHeight: "1.25",
        letterSpacing: "-0.011em",
        color: "#111827",
        margin: "0.5rem 0 1.25rem 0",
      }}
    >
      {content}
    </h1>
  );
}

