"use client";

interface CountingNumbersProps {
  className: string;
  starsCount: number;
  reverse?: boolean;
  start?: number;
  interval?: number;
  duration?: number;
}

const formatStars = (num: number) =>
  Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);

export default function CountingNumbers({
  className,
  starsCount,
}: CountingNumbersProps) {
  return <p className={className}>{formatStars(starsCount)}</p>;
}