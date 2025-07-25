import { parseISO, format } from 'date-fns'

export default function Date({ dateString }) {
  const date = parseISO(dateString)
  return <time dateTime={dateString} className=' text-[#190F36]'>{format(date, 'd LLL, yyyy')}</time>
}