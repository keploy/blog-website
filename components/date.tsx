import { parseISO, format, isValid } from "date-fns";

export interface DateProps {
  dateString: string;
  className?: string;
}

export default function DateComponent({ dateString, className }: DateProps) {
  if (!dateString) return null;

  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return <time dateTime={dateString} className={className || "text-gray-500"}>{dateString}</time>;
    }
    return (
      <time dateTime={dateString} className={className || "text-gray-500"}>
        {format(date, "d LLL, yyyy")}
      </time>
    );
  } catch {
    return <time dateTime={dateString} className={className || "text-gray-500"}>{dateString}</time>;
  }
}
