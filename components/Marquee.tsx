import React, { ReactNode } from "react";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: ReactNode;
  vertical?: boolean;
  repeat?: number;
  [key: string]: any; // For additional props like `id`, `style`, etc.
}

export function Marquee({
  className = "",
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps): JSX.Element {
  return (
    <div
      {...props}
      className={`group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)] ${vertical ? "flex-col" : "flex-row"} ${className}`}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={`flex shrink-0 justify-around [gap:var(--gap)] ${
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row"
          } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""} ${
            reverse ? "[animation-direction:reverse]" : ""
          }`}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
