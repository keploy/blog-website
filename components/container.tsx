import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

export default function Container({ children }: ContainerProps): JSX.Element {
  // return <div className="container mx-auto px-5">{children}</div>
  return <div className="max-w-7xl mx-auto px-5 sm:px-6 ">{children}</div>;
}
