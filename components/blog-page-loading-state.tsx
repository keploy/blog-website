import { Skeleton } from "@mui/material";

export default function PageLoadingSkeleton() {
  return (
    <div className="flex px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto py-6 animate-pulse flex flex-col justify-center mt-40">
        <div className="flex flex-col gap-2 mb-6 justify-center items-center">
          <div className="flex flex-wrap gap-2 mb-2 justify-center">
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="text" width={100} height={24} />
          </div>

          <Skeleton variant="text" width="100%" height={70} />

          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mb-2">
            <Skeleton variant="text" width={100} height={24} />

            <div className="flex gap-2 sm:gap-4 items-center">
              <Skeleton
                variant="rectangular"
                width={40}
                height={40}
                className="rounded-full"
              />
              <Skeleton variant="text" width={100} height={24} />
            </div>

            <div className="flex gap-2 sm:gap-4 items-center">
              <Skeleton
                variant="rectangular"
                width={40}
                height={40}
                className="rounded-full"
              />
              <Skeleton variant="text" width={100} height={24} />
            </div>

            <Skeleton variant="text" width={100} height={24} />
          </div>
        </div>

        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          sx={{ borderRadius: ".5rem", mt: 3 }}
        />

        <div className="mt-8 space-y-4">
          {[...Array(5)].map((_, idx) => (
            <Skeleton
              key={idx}
              variant="text"
              height={24}
              width={`${95 - idx * 8}%`}
            />
          ))}

          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ borderRadius: 2, my: 3 }}
          />

          {[...Array(4)].map((_, idx) => (
            <Skeleton
              key={idx}
              variant="text"
              height={20}
              width={`${85 - idx * 5}%`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
