import { Skeleton } from "../ui/skeleton";

export default function HeroPostSkeleton() {
  return (
    <section>
      <div className="relative bg-gray-100 border border-gray-300 px-8 py-8 rounded-md lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28">
        <div className="mb-8 lg:mb-0">
          <Skeleton className="w-full aspect-video rounded-md" />
        </div>
        <div>
          <Skeleton className="h-16 w-full mb-6" />
          <Skeleton className="h-16 w-4/5 mb-6" />
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-1 w-1 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </section>
  );
}
