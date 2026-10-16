import { ReactNode } from "react";

interface ContainerSlugProps {
  children?: ReactNode;
  className?: string;
}

export default function ContainerSlug({ children, className = "" }: ContainerSlugProps) {
  return (
    <div className={`w-full mx-auto px-5 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 ${className}`.trim()}>
      {children}
    </div>
  );
}

