import { Skeleton } from "./ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="bg-gray-100 border rounded-md overflow-hidden">
      <div className="aspect-video overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-6">
        <Skeleton className="h-8 w-3/4 mb-3" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-24" />
          <span className="text-gray-400">•</span>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function HeroPostSkeleton() {
  return (
    <section>
      <div className="relative bg-gray-100 border border-gray-300 px-8 py-8 rounded-md lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center overflow-hidden">
        {/* Banner */}
        <div className="absolute top-0 right-0 transform rotate-45 translate-x-[25%] translate-y-[90%] bg-orange-200 text-orange-800 text-[10px] font-bold py-0.5 w-[100px] flex justify-center items-center shadow-md">
          Latest Blog
        </div>

        {/* Image */}
        <div className="mb-8 lg:mb-0">
          <Skeleton className="w-full aspect-video rounded-md" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <Skeleton className="h-12 lg:h-16 w-full" />
          <Skeleton className="h-12 lg:h-16 w-4/5" />
          
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PostPreviewSkeleton() {
  return (
    <div className="bg-gray-100 border p-6 rounded-md">
      <div className="mb-5">
        <Skeleton className="w-full aspect-video rounded-md" />
      </div>
      
      <Skeleton className="h-8 w-3/4 mb-4" />
      
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
        <Skeleton className="h-4 w-24" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function MoreStoriesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-32 gap-y-20 md:gap-y-32 mb-32">
      {Array.from({ length: count }).map((_, index) => (
        <PostPreviewSkeleton key={index} />
      ))}
    </div>
  );
}
