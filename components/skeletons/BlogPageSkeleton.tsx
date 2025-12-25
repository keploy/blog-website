import { Skeleton } from "../ui/skeleton";
import PostCardSkeleton from "./PostCardSkeleton";

export default function BlogPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Hero Section Skeleton */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 items-center px-4 md:px-8 lg:px-16 ">
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
          <div className="justify-center hidden lg:flex">
             <Skeleton className="h-[400px] w-[400px] rounded-full" />
          </div>
        </div>

        {/* Blog Grid Skeleton */}
        <div className="px-4 md:px-8 lg:px-16 ">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
