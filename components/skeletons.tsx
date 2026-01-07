import { Skeleton } from "./ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="aspect-video overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-6">
        <Skeleton className="h-7 w-4/5 mb-4 rounded" />
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-4 w-24 rounded" />
          <span className="text-gray-300">•</span>
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export function HeroPostSkeleton() {
  return (
    <section>
      <div className="relative bg-white border border-gray-200 px-8 py-8 rounded-lg lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28 content-center overflow-hidden shadow-sm">
        {/* Banner placeholder */}
        <div className="absolute top-0 right-0 transform rotate-45 translate-x-[25%] translate-y-[90%] bg-orange-100 text-orange-400 text-[10px] font-bold py-0.5 w-[100px] flex justify-center items-center">
          Latest Blog
        </div>

        {/* Image */}
        <div className="mb-8 lg:mb-0">
          <Skeleton className="w-full aspect-video rounded-lg" />
        </div>

        {/* Content */}
        <div className="space-y-5">
          <Skeleton className="h-10 lg:h-14 w-full rounded" />
          <Skeleton className="h-10 lg:h-14 w-4/5 rounded" />

          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="divider bg-orange-300 h-1 w-1 rounded-full"></div>
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PostPreviewSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
      <div className="mb-5">
        <Skeleton className="w-full aspect-video rounded-lg" />
      </div>

      <Skeleton className="h-7 w-4/5 mb-4 rounded" />

      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="divider bg-orange-300 h-1 w-1 rounded-full"></div>
        <Skeleton className="h-4 w-28 rounded" />
      </div>

      <div className="space-y-2.5">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/5 rounded" />
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
