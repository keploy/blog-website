import { Skeleton } from "../ui/skeleton";
import Container from "../container";

export default function PostDetailSkeleton() {
  return (
    <Container>
      <article className="mb-32">
        {/* Date and Categories Skeleton */}
        <div className="flex flex-col items-start sm:items-center justify-center md:mb-5">
          <div className="mb-4 text-base flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>

          {/* Title Skeleton */}
          <div className="text-center w-full mb-6">
            <Skeleton className="h-10 md:h-14 w-11/12 mx-auto mb-3" />
            <Skeleton className="h-10 md:h-14 w-9/12 mx-auto" />
          </div>

          {/* Author Info Skeleton */}
          <div className="w-full">
            <div className="flex flex-col lg:flex-row lg:mt-7 items-start sm:items-center sm:justify-around gap-4 sm:gap-0 lg:mx-28">
              <Skeleton className="h-4 w-20" /> {/* Time to read */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto">
                {/* Writer */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                {/* Reviewer */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              {/* Share buttons */}
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image Skeleton */}
        <div className="mb-8 md:mb-16 sm:mx-0 xl:w-2/3 md:w-4/5 w-full md:-translate-x-1/2 md:left-1/2 relative">
          <Skeleton className="h-64 md:h-96 w-full rounded-lg" />
        </div>

        {/* Content Skeleton */}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="py-6">
            <Skeleton className="h-7 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-2" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </article>
    </Container>
  );
}
