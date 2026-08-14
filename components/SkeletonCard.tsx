export default function SkeletonCard() {
  return (
    <div className="animate-pulse border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4 bg-gray-100 dark:bg-gray-800/50 w-full">
      {/* Blog Thumbnail / Title Placeholder */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4"></div>
      
      {/* Author & Date Placeholder */}
      <div className="flex items-center space-x-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-24"></div>
        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full w-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div>
      </div>

      {/* Description Lines Placeholder */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}