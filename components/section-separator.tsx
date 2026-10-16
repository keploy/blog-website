export interface SectionSeparatorProps {
  className?: string;
}

export default function SectionSeparator({ className }: SectionSeparatorProps = {}) {
  return (
    <hr
      className={`border-accent-2 mt-28 mb-24${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
