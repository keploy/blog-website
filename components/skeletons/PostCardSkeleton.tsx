import { Skeleton } from "../ui/skeleton";

export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-6">
        <Skeleton className="h-8 w-full mb-3" />
        <Skeleton className="h-8 w-4/5 mb-4" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
