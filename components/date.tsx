import { parseISO, format } from "date-fns";

interface DateProps {
  dateString: string;
}

export default function Date({ dateString }: DateProps): JSX.Element {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString} className="text-gray-500">
      {format(date, "d LLL, yyyy")}
    </time>
  );
}
