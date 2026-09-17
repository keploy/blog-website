import { parseISO, format } from 'date-fns'

export interface DateProps {
  dateString: string
  className?: string
  formatString?: string
}

export default function Date({
  dateString,
  className,
  formatString = 'LLLL\td, yyyy',
}: DateProps) {
  if (!dateString) return null
  try {
    const date = parseISO(dateString)
    return (
      <time dateTime={dateString} className={className}>
        {format(date, formatString)}
      </time>
    )
  } catch {
    return <time className={className}>{dateString}</time>
  }
}

