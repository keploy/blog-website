import Skeleton from "@mui/material/Skeleton";

export default function PostSkeleton() {
  return (
    <div className="group relative sm:h-full h-[90%] overflow-hidden rounded-2xl border-[2px] border-[#E2E4E9] bg-[#F9FAFE] flex flex-col">
      <Skeleton
        variant="rectangular"
        width="100%"
        height={250}
        className="rounded-tr-2xl rounded-tl-2xl"
      />

      <div className="p-[24px] flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-2">
          <Skeleton
            variant="rectangular"
            width={50}
            height={24}
            className="mb-[8px] rounded-full"
          />
          <Skeleton variant="text" width="90%" height={38} />
        </div>
      </div>

      <div className="p-[1rem] pt-0 xl:p-[1.5rem] xl:pt-0">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" width={100} height={18} />
            <Skeleton variant="text" width={60} height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
