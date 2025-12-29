import { parseISO, format } from "date-fns";

export default function Date({ dateString }: { dateString: string }) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString} className="type-meta text-slate-500 uppercase tracking-[0.15em]">
      {format(date, "d LLL, yyyy")}
    </time>
  );
}
