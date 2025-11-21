import Container from "./container";
import Header from "./header";
import Layout from "./layout";
import { Skeleton } from "./ui/skeleton";

export default function PostDetailSkeleton() {
  return (
    <Layout
      preview={false}
      featuredImage=""
      Title="Loading..."
      Description="Loading blog post..."
    >
      <Header />
      <Container>
        <article>
          {/* Post Header */}
          <div className="mb-8 md:mb-16">
            <Skeleton className="h-12 md:h-16 w-3/4 mx-auto mb-8" />
            
            {/* Meta info */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
              <Skeleton className="h-4 w-24" />
              <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Featured Image */}
            <div className="mb-8 md:mb-16">
              <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
          </div>

          {/* Post Body */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <Skeleton className="h-8 w-2/3 mb-4 mt-8" />
            
            <div className="space-y-4 mb-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <Skeleton className="h-48 w-full rounded-lg mb-8" />

            <div className="space-y-4 mb-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Skeleton className="h-8 w-2/3 mb-4 mt-8" />
            
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 flex gap-2 flex-wrap">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-[5.5rem] rounded-full" />
          </div>

          {/* Author Box */}
          <div className="mt-12 p-6 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </article>
      </Container>
    </Layout>
  );
}
