import { parseISO, format, isValid } from 'date-fns'

interface DateProps {
  dateString?: string | null;
}

export default function Date({ dateString }: DateProps) {
  if (!dateString) return null;

  const date = parseISO(dateString);
  if (!isValid(date)) {
    return <time className="text-gray-500">{dateString}</time>;
  }

  return (
    <time dateTime={dateString} className="text-gray-500">
      {format(date, 'd LLL, yyyy')}
    </time>
  );
}

