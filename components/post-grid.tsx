import { ReactNode } from "react";

export default function PostGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      {children}
    </div>
  );
}


