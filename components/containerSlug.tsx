import { ReactNode } from "react";

interface ContainerSlugProps {
  children: ReactNode;
}

export default function ContainerSlug({ children }: ContainerSlugProps): JSX.Element {
  // return <div className="container  mx-auto px-5">{children}</div>
  return <div className="max-w-10xl  mx-auto px-5 sm:px-6 ">{children}</div>;
}
