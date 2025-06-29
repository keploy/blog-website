import Link from "next/link";
import { Card } from "./card";
import Image, { StaticImageData } from "next/image";

interface DevResourceCardProps {
  title: string;
  subtitle?: string;
  href: string;
  icon?: string;
  badge?: string;
  backgroundImage?: string | StaticImageData;
}

export function InfoCardBlock({
  title,
  subtitle,
  href,
  icon,
  badge,
  backgroundImage,
}: DevResourceCardProps) {
  return (
    <Link
      href={href}
      className="block w-full h-full group relative bg-[#fffcfa] rounded-2xl"
    >
      {" "}
      {/* Added relative */}
      {/* Background Image (conditionally rendered) */}
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={`${title} background`}
          fill
          className="object-cover overflow-hidden rounded-2xl w-full h-full absolute inset-0 z-0 transition-transform duration-300"
        />
      )}
      <div className="gradient-border h-full w-full group-hover:scale-[1.01] transition-all overflow-hidden">
        <Card className="h-full px-4 py-4 flex flex-col justify-between bg-muted/10 rounded-2xl overflow-hidden">
          {" "}
          <div className="space-y-1">
            {badge && (
              <span className="inline-block text-[.75em] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">
                {badge}
              </span>
            )}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h4 className="text-xs font-medium text-gray-900/80">{title}</h4>
                {subtitle && (
                  <p className="text-[.75em] text-gray-900/80">
                    {subtitle}
                  </p>
                )}
              </div>

              {icon && (
                <div className="self-start w-6 h-6 overflow-hidden rounded-md flex items-center justify-center">
                  <Image
                    src={icon}
                    width={24}
                    height={24}
                    alt={title}
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Link>
  );
}
