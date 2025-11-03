import { ReactNode } from "react";
import { cn } from "../lib/utils/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export default function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(300px,auto)] gap-6 mb-12",
        className
      )}
    >
      {children}
    </div>
  );
}
