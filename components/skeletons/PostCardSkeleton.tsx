import { Skeleton } from "../ui/skeleton";

export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden h-full">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-6">
        {/* Title */}
        <div className="mb-3 space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        
        {/* Author & Date */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <Skeleton className="h-4 w-20" />
          <span>•</span>
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Excerpt */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
