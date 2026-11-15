import { ReactNode } from "react";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto px-5 sm:px-6${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
