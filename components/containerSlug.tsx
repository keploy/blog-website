import { ReactNode } from "react";

export interface ContainerSlugProps {
  children: ReactNode;
  className?: string;
}

export default function ContainerSlug({ children, className }: ContainerSlugProps) {
  return (
    <div className={`w-full mx-auto px-5 sm:px-6 lg:px-10 xl:px-16 2xl:px-20${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
