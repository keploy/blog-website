import { parseISO, format } from 'date-fns'

export default function Date({ dateString, overrideClassName = false }) {
  const date = parseISO(dateString)
  return <time dateTime={dateString} className={`${overrideClassName ? "" : "text-[#190F36]"}`}>{format(date, 'd LLL, yyyy')}</time>
}
