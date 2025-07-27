import { Skeleton } from "@mui/material";
import PostSkeleton from "./post-skeleton";

export default function HeroOnlySkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-4 animate-pulse flex flex-col gap-10">
      <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        sx={{ borderRadius: 3 }}
      />

      <div className="flex flex-col sm:flex-row gap-6 w-full">
        <div className="flex flex-col gap-4 w-full sm:max-w-xs">
          <Skeleton
            variant="rectangular"
            height={50}
            className="rounded-xl"
          />
          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ borderRadius: 2 }}
          />
        </div>

        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 md:gap-x-8 lg:gap-x-8 gap-y-16">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
