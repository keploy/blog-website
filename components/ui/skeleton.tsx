import { cn } from "@/lib/utils/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[skeleton-shimmer_1.5s_ease-in-out_infinite] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
