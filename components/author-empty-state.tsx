"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

type AuthorEmptyStateProps = {
  noPosts: boolean;
  imagePath: string;
  initialSeconds?: number;
  renderLoading: () => ReactNode;
  children: ReactNode;
};

export default function AuthorEmptyState({
  noPosts,
  imagePath,
  initialSeconds = 10,
  renderLoading,
  children,
}: AuthorEmptyStateProps) {
  const router = useRouter();
  const [redirectSeconds, setRedirectSeconds] = useState(initialSeconds);

  const imageSrc = useMemo(() => {
    if (!imagePath) return imagePath;
    if (imagePath.startsWith("/") && router.basePath) {
      return `${router.basePath}${imagePath}`;
    }
    return imagePath;
  }, [imagePath, router.basePath]);

  useEffect(() => {
    if (!noPosts) return;
    setRedirectSeconds(initialSeconds);
    let isActive = true;
    const interval = setInterval(() => {
      if (!isActive) return;
      setRedirectSeconds((prev) => {
        if (prev <= 1) {
          router.push("/authors");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [initialSeconds, noPosts, router]);

  if (router.isFallback) {
    return <>{renderLoading()}</>;
  }

  if (!noPosts) {
    return <>{children}</>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-center md:text-left py-16 px-6 bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col md:flex-row md:justify-between items-center mb-15">
      <div>
        <h1 className="text-3xl md:text-3xl font-bold text-orange-600 ">
          OOPs!! No post found for the Author
        </h1>
        <p className="text-gray-600">
          We couldn&apos;t find any posts for this author. You will be redirected
          to the authors page shortly.
        </p>
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full text-orange-700 font-semibold">
          Redirecting in {redirectSeconds}s
        </div>
      </div>
      <div>
        <Image src={imageSrc} alt="errorImage" width={300} height={400} />
      </div>
    </div>
  );
}
