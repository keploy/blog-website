import { parseISO, format, isValid } from 'date-fns'

export interface DateProps {
  dateString: string
  formatPattern?: string
}

export default function Date({ dateString, formatPattern = 'LLLL d, yyyy' }: DateProps) {
  if (!dateString) {
    return null
  }

  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return <time dateTime={dateString}>{dateString}</time>
    }
    return <time dateTime={dateString}>{format(date, formatPattern)}</time>
  } catch {
    return <time dateTime={dateString}>{dateString}</time>
  }
}
