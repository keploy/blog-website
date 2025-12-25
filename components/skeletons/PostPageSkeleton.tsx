import { Skeleton } from "../ui/skeleton";

export default function PostPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
       {/* Post Header Skeleton */}
      <div className="mx-auto px-4 py-16 max-w-4xl">
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-6 w-1/2 mb-10" />
        
        {/* Author Info */}
        <div className="flex items-center gap-4 mb-10">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Featured Image */}
        <Skeleton className="w-full aspect-video rounded-xl mb-12" />

        {/* Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <br />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
        </div>
      </div>
    </div>
  );
}
