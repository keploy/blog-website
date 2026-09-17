export interface SectionSeparatorProps {
  className?: string
}

export default function SectionSeparator({ className = '' }: SectionSeparatorProps) {
  return (
    <hr
      role="separator"
      className={`border-accent-2 mt-28 mb-24 ${className}`.trim()}
    />
  )
}
