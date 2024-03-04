import { parseISO, format } from "date-fns";

export default function Date({ dateString, className = "" }) {
  const date = parseISO(dateString);
  return (
    <div className={className}>
      <time dateTime={dateString}>{format(date, "LLLL	d, yyyy")}</time>
    </div>
  );
}
